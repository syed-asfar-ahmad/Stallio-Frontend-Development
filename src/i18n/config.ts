import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enLayout from '../locales/en/layout.json';
import enHome from '../locales/en/home.json';
import enAbout from '../locales/en/about.json';
import enHowItWorks from '../locales/en/howItWorks.json';
import enFeatures from '../locales/en/features.json';
import enPricing from '../locales/en/pricing.json';
import enContact from '../locales/en/contact.json';
import enCareers from '../locales/en/careers.json';
import enAuth from '../locales/en/auth.json';
import enLegal from '../locales/en/legal.json';
import enNotFound from '../locales/en/notFound.json';
import enDashboard from '../locales/en/dashboard.json';

import esLayout from '../locales/es/layout.json';
import esHome from '../locales/es/home.json';
import esAbout from '../locales/es/about.json';
import esHowItWorks from '../locales/es/howItWorks.json';
import esFeatures from '../locales/es/features.json';
import esPricing from '../locales/es/pricing.json';
import esContact from '../locales/es/contact.json';
import esCareers from '../locales/es/careers.json';
import esAuth from '../locales/es/auth.json';
import esLegal from '../locales/es/legal.json';
import esNotFound from '../locales/es/notFound.json';
import esDashboard from '../locales/es/dashboard.json';

import arLayout from '../locales/ar/layout.json';
import arHome from '../locales/ar/home.json';
import arAbout from '../locales/ar/about.json';
import arHowItWorks from '../locales/ar/howItWorks.json';
import arFeatures from '../locales/ar/features.json';
import arPricing from '../locales/ar/pricing.json';
import arContact from '../locales/ar/contact.json';
import arCareers from '../locales/ar/careers.json';
import arAuth from '../locales/ar/auth.json';
import arLegal from '../locales/ar/legal.json';
import arNotFound from '../locales/ar/notFound.json';
import arDashboard from '../locales/ar/dashboard.json';

const enTranslation = {
  ...enLayout,
  ...enHome,
  ...enAbout,
  ...enHowItWorks,
  ...enFeatures,
  ...enPricing,
  ...enContact,
  ...enCareers,
  ...enAuth,
  ...enLegal,
  ...enNotFound,
  ...enDashboard,
};

const esTranslation = {
  ...esLayout,
  ...esHome,
  ...esAbout,
  ...esHowItWorks,
  ...esFeatures,
  ...esPricing,
  ...esContact,
  ...esCareers,
  ...esAuth,
  ...esLegal,
  ...esNotFound,
  ...esDashboard,
};

const arTranslation = {
  ...arLayout,
  ...arHome,
  ...arAbout,
  ...arHowItWorks,
  ...arFeatures,
  ...arPricing,
  ...arContact,
  ...arCareers,
  ...arAuth,
  ...arLegal,
  ...arNotFound,
  ...arDashboard,
};

export function syncDocumentLang(lng: string) {
  if (typeof document === 'undefined') return;
  const code = lng.split('-')[0];
  document.documentElement.lang = code === 'es' ? 'es' : code === 'ar' ? 'ar' : 'en';
  document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
}

export const i18nReady = i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      es: { translation: esTranslation },
      ar: { translation: arTranslation },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'ar'],
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged initialized',
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'stallio-lang',
    },
  })
  .then(() => {
    syncDocumentLang(i18n.resolvedLanguage ?? i18n.language);
  });

i18n.on('languageChanged', (lng) => {
  syncDocumentLang(lng);
});

export default i18n;
