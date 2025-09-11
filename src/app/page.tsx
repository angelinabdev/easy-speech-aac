"use client";

import { useState, useEffect } from "react";
import LoginForm from "@/components/login-form";
import MainApp from "@/components/main-app";

type Role = "user" | "caregiver" | null;

export default function Home() {
  const [role, setRole] = useState<Role>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedRole = localStorage.getItem("userRole") as Role;
    if (storedRole) {
      setRole(storedRole);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (selectedRole: Role) => {
    if (selectedRole) {
      localStorage.setItem("userRole", selectedRole);
      setRole(selectedRole);
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    setRole(null);
    setIsLoggedIn(false);
  };
  
  const handleRoleSwitch = (newRole: Role) => {
    if (newRole) {
      localStorage.setItem("userRole", newRole);
      setRole(newRole);
    }
  };

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isLoggedIn && role ? (
        <MainApp role={role} onLogout={handleLogout} onRoleSwitch={handleRoleSwitch} />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
}
