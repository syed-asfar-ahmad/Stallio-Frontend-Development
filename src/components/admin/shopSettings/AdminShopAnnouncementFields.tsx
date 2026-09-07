import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import type { AdminSellerShopFields } from '../../../types/admin';
import ContentLanguagePicker from '../../ContentLanguagePicker';
import { SHOP_CONTENT_LANGUAGES, type ShopContentLang } from '../../../lib/shopContentLanguages';
import { useAdminShopContentLanguages, useAdminShopMultilingualEnabled } from '../../../hooks/useAdminShopContentLanguages';
import { SHOP_SETTINGS_CARD, SHOP_SETTINGS_CARD_PAD, ShopSettingsSectionHeading, ShopSettingsStack } from './shopSettingsLayout';

function parseLines(text?: string): string[] {
  const raw = (text ?? '').split('\n').map((line) => line.trim()).filter(Boolean);
  return raw;
}

function joinLines(lines: string[]): string {
  return lines.map((line) => line.trim()).filter(Boolean).join('\n');
}

type Props = {
  form: AdminSellerShopFields;
  set: <K extends keyof AdminSellerShopFields>(key: K, value: AdminSellerShopFields[K]) => void;
  announcements: string[];
  setAnnouncements: (next: string[]) => void;
};

export default function AdminShopAnnouncementFields({ form, set, announcements, setAnnouncements }: Props) {
  const { t } = useTranslation();
  const contentLanguages = useAdminShopContentLanguages(form);
  const multilingualEnabled = useAdminShopMultilingualEnabled(form);
  const contentLangMeta = SHOP_CONTENT_LANGUAGES.filter((l) => contentLanguages.includes(l.id));
  const [announcementLang, setAnnouncementLang] = useState<ShopContentLang>('en');
  const [byLang, setByLang] = useState<Record<ShopContentLang, string[]>>({
    en: parseLines(form.announcementText),
    es: parseLines(form.announcementTextEs),
    ar: parseLines(form.announcementTextAr),
  });

  useEffect(() => {
    setByLang({
      en: parseLines(form.announcementText),
      es: parseLines(form.announcementTextEs),
      ar: parseLines(form.announcementTextAr),
    });
  }, [form.announcementText, form.announcementTextEs, form.announcementTextAr]);

  if (!form.announcementEnabled) return null;

  const activeLang = contentLangMeta.find((l) => l.id === announcementLang) ?? contentLangMeta[0] ?? SHOP_CONTENT_LANGUAGES[0];
  const currentLines = announcementLang === 'en' ? announcements : byLang[announcementLang];

  function patchLines(lang: ShopContentLang, next: string[]) {
    if (lang === 'en') {
      setAnnouncements(next);
      set('announcementText', joinLines(next));
      return;
    }
    const merged = { ...byLang, [lang]: next };
    setByLang(merged);
    if (lang === 'es') set('announcementTextEs', joinLines(next) || undefined);
    if (lang === 'ar') set('announcementTextAr', joinLines(next) || undefined);
  }

  const announcementLangFilled = {
    en: byLang.en.length > 0,
    es: byLang.es.length > 0,
    ar: byLang.ar.length > 0,
  };

  return (
    <ShopSettingsStack>
      <ShopSettingsSectionHeading title={t('dashboard.delivery.announcement')} />
      <div className={`${SHOP_SETTINGS_CARD} ${SHOP_SETTINGS_CARD_PAD} space-y-3 min-w-0`}>
        {multilingualEnabled ? (
          <ContentLanguagePicker
            label={t('dashboard.delivery.announcementLangLabel')}
            hint={t('dashboard.delivery.announcementLangHint')}
            value={announcementLang}
            onChange={setAnnouncementLang}
            filled={announcementLangFilled}
            languages={contentLanguages}
            className="mb-2"
          />
        ) : null}
        {currentLines.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-900/50 p-6 text-center">
            <Megaphone className="w-8 h-8 text-stone-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-stone-500 dark:text-zinc-400 text-sm font-medium">{t('dashboard.delivery.noAnnouncements')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentLines.map((text, i) => (
              <div key={i} className="flex gap-2 min-w-0">
                <div className="relative flex-1 min-w-0">
                  <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    value={text}
                    dir={activeLang.dir}
                    onChange={(e) => patchLines(announcementLang, currentLines.map((a, j) => (j === i ? e.target.value : a)))}
                    placeholder={t('dashboard.delivery.announcePh')}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => patchLines(announcementLang, currentLines.filter((_, j) => j !== i))}
                  className="p-2.5 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border-2 border-transparent hover:border-red-100 dark:hover:border-red-900/40 shrink-0"
                  aria-label={t('dashboard.delivery.removeAnnouncement')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => patchLines(announcementLang, [...currentLines, ''])}
          className="w-full py-2.5 rounded-xl border-2 border-dashed border-stone-200 dark:border-zinc-700 text-stone-500 dark:text-zinc-400 text-sm font-semibold hover:border-brand-200 dark:hover:border-brand-600/45 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> {t('dashboard.delivery.addAnnouncement')}
        </button>
      </div>
    </ShopSettingsStack>
  );
}
