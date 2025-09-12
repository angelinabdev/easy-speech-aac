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
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Info, Award } from 'lucide-react';

// --- SENTENCE BUILDER GAME ---

const SENTENCES = [
    // Original sentences
    { words: ["The", "dog", "runs"], correct: "The dog runs", prompt: "Drag the words to form the sentence that describes what the dog is doing." },
    { words: ["The", "cat", "sleeps"], correct: "The cat sleeps", prompt: "Arrange the words to show what the cat is doing." },
    { words: ["The", "bird", "flies"], correct: "The bird flies", prompt: "Put the words in order to say what the bird does." },
    { words: ["The", "fish", "swims"], correct: "The fish swims", prompt: "Build the sentence that tells what the fish is doing." },
    { words: ["The", "cow", "eats", "grass"], correct: "The cow eats grass", prompt: "Drag the words to form the sentence about the cow eating." },
    { words: ["I", "eat", "pizza"], correct: "I eat pizza", prompt: "Arrange the words to say what you are eating." },
    { words: ["I", "drink", "milk"], correct: "I drink milk", prompt: "Put the words in order to show what you are drinking." },
    { words: ["She", "eats", "an", "apple"], correct: "She eats an apple", prompt: "Drag the words to form the sentence about what she eats." },
    { words: ["He", "drinks", "water"], correct: "He drinks water", prompt: "Arrange the words to describe what he is drinking." },
    { words: ["We", "eat", "bread"], correct: "We eat bread", prompt: "Build the sentence showing what we eat." },
    { words: ["Mom", "is", "happy"], correct: "Mom is happy", prompt: "Drag the words to say how Mom feels." },
    { words: ["Dad", "is", "tired"], correct: "Dad is tired", prompt: "Arrange the words to show Dad’s feeling." },
    { words: ["The", "sister", "plays"], correct: "The sister plays", prompt: "Put the words in order to describe what the sister does." },
    { words: ["The", "brother", "jumps"], correct: "The brother jumps", prompt: "Build the sentence that tells what the brother is doing." },
    { words: ["The", "baby", "sleeps"], correct: "The baby sleeps", prompt: "Drag the words to say what the baby is doing." },
    { words: ["I", "read", "a", "book"], correct: "I read a book", prompt: "Arrange the words to form the sentence about reading." },
    { words: ["I", "play", "with", "the", "ball"], correct: "I play with the ball", prompt: "Put the words in order to say what you are playing with." },
    { words: ["The", "car", "is", "red"], correct: "The car is red", prompt: "Drag the words to form the sentence describing the car." },
    { words: ["The", "chair", "is", "big"], correct: "The chair is big", prompt: "Arrange the words to say something about the chair." },
    { words: ["I", "wear", "a", "hat"], correct: "I wear a hat", prompt: "Build the sentence that tells what you wear." },
    { words: ["I", "am", "happy"], correct: "I am happy", prompt: "Drag the words to say how you feel." },
    { words: ["I", "am", "sad"], correct: "I am sad", prompt: "Arrange the words to show your feeling." },
    { words: ["She", "is", "excited"], correct: "She is excited", prompt: "Put the words in order to describe how she feels." },
    { words: ["He", "is", "scared"], correct: "He is scared", prompt: "Build the sentence about his feeling." },
    { words: ["We", "are", "tired"], correct: "We are tired", prompt: "Drag the words to form the sentence about how we feel." },
    
    // New sentences
    { words: ["The", "rabbit", "hops"], correct: "The rabbit hops", prompt: "Describe what the rabbit is doing." },
    { words: ["The", "frog", "jumps"], correct: "The frog jumps", prompt: "What action does the frog take?" },
    { words: ["The", "squirrel", "climbs", "the", "tree"], correct: "The squirrel climbs the tree", prompt: "Where does the squirrel go?" },
    { words: ["The", "butterfly", "lands", "on", "the", "flower"], correct: "The butterfly lands on the flower", prompt: "What is the butterfly doing?" },
    { words: ["The", "bee", "collects", "nectar"], correct: "The bee collects nectar", prompt: "What does the bee get from the flower?" },
    { words: ["I", "eat", "strawberries"], correct: "I eat strawberries", prompt: "What fruit are you eating?" },
    { words: ["She", "drinks", "orange", "juice"], correct: "She drinks orange juice", prompt: "What is she drinking?" },
    { words: ["He", "likes", "chocolate"], correct: "He likes chocolate", prompt: "What sweet treat does he enjoy?" },
    { words: ["We", "bake", "a", "cake"], correct: "We bake a cake", prompt: "What are we making in the oven?" },
    { words: ["They", "eat", "sandwiches"], correct: "They eat sandwiches", prompt: "What are they having for lunch?" },
    { words: ["The", "teacher", "writes", "on", "the", "board"], correct: "The teacher writes on the board", prompt: "What is the teacher doing?" },
    { words: ["My", "friend", "sings", "a", "song"], correct: "My friend sings a song", prompt: "What is your friend doing?" },
    { words: ["The", "doctor", "helps", "the", "patient"], correct: "The doctor helps the patient", prompt: "How does a doctor help people?" },
    { words: ["The", "baby", "laughs", "loudly"], correct: "The baby laughs loudly", prompt: "What sound is the baby making?" },
    { words: ["Grandpa", "reads", "the", "newspaper"], correct: "Grandpa reads the newspaper", prompt: "What is Grandpa reading?" },
    { words: ["I", "open", "the", "door"], correct: "I open the door", prompt: "How do you enter a room?" },
    { words: ["She", "closes", "the", "window"], correct: "She closes the window", prompt: "What does she do when it's cold?" },
    { words: ["He", "paints", "a", "picture"], correct: "He paints a picture", prompt: "What is he creating with colors?" },
    { words: ["We", "ride", "the", "bicycle"], correct: "We ride the bicycle", prompt: "How do we travel on two wheels?" },
    { words: ["They", "build", "a", "tower"], correct: "They build a tower", prompt: "What are they making with blocks?" },
    { words: ["I", "feel", "sleepy"], correct: "I feel sleepy", prompt: "How do you feel before bed?" },
    { words: ["She", "feels", "surprised"], correct: "She feels surprised", prompt: "How does she feel when something unexpected happens?" },
    { words: ["He", "feels", "proud"], correct: "He feels proud", prompt: "How does he feel after winning?" },
    { words: ["We", "feel", "nervous"], correct: "We feel nervous", prompt: "How do we feel before a test?" },
    { words: ["They", "feel", "excited"], correct: "They feel excited", prompt: "How do they feel on their birthday?" },
    { words: ["Please", "sit", "here"], correct: "Please sit here", prompt: "Where should you ask someone to sit?" },
    { words: ["Can", "I", "have", "a", "pencil?"], correct: "Can I have a pencil?", prompt: "How do you ask for a pencil?" },
    { words: ["I", "like", "this", "game"], correct: "I like this game", prompt: "What do you say if you enjoy the game?" },
    { words: ["Let’s", "play", "together"], correct: "Let’s play together", prompt: "What can you say to ask someone to play?" },
    { words: ["Don’t", "touch", "that"], correct: "Don’t touch that", prompt: "What do you say when you don't want someone to touch something?" },
];

function shuffleArray(array: any[]) {
  return array.slice().sort(() => Math.random() - 0.5);
}

type SortableItemData = {
    id: string;
    text: string;
}

function SortableItem({ item }: { item: SortableItemData }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-2 px-4 bg-primary text-primary-foreground rounded-lg shadow cursor-grab touch-none select-none">
      {item.text}
    </div>
  );
}

function SentenceBuilderGame({ onGameComplete }: { onGameComplete: () => void }) {
    const [points, setPoints] = useLocalStorage('planner_points', 0);
    const [level, setLevel] = useLocalStorage('planner_level', 1);

    const [shuffledSentences, setShuffledSentences] = useLocalStorage('shuffled_sentences', []);
    const [currentSentenceIndex, setCurrentSentenceIndex] = useLocalStorage('sentence_builder_current_index', 0);

    const [items, setItems] = useState<SortableItemData[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        if (isInitialLoad) {
            setShuffledSentences(shuffleArray(SENTENCES));
            setIsInitialLoad(false);
        }
    }, [isInitialLoad, setShuffledSentences]);

    useEffect(() => {
        if (shuffledSentences.length > 0) {
            if (currentSentenceIndex >= shuffledSentences.length) {
                onGameComplete();
                // Reset for the next playthrough
                setCurrentSentenceIndex(0);
                setShuffledSentences(shuffleArray(SENTENCES));
            } else {
                const sentenceDef = shuffledSentences[currentSentenceIndex];
                setItems(shuffleArray(sentenceDef.words).map((word, i) => ({ id: `${word}_${i}`, text: word })));
                setFeedback(null);
            }
        }
    }, [shuffledSentences, currentSentenceIndex, onGameComplete, setCurrentSentenceIndex, setShuffledSentences]);

    const currentSentenceDef = shuffledSentences[currentSentenceIndex];
    
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
        const userAnswer = items.map(item => item.text).join(' ');
        if (userAnswer === currentSentenceDef.correct) {
            setFeedback('correct');
            setPoints(points + 20);
            
            setTimeout(() => {
                setCurrentSentenceIndex(currentSentenceIndex + 1);
            }, 1500);

        } else {
            setFeedback('incorrect');
            setPoints(Math.max(0, points - 10));
        }
    };
    
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
    
        if (over && active.id !== over.id) {
          setItems((currentItems) => {
            const oldIndex = currentItems.findIndex(item => item.id === active.id);
            const newIndex = currentItems.findIndex(item => item.id === over.id);
            return arrayMove(currentItems, oldIndex, newIndex);
          });
        }
    };
    
    if (!currentSentenceDef) return null; // Or a loading state

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
                <div className="text-center text-muted-foreground font-semibold">
                    Sentences Completed: {currentSentenceIndex} / {shuffledSentences.length}
                </div>
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Instructions</AlertTitle>
                    <AlertDescription>{currentSentenceDef.prompt}</AlertDescription>
                </Alert>
                
                <SortableContext items={items.map(i => i.id)} strategy={horizontalListSortingStrategy}>
                    <div id="word-bank-droppable" className="p-4 bg-secondary rounded-lg min-h-[100px] flex items-center justify-center gap-2 flex-wrap">
                         {items.map(item => <SortableItem key={item.id} item={item} />)}
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
  const [wins, setWins] = useLocalStorage('sentence_builder_wins', 0);
  const handleGameComplete = () => {
    setWins(w => w + 1);
  };
  return (
      <Card>
          <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Sentence Builder</CardTitle>
                <Badge variant="secondary" className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500"/> Wins: {wins}
                </Badge>
              </div>
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
                    <SentenceBuilderGame onGameComplete={handleGameComplete} />
                </DialogContent>
            </Dialog>
          </CardContent>
      </Card>
  );
}


// --- MAIN TAB COMPONENT ---

export default function GamesTab() {
  return (
    <div className="max-w-2xl mx-auto">
        <SentenceBuilder />
    </div>
  );
}
