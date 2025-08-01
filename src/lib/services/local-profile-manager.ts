import { UserProfile } from "@/lib/services/user-service";

/**
 * Local storage key for user profile data
 */
const getUserProfileKey = (uid: string) => `userProfile_${uid}`;

/**
 * Local-first user profile management
 * This acts as the primary source of truth for user data, with server sync as backup
 */
export class LocalUserProfileManager {
  private static instance: LocalUserProfileManager;
  private listeners: Set<(profile: UserProfile | null) => void> = new Set();

  static getInstance(): LocalUserProfileManager {
    if (!LocalUserProfileManager.instance) {
      LocalUserProfileManager.instance = new LocalUserProfileManager();
    }
    return LocalUserProfileManager.instance;
  }

  /**
   * Get user profile from local storage (primary source of truth)
   */
  getProfile(uid: string): UserProfile | null {
    try {
      const stored = localStorage.getItem(getUserProfileKey(uid));
      if (stored) {
        const profile = JSON.parse(stored);
        // Add timestamp for cache validation
        profile._localTimestamp = profile._localTimestamp || Date.now();
        return profile;
      }
    } catch (error) {
      console.error("Error reading profile from localStorage:", error);
    }
    return null;
  }

  /**
   * Update profile locally (immediate) and optionally sync to server
   */
  updateProfile(
    uid: string,
    updates: Partial<UserProfile>,
    syncToServer = true
  ): UserProfile {
    const currentProfile = this.getProfile(uid) || ({} as UserProfile);

    const updatedProfile: UserProfile = {
      ...currentProfile,
      ...updates,
      firebaseUID: uid,
      _localTimestamp: Date.now(),
      _locallyModified: true,
    };

    // Save to localStorage immediately
    try {
      localStorage.setItem(
        getUserProfileKey(uid),
        JSON.stringify(updatedProfile)
      );
    } catch (error) {
      console.error("Error saving profile to localStorage:", error);
    }

    // Notify all listeners of the change
    this.notifyListeners(updatedProfile);

    return updatedProfile;
  }

  /**
   * Sync profile with server data (merge strategy)
   */
  syncWithServer(uid: string, serverProfile: UserProfile): UserProfile {
    const localProfile = this.getProfile(uid);

    if (!localProfile) {
      // No local data, use server data
      return this.updateProfile(uid, serverProfile, false);
    }

    // Merge local and server data, prioritizing locally modified fields
    const mergedProfile: UserProfile = {
      ...serverProfile,
      ...(localProfile._locallyModified
        ? {
            name: localProfile.name,
            username: localProfile.username,
            email: localProfile.email,
            dateOfBirth: localProfile.dateOfBirth,
            language: localProfile.language,
          }
        : {}),
      _localTimestamp: Date.now(),
      _locallyModified: false, // Reset after sync
    };

    try {
      localStorage.setItem(
        getUserProfileKey(uid),
        JSON.stringify(mergedProfile)
      );
    } catch (error) {
      console.error("Error syncing profile to localStorage:", error);
    }

    this.notifyListeners(mergedProfile);
    return mergedProfile;
  }

  /**
   * Clear profile data for a user
   */
  clearProfile(uid: string): void {
    try {
      localStorage.removeItem(getUserProfileKey(uid));
    } catch (error) {
      console.error("Error clearing profile from localStorage:", error);
    }
    this.notifyListeners(null);
  }

  /**
   * Clear all profile data
   */
  clearAllProfiles(): void {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("userProfile_")) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Error clearing all profiles:", error);
    }
    this.notifyListeners(null);
  }

  /**
   * Subscribe to profile changes
   */
  subscribe(callback: (profile: UserProfile | null) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of profile changes
   */
  private notifyListeners(profile: UserProfile | null): void {
    this.listeners.forEach((listener) => {
      try {
        listener(profile);
      } catch (error) {
        console.error("Error in profile change listener:", error);
      }
    });
  }

  /**
   * Check if profile has local modifications that need to be synced
   */
  hasLocalModifications(uid: string): boolean {
    const profile = this.getProfile(uid);
    return profile?._locallyModified === true;
  }

  /**
   * Get all profiles with local modifications (for batch sync)
   */
  getProfilesWithLocalModifications(): Array<{
    uid: string;
    profile: UserProfile;
  }> {
    const profiles: Array<{ uid: string; profile: UserProfile }> = [];

    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("userProfile_")) {
          const uid = key.replace("userProfile_", "");
          const profile = this.getProfile(uid);
          if (profile?._locallyModified) {
            profiles.push({ uid, profile });
          }
        }
      });
    } catch (error) {
      console.error("Error getting profiles with local modifications:", error);
    }

    return profiles;
  }
}
