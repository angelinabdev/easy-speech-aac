
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import LoginForm from "@/components/login-form";
import MainApp from "@/components/main-app";
import { useAuth, useUser } from "@/lib/firebase/provider";
import { onUserDataSnapshot, setUserData, UserData, getInitialData } from "@/lib/user-data";
import { Loader2 } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

type Role = "user" | "caregiver" | null;
type LoginStep = 'loading' | 'login' | 'register' | 'selectRole' | 'mainApp';

export default function Home() {
  const { user, loading: userLoading } = useUser();
  const { signOut } = useAuth();
  const [userData, setUserDataState] = useState<UserData | null>(null);
  const [loginStep, setLoginStep] = useState<LoginStep>('loading');
  const firestoreUnsubscribeRef = useRef<() => void | undefined>();

  useEffect(() => {
    // Cleanup previous listener if user changes
    return () => {
      if (firestoreUnsubscribeRef.current) {
        firestoreUnsubscribeRef.current();
      }
    };
  }, [user]);

  useEffect(() => {
    if (userLoading) {
      setLoginStep('loading');
      return;
    }

    if (!user) {
      setLoginStep('login');
      setUserDataState(null);
      if (firestoreUnsubscribeRef.current) {
        firestoreUnsubscribeRef.current();
      }
      return;
    }

    // User is authenticated, now check for user data document
    const userDocRef = doc(db, "users", user.uid);
    getDoc(userDocRef).then(userDoc => {
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        if (!data.metadata?.role) {
          setUserDataState(data);
          setLoginStep('selectRole');
        } else {
          // Document exists and role is set, set up the real-time listener
          if (firestoreUnsubscribeRef.current) {
            firestoreUnsubscribeRef.current(); // Unsubscribe from any previous listener
          }
          firestoreUnsubscribeRef.current = onUserDataSnapshot(user.uid, (data) => {
              let updatedData = { ...data };
              let shouldUpdate = false;
              
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const lastLogin = data.metadata?.lastLoginDate ? new Date(data.metadata.lastLoginDate) : null;
              if (lastLogin) lastLogin.setHours(0, 0, 0, 0);

              if (data.metadata?.role && (!lastLogin || lastLogin.getTime() !== today.getTime())) {
                  let newStreak = data.metadata?.dailyStreak || 0;
                  let newRestores = data.metadata?.streakRestores ?? 1;
                  let streakBroken = false;
                  
                  const yesterday = new Date(today);
                  yesterday.setDate(today.getDate() - 1);
                  
                  if (lastLogin) {
                      if (lastLogin.getMonth() !== today.getMonth()) {
                          newRestores = 1;
                      }

                      if (lastLogin.getTime() === yesterday.getTime()) {
                          newStreak += 1;
                      } else {
                          if (newRestores > 0) {
                              newRestores -= 1;
                              streakBroken = true;
                              if (newStreak === 0) newStreak = 1;
                          } else {
                              newStreak = 1;
                          }
                      }
                  } else {
                      newStreak = 1;
                  }

                  updatedData.metadata = {
                      ...updatedData.metadata,
                      dailyStreak: newStreak,
                      lastLoginDate: today.toDateString(),
                      streakRestores: newRestores,
                      streakBroken: streakBroken,
                  };
                  shouldUpdate = true;
              } else if (data.metadata?.streakBroken) {
                  updatedData.metadata = { ...updatedData.metadata, streakBroken: false };
                  shouldUpdate = true;
              }
              
              if (shouldUpdate) {
                  setUserData(user.uid, updatedData);
              }
              
              setUserDataState(updatedData);
              setLoginStep('mainApp');
          });
        }
      } else {
        // First time login
        setLoginStep('register');
      }
    });

  }, [user, userLoading]);

  const handleRegistration = async (name: string, role: Role) => {
    if(user && name && role) {
        const initialData = getInitialData();
        const newUserData: UserData = {
            ...initialData,
            aboutMe: { ...initialData.aboutMe, name: name },
            metadata: {
                ...initialData.metadata,
                role: role,
                lastLoginDate: new Date().toDateString(),
                dailyStreak: 1
            }
        };
        await setDoc(doc(db, "users", user.uid), newUserData);
        setUserDataState(newUserData);
        setLoginStep('mainApp');
    }
  };
  
  const handleRoleSelect = (selectedRole: Role) => {
    if (user && selectedRole && userData && !userData.metadata.role) {
       const today = new Date().toDateString();
       const newMetadata = {
        ...userData.metadata,
        role: selectedRole,
        dailyStreak: 1, 
        lastLoginDate: today,
        streakRestores: userData.metadata.streakRestores ?? 1,
        streakBroken: false,
      };
      const newUserData = { ...userData, metadata: newMetadata };
      setUserData(user.uid, newUserData);
      setUserDataState(newUserData);
      setLoginStep('mainApp');
    }
  };

  const handleLogout = async () => {
    if (firestoreUnsubscribeRef.current) {
      firestoreUnsubscribeRef.current();
    }
    await signOut();
    setUserDataState(null);
    setLoginStep('login');
  };

  const handleUpdateUserData = useCallback((updatedData: Partial<UserData>) => {
    if (user && userData) {
      const newUserData: UserData = {
        ...userData,
        ...updatedData,
        aboutMe: { ...userData.aboutMe, ...updatedData.aboutMe },
        planner: { ...userData.planner, ...updatedData.planner },
        phrases: { ...userData.phrases, ...updatedData.phrases },
        moods: { ...userData.moods, ...updatedData.moods },
        games: { ...userData.games, ...updatedData.games },
        metadata: { ...userData.metadata, ...updatedData.metadata },
        notes: 'notes' in updatedData ? updatedData.notes! : userData.notes,
      };
      setUserData(user.uid, newUserData);
    }
  }, [user, userData]);


  if (loginStep === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {loginStep === 'mainApp' && user && userData ? (
        <MainApp user={user} userData={userData} onLogout={handleLogout} onUpdateUserData={handleUpdateUserData} />
      ) : (
        <LoginForm 
            loginStep={loginStep} 
            onRegister={handleRegistration} 
            onRoleSelect={handleRoleSelect} 
            currentUser={user}
        />
      )}
    </div>
  );
}
