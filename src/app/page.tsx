
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

      // Streak Logic
      const today = new Date().toDateString();
      const lastLoginDate = localStorage.getItem('lastLoginDate');
      let currentStreak = parseInt(localStorage.getItem('dailyStreak') || '0', 10);

      if (lastLoginDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastLoginDate === yesterday.toDateString()) {
          // Consecutive day
          currentStreak++;
        } else {
          // Missed a day or first login
          currentStreak = 1;
        }
        localStorage.setItem('dailyStreak', currentStreak.toString());
        localStorage.setItem('lastLoginDate', today);
      }
    }
  }, []);

  const handleLogin = (selectedRole: Role) => {
    if (selectedRole) {
      localStorage.setItem("userRole", selectedRole);
      setRole(selectedRole);
      setIsLoggedIn(true);

      // Reset/start streak on new login
      const today = new Date().toDateString();
      localStorage.setItem('dailyStreak', '1');
      localStorage.setItem('lastLoginDate', today);
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
