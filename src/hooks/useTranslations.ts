import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

export function useTranslations() {
  const { currentLanguage } = useLanguage();
  return translations[currentLanguage];
}
