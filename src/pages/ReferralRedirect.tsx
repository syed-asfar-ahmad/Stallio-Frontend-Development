import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { saveReferralCode, recordReferralClick } from '../lib/referral';
import { normalizeSlug } from '../lib/reservedWords';

export default function ReferralRedirect() {
  const { t } = useTranslation();
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const cleanCode = code ? normalizeSlug(code) : '';
  const isQr = searchParams.get('s') === 'qr';

  useEffect(() => {
    if (!cleanCode) {
      navigate('/signup', { replace: true });
      return;
    }

    // 1. Persist attribution locally (30-day window)
    saveReferralCode(cleanCode, isQr ? 'qr' : 'link');

    // 2. Fire non-blocking click tracking event
    recordReferralClick(cleanCode, isQr ? 'qr' : 'link');

    // 3. Smooth transition to seller signup
    const timer = setTimeout(() => {
      navigate(`/signup?ref=${encodeURIComponent(cleanCode)}`, { replace: true });
    }, 400);

    return () => clearTimeout(timer);
  }, [cleanCode, isQr, navigate]);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-stone-50 px-4 text-center dark:bg-zinc-950">
      {/* Ambient background glow matching Stallio's brand aesthetic */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(94,43,236,0.12),transparent_60%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(94,43,236,0.2),transparent_60%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15"
        aria-hidden
      />

      <div className="relative z-10 flex max-w-md flex-col items-center">
        {/* Animated Brand Logo */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-3xl bg-brand-500/10 blur-xl dark:bg-brand-500/20" />
          <BrandLogo className="relative h-20 w-auto transition-transform duration-700 hover:scale-105" />
        </div>

        {/* Partner Invitation Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur-sm dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{t('affiliate.specialInvitation')}</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400">• {cleanCode.toUpperCase()}</span>
        </div>

        {/* Status text */}
        <h1 className="mt-4 text-xl font-bold tracking-tight text-stone-900 sm:text-2xl dark:text-zinc-100">
          {t('affiliate.connectingToStallio')}
        </h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-zinc-400">
          {t('affiliate.redirectDescription')}
        </p>

        {/* Triple Dot Loader matching Stallio design */}
        <div className="mt-6 flex items-center justify-center gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-brand-500 dark:bg-brand-400 animate-admin-loader-dot"
              style={{ animationDelay: `${i * 0.16}s` }}
            />
          ))}
        </div>

        {/* Manual fallback link */}
        <div className="mt-8">
          <button
            type="button"
            onClick={() => navigate(`/signup?ref=${encodeURIComponent(cleanCode)}`, { replace: true })}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            <span>{t('affiliate.redirectFallback')}</span>
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}
