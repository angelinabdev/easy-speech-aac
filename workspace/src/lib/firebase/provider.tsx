
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut, Auth } from 'firebase/auth';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { getClientAuth, getClientFirestore } from './config';

interface FirebaseAuthContextType {
  user: User | null;
  loading: boolean;
  isRedirectLoading: boolean;
  signOut: () => Promise<void>;
  auth: Auth | null;
  app: FirebaseApp | null;
  db: Firestore | null;
}

const AuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export const FirebaseProvider = ({ children, app }: { children: ReactNode; app: FirebaseApp | null }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRedirectLoading, setIsRedirectLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);

  useEffect(() => {
    if (app) {
      const authInstance = getClientAuth();
      const dbInstance = getClientFirestore();
      setAuth(authInstance);
      setDb(dbInstance);

      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        setUser(user);
        setLoading(false);
      }, (error) => {
        setError(error.message);
        setLoading(false);
      });
      
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [app]);

  const signOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err: any) {
       setError(err.message || 'Failed to sign out.');
    }
  };
  
  const value = { user, loading, isRedirectLoading, signOut, auth, app, db };

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
    const { user, loading, isRedirectLoading } = useAuth();
    return { user, loading, isRedirectLoading };
}
