"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { LocalUserProfileManager } from "@/lib/services/local-profile-manager";

// Flag SVG components
const USFlag = () => (
  <svg width="24" height="16" viewBox="0 0 24 16" className="rounded">
    <rect width="24" height="16" fill="#B22234" />
    <rect width="24" height="1.23" y="1.23" fill="#FFFFFF" />
    <rect width="24" height="1.23" y="3.69" fill="#FFFFFF" />
    <rect width="24" height="1.23" y="6.15" fill="#FFFFFF" />
    <rect width="24" height="1.23" y="8.62" fill="#FFFFFF" />
    <rect width="24" height="1.23" y="11.08" fill="#FFFFFF" />
    <rect width="24" height="1.23" y="13.54" fill="#FFFFFF" />
    <rect width="9.6" height="8.8" fill="#3C3B6E" />
  </svg>
);

const MXFlag = () => (
  <svg width="24" height="16" viewBox="0 0 24 16" className="rounded">
    <rect width="8" height="16" fill="#006847" />
    <rect x="8" width="8" height="16" fill="#FFFFFF" />
    <rect x="16" width="8" height="16" fill="#CE1126" />
  </svg>
);

const LANGUAGE_OPTIONS = [
  {
    code: "en-US",
    displayName: "English (US)",
    flag: <USFlag />,
    dialect: "American English",
  },
  {
    code: "es-MX",
    displayName: "Spanish (Mexico)",
    flag: <MXFlag />,
    dialect: "Mexican Spanish",
  },
];

export function LanguageSettings({
  onClose,
}: {
  readonly onClose: () => void;
}) {
  const { currentLanguage, setLanguage } = useLanguage();
  const { user, updateProfile, userProfile } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize local profile manager for fallback data
  const localProfileManager = useMemo(() => new LocalUserProfileManager(), []);

  // Get profile data with local fallback
  const getProfileData = () => {
    if (userProfile) return userProfile;
    if (user?.uid) {
      return localProfileManager.getProfile(user.uid);
    }
    return null;
  };

  const profileData = getProfileData();

  useEffect(() => {
    // Set the current language from profile data or context
    if (profileData?.language) {
      setSelectedLanguage(profileData.language as "en" | "es");
    } else {
      setSelectedLanguage(currentLanguage);
    }
  }, [profileData, currentLanguage]);

  const handleLanguageSelect = (languageCode: string) => {
    // Convert detailed language codes to simple codes for LanguageContext
    const simpleCode: "en" | "es" = languageCode.startsWith("en") ? "en" : "es";
    setSelectedLanguage(simpleCode);
  };

  const handleSave = async () => {
    if (!user || selectedLanguage === currentLanguage) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      // Update in context (for immediate UI changes)
      setLanguage(selectedLanguage);

      // Update in MongoDB via the user profile using local fallback data
      if (profileData) {
        await updateProfile({
          name: profileData.name,
          username: profileData.username,
          email: profileData.email,
          dateOfBirth: profileData.dateOfBirth || "",
          language: selectedLanguage,
        });
      }

      onClose();
    } catch (error) {
      console.error("Error updating language:", error);
      // Revert the language change on error
      setSelectedLanguage(currentLanguage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold">Language Settings</h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Choose Your Language</h3>
              <p className="text-sm text-muted-foreground">
                This affects speech recognition, transcription, and
                pronunciation analysis
              </p>
            </div>

            <div className="space-y-3">
              {LANGUAGE_OPTIONS.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  className={`
                    relative flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all w-full text-left
                    ${
                      (selectedLanguage === "en" &&
                        language.code.startsWith("en")) ||
                      (selectedLanguage === "es" &&
                        language.code.startsWith("es"))
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  <div className="flex items-center justify-center w-8 h-6">
                    {language.flag}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {language.displayName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {language.dialect}
                    </div>
                  </div>
                  {((selectedLanguage === "en" &&
                    language.code.startsWith("en")) ||
                    (selectedLanguage === "es" &&
                      language.code.startsWith("es"))) && (
                    <div className="text-primary">
                      <Check className="h-5 w-5" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800">
                <strong>Note:</strong> Language changes will apply to new
                recordings and exercises. Your learning progress will be
                preserved.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white">
          <div className="max-w-md mx-auto">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Saving..." : "Apply Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
