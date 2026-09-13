// Offline pending-sync queue for registrations. Uses localStorage.
const KEY = 'civic_pending_queue_v1';

export function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveQueue(q) {
  localStorage.setItem(KEY, JSON.stringify(q));
}

export function addToQueue(record) {
  const q = getQueue();
  const item = { ...record, _local_id: 'loc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7) };
  q.push(item);
  saveQueue(q);
  return item;
}

export function removeFromQueue(localId) {
  const q = getQueue().filter((r) => r._local_id !== localId);
  saveQueue(q);
}

export function queueLength() {
  return getQueue().length;
}

export function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

// Attempt to flush the queue to the server. Returns count synced.
export async function flushQueue() {
  if (!isOnline()) return 0;
  const { supabaseApi } = await import('@/api/supabaseApi');
  const q = getQueue();
  let synced = 0;
  const remaining = [];
  for (const item of q) {
    try {
      const payload = { ...item };
      delete payload._local_id;
      // Use the backend function for server-side validation + idempotency.
      // Each queued item carries its own idempotency_key so a retry after a
      // partial failure won't create a duplicate.
      if (!payload.idempotency_key) {
        payload.idempotency_key = 'idem_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
      }
      await supabaseApi.functions.invoke('createRegistration', payload);
      synced++;
    } catch (e) {
      // keep in queue on failure
      remaining.push(item);
    }
  }
  saveQueue(remaining);
  // Notify the agent that offline data has synced successfully
  if (synced > 0) {
    try {
      const me = await supabaseApi.auth.me();
      if (me) {
        await supabaseApi.entities.Notification.create({
          recipient_id: me.id,
          title: 'Offline data synced',
          message: `${synced} record(s) successfully synced to the main system.`,
          category: 'system',
          read: false,
        });
      }
    } catch {}
  }
  return synced;
}