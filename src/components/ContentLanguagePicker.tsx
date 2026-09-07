import { FieldLabelWithHelp } from './FieldLabelWithHelp';
import ContentLanguageTabs from './ContentLanguageTabs';
import type { ShopContentLang } from '../lib/shopContentLanguages';
import { SHOP_CONTENT_LANGUAGES } from '../lib/shopContentLanguages';

type Props = {
  label: string;
  hint?: string;
  value: ShopContentLang;
  onChange: (lang: ShopContentLang) => void;
  filled?: Partial<Record<ShopContentLang, boolean>>;
  languages?: ShopContentLang[];
  className?: string;
};

export default function ContentLanguagePicker({
  label,
  hint,
  value,
  onChange,
  filled = {},
  languages,
  className = '',
}: Props) {
  const langs = languages ?? SHOP_CONTENT_LANGUAGES.map((l) => l.id);
  const items = SHOP_CONTENT_LANGUAGES.filter((l) => langs.includes(l.id));
  if (items.length <= 1) return null;

  return (
    <div className={`space-y-3 min-w-0 ${className}`}>
      <FieldLabelWithHelp help={hint}>{label}</FieldLabelWithHelp>
      <div className="min-w-0 w-full max-w-full overflow-x-auto">
        <ContentLanguageTabs value={value} onChange={onChange} filled={filled} languages={languages} />
      </div>
    </div>
  );
}
