import { STORE_HERO_VIEWPORT } from './imageCropViewports';

export { STORE_HERO_VIEWPORT, STORE_HERO_ASPECT_CLASS, type ImageCropViewport } from './imageCropViewports';

export const STORE_HERO_IMAGE_WIDTH = STORE_HERO_VIEWPORT.width;
export const STORE_HERO_IMAGE_HEIGHT = STORE_HERO_VIEWPORT.height;
export const STORE_HERO_IMAGE_ASPECT = STORE_HERO_IMAGE_WIDTH / STORE_HERO_IMAGE_HEIGHT;
