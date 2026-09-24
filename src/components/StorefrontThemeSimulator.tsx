import { ShoppingBag, ShieldCheck, ArrowRight, ArrowUpRight } from 'lucide-react';
import {
  type ResolvedTheme,
  type SampleThemeData,
  type SampleThemeProduct,
  SAMPLE_PREVIEWS,
  DEFAULT_THEME_ID,
} from '../themes';

export type PreviewDevice = 'desktop' | 'mobile';

export interface StorefrontThemeSimulatorProps {
  resolvedTheme: ResolvedTheme;
  sampleData?: SampleThemeData;
  device?: PreviewDevice;
  shopName?: string;
  className?: string;
}

export default function StorefrontThemeSimulator({
  resolvedTheme,
  sampleData,
  device = 'desktop',
  shopName = 'Sample Storefront',
  className = '',
}: StorefrontThemeSimulatorProps) {
  const { tokens, layout, themeId } = resolvedTheme;
  const activeSampleData: SampleThemeData =
    sampleData || SAMPLE_PREVIEWS[themeId] || SAMPLE_PREVIEWS[DEFAULT_THEME_ID];


  return (
    <div
      className={`mx-auto rounded-2xl border-4 border-stone-800 dark:border-zinc-700 overflow-hidden shadow-2xl transition-all duration-300 ${
        device === 'mobile' ? 'max-w-[340px]' : 'w-full'
      } ${className}`}
      style={{
        backgroundColor: tokens.colors.background,
        color: tokens.colors.textPrimary,
        fontFamily: tokens.typography.fontFamilyBody,
      }}
    >
      {/* 1. DYNAMIC HEADER VARIANT */}
      {layout.headerVariant === 'minimal-floating' ? (
        <div
          className="p-3 sm:p-4 border-b flex items-center justify-between backdrop-blur-md"
          style={{
            backgroundColor: `${tokens.colors.surface}ee`,
            borderColor: tokens.colors.border,
          }}
        >
          <span
            className="text-xs sm:text-sm font-light uppercase tracking-[0.25em]"
            style={{
              fontFamily: tokens.typography.fontFamilyHeading,
              color: tokens.colors.textPrimary,
            }}
          >
            {shopName}
          </span>
          <div className="flex items-center gap-3">
            <span
              className="text-[11px] font-light uppercase tracking-wider hidden sm:inline"
              style={{ color: tokens.colors.textSecondary }}
            >
              Catalog
            </span>
            <span
              className="text-[11px] font-light uppercase tracking-wider"
              style={{ color: tokens.colors.textPrimary }}
            >
              Bag (2)
            </span>
          </div>
        </div>
      ) : layout.headerVariant === 'centered-logo' ? (
        <div>
          <div
            className="py-1 px-3 text-center text-[10px] font-semibold text-white tracking-wide"
            style={{ backgroundColor: tokens.colors.primary }}
          >
            ✨ Complimentary Worldwide Shipping
          </div>
          <div
            className="p-3 border-b flex items-center justify-between"
            style={{
              backgroundColor: tokens.colors.surface,
              borderColor: tokens.colors.border,
            }}
          >
            <span className="text-[11px] font-semibold" style={{ color: tokens.colors.textSecondary }}>
              Menu
            </span>
            <span
              className="font-bold text-sm tracking-tight"
              style={{
                fontFamily: tokens.typography.fontFamilyHeading,
                letterSpacing: tokens.typography.headingLetterSpacing,
              }}
            >
              {shopName}
            </span>
            <span
              className="px-2 py-0.5 text-[10px] font-bold rounded-full"
              style={{
                backgroundColor: tokens.colors.primary,
                color: '#ffffff',
              }}
            >
              Cart 2
            </span>
          </div>
        </div>
      ) : layout.headerVariant === 'inline-compact' ? (
        <div
          className="px-3 py-2 border-b flex items-center justify-between gap-2"
          style={{
            backgroundColor: tokens.colors.surface,
            borderColor: tokens.colors.border,
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: tokens.colors.primary }}
            >
              {shopName.charAt(0)}
            </span>
            <span className="font-bold text-xs truncate max-w-[100px]">{shopName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
              style={{
                backgroundColor: tokens.colors.primary,
                borderRadius: tokens.radii.button,
              }}
            >
              Cart (2)
            </span>
          </div>
        </div>
      ) : (
        /* classic-bar default */
        <div>
          <div
            className="py-1 px-3 text-center text-[10px] font-bold text-white"
            style={{ backgroundColor: tokens.colors.primary }}
          >
            ✨ Free Shipping on Orders Over $50 • Fast Delivery
          </div>
          <div
            className="p-3 border-b flex items-center justify-between"
            style={{
              backgroundColor: tokens.colors.surface,
              borderColor: tokens.colors.border,
            }}
          >
            <span
              className="font-bold text-sm tracking-tight"
              style={{
                fontFamily: tokens.typography.fontFamilyHeading,
                letterSpacing: tokens.typography.headingLetterSpacing,
              }}
            >
              {shopName}
            </span>
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 text-[11px] font-semibold"
                style={{
                  backgroundColor: tokens.colors.primary,
                  color: '#ffffff',
                  borderRadius: tokens.radii.button,
                }}
              >
                Cart (2)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. DYNAMIC HERO VARIANT */}
      {layout.heroVariant === 'split-image' ? (
        <div
          className="p-4 sm:p-5 border-b"
          style={{ borderColor: tokens.colors.border, backgroundColor: tokens.colors.surface }}
        >
          <div className={`grid ${device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'} gap-4 items-center`}>
            <div className="space-y-2.5">
              <span
                className="px-2 py-0.5 text-[9px] font-bold uppercase rounded inline-block"
                style={{
                  backgroundColor: tokens.colors.badgeBg,
                  color: tokens.colors.badgeText,
                  borderRadius: tokens.radii.badge,
                }}
              >
                Official Drop
              </span>
              <h2
                className="text-base sm:text-lg font-black leading-tight"
                style={{
                  fontFamily: tokens.typography.fontFamilyHeading,
                  fontWeight: tokens.typography.headingFontWeight,
                  textTransform: tokens.typography.headingTransform,
                  letterSpacing: tokens.typography.headingLetterSpacing,
                }}
              >
                {shopName}
              </h2>
              <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: tokens.colors.textSecondary }}>
                High impact lifestyle statement pieces curated with precision.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span
                  className="px-3 py-1 text-[10px] font-bold text-white shadow-sm inline-flex items-center gap-1"
                  style={{
                    backgroundColor: tokens.colors.primary,
                    borderRadius: tokens.radii.button,
                  }}
                >
                  Shop Now <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
            <div
              className="relative h-36 w-full rounded-xl overflow-hidden border"
              style={{ borderColor: tokens.colors.border }}
            >
              <img src={activeSampleData.heroImage} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      ) : layout.heroVariant === 'card-showcase' ? (
        <div
          className="p-4 sm:p-5 border-b"
          style={{ borderColor: tokens.colors.border, backgroundColor: tokens.colors.surface }}
        >
          <div className={`grid ${device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'} gap-4 items-center`}>
            <div className="space-y-2">
              <span
                className="px-2 py-0.5 text-[9px] font-bold uppercase rounded text-white"
                style={{
                  backgroundColor: tokens.colors.primary,
                  borderRadius: tokens.radii.badge,
                }}
              >
                ★ Verified Catalog
              </span>
              <h2
                className="text-base sm:text-lg font-bold leading-tight"
                style={{
                  fontFamily: tokens.typography.fontFamilyHeading,
                  fontWeight: tokens.typography.headingFontWeight,
                }}
              >
                {shopName}
              </h2>
              <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: tokens.colors.textSecondary }}>
                Handcrafted organic artisan wares for refined homes.
              </p>
            </div>
            <div
              className="relative h-32 w-full rounded-xl overflow-hidden border shadow-md"
              style={{ borderColor: tokens.colors.border }}
            >
              <img src={activeSampleData.heroImage} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2.5">
                <span className="text-white text-[10px] font-bold">Spotlight Release</span>
              </div>
            </div>
          </div>
        </div>
      ) : layout.heroVariant === 'minimal-clean' ? (
        <div
          className="py-8 px-4 text-center border-b"
          style={{ borderColor: tokens.colors.border, backgroundColor: tokens.colors.surfaceSecondary }}
        >
          <h2
            className="text-lg sm:text-xl font-light uppercase tracking-[0.2em] leading-tight"
            style={{
              fontFamily: tokens.typography.fontFamilyHeading,
              color: tokens.colors.textPrimary,
            }}
          >
            {shopName}
          </h2>
          <p className="text-[11px] font-light mt-1.5 opacity-80 max-w-xs mx-auto" style={{ color: tokens.colors.textSecondary }}>
            Architectural essentials designed for timeless living.
          </p>
          <span
            className="inline-block mt-3 border-b pb-0.5 text-[10px] font-light uppercase tracking-[0.25em]"
            style={{ borderColor: tokens.colors.textPrimary, color: tokens.colors.textPrimary }}
          >
            Explore Collection →
          </span>
        </div>
      ) : (
        /* full-banner default */
        <div className="relative overflow-hidden border-b" style={{ borderColor: tokens.colors.border }}>
          <div className="relative h-44 sm:h-52 w-full overflow-hidden">
            <img src={activeSampleData.heroImage} alt="Hero banner" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-4 text-white">
              <span
                className="px-2 py-0.5 text-[9px] font-bold uppercase inline-block w-fit mb-1.5"
                style={{
                  backgroundColor: tokens.colors.primary,
                  borderRadius: tokens.radii.badge,
                }}
              >
                New Season Drop
              </span>
              <h2
                className="text-lg sm:text-xl font-bold leading-tight drop-shadow-sm"
                style={{
                  fontFamily: tokens.typography.fontFamilyHeading,
                  fontWeight: tokens.typography.headingFontWeight,
                  textTransform: tokens.typography.headingTransform,
                }}
              >
                {shopName}
              </h2>
              <p className="text-[11px] opacity-90 line-clamp-1 mt-0.5">
                Curated high quality pieces with custom theme styling.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. DYNAMIC PRODUCT CARDS GRID */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-bold"
            style={{ fontFamily: tokens.typography.fontFamilyHeading }}
          >
            Featured Collection
          </span>
          <span className="text-[10px] opacity-70 font-semibold">2 items</span>
        </div>

        <div className={`grid ${device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
          {activeSampleData.products.map((item) => {
            if (layout.productCardVariant === 'flat') {
              return (
                <div key={item.id} className="space-y-2">
                  <div
                    className="relative h-32 w-full overflow-hidden"
                    style={{ backgroundColor: tokens.colors.surfaceSecondary }}
                  >
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    <span
                      className="absolute bottom-2 start-2 px-2 py-0.5 text-[9px] uppercase tracking-wider font-medium"
                      style={{ backgroundColor: tokens.colors.surface, color: tokens.colors.textPrimary }}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-light text-xs truncate" style={{ color: tokens.colors.textPrimary }}>
                      {item.name}
                    </h4>
                    <p className="text-xs font-light mt-0.5" style={{ color: tokens.colors.textSecondary }}>
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            }

            if (layout.productCardVariant === 'elevated') {
              return (
                <div
                  key={item.id}
                  className="rounded-xl border overflow-hidden transition-all shadow-md"
                  style={{
                    backgroundColor: tokens.colors.surface,
                    borderColor: tokens.colors.border,
                    borderRadius: tokens.radii.card,
                    boxShadow: tokens.shadows.card,
                  }}
                >
                  <div
                    className="relative h-32 w-full overflow-hidden"
                    style={{ backgroundColor: tokens.colors.surfaceSecondary }}
                  >
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    <span
                      className="absolute top-2 start-2 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: tokens.colors.primary, borderRadius: tokens.radii.badge }}
                    >
                      {item.tag}
                    </span>
                  </div>

                  <div className="p-3">
                    <h4 className="font-bold text-xs truncate" style={{ fontFamily: tokens.typography.fontFamilyHeading }}>
                      {item.name}
                    </h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-xs" style={{ color: tokens.colors.primary }}>
                        ${item.price.toFixed(2)}
                      </span>
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: tokens.colors.primary }}
                      >
                        <ShoppingBag className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            if (layout.productCardVariant === 'compact') {
              return (
                <div
                  key={item.id}
                  className="rounded-lg border overflow-hidden p-2 flex gap-2 items-center"
                  style={{
                    backgroundColor: tokens.colors.surface,
                    borderColor: tokens.colors.border,
                    borderRadius: tokens.radii.card,
                  }}
                >
                  <img src={item.image} alt="" className="w-16 h-16 rounded object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-[11px] truncate">{item.name}</h4>
                    <span className="text-xs font-bold" style={{ color: tokens.colors.primary }}>
                      ${item.price.toFixed(2)}
                    </span>
                    <span
                      className="block text-[9px] px-1.5 py-0.5 rounded w-fit mt-1"
                      style={{ backgroundColor: tokens.colors.badgeBg, color: tokens.colors.badgeText }}
                    >
                      {item.tag}
                    </span>
                  </div>
                </div>
              );
            }

            if (layout.productCardVariant === 'editorial') {
              return (
                <div key={item.id} className="space-y-1.5">
                  <div
                    className="relative h-36 w-full overflow-hidden border"
                    style={{
                      borderColor: tokens.colors.border,
                      borderRadius: tokens.radii.card,
                    }}
                  >
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    <span
                      className="absolute top-2 start-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: tokens.colors.primary }}
                    >
                      Edition
                    </span>
                    <div className="absolute bottom-2 end-2 w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shadow">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <h4 className="font-medium text-xs truncate" style={{ fontFamily: tokens.typography.fontFamilyHeading }}>
                    {item.name}
                  </h4>
                  <p className="text-xs font-bold" style={{ color: tokens.colors.primary }}>
                    ${item.price.toFixed(2)}
                  </p>
                </div>
              );
            }

            /* bordered default */
            return (
              <div
                key={item.id}
                className="overflow-hidden border flex flex-col justify-between"
                style={{
                  backgroundColor: tokens.colors.surface,
                  borderColor: tokens.colors.border,
                  borderRadius: tokens.radii.card,
                  boxShadow: tokens.shadows.card,
                }}
              >
                <div
                  className="relative h-32 w-full overflow-hidden"
                  style={{ backgroundColor: tokens.colors.surfaceSecondary }}
                >
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  <span
                    className="absolute top-2 start-2 px-1.5 py-0.5 text-[9px] font-bold"
                    style={{
                      backgroundColor: tokens.colors.badgeBg,
                      color: tokens.colors.badgeText,
                      borderRadius: tokens.radii.badge,
                    }}
                  >
                    {item.tag}
                  </span>
                </div>
                <div className="p-3 flex flex-col flex-1 justify-between">
                  <div>
                    <h4 className="font-bold text-xs truncate" style={{ fontFamily: tokens.typography.fontFamilyHeading }}>
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-bold text-xs" style={{ color: tokens.colors.primary }}>
                        ${item.price.toFixed(2)}
                      </span>
                      <span className="line-through opacity-50 text-[10px]" style={{ color: tokens.colors.textMuted }}>
                        ${item.compare.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full mt-2.5 py-1.5 text-[11px] font-bold text-white flex items-center justify-center gap-1"
                    style={{
                      backgroundColor: tokens.colors.primary,
                      borderRadius: tokens.radii.button,
                    }}
                  >
                    <ShoppingBag className="w-3 h-3" />
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. DYNAMIC FOOTER VARIANT */}
        {layout.footerVariant === 'bold-newsletter' ? (
          <div
            className="mt-4 p-3.5 rounded-xl border text-center space-y-2"
            style={{
              backgroundColor: tokens.colors.surfaceSecondary,
              borderColor: tokens.colors.border,
              borderRadius: tokens.radii.card,
            }}
          >
            <span
              className="px-2 py-0.5 text-[9px] font-bold uppercase rounded text-white inline-block"
              style={{ backgroundColor: tokens.colors.primary }}
            >
              VIP Club
            </span>
            <p className="text-xs font-bold" style={{ color: tokens.colors.textPrimary }}>
              Subscribe for exclusive member drops
            </p>
            <div className="flex gap-1 pt-1">
              <input
                type="text"
                disabled
                placeholder="email@example.com"
                className="flex-1 px-2.5 py-1 text-[10px] rounded border"
                style={{
                  backgroundColor: tokens.colors.surface,
                  borderColor: tokens.colors.border,
                  color: tokens.colors.textPrimary,
                }}
              />
              <span
                className="px-2.5 py-1 text-[10px] font-bold text-white rounded"
                style={{ backgroundColor: tokens.colors.primary, borderRadius: tokens.radii.button }}
              >
                Join
              </span>
            </div>
          </div>
        ) : layout.footerVariant === 'centered-minimal' ? (
          <div className="mt-4 py-3 text-center border-t space-y-1" style={{ borderColor: tokens.colors.border }}>
            <span
              className="text-[10px] font-light uppercase tracking-[0.2em]"
              style={{ color: tokens.colors.textPrimary }}
            >
              {shopName}
            </span>
            <p className="text-[9px] font-light uppercase tracking-wider" style={{ color: tokens.colors.textMuted }}>
              © {new Date().getFullYear()} All Rights Reserved
            </p>
          </div>
        ) : (
          <div
            className="mt-4 p-2.5 rounded-lg border flex items-center gap-2 text-[11px]"
            style={{
              backgroundColor: tokens.colors.surfaceSecondary,
              borderColor: tokens.colors.border,
              borderRadius: tokens.radii.button,
            }}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[10px] font-medium">100% Authentic & Certified Quality</span>
          </div>
        )}
      </div>
    </div>
  );
}
