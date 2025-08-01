import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "placeholder-api-key",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "placeholder-auth-domain",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "placeholder-project-id",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "placeholder-storage-bucket",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    "placeholder-messaging-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "placeholder-app-id",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    "placeholder-measurement-id",
};

// Debug: Log the actual config (without sensitive data)
console.log("Firebase Config Check:", {
  apiKeyPresent: firebaseConfig.apiKey !== "placeholder-api-key",
  authDomainPresent: firebaseConfig.authDomain !== "placeholder-auth-domain",
  projectIdPresent: firebaseConfig.projectId !== "placeholder-project-id",
  storageBucketPresent:
    firebaseConfig.storageBucket !== "placeholder-storage-bucket",
  messagingSenderIdPresent:
    firebaseConfig.messagingSenderId !== "placeholder-messaging-sender-id",
  appIdPresent: firebaseConfig.appId !== "placeholder-app-id",
  measurementIdPresent:
    firebaseConfig.measurementId !== "placeholder-measurement-id",
});

// Initialize Firebase configuration
const initializeFirebase = () => {
  try {
    // Check if we have the minimum required config
    const hasRequiredConfig = 
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "placeholder-api-key" &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (hasRequiredConfig) {
      console.log("Attempting to initialize Firebase...");
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const googleProvider = new GoogleAuthProvider();
      
      // Configure Google provider
      googleProvider.addScope('email');
      googleProvider.addScope('profile');
      
      console.log("Firebase initialized successfully!");
      return { app, auth, googleProvider };
    } else {
      console.warn(
        "Firebase initialization skipped:",
        "Required environment variables missing"
      );
      return { app: undefined, auth: null, googleProvider: null };
    }
  } catch (error) {
    console.error("Firebase initialization error:", error);
    return { app: undefined, auth: null, googleProvider: null };
  }
};

const { app, auth, googleProvider } = initializeFirebase();

// Export the initialized instances
export { auth, googleProvider };
export default app;
