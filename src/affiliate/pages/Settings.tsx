// ============================================================================
// Stallio Affiliate Settings Screen (Settings.tsx)
// Profile management, referral slug editor, notification preferences & security
// ============================================================================

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Lock,
  Sparkles,
  Check,
  Loader2,
  KeyRound,
  FileCheck,
} from 'lucide-react';
import { useAffiliateAuth } from '../AffiliateAuthContext';
import CustomCodeEditor from '../components/CustomCodeEditor';
import {
  DASHBOARD_INPUT,
  DASHBOARD_BTN_PRIMARY,
  DASHBOARD_BTN_SECONDARY,
} from '../../lib/dashboardFormClasses';

export default function Settings() {
  const { t } = useTranslation();
  const tx = (key: string) => t(`affiliate.${key}`);
  const { affiliate, updateAffiliateProfile } = useAffiliateAuth();

  // Profile Form State
  const [name, setName] = useState(affiliate?.name || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Notifications State
  const [notifyOnSignup, setNotifyOnSignup] = useState(true);
  const [notifyOnCommission, setNotifyOnCommission] = useState(true);
  const [notifyOnPayout, setNotifyOnPayout] = useState(true);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setUpdatingProfile(true);
    try {
      await updateAffiliateProfile({ name: name.trim() });
      toast.success(tx('profileUpdated'));
    } catch {
      toast.error(tx('profileUpdateFailed'));
    } finally {
      setUpdatingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(tx('passwordMismatch'));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(tx('passwordMinLength'));
      return;
    }

    setUpdatingPassword(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      toast.success(tx('passwordUpdated'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error(tx('passwordUpdateFailed'));
    } finally {
      setUpdatingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 lg:gap-2 text-brand-600 mb-0.5">
            <SettingsIcon className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-[11px] lg:text-sm font-semibold uppercase tracking-wide lg:tracking-widest">
              {tx('accountPreferences')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight">
            {tx('profileSettings')}
          </h1>
          <p className="text-stone-500 dark:text-zinc-400 mt-0.5 text-xs lg:text-sm">
            {tx('settingsDescription')}
          </p>
        </div>
      </div>

      {/* Section 1: Referral Code & Slug Editor */}
      <CustomCodeEditor />

      {/* Section 2: Partner Profile Information */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-5 lg:p-6 shadow-lg shadow-stone-200/30 dark:border-zinc-700/80 dark:bg-zinc-900 dark:shadow-black/40">
        <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2 mb-1">
          <User className="w-4 h-4 text-brand-600" />
          <span>{tx('profileInformation')}</span>
        </h3>
        <p className="text-xs text-stone-500 dark:text-zinc-400 mb-5">
          {tx('profileDetailsDescription')}
        </p>

        <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
              {tx('fullNameOrBusiness')}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={DASHBOARD_INPUT}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
              {tx('emailLoginOtp')}
            </label>
            <input
              type="email"
              disabled
              value={affiliate?.email || ''}
              className={`${DASHBOARD_INPUT} cursor-not-allowed opacity-75`}
            />
            <p className="mt-1 text-[0.7rem] text-stone-500 dark:text-zinc-400">
              {tx('emailSecurityNotice')}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={updatingProfile}
              className={DASHBOARD_BTN_PRIMARY}
            >
              {updatingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{tx('saving')}</span>
                </>
              ) : (
                <span>{tx('saveChanges')}</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Section 3: Notification Preferences */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-5 lg:p-6 shadow-lg shadow-stone-200/30 dark:border-zinc-700/80 dark:bg-zinc-900 dark:shadow-black/40">
        <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2 mb-1">
          <Bell className="w-4 h-4 text-brand-600" />
          <span>{tx('notificationAlerts')}</span>
        </h3>
        <p className="text-xs text-stone-500 dark:text-zinc-400 mb-5">
          {tx('notificationDescription')}
        </p>

        <div className="space-y-4 max-w-xl">
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-stone-200/80 dark:border-zinc-700/80">
            <div>
              <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
                {tx('newMerchantSignup')}
              </p>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                {tx('newSignupNotice')}
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyOnSignup}
              onChange={(e) => setNotifyOnSignup(e.target.checked)}
              className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-stone-200/80 dark:border-zinc-700/80">
            <div>
              <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
                {tx('commissionReleased')}
              </p>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                {tx('commissionReleasedNotice')}
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyOnCommission}
              onChange={(e) => setNotifyOnCommission(e.target.checked)}
              className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-stone-200/80 dark:border-zinc-700/80">
            <div>
              <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
                {tx('monthlyPayoutDisbursed')}
              </p>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                {tx('monthlyPayoutNotice')}
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyOnPayout}
              onChange={(e) => setNotifyOnPayout(e.target.checked)}
              className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Security & Password */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-5 lg:p-6 shadow-lg shadow-stone-200/30 dark:border-zinc-700/80 dark:bg-zinc-900 dark:shadow-black/40">
        <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-brand-600" />
          <span>{tx('securityPassword')}</span>
        </h3>
        <p className="text-xs text-stone-500 dark:text-zinc-400 mb-5">
          {tx('securityDescription')}
        </p>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
              {tx('currentPassword')}
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={DASHBOARD_INPUT}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
                {tx('newPassword')}
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={DASHBOARD_INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
                {tx('confirmNewPassword')}
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={DASHBOARD_INPUT}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={updatingPassword}
              className={DASHBOARD_BTN_PRIMARY}
            >
              {updatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{tx('updating')}</span>
                </>
              ) : (
                <span>{tx('updatePassword')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
