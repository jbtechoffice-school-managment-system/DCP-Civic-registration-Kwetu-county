import { useAuth } from '@/lib/AuthContext';

// Hook returning the current authenticated profile with role + profile fields.
// AuthContext owns the Supabase session check so components do not create
// duplicate auth requests or refresh-token loops.
export function useCurrentUser() {
  const { user, isLoadingAuth, authChecked } = useAuth();

  return {
    user,
    loading: isLoadingAuth || !authChecked,
  };
}

export function isAdmin(u) {
  return u?.role === 'admin';
}

export function isSupervisor(u) {
  return u?.role === 'supervisor';
}

export function isAgent(u) {
  return u?.role === 'field_agent';
}

export function isStaff(u) {
  return isAdmin(u) || isSupervisor(u);
}