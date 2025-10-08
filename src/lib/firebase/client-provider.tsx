
"use client";

import { ReactNode, useState, useEffect } from "react";
import { FirebaseApp } from "firebase/app";
import { app } from "./config";
import { FirebaseProvider } from "./provider";

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);

  useEffect(() => {
    // The 'app' import from config is client-safe, but we still want to 
    // ensure this runs only on the client to avoid any SSR issues.
    setFirebaseApp(app);
  }, []);

  return <FirebaseProvider app={firebaseApp}>{children}</FirebaseProvider>;
}
