import type { ReactNode } from 'react';
import ContentLanguagePicker from './ContentLanguagePicker';
import type { ShopContentLang } from '../lib/shopContentLanguages';

type Props = {
  label: string;
  hint?: string;
  value: ShopContentLang;
  onChange: (lang: ShopContentLang) => void;
  filled?: Partial<Record<ShopContentLang, boolean>>;
  languages?: ShopContentLang[];
  children: ReactNode;
  className?: string;
};

export default function MultilingualTextSection({
  label,
  hint,
  value,
  onChange,
  filled,
  languages,
  children,
  className = '',
}: Props) {
  return (
    <div
      className={`rounded-xl border border-stone-200 bg-stone-50/40 dark:border-zinc-700 dark:bg-zinc-950/40 p-4 sm:p-5 space-y-4 min-w-0 ${className}`}
    >
      <ContentLanguagePicker
        label={label}
        hint={hint}
        value={value}
        onChange={onChange}
        filled={filled}
        languages={languages}
      />
      <div className="space-y-4 min-w-0">{children}</div>
    </div>
  );
}
