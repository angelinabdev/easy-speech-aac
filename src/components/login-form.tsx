
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Role = "user" | "caregiver" | null;

interface LoginFormProps {
  onLogin: (role: Role) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [role, setRole] = useState<string>("");

  const handleLogin = () => {
    if (role) {
      onLogin(role as Role);
    } else {
      alert("Please select a role.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary-foreground">Welcome to Easy Speech AAC</CardTitle>
          <CardDescription className="text-center text-muted-foreground">Please select your role to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" defaultValue="demo@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Enter your password" defaultValue="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-select">Select Role</Label>
            <Select onValueChange={setRole} value={role}>
              <SelectTrigger id="role-select">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="caregiver">Caregiver</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleLogin} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Login</Button>
          <Button variant="outline" className="w-full">Create Account</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
