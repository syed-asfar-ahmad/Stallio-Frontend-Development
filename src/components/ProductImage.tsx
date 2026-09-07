import type { ReactNode } from 'react';
import {
  PRODUCT_CARD_ASPECT_CLASS,
  PRODUCT_IMAGE_CLASS,
  PRODUCT_IMAGE_FRAME_CLASS,
} from '../lib/imageCropViewports';
import { getProductImageDisplayUrl } from '../lib/productImageUrl';

type Props = {
  src: string;
  alt: string;
  aspectClass?: string;
  className?: string;
  imageClassName?: string;
  loading?: 'lazy' | 'eager';
  children?: ReactNode;
};

export default function ProductImage({
  src,
  alt,
  aspectClass = PRODUCT_CARD_ASPECT_CLASS,
  className = '',
  imageClassName = '',
  loading,
  children,
}: Props) {
  return (
    <div className={`${aspectClass} ${PRODUCT_IMAGE_FRAME_CLASS} ${className}`.trim()}>
      <img
        src={getProductImageDisplayUrl(src)}
        alt={alt}
        loading={loading}
        className={`${PRODUCT_IMAGE_CLASS} ${imageClassName}`.trim()}
      />
      {children}
    </div>
  );
}
