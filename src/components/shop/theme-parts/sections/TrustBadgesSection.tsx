import { resolveTrustBadgeType, TrustBadgeTypeIcon } from '../../../../lib/trustBadgeIcons';
import { getLocalizedTrustLabel } from '../../../../lib/shopContentLanguages';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import type { Shop } from '../../../../types';

export default function TrustBadgesSection({ shop, containerClass }: { shop: Shop; containerClass: string }) {
  const { t, lang } = useShopLanguage();
  const badges = (shop.homeTrustBadges ?? []).filter((b) => b.label?.trim());
  if (!shop.homeTrustEnabled || badges.length === 0) return null;

  return (
    <section className={`${containerClass} mt-6 lg:mt-10`}>
      <h2
        className="mb-4 text-base font-bold lg:text-xl"
        style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}
      >
        {t('trustTitle')}
      </h2>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3">
        {badges.map((badge, i) => (
          <div
            key={`${badge.label}-${i}`}
            className="flex items-center justify-center gap-2 rounded-[var(--theme-radius-card)] border px-3 py-3 text-center"
            style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
          >
            <TrustBadgeTypeIcon
              type={resolveTrustBadgeType(badge.icon)}
              className="h-4 w-4 shrink-0"
            />
            <span className="text-xs font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
              {getLocalizedTrustLabel(badge, lang)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}