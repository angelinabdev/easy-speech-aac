
"use client";

import { useState } from "react";
import { User } from "firebase/auth";
import { useAuth } from "@/lib/firebase/provider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
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
    "Gamified Sentence Builder"
];

const PopupBlockedError = () => (
    <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Popup Blocked</AlertTitle>
        <AlertDescription>
            Your browser has blocked the sign-in window. Please click the popup icon in your address bar (usually on the right side) and select **"Always allow pop-ups and redirects from..."** then try signing in again.
        </AlertDescription>
    </Alert>
);

export default function LoginForm({ loginStep, onRegister, onRoleSelect, currentUser }: LoginFormProps) {
  const [name, setName] = useState(currentUser?.displayName || "");
  const [role, setRole] = useState<string>("");
  const { signInWithGoogle, error, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleRegistrationSubmit = () => {
      if (!name.trim()) {
          alert("Please enter a display name.");
          return;
      }
      if (!role) {
          alert("Please select a role.");
          return;
      }
      onRegister(name, role as Role);
  };
  
  const handleRoleSubmit = () => {
      if (!role) {
          alert("Please select a role.");
          return;
      }
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
                          <CardDescription className="text-center text-muted-foreground">Sign in with Google to continue.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          {error && error.includes('popup was blocked') 
                            ? <PopupBlockedError /> 
                            : error && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Authentication Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                      </CardContent>
                      <CardFooter>
                          <Button onClick={handleGoogleSignIn} className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
                              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                              Sign In with Google
                          </Button>
                      </CardFooter>
                   </>
              );
      }
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-secondary/50">
        <div className="grid md:grid-cols-2 max-w-4xl w-full bg-card shadow-2xl rounded-2xl overflow-hidden">
            <div className="p-8 space-y-6">
                <Card className="border-none shadow-none">
                    {renderContent()}
                </Card>
            </div>
            <div className="hidden md:flex flex-col justify-center p-8 bg-primary/20 space-y-6">
                <h2 className="text-2xl font-bold">A Free, Modern AAC Tool</h2>
                <p className="text-muted-foreground">Empowering individuals with communication challenges through accessible, research-driven features.</p>
                <ul className="space-y-3 pt-4">
                    {features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-500"/>
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
  );
}
