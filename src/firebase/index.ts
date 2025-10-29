
import { getApps, getApp, initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { firebaseConfig } from "@/lib/firebase/config";

// This object will hold the initialized Firebase services.
// It's a simple cache to ensure we don't initialize services more than once.
let firebaseServices: {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
} | null = null;

/**
 * Initializes and/or returns the Firebase App, Auth, and Firestore instances.
 * This function ensures that Firebase is initialized only once.
 *
 * @returns An object containing the initialized `app`, `auth`, and `db` services.
 */
export function initializeFirebase() {
  if (firebaseServices) {
    return firebaseServices;
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  firebaseServices = { app, auth, db };

  return firebaseServices;
}

// Re-export hooks and providers for easy consumption in the app.
export { FirebaseProvider, useAuth } from '@/lib/firebase/provider';
export { FirebaseClientProvider } from './client-provider';
