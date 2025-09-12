"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Loader2, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Lightbulb } from 'lucide-react';
import type { MoodActivitySuggestion } from '@/ai/flows/suggest-mood-activities';
import { getMoodSuggestions } from '@/app/actions';

type MoodEntry = { mood: string; timestamp: string, id: string };

const MOODS = [
  { name: 'Happy', emoji: '😊', color: '#4ade80' },
  { name: 'Sad', emoji: '😢', color: '#60a5fa' },
  { name: 'Angry', emoji: '😡', color: '#f87171' },
  { name: 'Anxious', emoji: '😰', color: '#facc15' },
  { name: 'Calm', emoji: '😌', color: '#818cf8' },
  { name: 'Tired', emoji: '😴', color: '#9ca3af' },
];

export default function MoodTab() {
  const [moodHistory, setMoodHistory] = useLocalStorage<MoodEntry[]>('mood_history_v2', []);
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<MoodActivitySuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMoodSelect = async (mood: string) => {
    const newEntry: MoodEntry = { mood, timestamp: new Date().toLocaleString(), id: Date.now().toString() };
    setMoodHistory([newEntry, ...moodHistory].slice(0, 20));
    setActiveMood(mood);
    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    const result = await getMoodSuggestions(mood);

    if (result.success && result.data) {
      setSuggestions(result.data);
    } else {
      setError(result.error || "An unknown error occurred.");
    }
    setIsLoading(false);
  };
  
  const deleteMoodEntry = (id: string) => {
    setMoodHistory(moodHistory.filter(entry => entry.id !== id));
  };

  const chartData = MOODS.map(mood => ({
    name: mood.name,
    count: moodHistory.filter(entry => entry.mood === mood.name).length,
    color: mood.color
  }));

  return (
    <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Mood Tracker</CardTitle>
                    <CardDescription>Tap your current mood to log it and get personalized tips.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {MOODS.map(mood => (
                        <Button key={mood.name} onClick={() => handleMoodSelect(mood.name)} variant="outline" className="p-4 h-auto text-lg flex-grow">
                            <span className="text-2xl mr-2">{mood.emoji}</span> {mood.name}
                        </Button>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Mood Analytics</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count">
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Mood History</CardTitle>
                        <Button variant="destructive" size="sm" onClick={() => setMoodHistory([])}>
                            <Trash2 className="h-4 w-4 mr-1"/> Clear All
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {moodHistory.length > 0 ? moodHistory.map((entry) => (
                        <div key={entry.id} className="group text-sm text-muted-foreground p-2 bg-secondary rounded-md flex justify-between items-center">
                           <span>{entry.timestamp}: <span className="font-semibold text-foreground">{entry.mood}</span></span>
                           <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => deleteMoodEntry(entry.id)}>
                               <Trash2 className="h-4 w-4 text-destructive"/>
                           </Button>
                        </div>
                    )) : <p className="text-muted-foreground">No mood recorded yet.</p>}
                </CardContent>
            </Card>
            
            <Card className="min-h-[180px]">
                <CardHeader><CardTitle>AI Mood Tips</CardTitle></CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {suggestions && (
                        <Alert>
                            <Lightbulb className="h-4 w-4" />
                            <AlertTitle>Suggestions for feeling {activeMood}</AlertTitle>
                            <AlertDescription className="space-y-2 mt-2">
                                <p><strong>Activity:</strong> {suggestions.activity}</p>
                                <p><strong>Calming Audio:</strong> {suggestions.audioSuggestion}</p>
                            </AlertDescription>
                        </Alert>
                    )}
                    {!isLoading && !error && !suggestions && (
                       <p className="text-muted-foreground">Select a mood to get a tip from the AI.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
