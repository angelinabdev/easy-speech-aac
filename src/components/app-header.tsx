"use client";

import { MessageSquareHeart, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

interface AppHeaderProps {
  onLogout: () => void;
}

export default function AppHeader({ onLogout }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <MessageSquareHeart className="w-10 h-10 text-accent" />
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground">
            EasySpeak
          </h1>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center space-x-2">
             <Sun className="h-5 w-5" />
            <Switch
              id="theme-toggle"
              checked={theme === "dark"}
              onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            />
            <Moon className="h-5 w-5" />
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
