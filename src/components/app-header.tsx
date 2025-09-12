"use client";

import { LogOut, Sun, Moon, HelpCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { Switch } from "./ui/switch";

interface AppHeaderProps {
  onLogout: () => void;
  onHelpClick: () => void;
}

export default function AppHeader({ onLogout, onHelpClick }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground">
            Easy Speech AAC
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
          <Button variant="ghost" size="icon" onClick={onHelpClick}>
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Help</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
