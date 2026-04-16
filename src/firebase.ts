import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, getDocFromServer, doc } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const env = import.meta.env as Record<string, string | undefined>;
const fallbackConfig: Record<string, string | undefined> = {
  apiKey: "AIzaSyDNmLFHQJyTLFGrHbWdGaiqaQAjw6F4pP8",
  authDomain: "family-quest-points.firebaseapp.com",
  projectId: "family-quest-points",
  storageBucket: "family-quest-points.firebasestorage.app",
  messagingSenderId: "751286937853",
  appId: "1:751286937853:web:1c22e9f4e7f81a2ab4f694",
  measurementId: "",
  firestoreDatabaseId: "ai-studio-b0b94068-2b94-410a-8bdd-e4d87b280480",
};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || fallbackConfig.appId,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || fallbackConfig.measurementId,
  firestoreDatabaseId: env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || fallbackConfig.firestoreDatabaseId,
};

const requiredEnvVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
  "VITE_FIREBASE_FIRESTORE_DATABASE_ID",
];

const resolvedRequiredValues: Record<string, string | undefined> = {
  VITE_FIREBASE_API_KEY: firebaseConfig.apiKey,
  VITE_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  VITE_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  VITE_FIREBASE_APP_ID: firebaseConfig.appId,
  VITE_FIREBASE_FIRESTORE_DATABASE_ID: firebaseConfig.firestoreDatabaseId,
};

const missingVars = requiredEnvVars.filter((key) => !resolvedRequiredValues[key]);
if (missingVars.length > 0) {
  throw new Error(
    `Missing required Firebase env vars: ${missingVars.join(", ")}. Copy .env.example to .env.local and set VITE_FIREBASE_* values.`,
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Analytics conditionally (only if measurementId exists and is supported)
export let analytics: any = null;
isSupported().then((supported) => {
  if (supported && firebaseConfig.measurementId) {
    analytics = getAnalytics(app);
  }
});

export const loginWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const logout = () => {
  return signOut(auth);
};

async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration. ");
    }
    // Skip logging for other errors, as this is simply a connection test.
  }
}
testConnection();
