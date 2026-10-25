// ============================================================================
// Stallio Affiliate Link & QR Studio (LinkQrStudio.tsx)
// QR Studio with SVG/PNG/Card export, Custom Code Editor, and Campaign Link Builder
// ============================================================================

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  QrCode,
  Link as LinkIcon,
  Sparkles,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Layers,
  Tag,
} from 'lucide-react';
import { useAffiliateAuth } from '../AffiliateAuthContext';
import QrCard from '../components/QrCard';
import CustomCodeEditor from '../components/CustomCodeEditor';
import {
  DASHBOARD_INPUT,
  DASHBOARD_BTN_PRIMARY,
  DASHBOARD_BTN_SECONDARY,
} from '../../lib/dashboardFormClasses';

type StudioTab = 'qr' | 'code' | 'campaigns';

export default function LinkQrStudio() {
  const { t } = useTranslation();
  const tx = (key: string) => t(`affiliate.${key}`);
  const { affiliate } = useAffiliateAuth();
  const [activeTab, setActiveTab] = useState<StudioTab>('qr');
  const [campaignTag, setCampaignTag] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const primaryCode = affiliate?.primaryCode || 'partner';
  const baseLink =
    affiliate?.referralLink ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/r/${primaryCode}`
      : `https://stallio.shop/r/${primaryCode}`);

  const campaignLink = campaignTag.trim()
    ? `${baseLink}?s=${encodeURIComponent(campaignTag.trim().toLowerCase())}`
    : baseLink;

  async function handleCopyCampaignLink() {
    try {
      await navigator.clipboard.writeText(campaignLink);
      setCopiedLink(true);
      toast.success(tx('campaignLinkCopied'));
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error(tx('copyFailed'));
    }
  }

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 lg:gap-2 text-brand-600 mb-0.5">
            <QrCode className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-[11px] lg:text-sm font-semibold uppercase tracking-wide lg:tracking-widest">
              {tx('assetLinkGenerator')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight">
            {tx('linkStudio')}
          </h1>
          <p className="text-stone-500 dark:text-zinc-400 mt-0.5 text-xs lg:text-sm">
            {tx('linkStudioDescription')}
          </p>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stone-100 dark:bg-zinc-800/80 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('qr')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'qr'
              ? 'bg-white text-brand-700 shadow-sm dark:bg-zinc-700 dark:text-brand-300'
              : 'text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>{tx('qrCodeStudio')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'code'
              ? 'bg-white text-brand-700 shadow-sm dark:bg-zinc-700 dark:text-brand-300'
              : 'text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>{tx('customSlugAliases')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('campaigns')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'campaigns'
              ? 'bg-white text-brand-700 shadow-sm dark:bg-zinc-700 dark:text-brand-300'
              : 'text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>{tx('campaignLinkBuilder')}</span>
        </button>
      </div>

      {/* Tab 1: QR Code Studio */}
      {activeTab === 'qr' && (
        <div className="space-y-6">
          <QrCard
            code={primaryCode}
            partnerName={affiliate?.name || tx('partner')}
          />
        </div>
      )}

      {/* Tab 2: Custom Slug & Alias Manager */}
      {activeTab === 'code' && (
        <div className="space-y-6">
          <CustomCodeEditor />
        </div>
      )}

      {/* Tab 3: Campaign Link Builder */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-lg shadow-stone-200/30 dark:border-zinc-700/80 dark:bg-zinc-900 dark:shadow-black/40">
            <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2 mb-1">
              <Share2 className="w-4 h-4 text-brand-600" />
              <span>{tx('multiChannelGenerator')}</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mb-6">
              {tx('campaignBuilderDescription')}
            </p>

            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
                  {tx('campaignTagLabel')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={campaignTag}
                    onChange={(e) => setCampaignTag(e.target.value)}
                    placeholder={tx('campaignTagPlaceholder')}
                    className={DASHBOARD_INPUT}
                  />
                </div>
              </div>

              {/* Preset Shortcuts */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-stone-400 dark:text-zinc-500">{tx('presets')}</span>
                {['instagram', 'youtube', 'tiktok', 'newsletter', 'event-flyer'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCampaignTag(preset)}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium border border-stone-200 bg-stone-50 text-stone-700 hover:border-brand-300 hover:text-brand-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 transition-colors"
                  >
                    +{preset}
                  </button>
                ))}
              </div>

              {/* Resulting URL display */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
                  {tx('campaignTargetUrl')}
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <code className="block flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-xl bg-stone-50 dark:bg-zinc-950 px-3.5 py-3 text-xs sm:text-sm font-mono text-stone-800 dark:text-zinc-200 border border-stone-200 dark:border-zinc-700">
                    {campaignLink}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyCampaignLink}
                    className={`${DASHBOARD_BTN_PRIMARY} text-xs sm:text-sm shrink-0`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>{tx('copied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>{tx('copyLink')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
