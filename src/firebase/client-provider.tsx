
"use client";

import { ReactNode, useState, useEffect } from "react";
import { FirebaseProvider } from "@/lib/firebase/provider";
import { initializeFirebase } from "./index";
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  // Use state to hold the services. This ensures they are only initialized on the client.
  const [services, setServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    // The `initializeFirebase` function is idempotent, so it's safe to call here.
    // It will only initialize the services once.
    setServices(initializeFirebase());
  }, []);
  
  if (!services) {
    // You can render a loader here while services are initializing,
    // though initialization is typically very fast.
    return null;
  }

  return (
    <FirebaseProvider app={services.app} auth={services.auth} db={services.db}>
      {children}
    </FirebaseProvider>
  );
}
