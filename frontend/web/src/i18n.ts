import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en.json';
import ruTranslations from './locales/ru.json';

// Only respect a language choice the user explicitly made inside the app.
// 'en' is the hard default — never fall back to the browser locale.
const userChosenLang = localStorage.getItem('orisios_lang');

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      ru: { translation: ruTranslations }
    },
    lng: userChosenLang === 'ru' ? 'ru' : 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'ru'],
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
