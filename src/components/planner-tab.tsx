
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Plus, Trash2, Printer, Check, X, GripVertical, Save, Bell, Minus, Target, CheckCircle2, Award } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
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
import { useToast } from '@/hooks/use-toast';
import { PlannerData, Activity, ScheduledActivity, SavedSchedule } from '@/lib/user-data';


const defaultActivities: Activity[] = [
  { text: "🪥 Brush Teeth" },
  { text: "🚿 Take a Shower" },
  { text: "👕 Get Dressed" },
  { text: "🍳 Eat Breakfast" },
  { text: "🍎 Eat Lunch" },
  { text: "🍝 Eat Dinner" },
  { text: "💊 Take Medicine" },
  { text: "💧 Drink Water" },
  { text: "🏫 Go to School" },
  { text: "📚 Do Homework" },
  { text: "🧹 Clean Room" },
  { text: "🏃 Exercise" },
  { text: "🎮 Play a Game" },
  { text: "📖 Read a Book" },
  { text: "🛌 Go to Bed" },
];

const EMOJIS = [ "🎨", "🏫", "🎮", "💻", "🎵", "🧘", "🧼", "🚴", "🚶", "🧹", "🧺", "👕", "💤", "🫖", "📖" ];

function SortableScheduledItem({ item, onTimeChange, onToggleComplete, onRemove }: { item: ScheduledActivity, onTimeChange: (id: string, type: 'startTime' | 'endTime', value: string) => void, onToggleComplete: (id: string) => void, onRemove: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({id: item.id});
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <li ref={setNodeRef} style={style} className={`p-2 rounded-md flex flex-col gap-2 border ${item.completed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-background'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none" aria-label={`Drag to reorder ${item.text}`}>
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <span className={item.completed ? 'line-through text-muted-foreground' : ''}>{item.text}</span>
                </div>
                <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => onToggleComplete(item.id)} aria-label={`Mark ${item.text} as ${item.completed ? 'incomplete' : 'complete'}`}>
                        <Check className={`h-4 w-4 ${item.completed ? 'text-green-600' : ''}`} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" aria-label={`Remove ${item.text} from schedule`}><X className="h-4 w-4 text-destructive"/></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>This will remove "{item.text}" from your current schedule.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onRemove(item.id)}>Remove</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            <div className="flex items-center gap-2 pl-8">
                <Input
                    type="time"
                    value={item.startTime}
                    onChange={(e) => onTimeChange(item.id, 'startTime', e.target.value)}
                    className="w-full h-7 text-xs"
                    aria-label={`Start time for ${item.text}`}
                />
                <span>-</span>
                <Input
                    type="time"
                    value={item.endTime}
                    onChange={(e) => onTimeChange(item.id, 'endTime', e.target.value)}
                    className="w-full h-7 text-xs"
                    aria-label={`End time for ${item.text}`}
                />
            </div>
        </li>
    );
}

interface PlannerTabProps {
    plannerData: PlannerData;
    onUpdate: (newData: PlannerData) => void;
}

export default function PlannerTab({ plannerData, onUpdate }: PlannerTabProps) {
  const [customActivityInput, setCustomActivityInput] = useState("");
  const [activitySearch, setActivitySearch] = useState("");
  const { toast } = useToast();
  const [scheduleName, setScheduleName] = useState("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { points = 0, level = 1, schedule = [], customActivities = [], savedSchedules = [], hiddenDefaultActivities = [], dailyGoal = 4, completedToday = 0, dailyBonusClaimed = false, completedTasksLog = [] } = plannerData || {};

  const handleUpdate = (data: Partial<PlannerData>) => {
    onUpdate({ ...plannerData, ...data });
  }

  const expForNextLevel = level * 100;
  const currentExp = points - ((level - 1) * 100);
  const progress = Math.min(100, (currentExp / expForNextLevel) * 100);

  const visibleDefaultActivities = useMemo(() => {
    return defaultActivities.filter(activity => !hiddenDefaultActivities.includes(activity.text));
  }, [hiddenDefaultActivities]);
  
  const allActivities = useMemo(() => {
    return [...visibleDefaultActivities, ...customActivities];
  }, [visibleDefaultActivities, customActivities]);


  const filteredActivities = useMemo(() => {
    return allActivities.filter(activity => 
      activity.text.toLowerCase().includes(activitySearch.toLowerCase())
    );
  }, [allActivities, activitySearch]);

  const addCustomActivity = () => {
    if (customActivityInput.trim() !== "") {
      const newActivity = { text: customActivityInput.trim() };
      if (![...defaultActivities, ...customActivities].some(a => a.text === newActivity.text)) {
        handleUpdate({ customActivities: [...customActivities, newActivity] });
      }
      setCustomActivityInput("");
    }
  };

  const deleteActivity = (text: string) => {
    const isDefault = defaultActivities.some(activity => activity.text === text);
    let newHidden = hiddenDefaultActivities;
    let newCustom = customActivities;

    if (isDefault) {
      newHidden = [...hiddenDefaultActivities, text];
    } else {
      newCustom = customActivities.filter(activity => activity.text !== text);
    }
    
    const newSavedSchedules = savedSchedules.map(schedule => ({
      ...schedule,
      activities: schedule.activities.filter(activity => activity.text !== text),
    }));

    handleUpdate({ 
        hiddenDefaultActivities: newHidden, 
        customActivities: newCustom, 
        savedSchedules: newSavedSchedules 
    });
  };

  
  const handleDragStartEvent = (e: React.DragEvent<HTMLLIElement>, text: string) => {
    e.dataTransfer.setData("text/plain", text);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.dataTransfer.getData("text/plain");
    if (text) {
      const newSchedule = [...schedule, { id: Date.now().toString(), text, completed: false, startTime: "", endTime: "" }];
      handleUpdate({ schedule: newSchedule });
    }
  };

  const handleDragStart = (event: any) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    setActiveDragId(null);
    if (over && active.id !== over.id) {
        const oldIndex = schedule.findIndex((item) => item.id === active.id);
        const newIndex = schedule.findIndex((item) => item.id === over.id);
        handleUpdate({ schedule: arrayMove(schedule, oldIndex, newIndex) });
    }
  }

  const handleTimeChange = (id: string, timeType: 'startTime' | 'endTime', value: string) => {
    const newSchedule = schedule.map(item => 
      item.id === id ? { ...item, [timeType]: value } : item
    );
    handleUpdate({ schedule: newSchedule });
  };

  const toggleComplete = (id: string) => {
    let newPoints = points;
    let newCompletedToday = completedToday;
    
    const itemToToggle = schedule.find(item => item.id === id);
    if (!itemToToggle) return;
    
    const wasCompleted = itemToToggle.completed;
    let newCompletedTasksLog = [...(completedTasksLog || [])];

    if (!wasCompleted) {
        newPoints += 10;
        newCompletedToday++;
        // Add to log
        newCompletedTasksLog.push({ text: itemToToggle.text, timestamp: new Date().toISOString() });
    } else {
        newPoints -= 10;
        newCompletedToday--;
        // For simplicity, we don't remove from log. Could be implemented if needed.
    }

    const newSchedule = schedule.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
    );
    
    let newLevel = level;
    if (newPoints >= expForNextLevel) {
        newLevel = level + 1;
    }
    
    handleUpdate({
        schedule: newSchedule,
        points: Math.max(0, newPoints),
        level: newLevel,
        completedToday: Math.max(0, newCompletedToday),
        completedTasksLog: newCompletedTasksLog,
    });
  };

  const removeScheduledItem = (id: string) => {
    const itemToRemove = schedule.find(item => item.id === id);
    let newPoints = points;
    let newCompletedToday = completedToday;
    
    if(itemToRemove?.completed) {
        newPoints = Math.max(0, points - 10);
        newCompletedToday = Math.max(0, completedToday - 1);
    }
    const newSchedule = schedule.filter(item => item.id !== id);
    handleUpdate({ schedule: newSchedule, points: newPoints, completedToday: newCompletedToday });
  };
  
  const clearSchedule = () => {
    handleUpdate({ 
        schedule: [],
        completedToday: 0
    });
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
        activities: schedule.map(({ id, completed, ...rest }) => rest),
      };
      handleUpdate({ savedSchedules: [...savedSchedules, newSavedSchedule]});
      setScheduleName("");
      setIsSaveDialogOpen(false);
    }
  };

  const loadSchedule = (scheduleToLoad: SavedSchedule) => {
    // Clear schedule but maintain points and level from previous actions
    handleUpdate({
        schedule: scheduleToLoad.activities.map(activity => ({
            ...activity,
            id: Date.now().toString() + Math.random(), 
            completed: false
        })),
        completedToday: 0, // Reset daily goal progress for the new schedule
    });
  };

  const deleteSchedule = (id: string) => {
    handleUpdate({ savedSchedules: savedSchedules.filter(s => s.id !== id)});
  };

  const handleClaimBonus = () => {
      if (completedToday >= dailyGoal && !dailyBonusClaimed) {
          let newPoints = points + 40;
          let newLevel = level;
          if (newPoints >= expForNextLevel) {
              newLevel += 1;
          }
          handleUpdate({
              points: newPoints,
              level: newLevel,
              dailyBonusClaimed: true
          });
          toast({
              title: "Bonus Claimed!",
              description: "You've earned 40 bonus points. Great job!",
          });
      }
  };

  const isGoalMet = completedToday >= dailyGoal;

  const renderDailyGoalContent = () => {
      if (dailyBonusClaimed) {
          return (
              <div className="text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-md">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="font-semibold text-green-700 dark:text-green-300">Good job!</p>
                  <p className="text-sm text-muted-foreground">Come back tomorrow for a new task.</p>
              </div>
          );
      }
      if (isGoalMet) {
          return (
              <div className="text-center p-4 space-y-3">
                  <h4 className="font-semibold">Daily Goal Met!</h4>
                  <Button onClick={handleClaimBonus} className="w-full">
                      <Award className="mr-2 h-4 w-4" />
                      Click to get 40 points!
                  </Button>
              </div>
          );
      }
      return (
          <>
              <p className="text-sm text-muted-foreground text-center mb-3">Complete {dailyGoal} tasks per day to get a 40-point bonus.</p>
              <div className="flex items-center justify-center gap-4">
                  <div className="text-2xl font-bold flex items-center gap-2">
                     <Target className="h-6 w-6 text-accent" />
                     {dailyGoal}
                  </div>
              </div>
               <p className="text-center text-sm text-muted-foreground mt-3">
                  Not quite, you have <strong>{completedToday} / {dailyGoal}</strong> tasks done!
               </p>
          </>
      );
  };

  const draggedItem = useMemo(() => activeDragId ? schedule.find(item => item.id === activeDragId) : null, [activeDragId, schedule]);
  
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2 space-y-8">
        <div className="grid gap-8 md:grid-cols-1">
            <div>
                <Card>
                    <CardHeader><CardTitle className="text-3xl">Daily Planner</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" aria-label="Add emoji">😀</Button>
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
                            <Button onClick={addCustomActivity} aria-label="Add custom activity"><Plus className="h-4 w-4"/></Button>
                        </div>
                    </CardContent>
                </Card>
                <Card className="mt-8">
                    <CardHeader><CardTitle>Activities</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Drag an activity to the schedule box. You can also search for activities below.</p>
                        <div className="mb-4">
                            <Input 
                                placeholder="Search activities..."
                                value={activitySearch}
                                onChange={(e) => setActivitySearch(e.target.value)}
                            />
                        </div>
                        <ScrollArea className="h-48">
                            <ul className="space-y-2 pr-4">
                                {filteredActivities.map((activity, i) => {
                                    return (
                                        <li key={`${activity.text}-${i}`} draggable onDragStart={(e) => handleDragStartEvent(e, activity.text)} className="group flex items-center justify-between p-2 rounded-md bg-secondary cursor-grab active:cursor-grabbing">
                                            <div className="flex items-center">
                                                <GripVertical className="h-5 w-5 text-muted-foreground mr-2" /> {activity.text}
                                            </div>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" aria-label={`Delete activity: ${activity.text}`}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will permanently delete "{activity.text}" from your activities list.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => deleteActivity(activity.text)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </li>
                                    );
                                })}
                            </ul>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
            
            <Card onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Schedule</CardTitle>
                    <span className="text-sm text-muted-foreground">Drag tasks here to schedule</span>
                  </div>
                </CardHeader>
                <CardContent className="min-h-[300px] border-2 border-dashed border-input rounded-md p-4 bg-muted/50">
                    {schedule.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Plus className="h-10 w-10 mb-2"/>
                            <p>Drag activities here to build your schedule</p>
                        </div>
                    ) : (
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
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full" disabled={schedule.length === 0}><Save className="h-4 w-4 mr-2" />Save</Button>
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
                        <Button onClick={handleSaveSchedule} disabled={!scheduleName.trim()}>Save Schedule</Button>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full" disabled={schedule.length === 0}><Trash2 className="h-4 w-4 mr-2" />Clear</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will clear all activities from your current schedule. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={clearSchedule}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button onClick={printSchedule} variant="secondary" className="w-full" aria-label="Print schedule"><Printer className="h-4 w-4 mr-2" />Print</Button>
        </div>
      </div>

      <div className="space-y-8">
        <Card>
            <CardHeader><CardTitle>My Progress</CardTitle></CardHeader>
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
            <CardHeader>
              <CardTitle>Daily Quests</CardTitle>
            </CardHeader>
            <CardContent>
                {renderDailyGoalContent()}
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Saved Schedules</CardTitle></CardHeader>
            <CardContent>
                <ScrollArea className="h-64">
                    {savedSchedules.length > 0 ? (
                        <div className="space-y-2 pr-4">
                            {savedSchedules.map(saved => (
                                <div key={saved.id} className="p-2 bg-secondary rounded-md flex items-center justify-between">
                                    <span className="font-medium">{saved.name}</span>
                                    <div className="flex gap-1">
                                        <Button size="sm" onClick={() => loadSchedule(saved)}>Load</Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="icon" variant="destructive" className="h-8 w-8" aria-label={`Delete saved schedule: ${saved.name}`}><Trash2 className="h-4 w-4"/></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete the "{saved.name}" schedule. This action cannot be undone.
                                                    </AlertDialogDescription>
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
      <DragOverlay>
        {draggedItem ? (
          <div className="p-2 rounded-md flex flex-col gap-2 bg-primary shadow-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <span>{draggedItem.text}</span>
                </div>
            </div>
        </div>
        ) : null}
      </DragOverlay>
    </div>
    </DndContext>
  );
}
