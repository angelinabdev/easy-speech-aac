
"use client";

import { ReactNode, useState, useEffect } from "react";
import { FirebaseApp } from "firebase/app";
import { getClientFirebaseApp } from "./config";
import { FirebaseProvider } from "./provider";

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);

  useEffect(() => {
    // This ensures that getClientFirebaseApp() is only called on the client.
    setFirebaseApp(getClientFirebaseApp());
  }, []);

  return <FirebaseProvider app={firebaseApp}>{children}</FirebaseProvider>;
}
