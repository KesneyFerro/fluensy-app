"use client";

import { useState } from "react";
import { ArrowLeft, Moon, Sun, Globe, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslations } from "@/lib/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { EditProfileMenu } from "./edit-profile-menu";
import { LanguageSettings } from "./language-settings";

interface SettingsMenuProps {
  readonly onClose: () => void;
}

export function SettingsMenu({ onClose }: SettingsMenuProps) {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentLanguage } = useLanguage();
  const t = useTranslations(currentLanguage);

  // Extract current locale from pathname
  const pathParts = pathname?.split("/") || [];
  const currentLocale = pathParts[1] || currentLanguage;

  const handleLogout = async () => {
    await logout();
    router.push(`/${currentLocale}/login`);
  };

  if (showEditProfile) {
    return <EditProfileMenu onClose={() => setShowEditProfile(false)} />;
  }

  if (showLanguageMenu) {
    return <LanguageSettings onClose={() => setShowLanguageMenu(false)} />;
  }

  return (
    <>
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50">
        <div className="flex flex-col h-full">
          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="ml-4 text-lg font-semibold">{t.settings}</h2>
          </div>
          <div className="flex-1 p-4">
            <div className="space-y-4">
              <button
                className="w-full flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => setShowEditProfile(true)}
              >
                <User className="h-5 w-5 mr-3" />
                <span>{t.editProfile}</span>
              </button>
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center">
                  {theme === "dark" ? (
                    <Moon className="h-5 w-5 mr-3" />
                  ) : (
                    <Sun className="h-5 w-5 mr-3" />
                  )}
                  <span>{theme === "dark" ? t.dark : t.light}</span>
                </div>
                <button
                  className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                    theme === "dark" ? "bg-primary" : "bg-gray-200"
                  }`}
                  onClick={toggleTheme}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                      theme === "dark" ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <button
                className="w-full flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => setShowLanguageMenu(true)}
              >
                <Globe className="h-5 w-5 mr-3" />
                <span>{t.language}</span>
              </button>
              <button
                className="w-full flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 cursor-pointer"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span>{t.logout}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 w-full">
            <h3 className="text-lg font-semibold mb-2">{t.confirmLogout}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t.confirmLogoutMessage}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowLogoutModal(false)}
              >
                {t.cancel}
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleLogout}
              >
                {t.logout}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
