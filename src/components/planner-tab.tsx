"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Plus, Trash2, Printer, Check, X, GripVertical } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';

type Activity = { text: string };
type ScheduledActivity = { id: string; text: string; completed: boolean };

const defaultActivities: Activity[] = [
  { text: "🪥 Brush Teeth" },
  { text: "🍳 Eat Breakfast" },
  { text: "🏃 Exercise" },
  { text: "📚 Study" },
  { text: "🛌 Rest" },
];

const EMOJIS = [ "🎨", "🏫", "🎮", "💻", "🎵", "🧘", "🧼", "🚴", "🚶", "🧹", "🧺", "👕", "💤", "🫖", "📖" ];

export default function PlannerTab() {
  const [customActivityInput, setCustomActivityInput] = useState("");
  const [customActivities, setCustomActivities] = useLocalStorage<Activity[]>('planner_customActivities', []);
  const [schedule, setSchedule] = useLocalStorage<ScheduledActivity[]>('planner_schedule', []);
  const [points, setPoints] = useLocalStorage('planner_points', 0);
  const [level, setLevel] = useLocalStorage('planner_level', 1);

  const expForNextLevel = level * 100;
  const currentExp = points - ((level - 1) * 100);
  const progress = Math.min(100, (currentExp / expForNextLevel) * 100);

  const addCustomActivity = () => {
    if (customActivityInput.trim() !== "") {
      setCustomActivities([...customActivities, { text: customActivityInput.trim() }]);
      setCustomActivityInput("");
    }
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, text: string) => {
    e.dataTransfer.setData("text/plain", text);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.dataTransfer.getData("text/plain");
    if (text) {
      setSchedule([...schedule, { id: Date.now().toString(), text, completed: false }]);
    }
  };

  const toggleComplete = (id: string) => {
    const newSchedule = schedule.map(item => {
        if (item.id === id) {
            const wasCompleted = item.completed;
            const newPoints = wasCompleted ? points - 10 : points + 10;
            setPoints(Math.max(0, newPoints));
            return { ...item, completed: !item.completed };
        }
        return item;
    });
    setSchedule(newSchedule);
  };

  useEffect(() => {
    if (points >= expForNextLevel) {
        setLevel(level + 1);
    }
  }, [points, level, expForNextLevel, setLevel]);

  const removeScheduledItem = (id: string) => {
    const itemToRemove = schedule.find(item => item.id === id);
    if(itemToRemove?.completed) {
        setPoints(Math.max(0, points - 10));
    }
    setSchedule(schedule.filter(item => item.id !== id));
  };
  
  const clearSchedule = () => {
    setSchedule([]);
    setPoints(0);
    setLevel(1);
  };

  const printSchedule = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Schedule</title>');
      printWindow.document.write('<style>body{font-family: sans-serif;} li {list-style-type: none; margin-bottom: 8px;}</style></head><body>');
      printWindow.document.write(`<h2>Daily Schedule - ${new Date().toLocaleDateString()}</h2>`);
      schedule.forEach(item => {
        printWindow.document.write(`<p>${item.completed ? '✅' : '🔲'} ${item.text}</p>`);
      });
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <Card>
            <CardHeader><CardTitle>📅 Daily Planner</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">😀</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                            <div className="grid grid-cols-5 gap-2">
                                {EMOJIS.map(emoji => (
                                    <Button key={emoji} variant="ghost" size="icon" onClick={() => setCustomActivityInput(prev => prev + emoji)}>{emoji}</Button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Input 
                        placeholder="Add a custom activity..." 
                        value={customActivityInput}
                        onChange={(e) => setCustomActivityInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addCustomActivity()}
                    />
                    <Button onClick={addCustomActivity}><Plus className="h-4 w-4"/></Button>
                </div>
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card>
                <CardHeader><CardTitle>🧲 Activities</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Drag an activity to the schedule.</p>
                    <ul className="space-y-2">
                        {[...defaultActivities, ...customActivities].map((activity, i) => (
                            <li key={i} draggable onDragStart={(e) => handleDragStart(e, activity.text)} className="flex items-center p-2 rounded-md bg-secondary cursor-grab active:cursor-grabbing">
                               <GripVertical className="h-5 w-5 text-muted-foreground mr-2" /> {activity.text}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            <Card onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
                <CardHeader><CardTitle>🗓️ Schedule</CardTitle></CardHeader>
                <CardContent className="min-h-[200px] border-2 border-dashed border-primary rounded-md p-4 bg-background/50">
                     {schedule.length === 0 ? (
                        <p className="text-muted-foreground text-center pt-16">Drop activities here</p>
                    ) : (
                        <ul className="space-y-2">
                            {schedule.map((item) => (
                                <li key={item.id} className={`flex items-center justify-between p-2 rounded-md ${item.completed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-secondary'}`}>
                                    <span className={item.completed ? 'line-through text-muted-foreground' : ''}>{item.text}</span>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" onClick={() => toggleComplete(item.id)}>
                                            {item.completed ? <Check className="h-4 w-4 text-green-600" /> : <Check className="h-4 w-4" />}
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => removeScheduledItem(item.id)}><X className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>

      <div>
        <Card>
            <CardHeader><CardTitle>🏆 My Progress</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center">
                    <Badge variant="outline" className="text-lg">Level {level}</Badge>
                    <p className="text-2xl font-bold mt-2">{points} Points</p>
                </div>
                <div>
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>Progress to Level {level+1}</span>
                        <span>{currentExp} / {expForNextLevel} EXP</span>
                    </div>
                    <Progress value={progress} />
                </div>
            </CardContent>
        </Card>
        <div className="flex gap-2 mt-4">
            <Button variant="destructive" onClick={clearSchedule} className="w-full"><Trash2 className="h-4 w-4 mr-2" />Clear Schedule</Button>
            <Button onClick={printSchedule} className="w-full bg-accent text-accent-foreground hover:bg-accent/90"><Printer className="h-4 w-4 mr-2" />Print Schedule</Button>
        </div>
      </div>
    </div>
  );
}
