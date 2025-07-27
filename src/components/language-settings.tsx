import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageSettings() {
  const { currentLanguage, availableLanguages, setLanguage } = useLanguage();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Language Settings</h3>
      <div className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground">
          Audio Processing Language
        </div>
        <div className="space-y-2">
          {availableLanguages.map((language) => (
            <label
              key={language.language}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <input
                type="radio"
                name="language"
                value={language.language}
                checked={currentLanguage === language.language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                aria-label={`Select ${language.displayName} language`}
              />
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {language.displayName}
                </div>
                <div className="text-xs text-muted-foreground">
                  Dialect: {language.dialect}
                </div>
              </div>
            </label>
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          This affects speech recognition, transcription validation, and
          pronunciation analysis. Changes apply to new recordings.
        </div>
      </div>
    </div>
  );
}
