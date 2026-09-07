import type { ProductOption } from '../types';
import type { ShopContentLang } from './shopContentLanguages';

export function alignProductOptionTranslations(
  structure: ProductOption[],
  translations: ProductOption[] | undefined | null,
  trim = false,
): ProductOption[] {
  const clean = (value: string) => (trim ? value.trim() : value);
  return structure.map((enOpt, i) => {
    const tr = translations?.[i];
    const choiceCount = enOpt.choices.length;
    const choices: string[] = [];
    for (let ci = 0; ci < choiceCount; ci++) {
      choices.push(clean(String(tr?.choices?.[ci] ?? '')));
    }
    const mods = enOpt.choicePriceModifiers ?? enOpt.choices.map(() => 0);
    while (mods.length < choiceCount) mods.push(0);
    return {
      name: clean(String(tr?.name ?? '')),
      choices,
      choicePriceModifiers: mods.slice(0, choiceCount),
      required: Boolean(enOpt.required),
    };
  });
}

export function syncProductOptionTranslations(
  structure: ProductOption[],
  prev: Record<ShopContentLang, ProductOption[]>,
): Record<ShopContentLang, ProductOption[]> {
  return {
    en: structure,
    es: alignProductOptionTranslations(structure, prev.es),
    ar: alignProductOptionTranslations(structure, prev.ar),
  };
}

export function mergeProductOptionsForDisplay(
  structure: ProductOption[],
  lang: ShopContentLang,
  translations: Record<ShopContentLang, ProductOption[]>,
): ProductOption[] {
  if (lang === 'en') return structure;
  return alignProductOptionTranslations(structure, translations[lang]);
}

export function buildLocalizedOptionsForSave(
  structure: ProductOption[],
  langTexts: ProductOption[],
): ProductOption[] {
  const result: ProductOption[] = [];
  for (let i = 0; i < structure.length; i++) {
    const enOpt = structure[i];
    const tr = langTexts[i];
    const name = String(tr?.name ?? '').trim();
    const choices = enOpt.choices.map((_, ci) => String(tr?.choices?.[ci] ?? '').trim());
    if (!name && !choices.some((c) => c)) continue;
    const mods = enOpt.choicePriceModifiers ?? enOpt.choices.map(() => 0);
    result.push({
      name,
      choices,
      choicePriceModifiers: enOpt.choices.map((_, ci) =>
        typeof mods[ci] === 'number' && Number.isFinite(mods[ci]) ? mods[ci] : 0,
      ),
      required: Boolean(enOpt.required),
    });
  }
  return result;
}

function normalizedChoiceIndices(enOpt: ProductOption): number[] {
  const indices: number[] = [];
  enOpt.choices.forEach((choice, ci) => {
    if (choice.trim()) indices.push(ci);
  });
  return indices;
}

export function alignedTranslationsForNormalizedEn(
  enRaw: ProductOption[],
  langTexts: ProductOption[] | undefined | null,
): ProductOption[] {
  const langAligned = alignProductOptionTranslations(enRaw, langTexts, true);
  const picked: ProductOption[] = [];
  for (let i = 0; i < enRaw.length; i++) {
    const enOpt = enRaw[i];
    const name = enOpt.name.trim();
    const choiceIndices = normalizedChoiceIndices(enOpt);
    if (!name || choiceIndices.length === 0) continue;

    const tr = langAligned[i];
    const mods = enOpt.choicePriceModifiers ?? enOpt.choices.map(() => 0);
    picked.push({
      name: String(tr?.name ?? '').trim(),
      choices: choiceIndices.map((ci) => String(tr?.choices?.[ci] ?? '').trim()),
      choicePriceModifiers: choiceIndices.map((ci) =>
        typeof mods[ci] === 'number' && Number.isFinite(mods[ci]) ? mods[ci] : 0,
      ),
      required: Boolean(enOpt.required),
    });
  }
  return picked;
}
