"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  onAuthStateChanged,
  signOut,
  User,
  Auth,
  updateProfile as firebaseUpdateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/firebase";
import { useRouter } from "next/navigation";
import { userService, UserProfile } from "@/lib/services/user-service";

// Debug: Log initial auth status
console.log("AuthContext Initial Auth Status:", {
  authExists: !!auth,
  authType: auth ? typeof auth : "null",
});

interface UpdateProfileData {
  name: string;
  username: string;
  email: string;
  dateOfBirth: string;
  language?: string;
  password?: string;
  oldPassword?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  logout: async () => {},
  login: async () => {},
  signup: async () => {},
  signInWithGoogle: async () => {},
  updateProfile: async () => {},
  deleteAccount: async () => {},
  refreshUserProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to refresh user profile from MongoDB
  const refreshUserProfile = async () => {
    if (!user?.uid) return;

    try {
      const profile = await userService.getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    console.log("AuthProvider mounted, setting up auth listener...");

    // If Firebase is not configured, skip authentication
    if (!auth) {
      console.warn("Auth listener setup skipped: auth object is null");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", { userExists: !!firebaseUser });
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Get the ID token and set it as a cookie
          const token = await firebaseUser.getIdToken();
          console.log("Got ID token, setting cookie...");
          document.cookie = `auth-token=${token}; path=/; max-age=3600; secure; samesite=strict`;

          // Sync with MongoDB and get user profile
          console.log("Syncing user with MongoDB...");
          const mongoProfile = await userService.syncFirebaseUser(firebaseUser);
          setUserProfile(mongoProfile);
          console.log("User synced with MongoDB:", mongoProfile);
        } catch (error) {
          console.error("Error syncing user with MongoDB:", error);
          setUserProfile(null);
        }
      } else {
        console.log("No user, removing auth cookie...");
        // Remove the auth token cookie and clear profile
        document.cookie =
          "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => {
      console.log("Cleaning up auth listener...");
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    if (!auth) {
      console.warn("Logout skipped: auth object is null");
      return;
    }

    try {
      console.log("Attempting to sign out...");
      await signOut(auth);
      console.log("Sign out successful, redirecting...");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth not initialized");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth not initialized");

    try {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Create user in MongoDB
      const mongoProfile = await userService.createUser({
        firebaseUID: firebaseUser.uid,
        name: firebaseUser.displayName || "",
        email: firebaseUser.email || "",
        username: email.split("@")[0] || "", // Default username from email
      });

      setUserProfile(mongoProfile);
      console.log("User created in both Firebase and MongoDB:", mongoProfile);
    } catch (error) {
      console.error("Error during signup:", error);
      throw error;
    }
  };

  const updateProfile = async (data: UpdateProfileData) => {
    if (!auth?.currentUser) throw new Error("No user logged in");

    try {
      // Update Firebase profile
      await firebaseUpdateProfile(auth.currentUser, {
        displayName: data.name,
      });

      // Update email if changed
      if (data.email !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, data.email);
      }

      // Update password if provided
      if (data.password) {
        await updatePassword(auth.currentUser, data.password);
      }

      // Update MongoDB profile
      const updateData: any = {
        name: data.name,
        username: data.username,
        email: data.email,
      };

      if (data.dateOfBirth) {
        updateData.dateOfBirth = data.dateOfBirth;
        updateData.birthDate = data.dateOfBirth; // Support both field names
      }

      if (data.language) {
        updateData.language = data.language;
      }

      const updatedProfile = await userService.updateUserProfile(
        auth.currentUser.uid,
        updateData
      );

      setUserProfile(updatedProfile);
      console.log(
        "Profile updated in both Firebase and MongoDB:",
        updatedProfile
      );

      // Note: Phone number updates typically require SMS verification
      // and additional Firebase configuration
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!auth?.currentUser) throw new Error("No user logged in");

    try {
      // Delete user from MongoDB first
      await userService.deleteUser(auth.currentUser.uid);

      // Then delete from Firebase
      await deleteUser(auth.currentUser);

      // Clear local state
      setUserProfile(null);

      router.push("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Auth not initialized");
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    // Check if user needs to complete profile
    if (!result.user.displayName) {
      router.push("/complete-profile");
    }
  };

  const value = useMemo(
    () => ({
      user,
      userProfile,
      loading,
      logout,
      login,
      signup,
      signInWithGoogle,
      updateProfile,
      deleteAccount,
      refreshUserProfile,
    }),
    [user, userProfile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
