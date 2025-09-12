"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Trash2, Printer } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Lightbulb } from 'lucide-react';

type MoodEntry = { mood: string; timestamp: string, id: string };

const MOODS = [
  { name: 'Happy', emoji: '😊', color: '#4ade80' },
  { name: 'Sad', emoji: '😢', color: '#60a5fa' },
  { name: 'Angry', emoji: '😡', color: '#f87171' },
  { name: 'Anxious', emoji: '😰', color: '#facc15' },
  { name: 'Calm', emoji: '😌', color: '#818cf8' },
  { name: 'Tired', emoji: '😴', color: '#9ca3af' },
];

const moodTips: Record<string, string> = {
  Happy: "It's wonderful you're feeling happy! Embrace this feeling. Maybe spend some time on a favorite hobby, watch a comfort movie, or share your joy with someone you trust. Let this positive energy fill you up.",
  Sad: "It's completely okay to feel sad. Your feelings are valid. Try wrapping yourself in a warm blanket, listening to some gentle music, or holding a comfort object. You don't have to rush this feeling away; just be gentle with yourself.",
  Angry: "Feeling angry is a powerful emotion. It's okay to feel this way. Try taking slow, deep breaths, counting to ten, or squeezing a stress ball if you have one. If you can, find a quiet space to let the feeling pass safely. You are in control.",
  Anxious: "Anxiety can feel very overwhelming. Let's try to ground ourselves. Focus on your breath—in for four seconds, out for six. Feel your feet on the floor. Name five things you can see around you. You are safe in this present moment.",
  Calm: "Feeling calm is a peaceful state. Enjoy it. This is a great time to do something gentle that you love, like reading a book, listening to an audiobook, or simply resting in a quiet space to recharge your energy.",
  Tired: "Your body and mind are telling you it's time to rest, and that's important. Find a comfortable spot for a short nap, listen to some calming sounds, or just close your eyes for a few minutes. It's okay to take a break."
};


export default function MoodTab() {
  const [moodHistory, setMoodHistory] = useLocalStorage<MoodEntry[]>('mood_history_v2', []);
  const [activeMood, setActiveMood] = useState<string | null>(null);

  const handleMoodSelect = async (mood: string) => {
    const newEntry: MoodEntry = { mood, timestamp: new Date().toLocaleString(), id: Date.now().toString() };
    setMoodHistory([newEntry, ...moodHistory].slice(0, 20));
    setActiveMood(mood);
  };
  
  const deleteMoodEntry = (id: string) => {
    setMoodHistory(moodHistory.filter(entry => entry.id !== id));
  };

  const chartData = MOODS.map(mood => ({
    name: mood.name,
    count: moodHistory.filter(entry => entry.mood === mood.name).length,
    color: mood.color
  }));

  const currentTip = activeMood ? moodTips[activeMood] : null;

  const printMoodData = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Mood Report</title>');
      printWindow.document.write('<style>body{font-family: sans-serif;} h2 { border-bottom: 1px solid #ccc; padding-bottom: 5px;} .entry { margin-bottom: 5px; } .analytics-item { display: flex; justify-content: space-between; max-width: 200px; }</style></head><body>');
      printWindow.document.write(`<h1>Mood Report - ${new Date().toLocaleDateString()}</h1>`);
      
      printWindow.document.write('<h2>Mood History</h2>');
      if (moodHistory.length > 0) {
        moodHistory.forEach(entry => {
          printWindow.document.write(`<div class="entry"><strong>${entry.timestamp}:</strong> ${entry.mood}</div>`);
        });
      } else {
        printWindow.document.write('<p>No history recorded.</p>');
      }

      printWindow.document.write('<br/><h2>Mood Analytics</h2>');
      if (chartData.some(d => d.count > 0)) {
        chartData.filter(d => d.count > 0).forEach(data => {
            printWindow.document.write(`<div class="analytics-item"><span>${data.name}:</span> <span>${data.count}</span></div>`);
        });
      } else {
          printWindow.document.write('<p>No analytics data available.</p>');
      }

      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

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
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={printMoodData}>
                                <Printer className="h-4 w-4 mr-1"/> Print
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setMoodHistory([])}>
                                <Trash2 className="h-4 w-4 mr-1"/> Clear All
                            </Button>
                        </div>
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
                <CardHeader><CardTitle>Mood Tips</CardTitle></CardHeader>
                <CardContent>
                    {currentTip && activeMood && (
                        <Alert>
                            <Lightbulb className="h-4 w-4" />
                            <AlertTitle>Suggestion for feeling {activeMood}</AlertTitle>
                            <AlertDescription className="space-y-2 mt-2">
                                <p>{currentTip}</p>
                            </AlertDescription>
                        </Alert>
                    )}
                    {!currentTip && (
                       <p className="text-muted-foreground">Select a mood to get a tip.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
