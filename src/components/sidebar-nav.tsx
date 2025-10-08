
"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarCheck,
  MessageSquare,
  Sparkles,
  HeartPulse,
  Gamepad2,
  User,
  BookLock,
  HeartHandshake,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Role = "user" | "caregiver" | null;

export const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "about", label: "About Me", icon: User },
  { id: "planner", label: "Planner", icon: CalendarCheck },
  { id: "phrases", label: "Phrases", icon: MessageSquare },
  { id: "soundboard", label: "Soundboard", icon: Sparkles },
  { id: "mood", label: "Moods", icon: HeartPulse },
  { id: "games", label: "Games", icon: Gamepad2 },
  { id: "notes", label: "Notes", icon: BookLock, roles: ["caregiver"] },
  { id: "resources", label: "Resources", icon: HeartHandshake },
  { id: "contact", label: "Contact", icon: Mail },
];

interface SidebarNavProps {
  activeTab: string | null;
  setActiveTab: (tab: string) => void;
  role: Role | null;
  isMobile?: boolean;
}

export function SidebarNav({ activeTab, setActiveTab, role, isMobile = false }: SidebarNavProps) {
  const filteredTabs = TABS.filter(tab => !tab.roles || role === null || tab.roles.includes(role));
  
  const NavContent = () => (
    <nav className={`flex flex-col items-center gap-4 px-2 ${isMobile ? 'w-full p-4' : 'sm:py-5'}`}>
      {filteredTabs.map((tab) => (
        <TooltipProvider key={tab.id} delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center justify-center rounded-lg transition-colors text-muted-foreground hover:text-foreground",
                  isMobile ? "w-full justify-start p-3 gap-4" : "h-12 w-12",
                  activeTab === tab.id && !isMobile ? "bg-accent text-accent-foreground" : ""
                )}
              >
                <tab.icon className="h-6 w-6" />
                {isMobile ? (
                  <span className="text-base font-medium">{tab.label}</span>
                ) : (
                  <span className="sr-only">{tab.label}</span>
                )}
              </button>
            </TooltipTrigger>
            {!isMobile && (
              <TooltipContent side="right">{tab.label}</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      ))}
    </nav>
  );

  if (isMobile) {
    return <NavContent />;
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-20 flex-col border-r bg-background sm:flex">
        <NavContent />
    </aside>
  );
}
