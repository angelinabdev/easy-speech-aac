"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { getMoodSuggestions } from '@/app/actions';
import { Loader2, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Lightbulb } from 'lucide-react';

type MoodEntry = { mood: string; timestamp: string };
type Suggestion = { activity: string; audioSuggestion: string };

const MOODS = [
  { name: 'Happy', emoji: '😊' },
  { name: 'Sad', emoji: '😢' },
  { name: 'Angry', emoji: '😡' },
  { name: 'Anxious', emoji: '😰' },
  { name: 'Calm', emoji: '😌' },
  { name: 'Tired', emoji: '😴' },
];

export default function MoodTab() {
  const [moodHistory, setMoodHistory] = useLocalStorage<MoodEntry[]>('mood_history', []);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMoodSelect = async (mood: string) => {
    const newEntry = { mood, timestamp: new Date().toLocaleString() };
    setMoodHistory([newEntry, ...moodHistory].slice(0, 20));
    
    setIsLoading(true);
    setSuggestion(null);
    const result = await getMoodSuggestions(mood);
    if(result.success && result.data) {
        setSuggestion(result.data);
    }
    setIsLoading(false);
  };

  const chartData = MOODS.map(mood => ({
    name: mood.name,
    count: moodHistory.filter(entry => entry.mood === mood.name).length
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
                            <Bar dataKey="count" fill="hsl(var(--primary))" />
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
                            <Trash2 className="h-4 w-4 mr-1"/> Clear
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {moodHistory.length > 0 ? moodHistory.map((entry, index) => (
                        <div key={index} className="text-sm text-muted-foreground p-2 bg-secondary rounded-md">
                           {entry.timestamp}: <span className="font-semibold text-foreground">{entry.mood}</span>
                        </div>
                    )) : <p className="text-muted-foreground">No mood recorded yet.</p>}
                </CardContent>
            </Card>
            
            <Card className="min-h-[180px]">
                <CardHeader><CardTitle>Mood Tips</CardTitle></CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    {suggestion && (
                        <Alert>
                            <Lightbulb className="h-4 w-4" />
                            <AlertTitle>Here are some suggestions for you</AlertTitle>
                            <AlertDescription className="space-y-2 mt-2">
                                <p><strong>Activity:</strong> {suggestion.activity}</p>
                                <p><strong>Audio:</strong> {suggestion.audioSuggestion}</p>
                            </AlertDescription>
                        </Alert>
                    )}
                    {!isLoading && !suggestion && <p className="text-muted-foreground">Select a mood to get a tip.</p>}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
