
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, Auth } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { FirebaseApp } from 'firebase/app';
import { db } from './config';
import { Firestore } from 'firebase/firestore';

interface FirebaseAuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  auth: Auth | null;
  app: FirebaseApp | null;
  db: Firestore | null;
}

const AuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export const FirebaseProvider = ({ children, app }: { children: ReactNode; app: FirebaseApp | null }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);

  useEffect(() => {
    if (app) {
      const authInstance = getAuth(app);
      setAuth(authInstance);

      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        setUser(user);
        setLoading(false);
      });
      
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [app]);

  const signInWithGoogle = async () => {
    if (!auth) {
        setError("Firebase Auth is not initialized.");
        return;
    };
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
       let errorMessage = "An unexpected error occurred. Please try again.";
        switch (err.code) {
            case 'auth/popup-blocked':
                errorMessage = "Sign-in popup was blocked by the browser. Please allow popups for this site to sign in.";
                break;
            case 'auth/popup-closed-by-user':
            case 'auth/cancelled-popup-request':
                errorMessage = "Sign-in cancelled. Please try again.";
                break;
            case 'auth/account-exists-with-different-credential':
                errorMessage = "An account already exists with the same email address but different sign-in credentials.";
                break;
            case 'auth/unauthorized-domain':
                 errorMessage = "Unauthorized Domain: Please add the domain from which you are accessing this app to your Firebase project's authorized domains.";
                break;
            default:
                errorMessage = err.message || "An error occurred during sign-in.";
                break;
        }
        setError(errorMessage.replace('Firebase: ', ''));
        setLoading(false);
    }
  };

  const signOut = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err: any) {
       setError(err.message || 'Failed to sign out.');
    } finally {
       setLoading(false);
    }
  };

  if (loading && !user) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading Authentication...</span>
        </div>
    );
  }
  
  const value = { user, loading, signInWithGoogle, signOut, error, auth, app, db: app ? db : null };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context;
};

export const useUser = () => {
    const { user, loading } = useAuth();
    return { user, loading };
}
