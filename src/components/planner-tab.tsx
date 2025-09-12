"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Plus, Trash2, Printer, Check, X, GripVertical, Save, Loader2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { ScrollArea } from './ui/scroll-area';

type Activity = { text: string };
type ScheduledActivity = { id: string; text: string; completed: boolean; startTime: string; endTime: string };
type SavedSchedule = { id: string; name: string; activities: ScheduledActivity[] };

const defaultActivities: Activity[] = [
  { text: "🪥 Brush Teeth" },
  { text: "🍳 Eat Breakfast" },
  { text: "🏃 Exercise" },
  { text: "📚 Study" },
  { text: "🛌 Rest" },
];

const EMOJIS = [ "🎨", "🏫", "🎮", "💻", "🎵", "🧘", "🧼", "🚴", "🚶", "🧹", "🧺", "👕", "💤", "🫖", "📖" ];

function SortableScheduledItem({ item, onTimeChange, onToggleComplete, onRemove }: { item: ScheduledActivity, onTimeChange: (id: string, type: 'startTime' | 'endTime', value: string) => void, onToggleComplete: (id: string) => void, onRemove: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({id: item.id});
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <li ref={setNodeRef} style={style} className={`p-2 rounded-md flex flex-col gap-2 ${item.completed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-secondary'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <span className={item.completed ? 'line-through text-muted-foreground' : ''}>{item.text}</span>
                </div>
                <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => onToggleComplete(item.id)}>
                        {item.completed ? <Check className="h-4 w-4 text-green-600" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onRemove(item.id)}><X className="h-4 w-4 text-destructive"/></Button>
                </div>
            </div>
            <div className="flex items-center gap-2 pl-8">
                <Input
                    type="time"
                    value={item.startTime}
                    onChange={(e) => onTimeChange(item.id, 'startTime', e.target.value)}
                    className="w-full h-7 text-xs"
                    aria-label="Start time"
                />
                <span>-</span>
                <Input
                    type="time"
                    value={item.endTime}
                    onChange={(e) => onTimeChange(item.id, 'endTime', e.target.value)}
                    className="w-full h-7 text-xs"
                    aria-label="End time"
                />
            </div>
        </li>
    );
}

export default function PlannerTab() {
  const [customActivityInput, setCustomActivityInput] = useState("");
  const [customActivities, setCustomActivities] = useLocalStorage<Activity[]>('planner_customActivities', []);
  const [schedule, setSchedule] = useLocalStorage<ScheduledActivity[]>('planner_schedule_v2', []);
  const [points, setPoints] = useLocalStorage('planner_points', 0);
  const [level, setLevel] = useLocalStorage('planner_level', 1);

  const [savedSchedules, setSavedSchedules] = useLocalStorage<SavedSchedule[]>('planner_saved_schedules', []);
  const [scheduleName, setScheduleName] = useState("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const expForNextLevel = level * 100;
  const currentExp = points - ((level - 1) * 100);
  const progress = Math.min(100, (currentExp / expForNextLevel) * 100);

  const allActivities = [...defaultActivities, ...customActivities];

  const addCustomActivity = () => {
    if (customActivityInput.trim() !== "") {
      const newActivity = { text: customActivityInput.trim() };
      if (!allActivities.some(a => a.text === newActivity.text)) {
        setCustomActivities([...customActivities, newActivity]);
      }
      setCustomActivityInput("");
    }
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, text: string) => {
    e.dataTransfer.setData("text/plain", text);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.dataTransfer.getData("text/plain");
    if (text && !schedule.some(item => item.text === text)) {
      setSchedule(prev => [...prev, { id: Date.now().toString(), text, completed: false, startTime: "", endTime: "" }]);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    if (over && active.id !== over.id) {
        setSchedule((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            return arrayMove(items, oldIndex, newIndex);
        });
    }
  }

  const handleTimeChange = (id: string, timeType: 'startTime' | 'endTime', value: string) => {
    const newSchedule = schedule.map(item => 
      item.id === id ? { ...item, [timeType]: value } : item
    );
    setSchedule(newSchedule);
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
        const timeString = (item.startTime && item.endTime) ? ` (${item.startTime} - ${item.endTime})` : '';
        printWindow.document.write(`<p>${item.completed ? '✅' : '🔲'} ${item.text}${timeString}</p>`);
      });
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  }

  const handleSaveSchedule = () => {
    if (scheduleName.trim() && schedule.length > 0) {
      const newSavedSchedule: SavedSchedule = {
        id: Date.now().toString(),
        name: scheduleName.trim(),
        activities: schedule
      };
      setSavedSchedules([...savedSchedules, newSavedSchedule]);
      setScheduleName("");
      setIsSaveDialogOpen(false);
    }
  };

  const loadSchedule = (scheduleToLoad: SavedSchedule) => {
    // A simple reset of points for the new schedule
    setPoints(0);
    setLevel(1);
    setSchedule(scheduleToLoad.activities.map(activity => ({...activity, completed: false})));
  };

  const deleteSchedule = (id: string) => {
    setSavedSchedules(savedSchedules.filter(s => s.id !== id));
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 grid gap-6">
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
                <Card>
                    <CardHeader><CardTitle>🧲 Activities</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Drag an activity to the schedule.</p>
                        <ScrollArea className="h-48">
                            <ul className="space-y-2 pr-4">
                                {allActivities.map((activity, i) => (
                                    <li key={i} draggable onDragStart={(e) => handleDragStart(e, activity.text)} className="flex items-center p-2 rounded-md bg-secondary cursor-grab active:cursor-grabbing">
                                    <GripVertical className="h-5 w-5 text-muted-foreground mr-2" /> {activity.text}
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
            
            <Card onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
                <CardHeader><CardTitle>🗓️ Schedule</CardTitle></CardHeader>
                <CardContent className="min-h-[300px] border-2 border-dashed border-primary rounded-md p-4 bg-background/50">
                    {schedule.length === 0 ? (
                        <p className="text-muted-foreground text-center pt-16">Drop activities here</p>
                    ) : (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={schedule.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                <ul className="space-y-2">
                                    {schedule.map((item) => (
                                        <SortableScheduledItem 
                                            key={item.id} 
                                            item={item}
                                            onTimeChange={handleTimeChange}
                                            onToggleComplete={toggleComplete}
                                            onRemove={removeScheduledItem}
                                        />
                                    ))}
                                </ul>
                            </SortableContext>
                        </DndContext>
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full" disabled={schedule.length === 0}><Save className="h-4 w-4 mr-2" />Save Schedule</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save Current Schedule</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <label htmlFor="schedule-name">Schedule Name</label>
                        <Input 
                            id="schedule-name"
                            placeholder="e.g., Morning Routine"
                            value={scheduleName}
                            onChange={e => setScheduleName(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveSchedule} disabled={!scheduleName.trim()}>Save</Button>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Button variant="destructive" onClick={clearSchedule} className="w-full"><Trash2 className="h-4 w-4 mr-2" />Clear Schedule</Button>
            <Button onClick={printSchedule} className="w-full bg-accent text-accent-foreground hover:bg-accent/90"><Printer className="h-4 w-4 mr-2" />Print Schedule</Button>
        </div>
      </div>

      <div className="space-y-6">
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
        <Card>
            <CardHeader><CardTitle>🗂️ Saved Schedules</CardTitle></CardHeader>
            <CardContent>
                <ScrollArea className="h-64">
                    {savedSchedules.length > 0 ? (
                        <div className="space-y-2 pr-4">
                            {savedSchedules.map(saved => (
                                <div key={saved.id} className="p-2 bg-secondary rounded-md flex items-center justify-between">
                                    <span className="font-medium">{saved.name}</span>
                                    <div className="flex gap-1">
                                        <Button size="sm" variant="ghost" onClick={() => loadSchedule(saved)}>Load</Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete the "{saved.name}" schedule. This action cannot be undone.
                                                    </Description>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deleteSchedule(saved.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center">No schedules saved yet.</p>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
