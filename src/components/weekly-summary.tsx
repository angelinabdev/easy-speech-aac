
"use client";

import { useState } from "react";
import type { UserData } from "@/lib/user-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Calendar as CalendarIcon, Heart, MessageSquare, ListChecks } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface WeeklySummaryProps {
  userData: UserData;
}

type FilterType = '7d' | '30d' | 'all' | 'custom';

export default function WeeklySummary({ userData }: WeeklySummaryProps) {
  const [filter, setFilter] = useState<FilterType>('7d');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const getTitle = () => {
    switch (filter) {
      case '7d': return "Data Summary (Last 7 days)";
      case '30d': return "Data Summary (Last 30 days)";
      case 'all': return "Data Summary (All time)";
      case 'custom':
        if (dateRange?.from && dateRange?.to) {
          return `Custom Range: ${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`;
        }
        return "Custom Range";
      default: return "Data Summary";
    }
  }

  const { startDate, endDate } = (() => {
    const now = new Date();
    switch (filter) {
      case '7d':
        return { startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7), endDate: now };
      case '30d':
        return { startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30), endDate: now };
      case 'custom':
        return { startDate: dateRange?.from, endDate: dateRange?.to };
      default: // 'all'
        return { startDate: null, endDate: null };
    }
  })();

  const filterByDate = (history: { timestamp: string }[]) => {
    if (!startDate) return history; // 'all' time
    const end = endDate || new Date(); // Use now if endDate is not set for custom range
    return history.filter(entry => {
        try {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= startDate && entryDate <= end;
        } catch (e) {
            return false;
        }
    });
  };

  // --- Mood Data ---
  const filteredMoods = filterByDate(userData.moods?.history || []);
  const moodCounts: { [key: string]: number } = {};
  filteredMoods.forEach(entry => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  });
  const sortedMoods = Object.entries(moodCounts).sort(([, a], [, b]) => b - a);
  const topThreeMoods = sortedMoods.slice(0, 3);

  // --- Task Data ---
  const filteredTasks = filterByDate(userData.planner?.completedTasksLog || []);
  const taskCounts: { [key: string]: number } = {};
  filteredTasks.forEach(log => {
      taskCounts[log.text] = (taskCounts[log.text] || 0) + 1;
  });
  const sortedTasks = Object.entries(taskCounts).sort(([, a], [, b]) => b - a);
  const topThreeTasks = sortedTasks.slice(0, 3);

  // --- Phrase Data ---
  const filteredPhrases = filterByDate(userData.phrases?.phraseUsageLog || []);
  const phraseCounts: { [key: string]: number } = {};
  filteredPhrases.forEach(log => {
      const phraseKey = `${log.text} (${log.type})`;
      phraseCounts[phraseKey] = (phraseCounts[phraseKey] || 0) + 1;
  });
  const sortedPhrases = Object.entries(phraseCounts).sort(([, a], [, b]) => b - a);
  const topThreePhrases = sortedPhrases.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            {getTitle()}
        </CardTitle>
        <CardDescription>A look at moods and completed activities for the selected period.</CardDescription>
        <div className="flex flex-wrap gap-2 pt-2">
            <Button size="sm" variant={filter === '7d' ? 'default' : 'outline'} onClick={() => setFilter('7d')}>7 days</Button>
            <Button size="sm" variant={filter === '30d' ? 'default' : 'outline'} onClick={() => setFilter('30d')}>30 days</Button>
            <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All time</Button>
             <Popover>
              <PopoverTrigger asChild>
                <Button id="date" size="sm" variant={filter === 'custom' ? 'default' : 'outline'}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>Custom range</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                    if (range?.from && range?.to) {
                      setFilter('custom');
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <h4 className="font-semibold mb-2 text-center flex items-center justify-center gap-2"><Heart className="h-4 w-4" /> Top Moods</h4>
            {topThreeMoods.length > 0 ? (
                <div className="flex justify-center gap-2 flex-wrap">
                    {topThreeMoods.map(([mood, count]) => (
                        <Badge 
                            key={mood} 
                            variant="secondary"
                            className="text-base"
                        >
                            {mood} ({count})
                        </Badge>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center">No mood data recorded in this period.</p>
            )}
        </div>

        <div>
            <h4 className="font-semibold mb-2 text-center flex items-center justify-center gap-2"><MessageSquare className="h-4 w-4" /> Top Phrases</h4>
            {topThreePhrases.length > 0 ? (
                <div className="flex flex-col items-center gap-2">
                    {topThreePhrases.map(([phrase, count]) => (
                        <Badge key={phrase} variant="secondary" className="text-base">{phrase} ({count})</Badge>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center">No phrases used in this period.</p>
            )}
        </div>

        <div>
            <h4 className="font-semibold mb-2 text-center flex items-center justify-center gap-2"><ListChecks className="h-4 w-4" /> Top Activities</h4>
            <p className="text-sm text-center text-muted-foreground mb-2">Total Completed: {filteredTasks.length}</p>
            {topThreeTasks.length > 0 ? (
                <div className="flex flex-col items-center gap-2">
                    {topThreeTasks.map(([task, count]) => (
                         <Badge key={task} variant="secondary" className="text-base">{task} ({count})</Badge>
                    ))}
                </div>
            ) : (
                 <p className="text-sm text-muted-foreground text-center">No activities completed in this period.</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
