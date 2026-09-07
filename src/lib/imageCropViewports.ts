export type ImageCropViewport = {
  width: number;
  height: number;
  titleKey: string;
  frameLabelKey: string;
};

export const PRODUCT_CARD_ASPECT_CLASS = 'aspect-square';

export const PRODUCT_IMAGE_FRAME_CLASS =
  'relative overflow-hidden bg-stone-50 dark:bg-zinc-950 border-b border-stone-100 dark:border-zinc-800';

export const PRODUCT_IMAGE_CLASS =
  'absolute inset-0 h-full w-full object-contain';

export const STORE_HERO_VIEWPORT: ImageCropViewport = {
  width: 1000,
  height: 600,
  titleKey: 'dashboard.home.cropTitle',
  frameLabelKey: 'dashboard.home.cropFrameLabel',
};

export const STORE_HERO_ASPECT_CLASS = 'aspect-[5/3]';

export const PRODUCT_CARD_VIEWPORT: ImageCropViewport = {
  width: 1200,
  height: 1200,
  titleKey: 'dashboard.productForm.cropTitle',
  frameLabelKey: 'dashboard.productForm.cropFrameLabel',
};

export const CATEGORY_CARD_VIEWPORT: ImageCropViewport = {
  width: 1200,
  height: 1200,
  titleKey: 'dashboard.categories.cropTitle',
  frameLabelKey: 'dashboard.categories.cropFrameLabel',
};

export const CATEGORY_CARD_ASPECT_CLASS = PRODUCT_CARD_ASPECT_CLASS;

export const ABOUT_HERO_VIEWPORT: ImageCropViewport = {
  width: 1200,
  height: 500,
  titleKey: 'dashboard.about.cropTitle',
  frameLabelKey: 'dashboard.about.cropFrameLabel',
};

export const ABOUT_HERO_ASPECT_CLASS = 'aspect-[12/5]';
