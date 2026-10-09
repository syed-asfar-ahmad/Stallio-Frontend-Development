import { useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import type { ThemeDefinition } from '../themes';
import { buildPreviewStore } from '../lib/themePreviewData';

export type ThumbnailMode = 'light' | 'dark';

/** Ask Unsplash for a smaller rendition; thumbnails never need the full-size sample photo. */
function sized(url: string, width: number): string {
  return url.includes('images.unsplash.com') ? url.replace(/([?&])w=\d+/, `$1w=${width}`) : url;
}

type PreviewImages = { hero: string; products: string[] };
const imageCache = new Map<string, PreviewImages>();

/** The same sample pictures the live storefront preview uses (hero + first products of the theme). */
function previewImages(themeId: ThemeDefinition['id']): PreviewImages {
  const cached = imageCache.get(themeId);
  if (cached) return cached;
  const store = buildPreviewStore('Sample Storefront', { version: 1, themeId });
  const result: PreviewImages = {
    hero: store.shop.homeHeroImage ?? '',
    products: store.products.slice(0, 4).map((p) => p.image ?? '').filter(Boolean),
  };
  imageCache.set(themeId, result);
  return result;
}

/** <img> that fades in over a solid placeholder and simply stays hidden if the picture fails. */
function FadeImage({ src, alt = '', className = '' }: { src: string; alt?: string; className?: string }) {
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>('loading');
  if (!src || state === 'failed') return null;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      onLoad={() => setState('loaded')}
      onError={() => setState('failed')}
      className={`absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-300 ${
        state === 'loaded' ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    />
  );
}

/**
 * Gallery thumbnail built from the theme's own sample-data pictures: the hero photo on the left and
 * a 2×2 grid of its sample products on the right, styled with the theme's palette and corner radius.
 *
 * It is plain images, so a gallery of any size costs a handful of small lazy-loaded pictures rather
 * than a full storefront app per card, and it needs no generated screenshots.
 */
export default function ThemeThumbnail({
  theme,
  mode,
  className = '',
}: {
  theme: ThemeDefinition;
  mode?: ThumbnailMode;
  className?: string;
}) {
  const { resolved } = useTheme();
  const activeMode: ThumbnailMode = mode ?? resolved;
  const tokens = activeMode === 'dark' && theme.defaultDarkTokens ? theme.defaultDarkTokens : theme.defaultTokens;
  const c = tokens.colors;
  const radius = tokens.radii.card;

  const images = useMemo(() => previewImages(theme.id), [theme.id]);
  const tiles = [0, 1, 2, 3].map((i) => images.products[i % Math.max(1, images.products.length)] ?? '');

  return (
    <div className={`absolute inset-0 flex ${className}`} style={{ backgroundColor: c.background }}>
      {/* Hero photo */}
      <div className="relative h-full w-[58%] overflow-hidden" style={{ backgroundColor: c.surfaceSecondary }}>
        <FadeImage src={sized(images.hero, 560)} alt={`${theme.displayName} sample storefront`} />
      </div>

      {/* Product photos */}
      <div
        className="grid h-full flex-1 grid-cols-2 grid-rows-2 gap-1.5 p-1.5"
        style={{ backgroundColor: c.background }}
      >
        {tiles.map((src, i) => (
          <div
            key={i}
            className="relative overflow-hidden"
            style={{
              backgroundColor: c.surfaceSecondary,
              border: `1px solid ${c.border}`,
              borderRadius: radius,
            }}
          >
            <FadeImage src={sized(src, 320)} />
          </div>
        ))}
      </div>
    </div>
  );
}
