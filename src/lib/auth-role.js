import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';

// Hook returning the current user with role + profile fields.
export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me = await supabaseApi.auth.me();
        if (alive) {
          setUser(me);
          setLoading(false);
        }
      } catch {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { user, loading };
}

export function isAdmin(u) { return u?.role === 'admin'; }
export function isSupervisor(u) { return u?.role === 'supervisor'; }
export function isAgent(u) { return u?.role === 'field_agent'; }
export function isStaff(u) { return isAdmin(u) || isSupervisor(u); }