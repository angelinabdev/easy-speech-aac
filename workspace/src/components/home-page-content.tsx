
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import LoginForm from "@/components/login-form";
import MainApp from "@/components/main-app";
import { useAuth } from "@/lib/firebase/provider";
import { onUserDataSnapshot, setUserData, UserData, getInitialData } from "@/lib/user-data";
import { Loader2 } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { isObject } from "lodash";

// A custom deep merge function that replaces arrays instead of combining them.
function mergeDeep(target: any, source: any): any {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else if (Array.isArray(source[key])) // This is the key: if it's an array, replace it.
          output[key] = source[key];
        else
          output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
}


type Role = "user" | "caregiver" | null;
type LoginStep = 'loading' | 'login' | 'register' | 'selectRole' | 'mainApp';

export default function HomePageContent() {
  const { user, loading: userLoading, isRedirectLoading, db } = useAuth();
  const { signOut } = useAuth();
  const [userData, setUserDataState] = useState<UserData | null>(null);
  const [loginStep, setLoginStep] = useState<LoginStep>('loading');
  const firestoreUnsubscribeRef = useRef<() => void | undefined>();

  const [isGuest, setIsGuest] = useLocalStorage('isGuest', false);
  const [guestData, setGuestData] = useLocalStorage<UserData>('guestData', getInitialData());

  useEffect(() => {
    // Cleanup previous listener if user changes
    return () => {
      if (firestoreUnsubscribeRef.current) {
        firestoreUnsubscribeRef.current();
      }
    };
  }, []);

  useEffect(() => {
    if (isGuest) {
      setLoginStep('mainApp');
      return;
    }

    if (userLoading || isRedirectLoading) {
      setLoginStep('loading');
      return;
    }

    if (!user || !db) {
      setLoginStep('login');
      setUserDataState(null);
      if (firestoreUnsubscribeRef.current) {
        firestoreUnsubscribeRef.current();
      }
      return;
    }

    // User is authenticated, now check for user data document
    
    // Unsubscribe from any previous listener before creating a new one
    if (firestoreUnsubscribeRef.current) {
        firestoreUnsubscribeRef.current();
    }

    firestoreUnsubscribeRef.current = onUserDataSnapshot(db, user.uid, (data) => {
        if (!data) { // Document doesn't exist
             setLoginStep('register');
             return;
        }

        if (!data.metadata?.role) {
            setUserDataState(data);
            setLoginStep('selectRole');
            return;
        }
        
        setUserDataState(data);
        setLoginStep('mainApp');
    });

  }, [user, userLoading, isRedirectLoading, isGuest, db]);


  useEffect(() => {
    // This effect handles the streak logic only on the client-side to prevent hydration errors
    if (typeof window === 'undefined' || loginStep !== 'mainApp' || !user || !userData || isGuest || !db) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toDateString();

    const lastLoginStr = userData.metadata?.lastLoginDate;
    const lastLogin = lastLoginStr ? new Date(lastLoginStr) : null;
    if (lastLogin) {
      lastLogin.setHours(0, 0, 0, 0);
    }
    
    let needsUpdate = false;
    let updatedData = { ...userData };

    // Check if this is a new day login
    if (lastLoginStr !== todayStr) {
        let newStreak = userData.metadata?.dailyStreak || 0;
        let newRestores = userData.metadata?.streakRestores ?? 1;
        let streakBrokenAndRestored = false;
        
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (lastLogin) {
            if (lastLogin.getMonth() !== today.getMonth()) {
                newRestores = 1; // Reset restores at the start of a new month
            }

            if (lastLogin.getTime() === yesterday.getTime()) {
                // Continued streak
                newStreak += 1;
            } else { // Missed a day or more
                if (newRestores > 0) {
                    newRestores -= 1;
                    streakBrokenAndRestored = true; // Inform user their streak was saved
                    newStreak +=1; // Continue streak after using a restore
                } else {
                    newStreak = 1; // Streak broken and no restores left
                }
            }
        } else {
            newStreak = 1; // First login ever
        }

        updatedData.metadata = {
            ...updatedData.metadata,
            dailyStreak: newStreak,
            lastLoginDate: todayStr,
            streakRestores: newRestores,
            streakBroken: streakBrokenAndRestored,
        };
        needsUpdate = true;
    } else if (userData.metadata?.streakBroken) {
        // On subsequent loads the same day, clear the 'streakBroken' flag
        updatedData.metadata = { ...updatedData.metadata, streakBroken: false };
        needsUpdate = true;
    }

    if(needsUpdate) {
      setUserData(db, user.uid, updatedData); // Write update to Firestore
      setUserDataState(updatedData); // Update local state immediately
    }
  }, [loginStep, user, userData, isGuest, db]);


  const handleRegistration = async (name: string, role: Role) => {
    if(user && name && role && db) {
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
        await setUserData(db, user.uid, newUserData);
        // The onSnapshot listener will pick up this change and set state/loginStep
    }
  };
  
  const handleRoleSelect = (selectedRole: Role) => {
    if (user && selectedRole && userData && !userData.metadata.role && db) {
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
      setUserData(db, user.uid, newUserData);
      // The onSnapshot listener will pick up this change and set state/loginStep
    }
  };

  const handleLogout = async () => {
    if (isGuest) {
      setIsGuest(false);
      setGuestData(getInitialData()); // Reset guest data on logout
    } else {
      if (firestoreUnsubscribeRef.current) {
        firestoreUnsubscribeRef.current();
      }
      await signOut();
    }
    setUserDataState(null);
    setLoginStep('login');
  };

  const handleUpdateUserData = useCallback((updatedData: Partial<UserData>) => {
    if (isGuest) {
        const newGuestData = mergeDeep(guestData, updatedData);
        setGuestData(newGuestData);
    } else if (user && userData && db) {
      const newUserData = mergeDeep(userData, updatedData);
      setUserData(db, user.uid, newUserData);
    }
  }, [user, userData, isGuest, guestData, setGuestData, db]);


  if (loginStep === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  
  const currentData = isGuest ? guestData : userData;
  const currentUser = isGuest ? { uid: 'guest', displayName: 'Guest' } : user;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {loginStep === 'mainApp' && currentUser && currentData ? (
        // @ts-ignore
        <MainApp user={currentUser} userData={currentData} onLogout={handleLogout} onUpdateUserData={handleUpdateUserData} isGuest={isGuest} />
      ) : (
        <LoginForm 
            loginStep={loginStep} 
            onRegister={handleRegistration} 
            onRoleSelect={handleRoleSelect} 
            currentUser={user}
            onGuestLogin={() => setIsGuest(true)}
        />
      )}
    </div>
  );
}
