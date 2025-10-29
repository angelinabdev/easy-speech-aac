
"use client";

import { useState } from "react";
import { User, GoogleAuthProvider, signInWithPopup, signInAnonymously } from "firebase/auth";
import { useAuth } from "@/firebase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Loader2, Star } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

type Role = "user" | "caregiver" | null;
type LoginStep = 'loading' | 'login' | 'register' | 'selectRole' | 'mainApp';

interface LoginFormProps {
  loginStep: LoginStep;
  onRegister: (name: string, role: Role) => void;
  onRoleSelect: (role: Role) => void;
  currentUser: User | null;
}

const features = [
    "Interactive Daily Planner",
    "Customizable Phrase & Soundboard",
    "Mood Tracking & Analytics",
    "Secure On-Device Notes",
    "Gamified Learning"
];

const AuthErrorDisplay = ({ error }: { error: string }) => {
    if (error.includes('auth/unauthorized-domain')) {
      return (
         <Alert variant="destructive" className="bg-red-100 dark:bg-red-900/30 border-red-500/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="font-bold text-lg">Action Required: Authorize Your Domain</AlertTitle>
            <AlertDescription className="space-y-3 mt-2 text-base">
                <p>For security, Firebase blocks sign-ins from unrecognized websites. To fix this, you must add your domain to the list of authorized domains in your Firebase project.</p>
                <ol className="list-decimal list-inside space-y-2 font-mono bg-destructive/10 p-3 rounded-md text-sm">
                    <li>
                        <strong>Step 1:</strong> Go to the Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains.
                    </li>
                    <li>
                        <strong>Step 2:</strong> Click <strong>"Add domain"</strong> and enter the domain where your app is hosted (e.g., `easyspeechaac.com`).
                    </li>
                </ol>
                <p>After adding the domain, please **refresh this page** and try signing in again. This is a one-time setup step required for custom domains.</p>
            </AlertDescription>
        </Alert>
      )
    }

    if (error.includes('popup')) {
      return (
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Popup Blocked</AlertTitle>
            <AlertDescription>
                Your browser has blocked the sign-in window. Please click the popup icon in your address bar and select **"Always allow pop-ups and redirects"**, then try again.
            </AlertDescription>
        </Alert>
      )
    }
    
    return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
};


export default function LoginForm({ loginStep, onRegister, onRoleSelect, currentUser }: LoginFormProps) {
  const [name, setName] = useState(currentUser?.displayName || "");
  const [role, setRole] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { auth, loading: authLoading } = useAuth();


  const handleGoogleSignIn = async () => {
    if (!auth) {
        setError("Authentication service is not ready. Please try again in a moment.");
        return;
    }
    setIsSigningIn(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
        if (err.code === 'auth/popup-closed-by-user') {
            setIsSigningIn(false);
            return;
        }

       let errorMessage = "An unexpected error occurred. Please try again.";
        switch (err.code) {
            case 'auth/popup-blocked':
                errorMessage = "Popup blocked by browser. Please allow popups for this site and try again.";
                break;
            case 'auth/unauthorized-domain':
                 errorMessage = "auth/unauthorized-domain";
                break;
            default:
                errorMessage = err.message || "An error occurred during sign-in.";
                break;
        }
        setError(errorMessage.replace('Firebase: ', ''));
    } finally {
        setIsSigningIn(false);
    }
  };
  
  const handleGuestLogin = async () => {
    if (!auth) {
        setError("Authentication service is not ready. Please try again.");
        return;
    }
    setIsSigningIn(true);
    setError(null);
    try {
        await signInAnonymously(auth);
    } catch (err: any) {
        let errorMessage = "Could not sign in as guest. Please try again.";
        if (err.code === 'auth/operation-not-allowed') {
            errorMessage = "Anonymous sign-in is not enabled. Please enable it in the Firebase console.";
        }
        setError(errorMessage);
    } finally {
        setIsSigningIn(false);
    }
  };

  const handleRegistrationSubmit = () => {
      if (!name.trim()) {
          setError("Please enter a display name.");
          return;
      }
      if (!role) {
          setError("Please select a role.");
          return;
      }
      setError(null);
      onRegister(name, role as Role);
  };
  
  const handleRoleSubmit = () => {
      if (!role) {
          setError("Please select a role.");
          return;
      }
      setError(null);
      onRoleSelect(role as Role);
  };

  const renderContent = () => {
      switch(loginStep) {
          case 'register':
              return (
                  <>
                      <CardHeader>
                          <CardTitle className="text-3xl font-bold text-center">Complete Your Profile</CardTitle>
                          <CardDescription className="text-center text-muted-foreground">Just a couple more things to get you started.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                           {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                          <div className="space-y-2">
                              <Label htmlFor="display-name">Display Name</Label>
                              <Input id="display-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="role-select-register">I am a...</Label>
                              <Select onValueChange={setRole} value={role}>
                                  <SelectTrigger id="role-select-register"><SelectValue placeholder="Select role" /></SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="user">User</SelectItem>
                                      <SelectItem value="caregiver">Caregiver</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                      </CardContent>
                      <CardFooter>
                          <Button onClick={handleRegistrationSubmit} className="w-full">Complete Registration</Button>
                      </CardFooter>
                  </>
              );
          case 'selectRole':
              return (
                  <>
                      <CardHeader>
                          <CardTitle className="text-3xl font-bold text-center">Choose Your Role</CardTitle>
                          <CardDescription className="text-center text-muted-foreground">Please select how you'll be using the app.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                          <div className="space-y-2">
                              <Label htmlFor="role-select-existing">I am a...</Label>
                              <Select onValueChange={setRole} value={role}>
                                  <SelectTrigger id="role-select-existing"><SelectValue placeholder="Select role" /></SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="user">User</SelectItem>
                                      <SelectItem value="caregiver">Caregiver</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                      </CardContent>
                      <CardFooter>
                          <Button onClick={handleRoleSubmit} className="w-full">Confirm Role</Button>
                      </CardFooter>
                  </>
              );
          case 'login':
          default:
              return (
                   <>
                      <CardHeader>
                          <CardTitle className="text-3xl font-bold text-center">Welcome!</CardTitle>
                          <CardDescription className="text-center text-muted-foreground">Sign in or continue as a guest.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          {error && <AuthErrorDisplay error={error} />}
                          <Button onClick={handleGoogleSignIn} className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground" disabled={authLoading || isSigningIn}>
                              {(authLoading || isSigningIn) && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                              {authLoading ? 'Initializing...' : (isSigningIn ? 'Signing In...' : 'Sign In with Google')}
                          </Button>
                           <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                  <span className="w-full border-t" />
                              </div>
                              <div className="relative flex justify-center text-xs uppercase">
                                  <span className="bg-card px-2 text-muted-foreground">
                                  Or
                                  </span>
                              </div>
                          </div>
                          <Button onClick={handleGuestLogin} variant="secondary" className="w-full hover:bg-accent hover:text-accent-foreground" disabled={authLoading || isSigningIn}>
                            Continue as Guest
                          </Button>
                      </CardContent>
                   </>
              );
      }
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-secondary/50">
        <div className="grid md:grid-cols-2 max-w-4xl w-full bg-card shadow-2xl rounded-2xl overflow-hidden">
            <div className="flex-col justify-center p-8 bg-primary/20 space-y-4 hidden md:flex">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">AAC app for Nonverbal & Neurodivergent Users</h1>
                    <h2 className="text-lg text-muted-foreground">Speak Your Way — An App for Everyone</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    Built from personal experience. No ads. No money. Just support.
                </p>
                <ul className="space-y-3 pt-4">
                    {features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-500"/>
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="p-8 space-y-6 flex flex-col justify-center">
                 <div className="flex flex-col md:hidden p-4 rounded-lg bg-primary/20 space-y-4 mb-6">
                    <div className="space-y-2 text-center">
                        <h1 className="text-xl font-bold">AAC app for Nonverbal & Neurodivergent Users</h1>
                        <h2 className="text-md text-muted-foreground">Speak Your Way — An App for Everyone</h2>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                        Built from personal experience. No ads. No money. Just support.
                    </p>
                </div>
                <Card className="border-none shadow-none">
                    {renderContent()}
                </Card>
            </div>
        </div>
    </div>
  );
}
