import { supabaseApi } from '@/api/supabaseApi';

let cachedMe = null;

export async function logAudit(action, recordId = '', details = '') {
  try {
    if (!cachedMe) cachedMe = await supabaseApi.auth.me();
    await supabaseApi.entities.AuditLog.create({
      actor_id: cachedMe.id,
      actor_email: cachedMe.email,
      action,
      record_id: recordId,
      details,
    });
  } catch (e) {
    // audit logging must never break the user's primary action
    console.warn('audit log failed', e);
  }
}