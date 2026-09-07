import ImageCropModal from './ImageCropModal';
import { ABOUT_HERO_VIEWPORT } from '../lib/imageCropViewports';

type Props = {
  open: boolean;
  imageFile: File | null;
  onClose: () => void;
  onConfirm: (blob: Blob) => void | Promise<void>;
};

export default function AboutHeroImageCropModal(props: Props) {
  return <ImageCropModal viewport={ABOUT_HERO_VIEWPORT} {...props} />;
}
