"use client";

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Picture-Word Match Game ---

const initialWords = [
  { id: 'word-1', text: 'Dog' },
  { id: 'word-2', text: 'Cat' },
  { id: 'word-3', text: 'Sun' },
  { id: 'word-4', text: 'Tree' },
];

const initialImages = [
  { id: 'image-1', wordId: 'word-1', src: 'https://picsum.photos/seed/10/200/200', hint: 'dog animal' },
  { id: 'image-2', wordId: 'word-2', src: 'https://picsum.photos/seed/11/200/200', hint: 'cat animal' },
  { id: 'image-3', wordId: 'word-3', src: 'https://picsum.photos/seed/12/200/200', hint: 'sun sky' },
  { id: 'image-4', wordId: 'word-4', src: 'https://picsum.photos/seed/13/200/200', hint: 'tree nature' },
];

// Utility to shuffle arrays
const shuffle = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

function PictureWordMatch() {
  const [words, setWords] = useState(() => shuffle(initialWords));
  const [images, setImages] = useState(() => shuffle(initialImages));
  const [matches, setMatches] = useState<Record<string, string | null>>({});
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'incorrect' | null>>({});
  const [draggingWord, setDraggingWord] = useState<string | null>(null);
  const { toast } = useToast();

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }

  const handleDragStart = (event: DragStartEvent) => {
    setDraggingWord(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggingWord(null);

    if (over && over.data.current?.type === 'image') {
      const imageId = over.id as string;
      const wordId = active.id as string;

      const isCorrect = over.data.current.wordId === wordId;

      setMatches(prev => ({ ...prev, [imageId]: wordId }));
      setFeedback(prev => ({ ...prev, [imageId]: isCorrect ? 'correct' : 'incorrect' }));

      if (isCorrect) {
        speak('Great job!');
        setWords(words.filter(w => w.id !== wordId));
      } else {
        speak('Try again!');
        setTimeout(() => {
          setMatches(prev => ({ ...prev, [imageId]: null }));
          setFeedback(prev => ({ ...prev, [imageId]: null }));
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setWords(shuffle(initialWords));
    setImages(shuffle(initialImages));
    setMatches({});
    setFeedback({});
    toast({ title: "Game Reset", description: "The game has been reset." });
  }
  
  const allCorrect = images.every(img => feedback[img.id] === 'correct');

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <Card>
        <CardHeader>
          <CardTitle>Picture-Word Matching</CardTitle>
          <CardDescription>Drag the word onto the image it matches.</CardDescription>
        </CardHeader>
        <CardContent>
          {allCorrect && (
            <div className="text-center p-8 bg-green-100 dark:bg-green-900/50 rounded-lg mb-4">
              <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">Congratulations!</h3>
              <p>You matched all the words correctly!</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {images.map(image => (
              <ImageDropZone 
                key={image.id}
                id={image.id}
                imageSrc={image.src}
                imageHint={image.hint}
                wordId={image.wordId}
                matchedWord={matches[image.id] ? words.find(w => w.id === matches[image.id])?.text || initialWords.find(w => w.id === matches[image.id])?.text : null}
                feedback={feedback[image.id]}
              />
            ))}
          </div>
          
          <div className="min-h-[60px] bg-secondary p-4 rounded-lg flex items-center justify-center gap-4">
            {words.map(word => (
              <WordDragItem key={word.id} id={word.id} text={word.text} />
            ))}
            {words.length === 0 && !allCorrect && <p className="text-muted-foreground">Match the remaining words!</p>}
            {words.length === 0 && allCorrect && <p className="text-muted-foreground">You did it!</p>}
          </div>

          <Button className="w-full mt-4" onClick={resetGame}>Reset Game</Button>
        </CardContent>
      </Card>
      <DragOverlay>
        {draggingWord ? <div className="p-2 px-4 bg-accent text-accent-foreground rounded-lg shadow-lg cursor-grabbing">{initialWords.find(w => w.id === draggingWord)?.text}</div> : null}
      </DragOverlay>
    </DndContext>
  );
}

function WordDragItem({ id, text }: { id: string; text: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id, data: { type: 'word' } });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-2 px-4 bg-primary text-primary-foreground rounded-lg shadow cursor-grab active:cursor-grabbing"
    >
      {text}
    </div>
  );
}

function ImageDropZone({ id, imageSrc, imageHint, wordId, matchedWord, feedback }: { id: string; imageSrc: string; imageHint: string; wordId: string; matchedWord: string | null | undefined; feedback: 'correct' | 'incorrect' | null }) {
  const { setNodeRef, isOver } = useSortable({ id, data: { type: 'image', wordId } });

  const borderColor = useMemo(() => {
    if (feedback === 'correct') return 'border-green-500';
    if (feedback === 'incorrect') return 'border-red-500';
    if (isOver) return 'border-accent';
    return 'border-dashed';
  }, [feedback, isOver]);
  
  return (
    <div
      ref={setNodeRef}
      className={cn("relative aspect-square rounded-lg border-2 flex items-center justify-center transition-all", borderColor)}
    >
      <Image src={imageSrc} alt={imageHint} width={200} height={200} data-ai-hint={imageHint} className={cn("rounded-md object-cover", feedback === 'correct' ? 'opacity-30' : '')} />
      {feedback === 'correct' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/30">
          <CheckCircle className="h-12 w-12 text-white" />
          <p className="mt-2 text-lg font-bold text-white">{matchedWord}</p>
        </div>
      )}
       {feedback === 'incorrect' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/50">
          <XCircle className="h-12 w-12 text-white" />
        </div>
      )}
    </div>
  );
}


// --- Sentence Builder Game ---

function SentenceBuilder() {
  return (
      <Card>
          <CardHeader>
              <CardTitle>Sentence Builder</CardTitle>
              <CardDescription>Drag and drop words to build simple sentences.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="flex flex-col items-center justify-center h-48 bg-secondary rounded-lg">
                  <p className="text-muted-foreground">Game coming soon!</p>
              </div>
              <Button className="w-full mt-4" disabled>Play Now</Button>
          </CardContent>
      </Card>
  );
}


export default function GamesTab() {
  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <PictureWordMatch />
        <SentenceBuilder />
    </div>
  );
}
