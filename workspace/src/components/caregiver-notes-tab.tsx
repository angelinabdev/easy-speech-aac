
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import type { Note, UserData } from '@/lib/user-data';
import type { User } from 'firebase/auth';
import PasscodeLock from './passcode-lock';


interface CaregiverNotesTabProps {
  user: User | { uid: string; displayName?: string | null };
  userData: UserData;
  onUpdate: (data: Partial<UserData>) => void;
}

export default function CaregiverNotesTab({ user, userData, onUpdate }: CaregiverNotesTabProps) {
    const [newNote, setNewNote] = useState("");
    const [isUnlocked, setIsUnlocked] = useState(false);

    const notes = userData.notes || [];
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
            };
            handleUpdateNotes([note, ...notes]);
            setNewNote("");
        }
    };

    const deleteNote = (id: string) => {
        handleUpdateNotes(notes.filter(note => note.id !== id));
    };

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
                <Textarea 
                    placeholder="Start typing your note..." 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={6}
                />
                <Button onClick={saveNote} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Save Note</Button>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Previous Notes</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-80 pr-4">
                    <div className="space-y-4">
                        {notes.length > 0 ? (
                            notes.map((note) => (
                                <div key={note.id} className="p-3 rounded-lg bg-secondary relative group">
                                    <p className="text-xs text-muted-foreground">{note.timestamp}</p>
                                    <p className="mt-1">{note.text}</p>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
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
                            ))
                        ) : (
                            <p className="text-muted-foreground">No notes saved yet.</p>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    </div>
  );
}
