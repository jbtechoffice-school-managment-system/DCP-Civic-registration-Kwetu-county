import { Navigate } from 'react-router-dom';
import { useCurrentUser, isStaff } from '@/lib/auth-role';

export default function HomeRedirect() {
  const { user, loading } = useCurrentUser();
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }
  return <Navigate to={isStaff(user) ? '/admin' : '/app'} replace />;
}