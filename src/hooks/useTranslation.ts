import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation, type TranslationKey } from '@/lib/translations';

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: TranslationKey, replacements?: Record<string, string | number>) => {
    let text = getTranslation(language, key);
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return { t, language };
}
