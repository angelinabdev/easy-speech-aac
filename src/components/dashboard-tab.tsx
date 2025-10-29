
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { CheckCircle2, Flame, Award, Medal, ShieldCheck, CalendarCheck, Trophy, Crown, HeartHandshake, Info } from "lucide-react";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { UserData } from "@/lib/user-data";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import WeeklySummary from "./weekly-summary";
import { Button } from "./ui/button";

type Role = "user" | "caregiver" | null;

interface DashboardTabProps {
  userData: UserData;
  onRoleSwitch: (newRole: Role) => void;
  onUpdateUserData: (data: Partial<UserData>) => void;
  setActiveTab: (tabId: string) => void;
}

const features = [
    "Tap to track your mood and view emotion charts.",
    "Drag and drop to build daily schedules and earn points for completing activities.",
    "Use customizable phrases and a quick-response soundboard to communicate wants, needs, and feelings.",
    "Share key info using the 'About Me' section.",
    "Caregivers can track patterns and keep private notes.",
    "Play learning games to practice language and emotional recognition."
];

function StreakCard({ streak, streakRestores, onUpdateUserData, metadata }: { streak: number, streakRestores: number, onUpdateUserData: (data: Partial<UserData>) => void, metadata?: UserData['metadata'] }) {
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
                <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{streak} Day{streak !== 1 ? 's' : ''}</div>
                <p className="text-xs text-muted-foreground">
                    You've logged in for {streak} day{streak !== 1 ? 's' : ''} in a row. Keep it up!
                </p>
                {metadata?.streakBroken && (
                    <div className="mt-4 space-y-4">
                        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/30">
                            <Info className="h-4 w-4" />
                            <AlertTitle>Streak Restored!</AlertTitle>
                            <AlertDescription>
                                Good news! Your streak was about to reset, but we used one of your restores to save it.
                            </AlertDescription>
                        </Alert>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="w-full text-center text-sm text-muted-foreground">
                                        You get one free restore per month.
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                <p>You get one restore per month to save your streak if you miss a day.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

const STREAK_BADGES = [
    { name: "Weekly Habit", days: 7, icon: Medal, color: "text-yellow-600" },
    { name: "Two-Week Turnout", days: 14, icon: CalendarCheck, color: "text-indigo-500" },
    { name: "Monthly Milestone", days: 30, icon: Award, color: "text-blue-500" },
    { name: "Century Club", days: 100, icon: ShieldCheck, color: "text-green-500" },
    { name: "Six-Month Survivor", days: 182, icon: Trophy, color: "text-orange-500" },
    { name: "Yearly Champion", days: 365, icon: Crown, color: "text-purple-500" },
];

function StreakBadges({ earnedBadges, streak }: { earnedBadges: string[], streak: number }) {
    const earnedBadgeData = STREAK_BADGES.filter(b => earnedBadges.includes(b.name));
    const nextBadge = STREAK_BADGES.find(b => streak < b.days && !earnedBadges.includes(b.name));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Streak Badges</CardTitle>
                <CardDescription>Earn badges by maintaining your daily login streak.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    {earnedBadgeData.length > 0 ? (
                        <TooltipProvider>
                            <div className="flex flex-wrap gap-4">
                                {earnedBadgeData.map(badge => (
                                    <Tooltip key={badge.name}>
                                        <TooltipTrigger asChild>
                                            <div className="flex flex-col items-center text-center gap-1">
                                                <badge.icon className={`h-12 w-12 ${badge.color}`} />
                                                <Badge variant="secondary">{badge.name}</Badge>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Achieved on Day {badge.days}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </TooltipProvider>
                    ) : (
                        <p className="text-sm text-muted-foreground"></p>
                    )}

                    {nextBadge && (
                        <div className="mt-4 text-center p-3 bg-secondary rounded-md">
                           <p className="font-semibold">Next Badge: {nextBadge.name}</p>
                           <p className="text-sm text-muted-foreground">
                                Log in for {nextBadge.days - streak} more day{nextBadge.days - streak > 1 ? 's' : ''} to unlock it!
                           </p>
                        </div>
                    )}
                 </div>
            </CardContent>
        </Card>
    );
}


export default function DashboardTab({ userData, onRoleSwitch, onUpdateUserData, setActiveTab }: DashboardTabProps) {
  const role = userData?.metadata?.role ?? null;
  const streak = userData?.metadata?.dailyStreak ?? 0;
  const streakRestores = userData?.metadata?.streakRestores ?? 0;
  const earnedBadges = userData?.metadata?.earnedBadgeNames ?? [];

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-8">
        <Card>
            <CardHeader>
            <CardTitle className="text-3xl">Welcome to Easy Speech AAC!</CardTitle>
            </CardHeader>
            <CardContent>
            <ul className="space-y-4">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">Our Mission <HeartHandshake className="ml-2 h-5 w-5 text-red-500"/></CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    Easy Speech AAC is a free, nonprofit platform to empower individuals with communication challenges. Built from personal experience and research, it helps users express needs, manage routines, and track progress—all to improve quality of life for both caregivers and users.
                </p>
                <Button onClick={() => setActiveTab('resources')} className="w-full">
                    Support Our Mission
                </Button>
            </CardContent>
        </Card>
      </div>
      
      <div className="space-y-8">
        {role === 'caregiver' && <WeeklySummary userData={userData} />}
        <StreakCard streak={streak} streakRestores={streakRestores} onUpdateUserData={onUpdateUserData} metadata={userData?.metadata} />
        <StreakBadges earnedBadges={earnedBadges} streak={streak} />
        
        <Card>
            <CardHeader>
                <CardTitle>Switch Role</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="role-switcher">Currently viewing as {role}</Label>
                    <Select onValueChange={(newRole) => onRoleSwitch(newRole as Role)} value={role ?? ""}>
                        <SelectTrigger id="role-switcher">
                            <SelectValue placeholder="Switch Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="caregiver">Caregiver</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

  