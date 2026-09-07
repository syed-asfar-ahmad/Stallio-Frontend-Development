import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import AdminBrandMark from '../../components/admin/AdminBrandMark';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import PublicLayout from '../../components/PublicLayout';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, logout, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Admin Sign In, Stallio';
  }, []);

  useEffect(() => {
    if (!loading && user?.role === 'admin') navigate('/admin', { replace: true });
    if (!loading && user && user.role !== 'admin') navigate('/dashboard', { replace: true });
  }, [loading, user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { error: err, role } = await login(email, password);
    setSubmitting(false);
    if (err) {
      setError(err);
      toast.error(err);
      return;
    }
    if (role !== 'admin') {
      logout();
      setError('This account does not have admin access.');
      toast.error('Not an admin account');
      return;
    }
    toast.success('Welcome back');
    navigate('/admin');
  }

  const inputClass =
    'w-full rounded-2xl border-2 border-stone-200 bg-white py-3 text-stone-900 placeholder:text-stone-400 transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12 sm:py-3.5 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-brand-400 dark:focus:ring-brand-400/20';

  return (
    <PublicLayout hideFooter>
      <div className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col items-center justify-center overflow-x-hidden bg-stone-50 px-4 py-8 dark:bg-zinc-950">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(45,212,191,0.14),transparent_55%)] dark:opacity-40"
          aria-hidden
        />

        <div className="relative w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4">
              <AdminBrandMark size="md" />
            </div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
              Platform
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-stone-900 dark:text-zinc-100">Admin sign in</h1>
            <p className="mt-1 text-sm text-stone-500 dark:text-zinc-400">
              Use your administrator account credentials
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200/90 bg-white/95 p-6 shadow-[0_16px_48px_-36px_rgba(15,23,42,0.28)] ring-1 ring-stone-100/80 backdrop-blur-sm dark:border-zinc-600/90 dark:bg-zinc-900/95 dark:ring-zinc-800/80 dark:shadow-black/40 sm:p-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50/95 p-3 text-xs font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 sm:text-sm"
                  role="alert"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[0.65rem] font-bold text-red-600 dark:bg-red-900/60 dark:text-red-300">
                    !
                  </span>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="admin-email" className="mb-1.5 block text-xs font-semibold text-stone-800 sm:text-sm dark:text-zinc-200">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-stone-400 dark:text-zinc-500" />
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="admin@yourcompany.com"
                    className={`${inputClass} pl-11 pr-3 text-sm sm:pl-12 sm:text-base`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password" className="mb-1.5 block text-xs font-semibold text-stone-800 sm:text-sm dark:text-zinc-200">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-stone-400 dark:text-zinc-500" />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="current-password"
                    className={`${inputClass} pl-11 pr-11 text-sm sm:pl-12 sm:text-base`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    aria-label={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="home-btn-primary group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-500 py-3 text-sm font-bold text-stone-950 shadow-md shadow-brand-900/10 transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:py-3.5 sm:text-base"
              >
                <LogIn className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden />
                {submitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <p className="mt-5 border-t border-stone-100 pt-4 text-center text-xs font-medium text-stone-600 dark:border-zinc-700 dark:text-zinc-400">
              Seller?{' '}
              <Link to="/login" className="font-bold text-brand-700 no-underline hover:text-brand-800 dark:text-brand-400">
                Go to seller login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
