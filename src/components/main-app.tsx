
"use client";

import { useState } from "react";
import AppHeader from "./app-header";
import DashboardTab from "./dashboard-tab";
import PlannerTab from "./planner-tab";
import PhrasesTab from "./phrases-tab";
import MoodTab from "./mood-tab";
import CaregiverNotesTab from "./caregiver-notes-tab";
import ResourcesTab from "./resources-tab";
import ContactTab from "./contact-tab";
import GamesTab from "./games-tab";
import AboutMeTab from "./about-me-tab";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
import HelpContent from "./help-content";
import SoundboardTab from "./soundboard-tab";
import ExportTab from "./export-tab";
import type { User } from "firebase/auth";
import type { UserData, PlannerData, PhrasesData, MoodData, GamesData, SoundboardData, AboutMeData } from "@/lib/user-data";
import { SidebarNav, TABS } from "./sidebar-nav";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";
import LegalTab from "./legal-tab";

type Role = "user" | "caregiver" | null;

interface MainAppProps {
  user: User;
  userData: UserData;
  onLogout: () => void;
  onUpdateUserData: (updatedData: Partial<UserData>) => void;
  isGuest: boolean;
}

export default function MainApp({ user, userData, onLogout, onUpdateUserData, isGuest }: MainAppProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const role = isGuest ? 'user' : userData?.metadata?.role;
  const displayName = isGuest ? "Guest" : (userData?.aboutMe?.name || user?.displayName);
  
  const handleRoleSwitch = (newRole: Role) => {
    if (role !== newRole) {
      onUpdateUserData({ metadata: { ...userData.metadata, role: newRole } });
      // If caregiver switches to user, make sure they don't land on a caregiver-only tab
      if (newRole === 'user' && (activeTab === 'notes' || activeTab === 'export')) {
        setActiveTab('dashboard');
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab userData={userData} onRoleSwitch={handleRoleSwitch} onUpdateUserData={onUpdateUserData} setActiveTab={setActiveTab} />;
      case "about-me":
        return <AboutMeTab aboutMeData={userData.aboutMe} onUpdate={(newAboutMeData: AboutMeData) => onUpdateUserData({ aboutMe: newAboutMeData })} />;
      case "planner":
        return <PlannerTab plannerData={userData.planner} onUpdate={(newPlannerData: PlannerData) => onUpdateUserData({ planner: newPlannerData })} />;
      case "phrases":
        return <PhrasesTab phrasesData={userData.phrases} onUpdate={(newPhrasesData: PhrasesData) => onUpdateUserData({ phrases: newPhrasesData })} />;
      case "soundboard":
        return <SoundboardTab soundboardData={userData.soundboard} onUpdate={(newSoundboardData: SoundboardData) => onUpdateUserData({ soundboard: newSoundboardData })} />;
      case "games":
        return <GamesTab 
                  plannerData={userData.planner} 
                  gamesData={userData.games} 
                  onUpdateGames={(newGamesData: GamesData) => onUpdateUserData({ games: newGamesData })}
                  onUpdatePlanner={(newPlannerData: PlannerData) => onUpdateUserData({ planner: newPlannerData })}
                />;
      case "mood":
        return <MoodTab moodData={userData.moods} onUpdate={(newMoodData: MoodData) => onUpdateUserData({ moods: newMoodData })} />;
      case "notes":
        return <CaregiverNotesTab user={user} userData={userData} onUpdate={onUpdateUserData} />;
      case "export":
        return <ExportTab userData={userData} />;
      case "resources":
        return <ResourcesTab />;
      case "contact":
        return <ContactTab />;
      case "legal":
        return <LegalTab />;
      default:
        return <DashboardTab userData={userData} onRoleSwitch={handleRoleSwitch} onUpdateUserData={onUpdateUserData} setActiveTab={setActiveTab} />;
    }
  };

  const activeTabInfo = TABS.find(tab => tab.id === activeTab);

  if (isMobile === null) {
    return (
       <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {!isMobile && (
        <SidebarNav 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          role={role}
        />
      )}
      <div className={`flex flex-col ${isMobile ? '' : 'sm:pl-20'}`}>
        <AppHeader 
          onLogout={onLogout} 
          onHelpClick={() => setIsHelpOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          role={role}
        />
        <main className="container mx-auto p-4 md:p-8 grid flex-1 items-start gap-4">
          <div className="mb-4">
            <p className="text-muted-foreground">
              {isGuest
                ? "You are using the app as a guest. To save your data permanently, please create an account."
                : `Welcome back${displayName ? `, ${displayName}` : ""}! You are logged in as a `}
              {!isGuest && <span className="font-semibold text-foreground">{role}</span>}
            </p>
          </div>
          {renderTabContent()}
        </main>
      </div>

      <Sheet open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Help: {activeTabInfo?.label}</SheetTitle>
            <SheetDescription>
              Step-by-step guide to using the {activeTabInfo?.label} feature.
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            <HelpContent activeTab={activeTab} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

    