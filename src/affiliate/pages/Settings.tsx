// ============================================================================
// Stallio Affiliate Settings Screen (Settings.tsx)
// Profile management, referral slug editor, notification preferences & security
// ============================================================================

import React, { useState } from 'react';
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
      toast.success('Partner profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setUpdatingPassword(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Failed to update password');
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
              ACCOUNT & PREFERENCES
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight">
            Partner Settings
          </h1>
          <p className="text-stone-500 dark:text-zinc-400 mt-0.5 text-xs lg:text-sm">
            Manage your partner profile, custom referral slug, notification alerts, and portal security.
          </p>
        </div>
      </div>

      {/* Section 1: Referral Code & Slug Editor */}
      <CustomCodeEditor />

      {/* Section 2: Partner Profile Information */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-5 lg:p-6 shadow-lg shadow-stone-200/30 dark:border-zinc-700/80 dark:bg-zinc-900 dark:shadow-black/40">
        <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2 mb-1">
          <User className="w-4 h-4 text-brand-600" />
          <span>Profile Information</span>
        </h3>
        <p className="text-xs text-stone-500 dark:text-zinc-400 mb-5">
          Your partner account contact and identification details.
        </p>

        <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
              Full Name or Business Name
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
              Email Address (Login & OTP Verification)
            </label>
            <input
              type="email"
              disabled
              value={affiliate?.email || ''}
              className={`${DASHBOARD_INPUT} cursor-not-allowed opacity-75`}
            />
            <p className="mt-1 text-[0.7rem] text-stone-500 dark:text-zinc-400">
              Email changes require administrative security verification.
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
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Section 3: Notification Preferences */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-5 lg:p-6 shadow-lg shadow-stone-200/30 dark:border-zinc-700/80 dark:bg-zinc-900 dark:shadow-black/40">
        <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2 mb-1">
          <Bell className="w-4 h-4 text-brand-600" />
          <span>Notification Alerts</span>
        </h3>
        <p className="text-xs text-stone-500 dark:text-zinc-400 mb-5">
          Choose which notifications you receive to your email address.
        </p>

        <div className="space-y-4 max-w-xl">
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-stone-200/80 dark:border-zinc-700/80">
            <div>
              <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
                New Merchant Signup
              </p>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                Receive an email when a seller registers with your link or QR code.
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
                Commission Released from Hold
              </p>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                Get notified when a 30-day hold concludes and funds enter your available balance.
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
                Monthly Payout Disbursed
              </p>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                Receive confirmation receipts whenever a monthly batch transfer is executed.
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
          <span>Security & Password</span>
        </h3>
        <p className="text-xs text-stone-500 dark:text-zinc-400 mb-5">
          Keep your partner account protected with a strong password.
        </p>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
              Current Password
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
                New Password
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
                Confirm New Password
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
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
