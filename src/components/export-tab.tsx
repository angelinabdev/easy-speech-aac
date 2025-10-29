
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { DownloadCloud, FileText, FileSpreadsheet, ShieldCheck, Calendar as CalendarIcon } from 'lucide-react';
import type { UserData } from '@/lib/user-data';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';


interface ExportTabProps {
  userData: UserData;
}

type FilterType = '7d' | '30d' | 'all' | 'custom';

export default function ExportTab({ userData }: ExportTabProps) {
  
  const userName = userData.aboutMe?.name || 'user';
  const safeUserName = userName.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  const [filter, setFilter] = useState<FilterType>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const getTitle = () => {
    switch (filter) {
      case '7d': return "Export Data (Last 7 days)";
      case '30d': return "Export Data (Last 30 days)";
      case 'all': return "Export Data (All time)";
      case 'custom':
        if (dateRange?.from && dateRange?.to) {
          return `Custom Range: ${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`;
        }
        return "Custom Range";
      default: return "Export Data";
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

  const filterByDate = <T extends { timestamp: string }>(history: T[]): T[] => {
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

  const downloadCSV = (csvString: string, filename: string) => {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadMoods = () => {
    const moodHistory = filterByDate(userData.moods?.history || []);

    const moodCounts: { [key: string]: number } = {};
    moodHistory.forEach(entry => {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });

    const sortedMoods = Object.entries(moodCounts).sort(([, a], [, b]) => b - a);

    let csvContent = `MOOD SUMMARY REPORT - ${safeUserName}\n\n`;
    csvContent += "Mood,Frequency\n";
    for (const [mood, count] of sortedMoods) {
        csvContent += `"${mood}",${count}\n`;
    }

    csvContent += "\n\nDETAILED LOG\n";
    csvContent += "Timestamp,Mood\n";
    moodHistory.forEach(entry => {
        csvContent += `"${entry.timestamp}","${entry.mood}"\n`;
    });

    downloadCSV(csvContent, `${safeUserName}_mood_report.csv`);
  };

  const handleDownloadActivities = () => {
    const activityLog = filterByDate(userData.planner?.completedTasksLog || []);
    
    const activityCounts: { [key: string]: number } = {};
    activityLog.forEach(log => {
      activityCounts[log.text] = (activityCounts[log.text] || 0) + 1;
    });
    
    const sortedActivities = Object.entries(activityCounts).sort(([, a], [, b]) => b - a);
    
    let csvContent = `COMPLETED ACTIVITIES REPORT - ${safeUserName}\n\n`;
    csvContent += "SUMMARY\n";
    csvContent += "Activity,Times Completed\n";
    for (const [activity, count] of sortedActivities) {
        csvContent += `"${activity}",${count}\n`;
    }

    csvContent += "\n\nDETAILED LOG\n";
    csvContent += "Timestamp,Activity\n";
    activityLog.forEach(log => {
        csvContent += `"${log.timestamp}","${log.text}"\n`;
    });
    
    downloadCSV(csvContent, `${safeUserName}_completed_activities_report.csv`);
  };

  const handleDownloadPhrases = () => {
    const phraseLog = filterByDate(userData.phrases?.phraseUsageLog || []);

    const phraseCounts: { [key: string]: number } = {};
    phraseLog.forEach(log => {
      phraseCounts[log.text] = (phraseCounts[log.text] || 0) + 1;
    });
    
    const sortedPhrases = Object.entries(phraseCounts).sort(([, a], [, b]) => b - a);

    let csvContent = `PHRASE USAGE REPORT - ${safeUserName}\n\n`;
    csvContent += "SUMMARY\n";
    csvContent += "Phrase,Times Used\n";
    for (const [phrase, count] of sortedPhrases) {
        csvContent += `"${phrase}",${count}\n`;
    }

    csvContent += "\n\nDETAILED LOG\n";
    csvContent += "Timestamp,Type,Phrase\n";
    phraseLog.forEach(log => {
      csvContent += `"${log.timestamp}","${log.type}","${log.text}"\n`;
    });
    
    downloadCSV(csvContent, `${safeUserName}_phrase_usage_report.csv`);
  };

  const generateReportHTML = () => {
    const styles = `
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; margin: 2em; }
        .report-header { text-align: center; margin-bottom: 3em; }
        .report-header h1 { font-size: 2.2em; margin-bottom: 0.1em; color: #111; }
        .report-header p { font-size: 1.1em; color: #666; margin-top: 0; }
        .section { margin-bottom: 2.5em; page-break-inside: avoid; }
        .section-header { border-bottom: 2px solid #eee; padding-bottom: 0.5em; margin-bottom: 1.5em; display: flex; justify-content: space-between; align-items: baseline; }
        .section-header h2 { font-size: 1.5em; color: #111; margin: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 1em; }
        th, td { padding: 0.8em 1em; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f9f9f9; font-weight: 600; }
        tr:nth-child(even) { background-color: #fcfcfc; }
        .no-data { text-align: center; color: #888; padding: 2em 0; background-color: #f9f9f9; border-radius: 8px;}
    `;

    // --- Data Processing ---
    const moodHistory = filterByDate(userData.moods?.history || []);
    const activityLog = filterByDate(userData.planner?.completedTasksLog || []);
    const phraseLog = filterByDate(userData.phrases?.phraseUsageLog || []);

    const getCounts = (data: any[], key: string | ((item: any) => string)) => {
        const counts: { [key: string]: number } = {};
        data.forEach(item => {
            const itemKey = typeof key === 'function' ? key(item) : item[key];
            counts[itemKey] = (counts[itemKey] || 0) + 1;
        });
        return Object.entries(counts).sort(([, a], [, b]) => b - a);
    };

    const moodCounts = getCounts(moodHistory, 'mood');
    const activityCounts = getCounts(activityLog, 'text');
    const phraseCounts = getCounts(phraseLog, item => `${item.text} (${item.type})`);
    
    const createSummaryTable = (title: string, headers: string[], data: [string, number][]) => {
        let tableHTML = `
          <div class="section">
            <div class="section-header"><h2>${title}</h2></div>
        `;
        if (data.length === 0) {
            tableHTML += '<div class="no-data">No data recorded for this period.</div>';
        } else {
            tableHTML += `
                <table>
                    <thead><tr><th>${headers[0]}</th><th>${headers[1]}</th></tr></thead>
                    <tbody>${data.map(([item, count]) => `<tr><td>${item}</td><td>${count}</td></tr>`).join('')}</tbody>
                </table>
            `;
        }
        tableHTML += '</div>';
        return tableHTML;
    };
    
    return `
      <html>
        <head>
          <title>Data Report for ${userName}</title>
          <style>${styles}</style>
        </head>
        <body>
          <div class="report-header">
            <h1>Data Report</h1>
            <p>For: ${userName} &nbsp;&bull;&nbsp; Generated: ${new Date().toLocaleDateString()}</p>
          </div>
          ${createSummaryTable('Mood Summary', ['Mood', 'Frequency'], moodCounts)}
          ${createSummaryTable('Completed Activities', ['Activity', 'Times Completed'], activityCounts)}
          ${createSummaryTable('Phrase Usage', ['Phrase (Category)', 'Times Used'], phraseCounts)}
        </body>
      </html>
    `;
  };

  const handlePrintPDF = () => {
    const reportHTML = generateReportHTML();
    const printWindow = window.open('', '', 'height=800,width=1000');
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DownloadCloud className="h-6 w-6 text-accent" />
            {getTitle()}
          </CardTitle>
          <CardDescription>
            Download user data for professional reports, such as for therapists or Individualized Education Plans (IEPs). You can export data as a CSV spreadsheet or a printable PDF document.
          </CardDescription>
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
        <CardContent className="space-y-8">
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                CSV Downloads (with full history)
              </h3>
              <div className="space-y-3">
                <Button onClick={handleDownloadMoods} variant="secondary" className="w-full justify-start gap-2">
                  <DownloadCloud className="h-4 w-4" />Mood Report
                </Button>
                <Button onClick={handleDownloadActivities} variant="secondary" className="w-full justify-start gap-2">
                  <DownloadCloud className="h-4 w-4" />Completed Activities
                </Button>
                <Button onClick={handleDownloadPhrases} variant="secondary" className="w-full justify-start gap-2">
                  <DownloadCloud className="h-4 w-4" />Phrase Usage
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Printable PDF Report (Summarized)
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                This will generate a single, comprehensive summary report of all data for the selected period, ready to be printed or saved as a PDF.
              </p>
              <Button onClick={handlePrintPDF} className="w-full justify-start gap-2">
                <FileText className="h-4 w-4" />Generate Full Report (PDF)
              </Button>
            </div>
        </CardContent>
      </Card>

       <Card className="bg-secondary/50">
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg bg-background">
                    <h3 className="font-semibold">What is CSV?</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        CSV (Comma-Separated Values) is a spreadsheet file format that can be opened by applications like Microsoft Excel, Google Sheets, or Apple Numbers. This format is ideal for detailed analysis, charting, or sharing raw data with professionals.
                    </p>
                </div>
                <div className="p-4 border rounded-lg bg-background">
                    <h3 className="font-semibold">What is PDF?</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        PDF (Portable Document Format) is a file format that provides an electronic image of text or text and graphics that looks like a printed document. It's the best format for sharing official reports that should not be modified.
                    </p>
                </div>
                <Alert variant="destructive" className="bg-orange-50 dark:bg-orange-900/20 border-orange-200">
                    <ShieldCheck className="h-4 w-4 text-orange-600" />
                    <AlertTitle className="text-orange-700 dark:text-orange-300">Handle With Care</AlertTitle>
                    <AlertDescription className="text-orange-600 dark:text-orange-400">
                        Exported data contains sensitive personal information. Please ensure you store and share these files securely and in compliance with privacy regulations like HIPAA.
                    </AlertDescription>
                </Alert>
            </CardContent>
      </Card>
    </div>
  );
}
