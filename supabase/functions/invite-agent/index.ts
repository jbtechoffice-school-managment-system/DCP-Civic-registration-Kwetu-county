import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Server configuration is incomplete");
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user: caller },
      error: callerError,
    } = await adminClient.auth.getUser(token);

    if (callerError || !caller) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: callerProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("id, role, account_status")
      .eq("id", caller.id)
      .single();

    if (
      profileError ||
      !callerProfile ||
      callerProfile.role !== "admin" ||
      callerProfile.account_status !== "active"
    ) {
      return new Response(
        JSON.stringify({ success: false, error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: membership, error: membershipError } = await adminClient
      .from("organization_memberships")
      .select("organization_id, role, status")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (membershipError || !membership) {
      return new Response(
        JSON.stringify({ success: false, error: "Active organization membership required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    const email = String(body.email || "").trim().toLowerCase();
    const role = String(body.role || "field_agent").trim();
    const fullName = String(body.full_name || "").trim();
    const phone = String(body.phone || "").trim();
    const county = String(body.county || "").trim();
    const constituency = String(body.constituency || "").trim();
    const ward = String(body.ward || "").trim();

    if (!email || !fullName) {
      throw new Error("Email and full name are required");
    }

    if (!["field_agent", "supervisor"].includes(role)) {
      throw new Error("Invalid role");
    }

    const { data: invited, error: inviteError } =
      await adminClient.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name: fullName,
          invited_role: role,
          organization_id: membership.organization_id,
        },
      });

    if (inviteError) {
      throw inviteError;
    }

    const { error: profileInsertError } = await adminClient
      .from("profiles")
      .upsert(
        {
          id: invited.user.id,
          role,
          phone: phone || null,
          account_status: "active",
        },
        { onConflict: "id" }
      );

    if (profileInsertError) {
      throw profileInsertError;
    }

    const { error: membershipInsertError } = await adminClient
      .from("organization_memberships")
      .insert({
        organization_id: membership.organization_id,
        user_id: invited.user.id,
        role,
        status: "active",
      });

    if (membershipInsertError) {
      throw membershipInsertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: invited.user.id,
        email,
        role,
        organization_id: membership.organization_id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("invite-agent error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || "Invitation failed",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
