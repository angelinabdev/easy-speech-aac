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
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import GamesTab from "./games-tab";

type Role = "user" | "caregiver" | null;

interface MainAppProps {
  role: Role;
  onLogout: () => void;
  onRoleSwitch: (newRole: Role) => void;
}

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "planner", label: "Daily Planner" },
  { id: "phrases", label: "My Phrases" },
  { id: "games", label: "Games" },
  { id: "mood", label: "Mood Tracker" },
  { id: "notes", label: "Caregiver Notes", roles: ["caregiver"] },
  { id: "resources", label: "Resources" },
  { id: "contact", label: "Contact Us" },
];

export default function MainApp({ role, onLogout, onRoleSwitch }: MainAppProps) {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab role={role} onRoleSwitch={onRoleSwitch} />;
      case "planner":
        return <PlannerTab />;
      case "phrases":
        return <PhrasesTab />;
      case "games":
        return <GamesTab />;
      case "mood":
        return <MoodTab />;
      case "notes":
        return <CaregiverNotesTab />;
      case "resources":
        return <ResourcesTab />;
      case "contact":
        return <ContactTab />;
      default:
        return <DashboardTab role={role} onRoleSwitch={onRoleSwitch} />;
    }
  };

  const filteredTabs = TABS.filter(tab => !tab.roles || tab.roles.includes(role!));

  return (
    <>
      <AppHeader onLogout={onLogout} />
      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Welcome back! You are logged in as a{" "}
            <span className="font-semibold text-primary">{role}</span>.
          </p>
        </div>
        
        <div className="relative">
          <ScrollArea className="w-full whitespace-nowrap rounded-lg">
            <div className="flex space-x-2 border-b pb-2">
              {filteredTabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "h-auto px-4 py-2 text-md transition-colors duration-300",
                    activeTab === tab.id
                      ? "bg-accent text-accent-foreground shadow-md"
                      : "text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div className="mt-6">{renderTabContent()}</div>
      </main>
    </>
  );
}
