import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  Auth,
  GoogleAuthProvider as GoogleAuthProviderType,
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

// Only initialize Firebase if we have a real API key
let app: FirebaseApp | undefined;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProviderType | null = null;

try {
  if (
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "placeholder-api-key"
  ) {
    console.log("Attempting to initialize Firebase...");
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    console.log("Firebase initialized successfully!");
  } else {
    console.warn(
      "Firebase initialization skipped:",
      "API Key missing or using placeholder value"
    );
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export { auth, googleProvider };
export default app;
