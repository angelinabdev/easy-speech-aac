"use client";

import { useState, useEffect } from 'react';
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
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

// --- Sentence Builder Game ---

const SENTENCES = [
    { words: ["The", "dog", "plays"], correct: "The dog plays" },
    { words: ["I", "want", "juice"], correct: "I want juice" },
    { words: ["She", "is", "happy"], correct: "She is happy" },
    { words: ["He", "can", "run"], correct: "He can run" },
];

function shuffleArray(array: any[]) {
  return array.slice().sort(() => Math.random() - 0.5);
}

function SortableItem({ id, children }: { id: string, children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}


function SentenceBuilderGame() {
    const [points, setPoints] = useLocalStorage('planner_points', 0);
    const [level, setLevel] = useLocalStorage('planner_level', 1);

    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
    const [wordBank, setWordBank] = useState<string[]>([]);
    const [sentenceBox, setSentenceBox] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

    useEffect(() => {
        const sentence = SENTENCES[currentSentenceIndex];
        setWordBank(shuffleArray(sentence.words));
        setSentenceBox([]);
        setFeedback(null);
    }, [currentSentenceIndex]);

    const expForNextLevel = level * 100;
    const currentExp = points - ((level - 1) * 100);
    const progress = Math.min(100, (currentExp / expForNextLevel) * 100);
    
    useEffect(() => {
        if (points >= expForNextLevel) {
            setLevel(level + 1);
        }
    }, [points, level, expForNextLevel, setLevel]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const checkSentence = () => {
        const userAnswer = sentenceBox.join(' ');
        const correctAnswer = SENTENCES[currentSentenceIndex].correct;
        if (userAnswer === correctAnswer) {
            setFeedback('correct');
            setPoints(points + 20);
            setTimeout(() => {
                setCurrentSentenceIndex((prevIndex) => (prevIndex + 1) % SENTENCES.length);
            }, 1500);
        } else {
            setFeedback('incorrect');
            setPoints(Math.max(0, points - 10));
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;
    
        if (active.id !== over.id) {
          if (over.data.current?.id === 'sentence-box') {
             // Move from word bank to sentence box
             if (wordBank.includes(active.id as string)) {
                 setSentenceBox((items) => [...items, active.id as string]);
                 setWordBank((items) => items.filter(item => item !== active.id));
             }
          } else if (over.data.current?.id === 'word-bank') {
            // Move from sentence box to word bank
            if (sentenceBox.includes(active.id as string)) {
                setWordBank((items) => [...items, active.id as string]);
                setSentenceBox((items) => items.filter(item => item !== active.id));
            }
          } else {
            // Reorder within sentence box
            setSentenceBox((items) => {
              const oldIndex = items.indexOf(active.id as string);
              const newIndex = items.indexOf(over.id as string);
              return arrayMove(items, oldIndex, newIndex);
            });
          }
        }
    };
    
    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="space-y-4">
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

                <div 
                  id="sentence-box"
                  data-id="sentence-box"
                  className="p-4 border-2 border-dashed rounded-lg min-h-[100px] flex items-center justify-center gap-2 flex-wrap bg-background/50"
                >
                    <SortableContext items={sentenceBox}>
                        {sentenceBox.length > 0 ? (
                           sentenceBox.map(word => (
                            <SortableItem key={word} id={word}>
                                <div className="p-2 px-4 bg-primary text-primary-foreground rounded-lg shadow cursor-grab">{word}</div>
                            </SortableItem>
                           ))
                        ) : (
                             <p className="text-muted-foreground">Drop words here to build a sentence.</p>
                        )}
                    </SortableContext>
                </div>
                
                <div 
                  id="word-bank" 
                  data-id="word-bank"
                  className="p-4 bg-secondary rounded-lg min-h-[100px] flex items-center justify-center gap-2 flex-wrap"
                >
                    <SortableContext items={wordBank}>
                         {wordBank.map(word => (
                           <SortableItem key={word} id={word}>
                                <div className="p-2 px-4 bg-primary text-primary-foreground rounded-lg shadow cursor-grab">{word}</div>
                           </SortableItem>
                         ))}
                    </SortableContext>
                </div>

                {feedback && (
                  <Alert variant={feedback === 'correct' ? 'default' : 'destructive'} className={feedback === 'correct' ? 'bg-green-100 border-green-500' : ''}>
                      <AlertTitle>{feedback === 'correct' ? 'Great Job!' : 'Try Again!'}</AlertTitle>
                      <AlertDescription>
                          {feedback === 'correct' ? 'You made a correct sentence!' : 'That doesn\'t look quite right. Check the word order.'}
                      </AlertDescription>
                  </Alert>
                )}

                 <Button onClick={checkSentence} className="w-full">Check Sentence</Button>
            </div>
        </DndContext>
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
    <div>
        <SentenceBuilder />
    </div>
  );
}
