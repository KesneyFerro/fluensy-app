"use client";

import type React from "react";
import { useState, useMemo, useEffect } from "react";
import { Settings, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { SettingsMenu } from "@/components/settings-menu";
import { LocalUserProfileManager } from "@/lib/services/local-profile-manager";

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
  const { user, userProfile, loading, refreshUserProfile, updateLocalProfile } =
    useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();

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
      <div
        className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center"
        style={{ backgroundColor: "#e0eafc" }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Determine data source for user feedback
  const isUsingLocalData = !userProfile && currentProfileData && user?.uid;

  return (
    <>
      <div
        className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100"
        style={{ backgroundColor: "#e0eafc" }}
      >
        {/* Show local data indicator if applicable */}
        {isUsingLocalData && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mx-4 mt-2 rounded">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  📱 Showing locally saved data. Will sync when connection is
                  restored.
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
            className="rounded-full bg-white/90 hover:bg-white shadow-sm border"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-5 w-5 text-gray-700" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/90 hover:bg-white shadow-sm border"
            onClick={() => router.push("/")}
          >
            <X className="h-5 w-5 text-gray-700" />
          </Button>
        </div>

        {/* Profile Section */}
        <div className="text-center px-6 mb-6">
          <div className="space-y-3">
            <div className="relative inline-block">
              <Avatar className="w-32 h-32 mx-auto border-4 border-white shadow-lg">
                <AvatarImage
                  src={userInfo.profileImage || "/placeholder.svg"}
                  alt="Profile"
                />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-gray-200 to-blue-200">
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {userInfo.name}
              </h1>
              <p className="text-gray-600 text-base">@{userInfo.username}</p>
              {userInfo.age && (
                <p className="text-gray-500 text-sm">
                  {userInfo.age} years old
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="px-6">
          <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl rounded-3xl">
            <CardContent className="p-6 space-y-6">
              <div>
                <p className="text-gray-600 text-center leading-relaxed">
                  Great progress with your speech sounds! Keep practicing those
                  tricky phonemes - you're doing amazing!
                </p>
              </div>

              <hr className="border-gray-300" />

              {/* Level Progress */}
              <div className="flex items-center gap-4">
                <div className="bg-sky-100 rounded-full px-3 py-1">
                  <span className="text-sky-600 font-bold text-sm">
                    Lv. {userInfo.level}
                  </span>
                </div>
                <div className="flex-1">
                  <Progress
                    value={userInfo.progress}
                    className="h-3 bg-gray-200 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-purple-600"
                  />
                </div>
                <span className="text-purple-600 font-bold text-lg">
                  {userInfo.progress}%
                </span>
              </div>

              {/* Speech Progress Section */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full border-4 border-purple-600 flex items-center justify-center bg-white">
                    <span className="text-purple-600 font-bold text-lg">
                      76%
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">
                    Speech Sound Mastery!
                  </h3>
                  <p className="text-gray-500 text-sm">
                    You've mastered 76% of your target sounds. See your phoneme
                    progress report...
                  </p>
                </div>
              </div>

              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-2xl py-4 text-lg font-medium">
                View Speech Report
              </Button>

              {/* Stats Grid */}
              <div className="space-y-3">
                <Card className="bg-gray-50 border-0 rounded-2xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-purple-100 rounded-lg p-2 flex-shrink-0">
                      <div className="w-6 h-6 bg-purple-600 rounded flex-shrink-0"></div>
                    </div>
                    <div>
                      <div className="font-bold text-xl text-gray-900">
                        12/15
                      </div>
                      <div className="text-gray-500 text-sm">
                        Speech exercises completed
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
                          Phonemes mastered
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
                          Therapy time today
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
            Speech Milestones
          </h2>
          <div className="h-1 bg-black rounded-full w-32"></div>
        </div>
      </div>

      {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} />}
    </>
  );
}
