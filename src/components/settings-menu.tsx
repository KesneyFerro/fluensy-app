"use client";

import { useState } from "react";
import { ArrowLeft, Moon, Sun, Globe, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { EditProfileMenu } from "./edit-profile-menu";

interface SettingsMenuProps {
  onClose: () => void;
}

export function SettingsMenu({ onClose }: SettingsMenuProps) {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "es">("en");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (showEditProfile) {
    return <EditProfileMenu onClose={() => setShowEditProfile(false)} />;
  }

  if (showLanguageMenu) {
    return (
      <div className="fixed inset-0 bg-white z-50">
        <div className="flex flex-col h-full">
          <div className="flex items-center p-4 border-b">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLanguageMenu(false)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="ml-4 text-lg font-semibold">Language</h2>
          </div>
          <div className="flex-1 p-4">
            <div className="space-y-4">
              <button
                className={`w-full flex items-center justify-between p-4 rounded-lg border ${
                  selectedLanguage === "en"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200"
                }`}
                onClick={() => setSelectedLanguage("en")}
              >
                <div className="flex items-center">
                  <img
                    src="https://flagcdn.com/w40/us.png"
                    alt="US Flag"
                    className="w-6 h-4 mr-3"
                  />
                  <span>English</span>
                </div>
                {selectedLanguage === "en" && (
                  <div className="w-3 h-3 rounded-full bg-primary" />
                )}
              </button>
              <button
                className={`w-full flex items-center justify-between p-4 rounded-lg border ${
                  selectedLanguage === "es"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200"
                }`}
                onClick={() => setSelectedLanguage("es")}
              >
                <div className="flex items-center">
                  <img
                    src="https://flagcdn.com/w40/mx.png"
                    alt="Mexico Flag"
                    className="w-6 h-4 mr-3"
                  />
                  <span>Español</span>
                </div>
                {selectedLanguage === "es" && (
                  <div className="w-3 h-3 rounded-full bg-primary" />
                )}
              </button>
            </div>
          </div>
          <div className="p-4 border-t">
            <Button
              className="w-full"
              onClick={() => {
                // Save language preference
                setShowLanguageMenu(false);
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-white z-50">
        <div className="flex flex-col h-full">
          <div className="flex items-center p-4 border-b">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="ml-4 text-lg font-semibold">Settings</h2>
          </div>
          <div className="flex-1 p-4">
            <div className="space-y-4">
              <button
                className="w-full flex items-center p-4 rounded-lg border border-gray-200"
                onClick={() => setShowEditProfile(true)}
              >
                <User className="h-5 w-5 mr-3" />
                <span>Edit Profile</span>
              </button>
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  {isDarkMode ? (
                    <Moon className="h-5 w-5 mr-3" />
                  ) : (
                    <Sun className="h-5 w-5 mr-3" />
                  )}
                  <span>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
                </div>
                <button
                  className={`w-12 h-6 rounded-full transition-colors ${
                    isDarkMode ? "bg-primary" : "bg-gray-200"
                  }`}
                  onClick={() => setIsDarkMode(!isDarkMode)}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                      isDarkMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <button
                className="w-full flex items-center p-4 rounded-lg border border-gray-200"
                onClick={() => setShowLanguageMenu(true)}
              >
                <Globe className="h-5 w-5 mr-3" />
                <span>Language</span>
              </button>
              <button
                className="w-full flex items-center p-4 rounded-lg border border-gray-200 text-red-600"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 w-full">
            <h3 className="text-lg font-semibold mb-2">Confirm Logout</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to log out?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleLogout}
              >
                Log Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
