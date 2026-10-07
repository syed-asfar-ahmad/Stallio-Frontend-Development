import {
  isStandaloneThemePreview,
  useStandalonePreviewLinked,
  useThemePreviewPayload,
} from '../../lib/themePreviewBridge';

/**
 * Small pill shown only when the preview is opened in its own browser tab. It tells the viewer
 * this is a sample storefront and whether it is receiving live edits from the dashboard.
 */
export default function StandalonePreviewBadge() {
  const payload = useThemePreviewPayload();
  const linked = useStandalonePreviewLinked();

  if (!isStandaloneThemePreview() || !payload) return null;

  const themeName = payload.themeConfig.themeId.replace(/-/g, ' ');

  return (
    <div
      className="pointer-events-none fixed bottom-3 left-3 z-[9999] flex items-center gap-2 rounded-full bg-stone-900/90 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur"
      role="status"
    >
      <span
        className={`h-2 w-2 rounded-full ${linked ? 'bg-emerald-400' : 'bg-stone-400'}`}
        aria-hidden
      />
      <span className="capitalize">{themeName}</span>
      <span className="text-white/60">
        {linked ? '· Live preview · synced with dashboard' : '· Sample preview · open from the dashboard to sync'}
      </span>
    </div>
  );
}
