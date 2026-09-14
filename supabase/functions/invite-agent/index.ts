import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return json({ error: "Authentication required" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: "Supabase function configuration is incomplete" }, 500);
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user: caller },
      error: callerError,
    } = await callerClient.auth.getUser();

    if (callerError || !caller) {
      return json({ error: "Invalid authentication session" }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("id, role")
      .eq("id", caller.id)
      .maybeSingle();

    if (profileError) {
      return json({ error: "Could not verify administrator" }, 500);
    }

    if (!callerProfile || !["admin", "supervisor"].includes(callerProfile.role)) {
      return json({ error: "Administrator permission required" }, 403);
    }

    const { data: membership, error: membershipError } = await adminClient
      .from("organization_memberships")
      .select("organization_id, role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      return json({ error: "Could not determine organization" }, 500);
    }

    if (!membership?.organization_id) {
      return json({ error: "Administrator is not assigned to an organization" }, 403);
    }

    const body = await req.json();

    const email = String(body.email || "").trim().toLowerCase();
    const fullName = String(body.full_name || "").trim();
    const phone = String(body.phone || "").trim();
    const role = String(body.role || "field_agent").trim();
    const county = String(body.county || "").trim();
    const constituency = String(body.constituency || "").trim();
    const ward = String(body.ward || "").trim();

    if (!email || !fullName) {
      return json({ error: "Email and full name are required" }, 400);
    }

    if (!["field_agent", "supervisor"].includes(role)) {
      return json({ error: "Invalid agent role" }, 400);
    }

    const agentReference =
      "AGT-" + Math.floor(100000 + Math.random() * 900000).toString();

    const operatingArea = [county, constituency, ward]
      .filter(Boolean)
      .join(" / ");

    const { data: invited, error: inviteError } =
      await adminClient.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name: fullName,
          role,
          agent_reference: agentReference,
          phone,
          county,
          constituency,
          ward,
          organization_id: membership.organization_id,
        },
      });

    if (inviteError) {
      return json({ error: inviteError.message }, 400);
    }

    if (!invited?.user?.id) {
      return json({ error: "Invitation was not created" }, 500);
    }

    const userId = invited.user.id;

    const { error: upsertProfileError } = await adminClient
      .from("profiles")
      .upsert(
        {
          id: userId,
          role,
          agent_reference: agentReference,
          operating_area: operatingArea || null,
          phone: phone || null,
          account_status: "active",
        },
        { onConflict: "id" }
      );

    if (upsertProfileError) {
      await adminClient.auth.admin.deleteUser(userId);
      return json({ error: upsertProfileError.message }, 500);
    }

    const { error: membershipInsertError } = await adminClient
      .from("organization_memberships")
      .upsert(
        {
          organization_id: membership.organization_id,
          user_id: userId,
          role,
        },
        { onConflict: "organization_id,user_id" }
      );

    if (membershipInsertError) {
      await adminClient.from("profiles").delete().eq("id", userId);
      await adminClient.auth.admin.deleteUser(userId);
      return json({ error: membershipInsertError.message }, 500);
    }

    return json({
      success: true,
      user_id: userId,
      email,
      role,
      agent_reference: agentReference,
      organization_id: membership.organization_id,
    });
  } catch (error) {
    console.error("invite-agent error:", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Unexpected server error",
      },
      500
    );
  }
});
