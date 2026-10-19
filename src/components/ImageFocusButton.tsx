import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Crosshair } from 'lucide-react';
import FocalPointPicker from './FocalPointPicker';
import type { FocalPreviewRatio } from './FocalPointPicker';

const DEFAULT_CLASS =
  'inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-semibold border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed';

type Props = {
  /** Stored image URL (with or without a focal fragment). Renders nothing when empty. */
  src: string | null | undefined;
  /** Receives the image URL with the chosen focal point stored in it. */
  onChange: (nextSrc: string) => void;
  previews?: FocalPreviewRatio[];
  disabled?: boolean;
  className?: string;
  iconClassName?: string;
  /** Icon-only round button (label stays available to screen readers). */
  iconOnly?: boolean;
};

/** "Adjust focus" button + picker. Used next to every image upload (category, hero, about…). */
export default function ImageFocusButton({
  src,
  onChange,
  previews,
  disabled,
  className = DEFAULT_CLASS,
  iconClassName = 'w-4 h-4',
  iconOnly = false,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  if (!src) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className={className}
        title={iconOnly ? t('dashboard.focal.adjust') : undefined}
      >
        <Crosshair className={`${iconClassName} shrink-0`} aria-hidden />
        <span className={iconOnly ? 'sr-only' : 'truncate'}>{t('dashboard.focal.adjust')}</span>
      </button>
      <FocalPointPicker
        open={open}
        src={src}
        previews={previews}
        onClose={() => setOpen(false)}
        onConfirm={(next) => {
          onChange(next);
          setOpen(false);
        }}
      />
    </>
  );
}
