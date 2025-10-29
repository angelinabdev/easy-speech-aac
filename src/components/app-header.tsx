
"use client";

import { LogOut, Sun, Moon, HelpCircle, Menu, Type } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { Switch } from "./ui/switch";
import { Logo } from "./logo";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { SidebarNav } from "./sidebar-nav";
import { useState } from "react";
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
import { useFontSize } from "./font-size-provider";
import { useCalmMode } from "./calm-mode-provider";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

interface AppHeaderProps {
  onLogout: () => void;
  onHelpClick: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: "user" | "caregiver" | null;
}

export default function AppHeader({ onLogout, onHelpClick, activeTab, setActiveTab, role }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { fontSize, toggleFontSize } = useFontSize();
  const { isCalmMode, toggleCalmMode } = useCalmMode();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  const handleTabSelect = (tab: string) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
  }

  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between p-4 h-16">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" aria-label="Toggle Navigation">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 pt-8 w-72 flex flex-col">
                 <SheetHeader className="p-4 border-b">
                    <SheetTitle className="text-left">Navigation</SheetTitle>
                 </SheetHeader>
                 <SidebarNav 
                    activeTab={activeTab} 
                    setActiveTab={handleTabSelect}
                    role={role}
                    isMobile={true}
                  />
                  <div className="mt-auto border-t p-4 space-y-4">
                    <Separator />
                    <h3 className="font-semibold">Settings</h3>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mobile-calm-mode-toggle" className="text-base">Calm Mode</Label>
                      <Switch
                        id="mobile-calm-mode-toggle"
                        checked={isCalmMode}
                        onCheckedChange={toggleCalmMode}
                        aria-label="Toggle calm mode"
                      />
                    </div>
                     <div className="flex items-center justify-between">
                      <Label htmlFor="mobile-theme-toggle" className="text-base">Dark Mode</Label>
                      <Switch
                        id="mobile-theme-toggle"
                        checked={theme === "dark"}
                        onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                        aria-label="Toggle dark mode"
                      />
                    </div>
                  </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10" />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
           <div className="items-center space-x-2 hidden sm:flex">
             <Label htmlFor="calm-mode-toggle" className="flex items-center gap-2 cursor-pointer">
                <span>Calm Mode</span>
             </Label>
            <Switch
              id="calm-mode-toggle"
              checked={isCalmMode}
              onCheckedChange={toggleCalmMode}
              aria-label="Toggle calm mode"
            />
          </div>
           <div className="items-center space-x-2 hidden sm:flex">
             <Sun className="h-5 w-5" />
            <Switch
              id="theme-toggle"
              checked={theme === "dark"}
              onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle dark mode"
            />
            <Moon className="h-5 w-5" />
          </div>
          <Button variant="outline" size="sm" onClick={toggleFontSize} aria-label="Toggle font size" className="hidden sm:inline-flex">
             <Type className="mr-2 h-4 w-4" />
             <span>{fontSize === 'default' ? 'Large' : 'Normal'}</span>
          </Button>
          
          <div className="flex sm:hidden items-center gap-2">
            <Button variant="outline" size="icon" onClick={toggleFontSize} aria-label="Toggle font size">
              <Type className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={onHelpClick} aria-label="Open help panel">
              <HelpCircle className="h-5 w-5" />
            </Button>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Logout">
                  <LogOut className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onLogout}>Logout</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onHelpClick} aria-label="Open help and documentation">
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
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
      </div>
    </header>
  );
}

    