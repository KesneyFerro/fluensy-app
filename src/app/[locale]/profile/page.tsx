"use client";

import type React from "react";
import { useState, useMemo, useEffect } from "react";
import { Settings, X, User, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { SettingsMenu } from "@/components/settings-menu";
import { LocalUserProfileManager } from "@/lib/services/local-profile-manager";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/lib/translations";
import { usePhonemePerformance } from "@/hooks/usePhonemeEvaluation";
import PhonemeProgressDashboard from "@/components/PhonemeProgressDashboard";

const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

export default function ProfilePage() {
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showPhonemeReport, setShowPhonemeReport] = useState(false);
  const router = useRouter();
  const { currentLanguage } = useLanguage();
  const t = useTranslations(currentLanguage);
  const { getPerformance } = usePhonemePerformance();
  const [phonemePerformance, setPhonemePerformance] = useState<any>(null);

  // Initialize local profile manager for fallback data
  const localProfileManager = useMemo(() => new LocalUserProfileManager(), []);

  // Force refresh from local storage when component mounts or user changes
  useEffect(() => {
    if (user?.uid && !userProfile) {
      // If we have a user but no userProfile, try to get it from local storage
      const localProfile = localProfileManager.getProfile(user.uid);
      if (localProfile) {
        // We have local data but AuthContext doesn't, let's refresh
        refreshUserProfile().catch((error) => {
          console.log(
            "Failed to refresh from server, using local data:",
            error
          );
        });
      }
    }
  }, [user?.uid, userProfile, localProfileManager, refreshUserProfile]);

  // Fetch phoneme performance data only once when user changes
  useEffect(() => {
    const fetchPhonemePerformance = async () => {
      if (user) {
        try {
          const performance = await getPerformance();
          setPhonemePerformance(performance);
        } catch (error) {
          console.error("Error fetching phoneme performance:", error);
        }
      }
    };

    fetchPhonemePerformance();
  }, [user?.uid]); // Only depend on user ID, not the function

  // Add a listener for local profile changes to trigger re-render
  const [localUpdateTrigger, setLocalUpdateTrigger] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => {
      setLocalUpdateTrigger((prev) => prev + 1);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Enhanced profile data that includes latest local changes
  const currentProfileData = useMemo(() => {
    // Always get the freshest local data
    if (user?.uid) {
      const freshLocalProfile = localProfileManager.getProfile(user.uid);
      if (freshLocalProfile) return freshLocalProfile;
    }

    // Fallback to context profile
    if (userProfile) return userProfile;

    return null;
  }, [userProfile, user?.uid, localProfileManager, localUpdateTrigger]);

  const userInfo = {
    name: currentProfileData?.name || user?.displayName || "User",
    username: currentProfileData?.username?.trim()
      ? currentProfileData.username
      : user?.email?.split("@")[0] ||
        "user" + Math.random().toString(36).substring(2, 6),
    age: currentProfileData?.dateOfBirth
      ? calculateAge(currentProfileData.dateOfBirth)
      : null,
    email: currentProfileData?.email || user?.email || "",
    level: 4,
    progress: 58,
    profileImage: "/placeholder.svg?height=120&width=120&text=Profile",
  };

  // Show loading state while fetching user data
  if (loading && !currentProfileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {t.loadingYourProfile}
          </p>
        </div>
      </div>
    );
  }

  // Determine data source for user feedback
  const isUsingLocalData = !userProfile && currentProfileData && user?.uid;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Show local data indicator if applicable */}
        {isUsingLocalData && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-3 mx-4 mt-2 rounded">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t.showingLocallyDataSync}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 shadow-sm border dark:border-gray-700"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 shadow-sm border dark:border-gray-700"
            onClick={() => router.push("/")}
          >
            <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </Button>
        </div>

        {/* Profile Section */}
        <div className="text-center px-6 mb-6">
          <div className="space-y-3">
            <div className="relative inline-block">
              <Avatar className="w-32 h-32 mx-auto border-4 border-white dark:border-gray-700 shadow-lg">
                <AvatarImage
                  src={userInfo.profileImage || "/placeholder.svg"}
                  alt="Profile"
                />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-gray-200 to-blue-200 dark:from-gray-700 dark:to-gray-600 dark:text-gray-200">
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {userInfo.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-base">
                @{userInfo.username}
              </p>
              {userInfo.age && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {userInfo.age} {t.yearsOld}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="px-6">
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-3xl">
            <CardContent className="p-6 space-y-6">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                  {t.greatProgressSpeech}
                </p>
              </div>

              <hr className="border-gray-300 dark:border-gray-600" />

              {/* Level Progress */}
              <div className="flex items-center gap-4">
                <div className="bg-sky-100 dark:bg-sky-900 rounded-full px-3 py-1">
                  <span className="text-sky-600 dark:text-sky-300 font-bold text-sm">
                    Lv. {userInfo.level}
                  </span>
                </div>
                <div className="flex-1">
                  <Progress
                    value={userInfo.progress}
                    className="h-3 bg-gray-200 dark:bg-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-purple-600"
                  />
                </div>
                <span className="text-purple-600 dark:text-purple-400 font-bold text-lg">
                  {userInfo.progress}%
                </span>
              </div>

              {/* Speech Progress Section */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full border-4 border-purple-600 dark:border-purple-400 flex items-center justify-center bg-white dark:bg-gray-800">
                    <span className="text-purple-600 dark:text-purple-400 font-bold text-lg">
                      76%
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {t.speechSoundMastery}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {t.masterPercentTarget}
                  </p>
                </div>
                <Button
                  onClick={() => setShowPhonemeReport(true)}
                  variant="outline"
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <BarChart3 className="w-4 h-4" />
                  Report
                </Button>
              </div>

              <Button className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white rounded-2xl py-4 text-lg font-medium">
                {t.viewSpeechReport}
              </Button>

              {/* Stats Grid */}
              <div className="space-y-3">
                <Card className="bg-gray-50 dark:bg-gray-700/50 border-0 rounded-2xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900/50 rounded-lg p-2 flex-shrink-0">
                      <div className="w-6 h-6 bg-purple-600 dark:bg-purple-400 rounded flex-shrink-0"></div>
                    </div>
                    <div>
                      <div className="font-bold text-xl text-gray-900 dark:text-white">
                        12/15
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-sm">
                        {t.speechExercisesCompleted}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-gray-50 border-0 rounded-2xl">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="bg-green-100 rounded-lg p-2 flex-shrink-0">
                        <div className="w-4 h-6 bg-green-500 rounded-full flex-shrink-0"></div>
                      </div>
                      <div>
                        <div className="font-bold text-xl text-gray-900">8</div>
                        <div className="text-gray-500 text-sm">
                          {t.phonemesMastered}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50 border-0 rounded-2xl">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="bg-blue-100 rounded-lg p-2 flex-shrink-0">
                        <div className="w-4 h-6 bg-blue-500 rounded-sm flex-shrink-0"></div>
                      </div>
                      <div>
                        <div className="font-bold text-xl text-gray-900">
                          45m
                        </div>
                        <div className="text-gray-500 text-sm">
                          {t.therapyTimeToday}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Section */}
        <div className="px-6 py-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-left">
            {t.speechMilestones}
          </h2>
          <div className="h-1 bg-black rounded-full w-32"></div>
        </div>
      </div>

      {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} />}

      {/* Phoneme Report Modal */}
      {showPhonemeReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowPhonemeReport(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <PhonemeProgressDashboard />
          </div>
        </div>
      )}
    </>
  );
}
