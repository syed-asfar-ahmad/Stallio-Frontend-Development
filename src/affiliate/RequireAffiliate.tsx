import { Navigate, useLocation } from 'react-router-dom';
import { useAffiliateAuth } from './AffiliateAuthContext';
import AdminLoading from '../components/admin/AdminLoading';

export default function RequireAffiliate({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAffiliateAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-zinc-950">
        <AdminLoading message="Restoring partner session..." />
      </div>
    );
  }

  if (!token) {
    return (
      <Navigate
        to={`/affiliate/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  return <>{children}</>;
}
