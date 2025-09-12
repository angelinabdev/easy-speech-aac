"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Trash2, Lightbulb, Printer, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import html2canvas from 'html2canvas';
import { getSuggestion } from '@/ai/flows/suggestion-flow';

type MoodEntry = { mood: string; timestamp: string, id: string };
type ListItem = { id: string; text: string };

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
  const [likes] = useLocalStorage<ListItem[]>('about_me_likes', []);
  const [dislikes] = useLocalStorage<ListItem[]>('about_me_dislikes', []);
  const [communication] = useLocalStorage<string>('about_me_communication', '');
  
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleMoodSelect = async (mood: string) => {
    const newEntry: MoodEntry = { mood, timestamp: new Date().toLocaleString(), id: Date.now().toString() };
    setMoodHistory([newEntry, ...moodHistory].slice(0, 20));
    setActiveMood(mood);
    
    setIsLoadingSuggestion(true);
    setSuggestion(null);
    try {
      const userLikes = likes.map(like => like.text);
      const userDislikes = dislikes.map(dislike => dislike.text);
      const generatedSuggestion = await getSuggestion({ 
        mood, 
        likes: userLikes,
        dislikes: userDislikes,
        communication: communication
      });
      setSuggestion(generatedSuggestion);
    } catch (error) {
      console.error("Failed to get suggestion:", error);
      setSuggestion("Sorry, I couldn't think of a suggestion right now. Please try again later.");
    } finally {
      setIsLoadingSuggestion(false);
    }
  };
  
  const deleteMoodEntry = (id: string) => {
    setMoodHistory(moodHistory.filter(entry => entry.id !== id));
  };
  
  const printMoodData = async () => {
    const chartElement = chartRef.current;
    if (!chartElement) return;

    const canvas = await html2canvas(chartElement, { backgroundColor: null });
    const chartImage = canvas.toDataURL('image/png');

    const printWindow = window.open('', '', 'height=800,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Mood Report</title>');
      printWindow.document.write('<style>body { font-family: sans-serif; } h1, h2 { text-align: center; } .history { margin-top: 20px; border-collapse: collapse; width: 100%; } .history th, .history td { border: 1px solid #ddd; padding: 8px; text-align: left; } .history th { background-color: #f2f2f2; } img { max-width: 90%; display: block; margin: 20px auto; }</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(`<h1>Mood Report - ${new Date().toLocaleDateString()}</h1>`);
      printWindow.document.write('<h2>Mood Analytics</h2>');
      printWindow.document.write(`<img src="${chartImage}" alt="Mood Analytics Chart" />`);
      printWindow.document.write('<h2>Mood History</h2>');
      if (moodHistory.length > 0) {
        printWindow.document.write('<table class="history"><thead><tr><th>Date & Time</th><th>Mood</th></tr></thead><tbody>');
        moodHistory.forEach(entry => {
            printWindow.document.write(`<tr><td>${entry.timestamp}</td><td>${entry.mood}</td></tr>`);
        });
        printWindow.document.write('</tbody></table>');
      } else {
        printWindow.document.write('<p>No mood history recorded.</p>');
      }
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  const chartData = MOODS.map(mood => ({
    name: mood.name,
    count: moodHistory.filter(entry => entry.mood === mood.name).length,
    color: mood.color
  }));

  const renderSuggestionContent = () => {
    if (isLoadingSuggestion) {
      return (
          <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating a personalized tip...</span>
          </div>
      );
    }
    if (suggestion) {
      return <p>{suggestion}</p>;
    }
    return <p>Select a mood to get a personalized tip based on your 'About Me' profile.</p>
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
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
            <CardHeader>
                <CardTitle>Mood Analytics</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]" ref={chartRef}>
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
        
        <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>
              {activeMood && !isLoadingSuggestion ? `Suggestion for feeling ${activeMood}` : 'AI-Powered Tip'}
            </AlertTitle>
            <AlertDescription className="space-y-2 mt-2">
                {renderSuggestionContent()}
            </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
