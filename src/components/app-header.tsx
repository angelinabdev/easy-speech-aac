
"use client";

import { LogOut, Sun, Moon, HelpCircle, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { Switch } from "./ui/switch";
import { Logo } from "./logo";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { SidebarNav } from "./sidebar-nav";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AppHeaderProps {
  onLogout: () => void;
  onHelpClick: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: "user" | "caregiver" | null;
}

export default function AppHeader({ onLogout, onHelpClick, activeTab, setActiveTab, role }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const handleTabSelect = (tab: string) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
  }

  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-30">
      <div className="container mx-auto flex items-center justify-between p-4 h-16">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 pt-8 w-60">
                 <SheetHeader className="p-4 border-b">
                    <SheetTitle className="text-left">Navigation</SheetTitle>
                 </SheetHeader>
                 <SidebarNav 
                    activeTab={activeTab} 
                    setActiveTab={handleTabSelect}
                    role={role}
                    isMobile={true}
                  />
              </SheetContent>
            </Sheet>
          )}
          <Logo className="h-10 w-10" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight hidden sm:block">
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
          <Button variant="outline" size="sm" onClick={onHelpClick}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Help
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will be returned to the login screen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onLogout}>Logout</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </header>
  );
}
