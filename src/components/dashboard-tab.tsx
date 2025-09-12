"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle2, Flame } from "lucide-react";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useLocalStorage } from '@/hooks/use-local-storage';

type Role = "user" | "caregiver" | null;

interface DashboardTabProps {
  role: Role;
  onRoleSwitch: (newRole: Role) => void;
}

const features = [
    "Express how you feel by using our simple interface.",
    "Create your daily routines with the drag-and-drop planner.",
    "Tap phrases to quickly communicate your feelings and needs.",
    "Listen to calming audio to relax when overwhelmed.",
    "Caregivers can track mood history, analyze patterns, and take helpful notes."
];

function StreakCard() {
    const [streak] = useLocalStorage('dailyStreak', 0);
    
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
            </CardContent>
        </Card>
    );
}


export default function DashboardTab({ role, onRoleSwitch }: DashboardTabProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Easy Speech AAC!</CardTitle>
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
      
      <div className="space-y-8">
        <StreakCard />

        <Card>
            <CardHeader>
                <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Easy Speech AAC is a free, nonprofit tool developed through research and personal experience to empower individuals with communication challenges. Unlike many costly alternatives, our tool offers support by enabling users to express their needs, monitor emotions, and manage routines effectively. We are dedicated to enhancing the quality of life for both caregivers and users.
                </p>
            </CardContent>
        </Card>
        
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
