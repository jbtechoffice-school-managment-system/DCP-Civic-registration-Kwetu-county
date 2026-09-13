import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key');

const TABLES = {
  Attendance: 'attendance',
  AuditLog: 'audit_logs',
  CommunityUpdate: 'community_updates',
  ContentLibraryItem: 'content_library_items',
  Conversation: 'conversations',
  Device: 'devices',
  Feedback: 'feedback',
  FieldVisit: 'field_visits',
  Goal: 'goals',
  LocationSession: 'location_sessions',
  Message: 'messages',
  Notification: 'notifications',
  OperationalAlert: 'operational_alerts',
  Registration: 'registrations',
  SafetyCheckin: 'safety_checkins',
  SupportTicket: 'support_tickets',
  User: 'profiles',
};

const fieldMap = {
  created_date: 'created_at',
  updated_date: 'updated_at',
  date: 'attendance_date',
  read: 'is_read',
  file_url: 'file_path',
};

const normalizeField = (key) => fieldMap[key] || key;
const mapRow = (row) => {
  if (!row) return row;
  const out = { ...row };
  if (out.created_at && out.created_date == null) out.created_date = out.created_at;
  if (out.updated_at && out.updated_date == null) out.updated_date = out.updated_at;
  if (out.attendance_date && out.date == null) out.date = out.attendance_date;
  if (out.is_read != null && out.read == null) out.read = out.is_read;
  if (out.file_path != null && out.file_url == null) out.file_url = out.file_path;
  return out;
};

async function currentProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  return data ? { ...mapRow(data), id: user.id, email: user.email, phone: data.phone || user.phone } : {
    id: user.id, email: user.email, phone: user.phone
  };
}

async function currentOrganizationId() {
  const profile = await currentProfile();
  if (profile?.organization_id) return profile.organization_id;
  const { data } = await supabase.from('organizations').select('id').eq('active', true).order('created_at', { ascending: true }).limit(1).maybeSingle();
  return data?.id || null;
}

function parseOrder(order) {
  if (!order) return { column: 'created_at', ascending: false };
  const raw = Array.isArray(order) ? order[0] : order;
  const descending = String(raw).startsWith('-');
  return { column: normalizeField(String(raw).replace(/^-/, '')), ascending: !descending };
}

function applyFilter(query, filter = {}) {
  let q = query;
  for (const [key, value] of Object.entries(filter || {})) {
    const column = normalizeField(key);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if ('$in' in value) q = q.in(column, value.$in);
      else if ('$ne' in value) q = q.neq(column, value.$ne);
      else if ('$gt' in value) q = q.gt(column, value.$gt);
      else if ('$gte' in value) q = q.gte(column, value.$gte);
      else if ('$lt' in value) q = q.lt(column, value.$lt);
      else if ('$lte' in value) q = q.lte(column, value.$lte);
      else q = q.eq(column, value);
    } else {
      q = q.eq(column, value);
    }
  }
  return q;
}

async function withContext(table, payload, { requireOrg = true } = {}) {
  const row = { ...payload };
  if (requireOrg && TABLES[table] !== 'profiles' && row.organization_id == null) {
    row.organization_id = await currentOrganizationId();
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (table === 'Registration' && user && !row.created_by_id) row.created_by_id = user.id;
  if (table === 'AuditLog' && user && !row.actor_id) row.actor_id = user.id;
  if (table === 'Notification' && user && row.recipient_id == null) row.recipient_id = user.id;
  return row;
}

function entity(tableName) {
  const table = TABLES[tableName];
  if (!table) throw new Error(`Unknown entity: ${tableName}`);
  return {
    async list(order, limit = 100) {
      let q = supabase.from(table).select('*');
      const o = parseOrder(order);
      q = q.order(o.column, { ascending: o.ascending }).limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []).map(mapRow);
    },
    async filter(filter, order, limit = 100) {
      let q = applyFilter(supabase.from(table).select('*'), filter);
      const o = parseOrder(order);
      q = q.order(o.column, { ascending: o.ascending }).limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []).map(mapRow);
    },
    async get(id) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) throw error;
      return mapRow(data);
    },
    async create(payload) {
      const row = await withContext(tableName, payload);
      const { data, error } = await supabase.from(table).insert(row).select().single();
      if (error) throw error;
      return mapRow(data);
    },
    async bulkCreate(payloads) {
      const rows = [];
      for (const payload of payloads) rows.push(await withContext(tableName, payload));
      const { data, error } = await supabase.from(table).insert(rows).select();
      if (error) throw error;
      return (data || []).map(mapRow);
    },
    async update(id, payload) {
      const row = { ...payload };
      delete row.id;
      delete row.created_at;
      delete row.created_date;
      const { data, error } = await supabase.from(table).update(row).eq('id', id).select().single();
      if (error) throw error;
      return mapRow(data);
    },
    async updateMany(filter, payload) {
      const row = { ...payload };
      let q = applyFilter(supabase.from(table).update(row), filter);
      const { data, error } = await q.select();
      if (error) throw error;
      return (data || []).map(mapRow);
    },
    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return true;
    },
    async deleteMany(filter) {
      const { error } = await applyFilter(supabase.from(table).delete(), filter);
      if (error) throw error;
      return true;
    },
    subscribe(callback) {
      const channel = supabase.channel(`realtime:${table}:${Math.random().toString(36).slice(2)}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => callback?.())
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  };
}

export const supabaseApi = {
  entities: Object.fromEntries(Object.keys(TABLES).map((key) => [key, entity(key)])),
  auth: {
    async me() {
      const profile = await currentProfile();
      if (!profile) {
        const error = new Error('Authentication required');
        error.status = 401;
        throw error;
      }
      return profile;
    },
    async isAuthenticated() {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    },
    async loginViaEmailPassword(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    async loginWithProvider(provider, redirectTo = window.location.origin) {
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
      if (error) throw error;
    },
    async register({ email, password }) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    },
    async verifyOtp({ email, otpCode }) {
      const { data, error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'signup' });
      if (error) throw error;
      return { access_token: data.session?.access_token, ...data };
    },
    async resendOtp(email) {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
    },
    async resetPasswordRequest(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      if (error) throw error;
    },
    async resetPassword({ newPassword }) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
    setToken() {},
    onAuthStateChange(callback) { return supabase.auth.onAuthStateChange(callback); },
    async logout() { await supabase.auth.signOut(); },
    redirectToLogin() { window.location.assign('/login'); },
  },
  app: {
    async getPublicSettings() {
      const { data } = await supabase.from('organizations').select('id,name,short_name,description,logo_path,settings').eq('active', true).order('created_at').limit(1).maybeSingle();
      return data || { id: null, public_settings: {} };
    }
  },
  users: {
    async inviteUser(email, role) {
      throw new Error('User invitations require a secure Supabase Edge Function. The UI is preserved; configure the invite function before production.');
    }
  },
  functions: {
    async invoke(name, payload = {}) {
      if (name === 'createRegistration') {
        const row = await withContext('Registration', payload);
        const { data, error } = await supabase.from('registrations').insert(row).select().single();
        if (error) throw error;
        return { data: mapRow(data) };
      }
      if (name === 'dailySummary') return { data: { ok: true } };
      if (name === 'googleSheetsExport') {
        const regs = await entity('Registration').list('-created_date', 2000);
        return { data: regs };
      }
      if (name === 'bulkImportRegistrations') {
        return { data: { ok: true, message: 'Import endpoint moved to the Supabase client. Use the Admin Import page.' } };
      }
      throw new Error(`Supabase migration: function "${name}" has not been implemented yet.`);
    }
  },
  integrations: {
    Core: {
      async UploadFile({ file }) {
        const safeName = String(file.name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `uploads/${crypto.randomUUID()}-${safeName}`;
        const { error } = await supabase.storage.from('profile-images').upload(path, file, { upsert: false });
        if (error) throw error;
        return { file_url: path };
      },
      async ExtractDataFromUploadedFile({ file_url: url }) {
        throw new Error('File extraction is now handled locally/Supabase. CSV import can be implemented without supabaseApi.');
      }
    }
  }
};
