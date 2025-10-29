
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trash2, Printer } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { MoodData, MoodEntry } from '@/lib/user-data';
import { useToast } from '@/hooks/use-toast';

const MOODS = [
  { name: 'Happy', emoji: '😊', color: '#4ade80' },
  { name: 'Sad', emoji: '😢', color: '#60a5fa' },
  { name: 'Angry', emoji: '😡', color: '#f87171' },
  { name: 'Anxious', emoji: '😰', color: '#facc15' },
  { name: 'Calm', emoji: '😌', color: '#818cf8' },
  { name: 'Tired', emoji: '😴', color: '#9ca3af' },
];

const moodTips = {
  Happy: [
    "That's wonderful! Keep up the good work and continue what you are doing. Try something fun and relaxing that focuses on your special interests.",
    "Great to hear you're happy! Spread the joy by sharing a smile or doing something kind for someone else.",
    "Embrace the happiness! It's a perfect time to engage in a favorite hobby or activity."
  ],
  Sad: [
    "It's okay to feel sad. Try comforting activities, create a calm space, practice breathing exercises, or talk to someone you trust. Remember, you will be okay!",
    "Remember that this feeling will pass. Be kind to yourself and allow yourself some time to rest and recover.",
    "Listening to some gentle music or wrapping yourself in a warm blanket can be very comforting right now."
  ],
  Angry: [
    "It's normal to feel angry. Calm yourself by identifying triggers, creating a predictable environment, counting to 10, or using breathing exercises. Find support if needed.",
    "When you feel angry, taking a few deep breaths can help calm your body and mind. Step away from the situation if you can.",
    "Squeezing a stress ball or tearing up paper can be a safe way to let out angry feelings."
  ],
  Anxious: [
    "Focus on your breath and stay in a calm, familiar setting. Use sensory objects or grounding techniques to help you feel more present and reduce stress.",
    "Try the 5-4-3-2-1 grounding technique: Name 5 things you can see, 4 things you can feel, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.",
    "Anxiety can be tough, but you are tougher. Hold onto a comforting object and focus on its texture."
  ],
  Calm: [
    "Enjoy this moment. Do something relaxing and fun! Sensory objects and peaceful settings can help you recharge and maintain calm.",
    "Feeling calm is a superpower. It's a great time to do an activity that requires focus, like reading or drawing.",
    "This is a wonderful feeling. Take a moment to notice the peace and quiet within you."
  ],
  Tired: [
    "Take a well-deserved rest. Step away from the screen, have a short nap, or listen to calming music to refresh your mind.",
    "Your body is telling you it needs a break. It's important to listen. A little rest can make a big difference.",
    "Even a 10-minute break with your eyes closed can help you feel more refreshed. Be gentle with yourself."
  ]
};

interface MoodTabProps {
    moodData: MoodData;
    onUpdate: (newData: MoodData) => void;
}

export default function MoodTab({ moodData, onUpdate }: MoodTabProps) {
  const [activeTip, setActiveTip] = useState<string>("Select a mood above to get tips.");
  const { history: moodHistory = [] } = moodData;
  const { toast } = useToast();

  const handleMoodSelect = (mood: string) => {
    const newEntry: MoodEntry = { mood, timestamp: new Date().toLocaleString(), id: Date.now().toString() };
    const newHistory = [newEntry, ...moodHistory];
    onUpdate({ history: newHistory });
    
    const tipsForMood = moodTips[mood as keyof typeof moodTips] || [];
    const randomTip = tipsForMood[Math.floor(Math.random() * tipsForMood.length)];
    setActiveTip(randomTip);

    toast({
        title: "Mood Logged",
        description: `You've logged feeling ${mood}.`,
    });
  };
  
  const deleteMoodEntry = (id: string) => {
    const newHistory = moodHistory.filter(entry => entry.id !== id);
    onUpdate({ history: newHistory });
  };
  
  const clearHistory = () => {
    onUpdate({ history: [] });
  };

  const printMoodData = async () => {
    const chartData = MOODS.map(mood => ({
      name: mood.name,
      count: moodHistory.filter(entry => entry.mood === mood.name).length,
    }));
    
    let mostFrequentMood = { name: 'N/A', count: 0 };
    if (moodHistory.length > 0) {
        mostFrequentMood = chartData.reduce((prev, current) => (prev.count > current.count) ? prev : current);
    }
    
    const reportTitle = () => {
        if (moodHistory.length === 0) {
            return `Mood Report - ${new Date().toLocaleDateString()}`;
        }
        const firstDate = new Date(moodHistory[moodHistory.length - 1].timestamp).toLocaleDateString();
        const lastDate = new Date(moodHistory[0].timestamp).toLocaleDateString();
        return `Mood Report: ${firstDate} - ${lastDate}`;
    };


    const printWindow = window.open('', '', 'height=800,width=1000');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Mood Report</title>');
      printWindow.document.write('<style>body { font-family: sans-serif; font-size: 16px; padding: 20px; } .container { max-width: 800px; margin: auto; } h1, h2 { text-align: center; } table { margin-top: 20px; border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 12px; text-align: left; } th { background-color: #f2f2f2; }</style>');
      printWindow.document.write('</head><body><div class="container">');
      printWindow.document.write(`<h1>${reportTitle()}</h1>`);
      
      printWindow.document.write('<h2>Mood Patterns</h2>');
      if (chartData.some(d => d.count > 0)) {
        printWindow.document.write('<table><thead><tr><th>Mood</th><th>Count</th></tr></thead><tbody>');
        chartData.forEach(data => {
            if (data.count > 0) {
              printWindow.document.write(`<tr><td>${data.name}</td><td>${data.count}</td></tr>`);
            }
        });
        printWindow.document.write('</tbody></table>');
      } else {
        printWindow.document.write('<p style="text-align: center;">No analytics data recorded.</p>');
      }

      printWindow.document.write('<h2>Most Frequent Mood</h2>');
      if (mostFrequentMood.count > 0) {
          printWindow.document.write(`<p style="text-align: center; font-size: 1.1em;">${mostFrequentMood.name} (logged ${mostFrequentMood.count} times)</p>`);
      } else {
          printWindow.document.write('<p style="text-align: center;">Not enough data.</p>');
      }

      printWindow.document.write('<h2>Mood Journal</h2>');
      if (moodHistory.length > 0) {
        printWindow.document.write('<table><thead><tr><th>Date & Time</th><th>Mood</th></tr></thead><tbody>');
        moodHistory.forEach(entry => {
            printWindow.document.write(`<tr><td>${entry.timestamp}</td><td>${entry.mood}</td></tr>`);
        });
        printWindow.document.write('</tbody></table>');
      } else {
        printWindow.document.write('<p style="text-align: center;">No mood history recorded.</p>');
      }
      printWindow.document.write('</div></body></html>');
      printWindow.document.close();
      
      printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
      };
    }
  };

  const chartData = MOODS.map(mood => ({
    name: mood.name,
    count: moodHistory.filter(entry => entry.mood === mood.name).length,
    color: mood.color
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">How are you feeling?</CardTitle>
            <CardDescription>Tap your current mood to log it.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {MOODS.map(mood => (
              <Button key={mood.name} onClick={() => handleMoodSelect(mood.name)} variant="outline" className="p-4 h-auto text-lg flex-grow" aria-label={`Log mood as ${mood.name}`}>
                <span className="text-2xl mr-2">{mood.emoji}</span> {mood.name}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* On mobile, MoodTips appears here */}
        <div className="md:hidden">
          <Card>
            <CardHeader>
              <CardTitle>Mood Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{activeTip}</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Mood Patterns</CardTitle>
            <CardDescription>Frequency of each mood chosen.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
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
        {/* On desktop, MoodTips appears here */}
        <div className="hidden md:block">
          <Card>
            <CardHeader>
              <CardTitle>Mood Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{activeTip}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Mood Journal</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={printMoodData} aria-label="Print mood data">
                  <Printer className="h-4 w-4 mr-1"/> Print
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={moodHistory.length === 0} aria-label="Clear all mood history">
                      <Trash2 className="h-4 w-4 mr-1"/> Clear All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your mood history.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={clearHistory}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="max-h-[340px] overflow-y-auto space-y-2 pr-2">
            {moodHistory.length > 0 ? moodHistory.map((entry) => (
              <div key={entry.id} className="group text-sm text-muted-foreground p-2 bg-secondary rounded-md flex justify-between items-center">
                <span>{entry.timestamp}: <span className="font-semibold text-foreground">{entry.mood}</span></span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" aria-label={`Delete mood entry: ${entry.mood} at ${entry.timestamp}`}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently delete this mood entry from your history.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMoodEntry(entry.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )) : <p className="text-muted-foreground">No mood recorded yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
