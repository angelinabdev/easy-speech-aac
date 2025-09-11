"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ScrollArea } from './ui/scroll-area';
import { Trash2 } from 'lucide-react';

type Note = {
    text: string;
    timestamp: string;
}

export default function CaregiverNotesTab() {
  const [notes, setNotes] = useLocalStorage<Note[]>('caregiver_notes', []);
  const [newNote, setNewNote] = useState("");

  const saveNote = () => {
    if (newNote.trim()) {
        const note: Note = {
            text: newNote.trim(),
            timestamp: new Date().toLocaleString(),
        };
        setNotes([note, ...notes]);
        setNewNote("");
    }
  };

  const deleteNote = (index: number) => {
    const updatedNotes = [...notes];
    updatedNotes.splice(index, 1);
    setNotes(updatedNotes);
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Caregiver Notes</CardTitle>
                <CardDescription>Write observations or important information here.</CardDescription>
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
                <ScrollArea className="h-96 pr-4">
                    <div className="space-y-4">
                        {notes.length > 0 ? (
                            notes.map((note, index) => (
                                <div key={index} className="p-3 rounded-lg bg-secondary relative group">
                                    <p className="text-xs text-muted-foreground">{note.timestamp}</p>
                                    <p className="mt-1">{note.text}</p>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => deleteNote(index)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
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
