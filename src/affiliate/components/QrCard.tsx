// ============================================================================
// Stallio Affiliate QR Studio & Card Component (QrCard.tsx)
// Provides SVG vector download, 1024px PNG export, and printable card
// ============================================================================

import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  Download,
  Printer,
  Copy,
  ExternalLink,
  Sparkles,
  QrCode as QrIcon,
  Check,
  Store,
} from 'lucide-react';
import BrandLogo from '../../components/BrandLogo';
import {
  DASHBOARD_BTN_PRIMARY,
  DASHBOARD_BTN_SECONDARY,
} from '../../lib/dashboardFormClasses';

interface QrCardProps {
  code: string;
  partnerName?: string;
  baseUrl?: string;
  className?: string;
}

export default function QrCard({
  code,
  partnerName = 'Affiliate Partner',
  baseUrl,
  className = '',
}: QrCardProps) {
  const { t } = useTranslation();
  const tx = (key: string, options?: Record<string, unknown>) => t(`affiliate.${key}`, options);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const printableCardRef = useRef<HTMLDivElement>(null);
  const hiddenCanvasRef = useRef<HTMLDivElement>(null);

  const origin = baseUrl || 'https://stalio.shop';

  // Spec Rule: A QR code encodes the link with ?s=qr so scans are counted apart from clicks.
  const rawQrUrl = `${origin}/r/${code.toLowerCase()}?s=qr`;
  const cleanDisplayUrl = `${origin.replace(/^https?:\/\//, '')}/r/${code.toLowerCase()}`;

  // 1. Copy Link to Clipboard
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(rawQrUrl);
      setCopied(true);
      toast.success(tx('copyQrTarget'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(tx('qrCopyFailed'));
    }
  }

  // 2. Download Vector SVG
  function downloadSvg() {
    const svgEl = document.getElementById(`stallio-qr-svg-${code}`) as SVGSVGElement | null;
    if (!svgEl) {
      toast.error(tx('svgDownloadFailed'));
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `stallio-qr-${code}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
    toast.success(tx('svgDownloaded'));
  }

  // 3. Download Ultra High-Res 1024px PNG
  async function downloadHighResPng() {
    setDownloading(true);
    try {
      const size = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // Render QR code from hidden canvas or generate image
      const hiddenCanvas = hiddenCanvasRef.current?.querySelector('canvas');
      if (hiddenCanvas) {
        // Draw the 1024 canvas directly
        ctx.drawImage(hiddenCanvas, 0, 0, size, size);
      } else {
        // Fallback drawing from SVG
        const svgEl = document.getElementById(`stallio-qr-svg-${code}`) as SVGSVGElement | null;
        if (svgEl) {
          const svgData = new XMLSerializer().serializeToString(svgEl);
          const img = new Image();
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              ctx.drawImage(img, 64, 64, size - 128, size - 128);
              URL.revokeObjectURL(url);
              resolve();
            };
            img.onerror = reject;
            img.src = url;
          });
        }
      }

      // Add branding header & footer text onto the PNG
      ctx.fillStyle = '#5b45e5';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `stallio-qr-1024px-${code}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success(tx('pngDownloaded'));
    } catch {
      toast.error(tx('pngExportFailed'));
    } finally {
      setDownloading(false);
    }
  }

  // 4. Print Card Trigger
  function handlePrint() {
    window.print();
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Hidden 1024px canvas used for pure-pixel high-res export */}
      <div ref={hiddenCanvasRef} className="hidden" aria-hidden="true">
        <QRCodeCanvas
          value={rawQrUrl}
          size={1024}
          level="H"
          marginSize={2}
          fgColor="#18181b"
          bgColor="#ffffff"
        />
      </div>

      {/* Scoped print styling for physical card generation */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #stallio-printable-qr-card, #stallio-printable-qr-card * {
            visibility: visible !important;
          }
          #stallio-printable-qr-card {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 100% !important;
            max-width: 650px !important;
            box-shadow: none !important;
            border: 2px solid #5b45e5 !important;
            margin: 0 !important;
            background: #ffffff !important;
            color: #18181b !important;
          }
        }
      `}</style>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: QR Code Preview and Fast Action Buttons */}
        <div className="lg:col-span-5 flex flex-col items-center rounded-2xl border border-stone-200/80 bg-white p-6 shadow-lg shadow-stone-200/30 dark:border-zinc-700/80 dark:bg-zinc-900 dark:shadow-black/40">
          {/* QR Display Card */}
          <div className="relative group p-4 rounded-2xl bg-white border border-stone-200 shadow-inner dark:bg-white dark:border-zinc-300">
            <QRCodeSVG
              id={`stallio-qr-svg-${code}`}
              value={rawQrUrl}
              size={220}
              level="H"
              marginSize={1}
              fgColor="#18181b"
              bgColor="#ffffff"
              className="w-full h-auto max-w-[220px]"
            />
            {/* Center icon badge for branding */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-xl bg-white shadow-md border border-stone-200 flex items-center justify-center">
                <Store className="w-5 h-5 text-brand-600" />
              </div>
            </div>
          </div>

          {/* Quick link & Code */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-800 dark:bg-brand-950/60 dark:text-brand-300 text-xs font-bold border border-brand-200/80 dark:border-brand-800/60">
              <QrIcon className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>{tx('qrScanTracker')}</span>
            </div>
            <p className="mt-2 text-sm font-mono font-semibold text-stone-800 dark:text-zinc-200">
              {cleanDisplayUrl}
            </p>
          </div>

          {/* Action Button Row */}
          <div className="mt-6 flex flex-wrap gap-2.5 w-full justify-center">
            <button
              type="button"
              onClick={handleCopy}
              className={`${DASHBOARD_BTN_SECONDARY} flex-1 min-w-[120px] text-xs flex items-center justify-center gap-1.5`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{tx('copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-600 dark:text-zinc-400" />
                  <span>{tx('copyLink')}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={downloadSvg}
              className={`${DASHBOARD_BTN_SECONDARY} flex-1 min-w-[120px] text-xs flex items-center justify-center gap-1.5`}
              title={tx('downloadSvgTitle')}
            >
              <Download className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>{tx('vectorSvg')}</span>
            </button>

            <button
              type="button"
              onClick={downloadHighResPng}
              disabled={downloading}
              className={`${DASHBOARD_BTN_PRIMARY} w-full text-xs flex items-center justify-center gap-2`}
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? tx('exporting') : tx('downloadPng')}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Premium Printable Marketing Card View */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>{tx('printableCard')}</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                {tx('printCardDescription')}
              </p>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className={`${DASHBOARD_BTN_SECONDARY} text-xs flex items-center gap-1.5`}
            >
              <Printer className="w-4 h-4 text-brand-600" />
              <span>{tx('printCard')}</span>
            </button>
          </div>

          {/* The Physical Card Template (Supports CSS print media query) */}
          <div
            ref={printableCardRef}
            id="stallio-printable-qr-card"
            className="relative overflow-hidden rounded-3xl border-2 border-stone-200/90 bg-gradient-to-br from-white via-stone-50 to-brand-50/20 p-6 sm:p-8 shadow-xl shadow-stone-200/40 dark:border-zinc-700/80 dark:bg-zinc-900 dark:from-zinc-900 dark:to-zinc-950 dark:shadow-black/50"
          >
            {/* Ambient Background Accents */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-brand-500/10 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-brand-600/10 blur-2xl pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              {/* QR Code Container on Card */}
              <div className="shrink-0 rounded-2xl bg-white p-3.5 shadow-md border border-stone-200/90 dark:border-zinc-200">
                <QRCodeSVG
                  value={rawQrUrl}
                  size={150}
                  level="H"
                  marginSize={1}
                  fgColor="#18181b"
                  bgColor="#ffffff"
                />
              </div>

              {/* Pitch & Callout */}
              <div className="flex-1 text-center sm:text-start space-y-2">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <BrandLogo className="h-6 w-auto" />
                  <span className="rounded bg-brand-100 px-2 py-0.5 text-[0.625rem] font-extrabold uppercase tracking-wider text-brand-800 dark:bg-brand-950/80 dark:text-brand-300">
                    {tx('officialPartner')}
                  </span>
                </div>

                <h4 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-zinc-100 tracking-tight leading-snug">
                  {tx('promoHeadline')}
                </h4>

                <p className="text-xs text-stone-600 dark:text-zinc-300 leading-relaxed">
                  {tx('promoDescription')}
                </p>

                <div className="pt-2 flex items-center justify-center sm:justify-start gap-2 text-[0.7rem] text-stone-500 dark:text-zinc-400">
                  <span>{tx('referredBy', { name: partnerName })}</span>
                  <span>•</span>
                  <span className="font-mono font-bold text-brand-700 dark:text-brand-400">{tx('codeLabel', { code })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
