// ============================================================================
// Stallio Affiliate Custom Slug Editor (CustomCodeEditor.tsx)
// Live debounced availability check, reserved slug protection, and 409 handling
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  History,
  Lock,
} from 'lucide-react';
import { validateAffiliateCode } from '../../lib/reservedWords';
import { affiliateApi } from '../affiliateApi';
import { useAffiliateAuth } from '../AffiliateAuthContext';
import {
  DASHBOARD_INPUT,
  DASHBOARD_BTN_PRIMARY,
  DASHBOARD_BTN_SECONDARY,
} from '../../lib/dashboardFormClasses';

interface CheckCodeResponse {
  available: boolean;
  reason?: string;
}

interface CustomCodeEditorProps {
  onCodeUpdated?: (newCode: string) => void;
  className?: string;
}

export default function CustomCodeEditor({
  onCodeUpdated,
  className = '',
}: CustomCodeEditorProps) {
  const { t } = useTranslation();
  const tx = (key: string, options?: Record<string, unknown>) => t(`affiliate.${key}`, options);
  const { affiliate, updateAffiliateProfile } = useAffiliateAuth();
  const currentCode = affiliate?.primaryCode || '';
  const aliasCodes = affiliate?.aliasCodes || [];

  const [inputCode, setInputCode] = useState(currentCode);
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<{
    status: 'idle' | 'valid_available' | 'taken' | 'invalid';
    message?: string;
  }>({ status: 'idle' });
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputCode(currentCode);
  }, [currentCode]);

  // Live validation & debounced availability check
  function handleInputChange(val: string) {
    const normalized = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setInputCode(normalized);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!normalized || normalized === currentCode) {
      setAvailability({ status: 'idle' });
      setChecking(false);
      return;
    }

    // Client-side format & reserved word validation
    const clientValidation = validateAffiliateCode(normalized);
    if (!clientValidation.valid) {
      setAvailability({
        status: 'invalid',
        message: clientValidation.reason,
      });
      setChecking(false);
      return;
    }

    // Set checking state and debounce server call
    setChecking(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await affiliateApi<CheckCodeResponse>(
          `/api/affiliate/code/check?code=${encodeURIComponent(normalized)}`
        );

        if (res.available) {
          setAvailability({
            status: 'valid_available',
            message: tx('codeAvailable', { url: `stallio.shop/r/${normalized}` }),
          });
        } else {
          setAvailability({
            status: 'taken',
            message: res.reason || tx('codeAlreadyUsed'),
          });
        }
      } catch {
        setAvailability({
          status: 'taken',
          message: tx('codeCheckUnavailable'),
        });
      } finally {
        setChecking(false);
      }
    }, 400);
  }

  // Handle final submission
  async function handleConfirmUpdate() {
    if (availability.status !== 'valid_available' || !inputCode) return;

    setSubmitting(true);
    try {
      const res = await affiliateApi<{ success: boolean; error?: string }>(
        '/api/affiliate/code',
        {
          method: 'PUT',
          body: { code: inputCode },
        }
      );

      if (res.error) {
        toast.error(res.error);
        return;
      }

      // Update local auth context
      await updateAffiliateProfile({
        primaryCode: inputCode,
        referralLink: `https://stallio.shop/r/${inputCode}`,
      });

      toast.success(tx('codeUpdated', { code: `"${inputCode}"` }));
      setShowConfirmModal(false);
      setAvailability({ status: 'idle' });
      onCodeUpdated?.(inputCode);
    } catch (err: unknown) {
      // 409 Conflict Handling per spec
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('409') || msg.includes('conflict') || msg.includes('taken')) {
        toast.error(tx('codeConflict'));
        setAvailability({
          status: 'taken',
          message: tx('codeConflictMessage'),
        });
      } else {
        toast.error(msg || tx('codeUpdateFailed'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  const isSaveDisabled =
    checking ||
    submitting ||
    availability.status !== 'valid_available' ||
    inputCode === currentCode;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Editor Box */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-5 lg:p-6 shadow-sm dark:border-zinc-700/80 dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <h4 className="text-sm lg:text-base font-bold text-stone-900 dark:text-zinc-100">
              {tx('customCode')}
            </h4>
          </div>
          <span className="text-xs text-stone-500 dark:text-zinc-400">
            {tx('currentCode')} <strong className="font-mono text-brand-600 dark:text-brand-400">{currentCode}</strong>
          </span>
        </div>

        <p className="text-xs text-stone-600 dark:text-zinc-400 mb-4">
          {tx('customCodeHelp')}
        </p>

        {/* Input with prefix and live availability badge */}
        <div className="space-y-3">
          <div className="relative flex rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-950/60 overflow-hidden focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all">
            <span className="inline-flex items-center px-3.5 bg-stone-100/80 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400 text-xs sm:text-sm font-mono border-e border-stone-200 dark:border-zinc-700 select-none">
              stallio.shop/r/
            </span>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={tx('codePlaceholder')}
              maxLength={20}
              className="flex-1 px-3.5 py-3 text-sm font-mono font-semibold text-stone-900 dark:text-zinc-100 bg-transparent focus:outline-none placeholder:text-stone-400"
            />
            {/* Live Indicator Icon */}
            <div className="flex items-center pe-3 shrink-0">
              {checking && (
                <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />
              )}
              {!checking && availability.status === 'valid_available' && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              )}
              {!checking && (availability.status === 'taken' || availability.status === 'invalid') && (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
          </div>

          {/* Feedback message banner */}
          {availability.status !== 'idle' && (
            <div
              className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium ${
                availability.status === 'valid_available'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/50'
                  : 'bg-red-50 text-red-800 border border-red-200/80 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/50'
              }`}
            >
              {availability.status === 'valid_available' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{availability.message}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isSaveDisabled}
              onClick={() => setShowConfirmModal(true)}
              className={DASHBOARD_BTN_PRIMARY}
            >
              <span>{tx('saveCode')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Retired Aliases Section */}
      <div className="rounded-2xl border border-stone-200/80 bg-stone-50/50 p-5 lg:p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2 text-stone-800 dark:text-zinc-200 mb-1">
          <History className="w-4 h-4 text-brand-600" />
          <h4 className="text-sm font-bold">{tx('retiredAliases')}</h4>
        </div>
        <p className="text-xs text-stone-500 dark:text-zinc-400 mb-3">
          {tx('aliasDescription')}
        </p>

        {aliasCodes.length === 0 ? (
          <p className="text-xs text-stone-400 dark:text-zinc-500 italic">
            {tx('noAliases')}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {aliasCodes.map((alias) => (
              <span
                key={alias}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 text-xs font-mono font-medium shadow-xs dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
              >
                <Lock className="w-3 h-3 text-stone-400" />
                <span>stallio.shop/r/{alias}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 dark:bg-zinc-900 dark:border-zinc-700 space-y-4">
            <div className="flex items-center gap-3 text-brand-600">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100">
                {tx('confirmMigration')}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-300 leading-relaxed">
              {tx('confirmMigrationText', { code: inputCode })}{' '}
              <strong className="font-mono text-brand-600 dark:text-brand-400">{inputCode}</strong>?
            </p>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300">
              {tx('migrationWarning', { code: currentCode })}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className={DASHBOARD_BTN_SECONDARY}
              >
                {tx('cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmUpdate}
                disabled={submitting}
                className={DASHBOARD_BTN_PRIMARY}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{tx('updating')}</span>
                  </>
                ) : (
                  <span>{tx('confirmUpdate')}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
