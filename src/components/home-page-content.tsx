
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import LoginForm from "@/components/login-form";
import MainApp from "@/components/main-app";
import { useAuth } from "@/firebase";
import { Loader2 } from "lucide-react";
import { getInitialData, UserData, onUserDataSnapshot, setUserData, deepMerge } from "@/lib/user-data";
import type { User } from 'firebase/auth';

type Role = "user" | "caregiver" | null;

export default function HomePageContent() {
  const { user, loading: authLoading, signOut, db } = useAuth();
  const [userData, setUserDataState] = useState<UserData | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const firestoreUnsubscribeRef = useRef<() => void | undefined>();

  const handleUpdateUserData = useCallback((data: Partial<UserData>) => {
    if (user && db) {
      // All users, including anonymous guests, are handled through Firestore.
      setUserData(db, user.uid, data);
    }
  }, [user, db]);


  useEffect(() => {
    if (authLoading) {
      setIsDataLoading(true);
      return;
    }

    if (!user || !db) {
      setIsDataLoading(false);
      setUserDataState(null);
      if (firestoreUnsubscribeRef.current) {
        firestoreUnsubscribeRef.current();
        firestoreUnsubscribeRef.current = undefined;
      }
      return;
    }

    setIsDataLoading(true);

    const unsubscribe = onUserDataSnapshot(db, user.uid, (data) => {
      if (!data) {
        // If user is anonymous, create their initial data.
        if (user.isAnonymous) {
          const initialData = getInitialData();
          initialData.aboutMe.name = "Guest";
          setUserData(db, user.uid, initialData).then(() => {
             // The listener will re-trigger with the new data.
          });
        } else {
          // For a new regular user, we wait for registration.
          setUserDataState(null);
        }
        setIsDataLoading(false);
        return;
      }

      let mergedData = deepMerge(getInitialData(), data);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toDateString();
      const lastLoginStr = mergedData.metadata.lastLoginDate;
      let needsUpdate = false;
      let updatedMetadata = { ...mergedData.metadata };

      if (lastLoginStr !== todayStr) {
        let newStreak = updatedMetadata.dailyStreak || 0;
        let newRestores = updatedMetadata.streakRestores ?? 1;
        let streakBrokenAndRestored = false;
        
        const lastLogin = lastLoginStr ? new Date(lastLoginStr) : null;
        
        if (lastLogin) {
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);

            if (lastLogin.getMonth() !== today.getMonth()) {
                newRestores = 1; // Reset restores at the start of a new month
            }
            
            if (lastLogin.toDateString() === yesterday.toDateString()) {
                newStreak++;
            } else { // Missed a day
                if (user.isAnonymous) {
                   newStreak = 1; // Don't use restores for guests
                }
                else if (newRestores > 0) {
                    newRestores--;
                    streakBrokenAndRestored = true;
                    newStreak++; // Keep streak alive
                } else {
                    newStreak = 1; // Reset streak
                }
            }
        } else {
            newStreak = 1; // First login ever
        }
        
        updatedMetadata = {
            ...updatedMetadata,
            dailyStreak: newStreak,
            lastLoginDate: todayStr,
            streakRestores: newRestores,
            streakBroken: streakBrokenAndRestored,
        };

        if (mergedData.planner) {
          mergedData.planner.completedToday = 0;
          mergedData.planner.dailyBonusClaimed = false;
        }
        needsUpdate = true;
      } else if (updatedMetadata.streakBroken) {
        // On subsequent loads the same day, clear the 'streakBroken' flag
        updatedMetadata = { ...updatedMetadata, streakBroken: false };
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        const dataToUpdate = {
          metadata: updatedMetadata,
          planner: mergedData.planner,
        };
        setUserData(db, user.uid, dataToUpdate);
        // Optimistically update local state
        mergedData.metadata = updatedMetadata;
      }
      
      setUserDataState(mergedData);
      setIsDataLoading(false);
    });

    firestoreUnsubscribeRef.current = unsubscribe;

    return () => unsubscribe();
  }, [user, db, authLoading]);

  const handleLogout = async () => {
    // If the user is anonymous, delete their account on logout to clean up.
    if (user?.isAnonymous) {
      await user.delete();
    }
    await signOut();
  };
  
  const handleRegistration = async (name: string, role: Role) => {
    if (!user || !db) return;
    const initialData = getInitialData();
    const newUserData: UserData = {
      ...initialData,
      aboutMe: { ...initialData.aboutMe, name: name },
      metadata: {
        ...initialData.metadata,
        role: role,
        dailyStreak: 1,
        lastLoginDate: new Date().toDateString(),
      }
    };
    await setUserData(db, user.uid, newUserData);
    setUserDataState(newUserData);
  };
  
  const handleRoleSelect = (role: Role) => {
    if (user && db && userData) {
      const updatedData = {
        metadata: {
          ...userData.metadata,
          role: role,
        }
      };
      handleUpdateUserData(updatedData as Partial<UserData>);
    }
  };
  
  if (authLoading || isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // This logic determines which UI to show based on the user's state
  const getLoginStep = () => {
    if (!user) return 'login';
    // If the user is anonymous, they should always go straight to the app.
    if (user.isAnonymous) return 'mainApp';
    if (!userData) return 'register';
    if (!userData.metadata?.role) return 'selectRole';
    return 'mainApp';
  }

  const loginStep = getLoginStep();

  if (loginStep === 'mainApp' && user && userData) {
    return (
      <MainApp 
          user={user} 
          userData={userData} 
          onLogout={handleLogout} 
          onUpdateUserData={handleUpdateUserData} 
          isGuest={user.isAnonymous}
      />
    );
  }

  return (
    <LoginForm 
      loginStep={loginStep} 
      onRegister={handleRegistration} 
      onRoleSelect={handleRoleSelect} 
      currentUser={user}
    />
  );
}
