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
  Active,
  Over,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Info } from 'lucide-react';

// --- Sentence Builder Game ---

const SENTENCES = [
    // Animals / Actions
    { words: ["The", "dog", "runs"], correct: "The dog runs", prompt: "Drag the words to form the sentence that describes what the dog is doing." },
    { words: ["The", "cat", "sleeps"], correct: "The cat sleeps", prompt: "Arrange the words to show what the cat is doing." },
    { words: ["The", "bird", "flies"], correct: "The bird flies", prompt: "Put the words in order to say what the bird does." },
    { words: ["The", "fish", "swims"], correct: "The fish swims", prompt: "Build the sentence that tells what the fish is doing." },
    { words: ["The", "cow", "eats", "grass"], correct: "The cow eats grass", prompt: "Drag the words to form the sentence about the cow eating." },
    // Food / Eating
    { words: ["I", "eat", "pizza"], correct: "I eat pizza", prompt: "Arrange the words to say what you are eating." },
    { words: ["I", "drink", "milk"], correct: "I drink milk", prompt: "Put the words in order to show what you are drinking." },
    { words: ["She", "eats", "an", "apple"], correct: "She eats an apple", prompt: "Drag the words to form the sentence about what she eats." },
    { words: ["He", "drinks", "water"], correct: "He drinks water", prompt: "Arrange the words to describe what he is drinking." },
    { words: ["We", "eat", "bread"], correct: "We eat bread", prompt: "Build the sentence showing what we eat." },
    // People / Family
    { words: ["Mom", "is", "happy"], correct: "Mom is happy", prompt: "Drag the words to say how Mom feels." },
    { words: ["Dad", "is", "tired"], correct: "Dad is tired", prompt: "Arrange the words to show Dad’s feeling." },
    { words: ["The", "sister", "plays"], correct: "The sister plays", prompt: "Put the words in order to describe what the sister does." },
    { words: ["The", "brother", "jumps"], correct: "The brother jumps", prompt: "Build the sentence that tells what the brother is doing." },
    { words: ["The", "baby", "sleeps"], correct: "The baby sleeps", prompt: "Drag the words to say what the baby is doing." },
    // Everyday Objects / Activities
    { words: ["I", "read", "a", "book"], correct: "I read a book", prompt: "Arrange the words to form the sentence about reading." },
    { words: ["I", "play", "with", "the", "ball"], correct: "I play with the ball", prompt: "Put the words in order to say what you are playing with." },
    { words: ["The", "car", "is", "red"], correct: "The car is red", prompt: "Drag the words to form the sentence describing the car." },
    { words: ["The", "chair", "is", "big"], correct: "The chair is big", prompt: "Arrange the words to say something about the chair." },
    { words: ["I", "wear", "a", "hat"], correct: "I wear a hat", prompt: "Build the sentence that tells what you wear." },
    // Feelings / Emotions
    { words: ["I", "am", "happy"], correct: "I am happy", prompt: "Drag the words to say how you feel." },
    { words: ["I", "am", "sad"], correct: "I am sad", prompt: "Arrange the words to show your feeling." },
    { words: ["She", "is", "excited"], correct: "She is excited", prompt: "Put the words in order to describe how she feels." },
    { words: ["He", "is", "scared"], correct: "He is scared", prompt: "Build the sentence about his feeling." },
    { words: ["We", "are", "tired"], correct: "We are tired", prompt: "Drag the words to form the sentence about how we feel." },
];

function shuffleArray(array: any[]) {
  return array.slice().sort(() => Math.random() - 0.5);
}

function SortableItem({ id }: { id: string }) {
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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-2 px-4 bg-primary text-primary-foreground rounded-lg shadow cursor-grab">
      {id}
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

        const activeId = String(active.id);
        const overId = String(over.id);

        const activeContainer = active.data.current?.sortable.containerId;
        const overContainer = over.data.current?.sortable.containerId;
        
        if (activeContainer === overContainer) {
            if (activeContainer === 'sentence-box-container') {
                 const oldIndex = sentenceBox.indexOf(activeId);
                 const newIndex = sentenceBox.indexOf(overId);
                 if (oldIndex !== newIndex) {
                    setSentenceBox((items) => arrayMove(items, oldIndex, newIndex));
                 }
            }
        } else {
            if (overContainer === 'sentence-box-container') {
                const activeIndex = wordBank.indexOf(activeId);
                const overIndex = overId === 'sentence-box-container' ? sentenceBox.length : sentenceBox.indexOf(overId);
                
                setWordBank((items) => items.filter((item) => item !== activeId));
                setSentenceBox((items) => {
                    const newItems = [...items];
                    newItems.splice(overIndex, 0, activeId);
                    return newItems;
                });
            } else if (overContainer === 'word-bank-container') {
                const activeIndex = sentenceBox.indexOf(activeId);
                const overIndex = overId === 'word-bank-container' ? wordBank.length : wordBank.indexOf(overId);

                setSentenceBox((items) => items.filter((item) => item !== activeId));
                setWordBank((items) => {
                    const newItems = [...items];
                    newItems.splice(overIndex, 0, activeId);
                    return newItems;
                });
            }
        }
    };
    
    const currentPrompt = SENTENCES[currentSentenceIndex].prompt;

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
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Instructions</AlertTitle>
                    <AlertDescription>{currentPrompt}</AlertDescription>
                </Alert>
                <SortableContext items={sentenceBox} strategy={rectSortingStrategy}>
                    <div 
                      id="sentence-box-container"
                      data-id="sentence-box-container"
                      className="p-4 border-2 border-dashed rounded-lg min-h-[100px] flex items-center justify-center gap-2 flex-wrap bg-background/50"
                    >
                        {sentenceBox.map(word => <SortableItem key={word} id={word} />)}
                    </div>
                </SortableContext>
                
                <SortableContext items={wordBank} strategy={rectSortingStrategy}>
                    <div 
                      id="word-bank-container"
                      data-id="word-bank-container"
                      className="p-4 bg-secondary rounded-lg min-h-[100px] flex items-center justify-center gap-2 flex-wrap"
                    >
                         {wordBank.map(word => <SortableItem key={word} id={word} />)}
                    </div>
                </SortableContext>

                {feedback && (
                  <Alert variant={feedback === 'correct' ? 'default' : 'destructive'} className={feedback === 'correct' ? 'bg-green-100 dark:bg-green-900/50 border-green-500' : ''}>
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
