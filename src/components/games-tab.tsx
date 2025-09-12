"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

// --- Picture-Word Match Game ---

const allWords = [
  // Animals
  { id: 'word-1', text: 'Dog', category: 'Animals' },
  { id: 'word-2', text: 'Cat', category: 'Animals' },
  { id: 'word-3', text: 'Bird', category: 'Animals' },
  { id: 'word-4', text: 'Fish', category: 'Animals' },
  { id: 'word-5', text: 'Cow', category: 'Animals' },
  { id: 'word-6', text: 'Duck', category: 'Animals' },
  { id: 'word-7', text: 'Horse', category: 'Animals' },
  // Food
  { id: 'word-8', text: 'Apple', category: 'Food' },
  { id: 'word-9', text: 'Banana', category: 'Food' },
  { id: 'word-10', text: 'Bread', category: 'Food' },
  { id: 'word-11', text: 'Milk', category: 'Food' },
  { id: 'word-12', text: 'Egg', category: 'Food' },
  { id: 'word-13', text: 'Cheese', category: 'Food' },
  { id: 'word-14', text: 'Pizza', category: 'Food' },
  // Actions / Verbs
  { id: 'word-15', text: 'Eat', category: 'Actions' },
  { id: 'word-16', text: 'Drink', category: 'Actions' },
  { id: 'word-17', text: 'Sleep', category: 'Actions' },
  { id: 'word-18', text: 'Play', category: 'Actions' },
  { id: 'word-19', text: 'Run', category: 'Actions' },
  { id: 'word-20', text: 'Jump', category: 'Actions' },
  { id: 'word-21', text: 'Sit', category: 'Actions' },
  { id: 'word-22', text: 'Stand', category: 'Actions' },
  // People / Family
  { id: 'word-23', text: 'Mom', category: 'People' },
  { id: 'word-24', text: 'Dad', category: 'People' },
  { id: 'word-25', text: 'Sister', category: 'People' },
  { id: 'word-26', text: 'Brother', category: 'People' },
  { id: 'word-27', text: 'Baby', category: 'People' },
  { id: 'word-28', text: 'Friend', category: 'People' },
  // Objects / Everyday Things
  { id: 'word-29', text: 'Ball', category: 'Objects' },
  { id: 'word-30', text: 'Book', category: 'Objects' },
  { id: 'word-31', text: 'Car', category: 'Objects' },
  { id: 'word-32', text: 'Chair', category: 'Objects' },
  { id: 'word-33', text: 'Cup', category: 'Objects' },
  { id: 'word-34', text: 'Hat', category: 'Objects' },
  { id: 'word-35', text: 'Bag', category: 'Objects' },
  // Feelings / Emotions
  { id: 'word-36', text: 'Happy', category: 'Feelings' },
  { id: 'word-37', text: 'Sad', category: 'Feelings' },
  { id: 'word-38', text: 'Tired', category: 'Feelings' },
  { id: 'word-39', text: 'Scared', category: 'Feelings' },
  { id: 'word-40', text: 'Excited', category: 'Feelings' },
];

const allImages = [
  { id: 'image-1', wordId: 'word-1', src: 'https://picsum.photos/seed/dog/200/200', hint: 'dog animal' },
  { id: 'image-2', wordId: 'word-2', src: 'https://picsum.photos/seed/cat/200/200', hint: 'cat animal' },
  { id: 'image-3', wordId: 'word-3', src: 'https://picsum.photos/seed/bird/200/200', hint: 'bird animal' },
  { id: 'image-4', wordId: 'word-4', src: 'https://picsum.photos/seed/fish/200/200', hint: 'fish animal' },
  { id: 'image-5', wordId: 'word-5', src: 'https://picsum.photos/seed/cow/200/200', hint: 'cow animal' },
  { id: 'image-6', wordId: 'word-6', src: 'https://picsum.photos/seed/duck/200/200', hint: 'duck animal' },
  { id: 'image-7', wordId: 'word-7', src: 'https://picsum.photos/seed/horse/200/200', hint: 'horse animal' },
  { id: 'image-8', wordId: 'word-8', src: 'https://picsum.photos/seed/apple/200/200', hint: 'apple fruit' },
  { id: 'image-9', wordId: 'word-9', src: 'https://picsum.photos/seed/banana/200/200', hint: 'banana fruit' },
  { id: 'image-10', wordId: 'word-10', src: 'https://picsum.photos/seed/bread/200/200', hint: 'bread food' },
  { id: 'image-11', wordId: 'word-11', src: 'https://picsum.photos/seed/milk/200/200', hint: 'milk drink' },
  { id: 'image-12', wordId: 'word-12', src: 'https://picsum.photos/seed/egg/200/200', hint: 'egg food' },
  { id: 'image-13', wordId: 'word-13', src: 'https://picsum.photos/seed/cheese/200/200', hint: 'cheese food' },
  { id: 'image-14', wordId: 'word-14', src: 'https://picsum.photos/seed/pizza/200/200', hint: 'pizza food' },
  { id: 'image-15', wordId: 'word-15', src: 'https://picsum.photos/seed/eat/200/200', hint: 'eat action' },
  { id: 'image-16', wordId: 'word-16', src: 'https://picsum.photos/seed/drink/200/200', hint: 'drink action' },
  { id: 'image-17', wordId: 'word-17', src: 'https://picsum.photos/seed/sleep/200/200', hint: 'sleep action' },
  { id: 'image-18', wordId: 'word-18', src: 'https://picsum.photos/seed/play/200/200', hint: 'play action' },
  { id: 'image-19', wordId: 'word-19', src: 'https://picsum.photos/seed/run/200/200', hint: 'run action' },
  { id: 'image-20', wordId: 'word-20', src: 'https://picsum.photos/seed/jump/200/200', hint: 'jump action' },
  { id: 'image-21', wordId: 'word-21', src: 'https://picsum.photos/seed/sit/200/200', hint: 'sit action' },
  { id: 'image-22', wordId: 'word-22', src: 'https://picsum.photos/seed/stand/200/200', hint: 'stand action' },
  { id: 'image-23', wordId: 'word-23', src: 'https://picsum.photos/seed/mom/200/200', hint: 'mom person' },
  { id: 'image-24', wordId: 'word-24', src: 'https://picsum.photos/seed/dad/200/200', hint: 'dad person' },
  { id: 'image-25', wordId: 'word-25', src: 'https://picsum.photos/seed/sister/200/200', hint: 'sister person' },
  { id: 'image-26', wordId: 'word-26', src: 'https://picsum.photos/seed/brother/200/200', hint: 'brother person' },
  { id: 'image-27', wordId: 'word-27', src: 'https://picsum.photos/seed/baby/200/200', hint: 'baby person' },
  { id: 'image-28', wordId: 'word-28', src: 'https://picsum.photos/seed/friend/200/200', hint: 'friend person' },
  { id: 'image-29', wordId: 'word-29', src: 'https://picsum.photos/seed/ball/200/200', hint: 'ball object' },
  { id: 'image-30', wordId: 'word-30', src: 'https://picsum.photos/seed/book/200/200', hint: 'book object' },
  { id: 'image-31', wordId: 'word-31', src: 'https://picsum.photos/seed/car/200/200', hint: 'car object' },
  { id: 'image-32', wordId: 'word-32', src: 'https://picsum.photos/seed/chair/200/200', hint: 'chair object' },
  { id: 'image-33', wordId: 'word-33', src: 'https://picsum.photos/seed/cup/200/200', hint: 'cup object' },
  { id: 'image-34', wordId: 'word-34', src: 'https://picsum.photos/seed/hat/200/200', hint: 'hat object' },
  { id: 'image-35', wordId: 'word-35', src: 'https://picsum.photos/seed/bag/200/200', hint: 'bag object' },
  { id: 'image-36', wordId: 'word-36', src: 'https://picsum.photos/seed/happy/200/200', hint: 'happy emotion' },
  { id: 'image-37', wordId: 'word-37', src: 'https://picsum.photos/seed/sad/200/200', hint: 'sad emotion' },
  { id: 'image-38', wordId: 'word-38', src: 'https://picsum.photos/seed/tired/200/200', hint: 'tired emotion' },
  { id: 'image-39', wordId: 'word-39', src: 'https://picsum.photos/seed/scared/200/200', hint: 'scared emotion' },
  { id: 'image-40', wordId: 'word-40', src: 'https://picsum.photos/seed/excited/200/200', hint: 'excited emotion' },
];

const shuffle = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

const getGameSet = (size = 4) => {
  const shuffledImages = shuffle(allImages);
  const selectedImages = shuffledImages.slice(0, size);
  const selectedWordIds = selectedImages.map(img => img.wordId);
  const selectedWords = allWords.filter(word => selectedWordIds.includes(word.id));
  return {
    words: shuffle(selectedWords),
    images: shuffle(selectedImages),
  };
};

function PictureWordMatch() {
  const [words, setWords] = useState<{id: string, text: string}[]>([]);
  const [images, setImages] = useState<{id: string, wordId: string, src: string, hint: string}[]>([]);
  const [initialWords, setInitialWords] = useState<{id: string, text: string}[]>([]);
  
  const [matches, setMatches] = useState<Record<string, string | null>>({});
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'incorrect' | null>>({});
  const [draggingWord, setDraggingWord] = useState<string | null>(null);
  const { toast } = useToast();

  const setupGame = useCallback(() => {
    const { words: newWords, images: newImages } = getGameSet(4);
    setWords(newWords);
    setImages(newImages);
    setInitialWords(newWords);
    setMatches({});
    setFeedback({});
  }, []);

  useEffect(() => {
    setupGame();
  }, [setupGame]);

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
    setupGame();
    toast({ title: "Game Reset", description: "A new set of words is ready." });
  }
  
  const allCorrect = images.every(img => feedback[img.id] === 'correct') && images.length > 0;

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
                matchedWord={matches[image.id] ? initialWords.find(w => w.id === matches[image.id])?.text : null}
                feedback={feedback[image.id]}
              />
            ))}
          </div>
          
          <div className="min-h-[60px] bg-secondary p-4 rounded-lg flex items-center justify-center gap-4 flex-wrap">
            {words.map(word => (
              <WordDragItem key={word.id} id={word.id} text={word.text} />
            ))}
            {words.length === 0 && !allCorrect && <p className="text-muted-foreground">Match the remaining words!</p>}
            {words.length === 0 && allCorrect && <p className="text-muted-foreground">You did it!</p>}
          </div>

          <Button className="w-full mt-4" onClick={resetGame}>New Game</Button>
        </CardContent>
      </Card>
      <DragOverlay>
        {draggingWord ? <div className="p-2 px-4 bg-accent text-accent-foreground rounded-lg shadow-lg cursor-grabbing">{initialWords.find(w => w.id === draggingWord)?.text}</div> : null}
      </DragOverlay>
    </DndContext>
  );
}

function WordDragItem({ id, text }: { id: string; text: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id, data: { type: 'word' } });
  const style = { 
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
   };
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
  const { setNodeRef, isOver } = useSortable({ id, data: { type: 'image', wordId }, disabled: feedback === 'correct' });

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
      <Image src={imageSrc} alt={imageHint} width={200} height={200} data-ai-hint={imageHint} className={cn("rounded-md object-cover w-full h-full", feedback === 'correct' ? 'opacity-30' : '')} />
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

function SentenceBuilderGame() {
    // This will hold the game logic. For now, it's a placeholder.
    return (
        <div className="space-y-4">
            <div className="p-4 border-2 border-dashed rounded-lg min-h-[100px] flex items-center justify-center">
                <p className="text-muted-foreground">Drop words here to build a sentence.</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg min-h-[100px] flex items-center justify-center gap-2">
                 <div className="p-2 px-4 bg-primary text-primary-foreground rounded-lg shadow cursor-grab">The</div>
                 <div className="p-2 px-4 bg-primary text-primary-foreground rounded-lg shadow cursor-grab">dog</div>
                 <div className="p-2 px-4 bg-primary text-primary-foreground rounded-lg shadow cursor-grab">plays</div>
            </div>
             <Button className="w-full">Check Sentence</Button>
        </div>
    );
}

function SentenceBuilder() {
  return (
      <Card>
          <CardHeader>
              <CardTitle>Sentence Builder</CardTitle>
              <CardDescription>Drag and drop words to build simple sentences.</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="w-full">Play Now</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Build a Sentence</DialogTitle>
                    </DialogHeader>
                    <SentenceBuilderGame />
                </DialogContent>
            </Dialog>
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
