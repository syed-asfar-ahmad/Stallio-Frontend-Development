import ImageCropModal from './ImageCropModal';
import { STORE_HERO_VIEWPORT } from '../lib/imageCropViewports';
import { STORE_HERO_IMAGE_ASPECT, STORE_HERO_IMAGE_HEIGHT, STORE_HERO_IMAGE_WIDTH } from '../lib/heroStoreViewport';

export { STORE_HERO_IMAGE_WIDTH as HERO_IMAGE_WIDTH, STORE_HERO_IMAGE_HEIGHT as HERO_IMAGE_HEIGHT, STORE_HERO_IMAGE_ASPECT as HERO_IMAGE_ASPECT };

type Props = {
  open: boolean;
  imageFile: File | null;
  onClose: () => void;
  onConfirm: (blob: Blob) => void | Promise<void>;
};

export default function HeroImageCropModal(props: Props) {
  return <ImageCropModal viewport={STORE_HERO_VIEWPORT} {...props} />;
}
