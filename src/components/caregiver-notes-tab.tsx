
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Trash2, Pin, PinOff } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import type { Note, UserData, NoteCategory } from '@/lib/user-data';
import type { User } from 'firebase/auth';
import PasscodeLock from './passcode-lock';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';


interface CaregiverNotesTabProps {
  user: User | { uid: string; displayName?: string | null };
  userData: UserData;
  onUpdate: (data: Partial<UserData>) => void;
}

const categoryStyles: Record<NoteCategory, string> = {
    general: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    medical: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    behavioral: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    progress: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
};

export default function CaregiverNotesTab({ user, userData, onUpdate }: CaregiverNotesTabProps) {
    const [newNote, setNewNote] = useState("");
    const [noteCategory, setNoteCategory] = useState<NoteCategory>('general');
    const [isUnlocked, setIsUnlocked] = useState(false);

    const notes = userData.notes || [];
    const role = userData.metadata?.role;
    const passcode = userData.metadata?.notesPasscode ?? null;

    const handleUpdateNotes = (newNotes: Note[]) => {
      onUpdate({ notes: newNotes });
    };

    const handleSetPasscode = (newPasscode: string) => {
        onUpdate({ 
            metadata: {
                ...userData.metadata,
                notesPasscode: newPasscode
            }
        });
    };

    const saveNote = () => {
        if (newNote.trim()) {
            const note: Note = {
                id: `${Date.now()}-${Math.random()}`,
                text: newNote.trim(),
                timestamp: new Date().toLocaleString(),
                category: noteCategory,
                pinned: false,
            };
            handleUpdateNotes([note, ...notes]);
            setNewNote("");
            setNoteCategory('general');
        }
    };

    const deleteNote = (id: string) => {
        handleUpdateNotes(notes.filter(note => note.id !== id));
    };

    const togglePinNote = (id: string) => {
        const newNotes = notes.map(note => 
            note.id === id ? { ...note, pinned: !note.pinned } : note
        );
        handleUpdateNotes(newNotes);
    };

    const sortedNotes = useMemo(() => {
        return [...notes].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            // @ts-ignore
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
    }, [notes]);


    if (user.uid === 'guest' || role !== 'caregiver') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Feature Unavailable</CardTitle>
                    <CardDescription>The Caregiver Notes feature is only available for logged-in users with the 'caregiver' role. You can switch your role from the Dashboard tab.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">This ensures your sensitive information is private and accessible only to authorized caregivers.</p>
                </CardContent>
            </Card>
        );
    }

    if (!isUnlocked) {
        return (
            <PasscodeLock 
                passcode={passcode}
                onPasscodeSet={handleSetPasscode}
                onUnlock={() => setIsUnlocked(true)}
                onPasscodeChange={handleSetPasscode}
            />
        );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Caregiver Notes</CardTitle>
                <CardDescription>Write observations or important information here. These notes are saved to your account and available on any device.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="note-category">Category</Label>
                    <Select value={noteCategory} onValueChange={(value) => setNoteCategory(value as NoteCategory)}>
                        <SelectTrigger id="note-category">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="medical">Medical</SelectItem>
                            <SelectItem value="behavioral">Behavioral</SelectItem>
                            <SelectItem value="progress">Progress</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Textarea 
                    placeholder="Start typing your note..." 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={6}
                />
                <Button onClick={saveNote} className="w-full">Save Note</Button>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Previous Notes</CardTitle>
                <CardDescription>Pinned notes will always appear at the top.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[28.5rem] pr-4">
                    <div className="space-y-4">
                        {sortedNotes.length > 0 ? (
                            sortedNotes.map((note) => (
                                <div key={note.id} className={cn(
                                    "p-3 rounded-lg relative group transition-colors",
                                    note.pinned ? "bg-accent/20 border border-accent" : "bg-secondary"
                                )}>
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="text-xs text-muted-foreground">{note.timestamp}</p>
                                        <p className="mt-1 pr-16">{note.text}</p>
                                      </div>
                                      <div className="absolute top-1 right-1 flex flex-col items-end gap-1">
                                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                           <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => togglePinNote(note.id)} aria-label={note.pinned ? 'Unpin note' : 'Pin note'}>
                                                {note.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                                           </Button>
                                           <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Delete note">
                                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will permanently delete this note. This action cannot be undone.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => deleteNote(note.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                         {note.pinned && <Pin className="h-4 w-4 text-accent group-hover:opacity-0 transition-opacity" />}
                                      </div>
                                    </div>
                                    {note.category && (
                                        <Badge className={cn("mt-2 text-xs", categoryStyles[note.category])}>
                                            {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
                                        </Badge>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-10">No notes saved yet.</p>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    </div>
  );
}

    

    