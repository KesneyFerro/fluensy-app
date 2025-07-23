"use client";

import { createContext, useContext, useEffect, useState } from "react";
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
  password?: string;
  oldPassword?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  login: async () => {},
  signup: async () => {},
  signInWithGoogle: async () => {},
  updateProfile: async () => {},
  deleteAccount: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("AuthProvider mounted, setting up auth listener...");

    // If Firebase is not configured, skip authentication
    if (!auth) {
      console.warn("Auth listener setup skipped: auth object is null");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", { userExists: !!user });
      setUser(user);
      setLoading(false);

      if (user) {
        try {
          // Get the ID token and set it as a cookie
          const token = await user.getIdToken();
          console.log("Got ID token, setting cookie...");
          document.cookie = `auth-token=${token}; path=/; max-age=3600; secure; samesite=strict`;
        } catch (error) {
          console.error("Error getting ID token:", error);
        }
      } else {
        console.log("No user, removing auth cookie...");
        // Remove the auth token cookie
        document.cookie =
          "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
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
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const updateProfile = async (data: UpdateProfileData) => {
    if (!auth || !auth.currentUser) throw new Error("No user logged in");

    try {
      // Update display name
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

      // Note: Phone number updates typically require SMS verification
      // and additional Firebase configuration
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!auth || !auth.currentUser) throw new Error("No user logged in");

    try {
      await deleteUser(auth.currentUser);
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

  const value = {
    user,
    loading,
    logout,
    login,
    signup,
    signInWithGoogle,
    updateProfile,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
