
"use client";

import { useState, useEffect, useCallback } from 'react';
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
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Info, Award, CheckCircle, Loader2, Lightbulb } from 'lucide-react';
import { PlannerData, GamesData, ALL_EMOTIONS, EMOTION_DEFINITIONS, Emotion } from '@/lib/user-data';


// --- EMOTION MATCH GAME ---
const EMOTION_ROUND_LENGTH = 4;
const EMOTION_TOTAL_ROUNDS = 3;


function shuffleArray<T>(array: T[]): T[] {
  return array.slice().sort(() => Math.random() - 0.5);
}

interface EmotionMatchGameProps {
    gamesData: GamesData;
    onGameUpdate: (updatedData: Partial<GamesData>) => void;
}

function EmotionMatchGame({ gamesData, onGameUpdate }: EmotionMatchGameProps) {
    const { emotionMatchCurrentSentence = 0, emotionMatchUsed = [], emotionMatchCheckpoints = 0 } = gamesData;

    const [currentRoundEmotions, setCurrentRoundEmotions] = useState<Emotion[]>([]);
    const [currentEmotionIndex, setCurrentEmotionIndex] = useState(emotionMatchCurrentSentence);

    const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
    const [options, setOptions] = useState<Emotion[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [showNext, setShowNext] = useState(false);
    const [isRoundOver, setIsRoundOver] = useState(false);
    const [isGameWon, setIsGameWon] = useState(false);
    const [explanation, setExplanation] = useState<string | null>(null);

    useEffect(() => {
        setCurrentEmotionIndex(gamesData.emotionMatchCurrentSentence || 0);
    }, [gamesData.emotionMatchCurrentSentence]);


    const startNewRound = useCallback((isInitialLoad = false) => {
        let availableEmotions = ALL_EMOTIONS.filter(s => !emotionMatchUsed.includes(s.name));
        
        if (availableEmotions.length < EMOTION_ROUND_LENGTH) {
            onGameUpdate({ emotionMatchUsed: [] });
            availableEmotions = ALL_EMOTIONS;
        }

        const roundEmotions = shuffleArray(availableEmotions).slice(0, EMOTION_ROUND_LENGTH);
        setCurrentRoundEmotions(roundEmotions);
        
        if (!isInitialLoad) {
            setCurrentEmotionIndex(0);
            onGameUpdate({ emotionMatchCurrentSentence: 0 });
        }

        setIsRoundOver(false);
        setIsGameWon(false);
        setFeedback(null);
        setExplanation(null);
        setShowNext(false);
    }, [emotionMatchUsed, onGameUpdate]);

    useEffect(() => {
        startNewRound(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    useEffect(() => {
        if (currentRoundEmotions.length > 0 && currentEmotionIndex < currentRoundEmotions.length) {
            const correctAnswer = currentRoundEmotions[currentEmotionIndex];
            setCurrentEmotion(correctAnswer);

            const wrongAnswers = shuffleArray(ALL_EMOTIONS.filter(e => e.name !== correctAnswer.name)).slice(0, 3);
            setOptions(shuffleArray([correctAnswer, ...wrongAnswers]));
            setFeedback(null);
            setExplanation(null);
            setShowNext(false);
        }
    }, [currentRoundEmotions, currentEmotionIndex]);

     const handleNextStep = () => {
        const newEmotionIndex = currentEmotionIndex + 1;
        
        if (newEmotionIndex >= currentRoundEmotions.length) {
            // Round is over
            const newCheckpoints = emotionMatchCheckpoints + 1;
            const didWin = newCheckpoints >= EMOTION_TOTAL_ROUNDS;
            
            setIsGameWon(didWin);
            setIsRoundOver(true);
            
            const newUsedEmotions = [...emotionMatchUsed, ...currentRoundEmotions.map(s => s.name)];
            
            const updatedData = { 
                emotionMatchCheckpoints: didWin ? 0 : newCheckpoints,
                emotionMatchWins: didWin ? (gamesData.emotionMatchWins ?? 0) + 1 : (gamesData.emotionMatchWins ?? 0),
                emotionMatchUsed: didWin ? [] : newUsedEmotions,
                emotionMatchCurrentSentence: 0,
            };

            onGameUpdate(updatedData);
        } else {
            setCurrentEmotionIndex(newEmotionIndex);
            onGameUpdate({ emotionMatchCurrentSentence: newEmotionIndex });
        }
    };


    const handleAnswer = (emotionName: string) => {
        if (feedback === 'correct') return;

        if (emotionName === currentEmotion?.name) {
            setFeedback('correct');
            setTimeout(() => setShowNext(true), 500);
        } else {
            setFeedback('incorrect');
        }
    };
    
    const handlePlayAgain = () => {
         const updatedData = {
            emotionMatchCheckpoints: 0,
            emotionMatchWins: gamesData.emotionMatchWins, // Keep the wins
            emotionMatchUsed: [],
            emotionMatchCurrentSentence: 0,
        };
        onGameUpdate(updatedData);
        startNewRound();
    };

    const handleExplainEmotion = () => {
        if (!currentEmotion) return;
        const definition = EMOTION_DEFINITIONS[currentEmotion.name];
        setExplanation(definition || "Sorry, I don't have a definition for this feeling.");
    };

    const handleStartNextRound = () => {
        startNewRound();
    };

    if (isRoundOver) {
        if (isGameWon) {
            return (
                <div className="text-center space-y-4 py-8">
                    <Award className="h-16 w-16 text-yellow-500 mx-auto"/>
                    <h2 className="text-2xl font-bold">You're a Winner!</h2>
                    <p className="text-muted-foreground">You completed all {EMOTION_TOTAL_ROUNDS} checkpoints. Fantastic work!</p>
                    <Button onClick={handlePlayAgain}>Play Again</Button>
                </div>
            )
        }
        return (
            <div className="text-center space-y-4 py-8">
                <CheckCircle className="h-16 w-16 text-blue-500 mx-auto"/>
                <h2 className="text-2xl font-bold">Checkpoint Reached! ({emotionMatchCheckpoints}/{EMOTION_TOTAL_ROUNDS})</h2>
                <p className="text-muted-foreground">You finished the round. Keep up the great work!</p>
                <Button onClick={handleStartNextRound}>Start Next Round</Button>
            </div>
        )
    }

    if (!currentEmotion) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    
    return (
        <div className="space-y-4">
            <div className="flex justify-around text-muted-foreground font-semibold">
                <span>Emotion: {currentEmotionIndex + 1} / {currentRoundEmotions.length}</span>
                <span>Checkpoint: {emotionMatchCheckpoints} / {EMOTION_TOTAL_ROUNDS}</span>
            </div>

            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Which face is feeling <span className="font-bold">{currentEmotion.name}</span>?</AlertTitle>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
                {options.map(option => (
                    <Button key={option.name} variant="outline" className="h-24 text-4xl flex-col gap-2" onClick={() => handleAnswer(option.name)}>
                        {option.emoji}
                    </Button>
                ))}
            </div>

            {feedback && (
                 <Alert variant={feedback === 'incorrect' ? 'destructive' : 'default'} className={feedback !== 'incorrect' ? 'bg-green-100 dark:bg-green-900/50 border-green-500' : ''}>
                    <AlertTitle>{
                       feedback === 'correct' ? 'Great Job!' : 'Not Quite'
                    }</AlertTitle>
                    <AlertDescription>
                        {feedback === 'correct' ? `That's right! You found it.` : 'Try again. Which face looks different?'}
                    </AlertDescription>
                </Alert>
            )}

            {showNext && (
                <div className="flex gap-2">
                    <Button onClick={handleExplainEmotion} className="w-full">
                        <Lightbulb className="mr-2 h-4 w-4"/>
                        Explain
                    </Button>
                    <Button onClick={handleNextStep} className="w-full">
                        Next
                    </Button>
                </div>
            )}
            
            {explanation && (
                <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>What does "{currentEmotion?.name}" mean?</AlertTitle>
                    <AlertDescription>{explanation}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}

interface EmotionMatchCardProps {
    gamesData: GamesData;
    onGameUpdate: (updatedData: Partial<GamesData>) => void;
}

function EmotionMatchCard({ gamesData, onGameUpdate }: EmotionMatchCardProps) {
    const { emotionMatchWins = 0, emotionMatchCheckpoints = 0 } = gamesData;
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Emotion Match</CardTitle>
                    <div className="flex gap-4">
                      <Badge variant="secondary" className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500"/> Checkpoints: {emotionMatchCheckpoints}/{EMOTION_TOTAL_ROUNDS}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-500"/> Wins: {emotionMatchWins}
                      </Badge>
                    </div>
                </div>
                <CardDescription>Match the word to the correct face. Click "Explain" to learn more about a feeling.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full mt-auto">Play Now</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Emotion Match</DialogTitle>
                        </DialogHeader>
                        {isOpen && <EmotionMatchGame 
                            gamesData={gamesData}
                            onGameUpdate={onGameUpdate}
                        />}
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}

// --- SENTENCE BUILDER GAME ---

const ALL_SENTENCES = [
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

const ROUND_LENGTH = 11;
const TOTAL_ROUNDS = 5;

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

interface SentenceBuilderGameProps {
    gamesData: GamesData;
    onGameUpdate: (updatedData: Partial<GamesData>) => void;
}

function SentenceBuilderGame({ gamesData, onGameUpdate }: SentenceBuilderGameProps) {
    const { sentenceBuilderCurrentSentence = 0, sentenceBuilderUsed = [], sentenceBuilderCheckpoints = 0 } = gamesData;
    
    const [currentRoundSentences, setCurrentRoundSentences] = useState<(typeof ALL_SENTENCES[0])[]>([]);
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(sentenceBuilderCurrentSentence);

    const [items, setItems] = useState<SortableItemData[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [isRoundOver, setIsRoundOver] = useState(false);
    const [isWin, setIsWin] = useState(false);

    useEffect(() => {
        setCurrentSentenceIndex(gamesData.sentenceBuilderCurrentSentence || 0);
    }, [gamesData.sentenceBuilderCurrentSentence]);
    
    const startNewRound = useCallback((isInitialLoad = false) => {
        let availableSentences = ALL_SENTENCES.filter(s => !sentenceBuilderUsed.includes(s.correct));
        
        if (availableSentences.length < ROUND_LENGTH) {
            onGameUpdate({ sentenceBuilderUsed: [] });
            availableSentences = ALL_SENTENCES;
        }

        const roundSentences = shuffleArray(availableSentences).slice(0, ROUND_LENGTH);
        setCurrentRoundSentences(roundSentences);
        
        if (!isInitialLoad) {
            const newSentenceIndex = 0;
            setCurrentSentenceIndex(newSentenceIndex);
            onGameUpdate({ sentenceBuilderCurrentSentence: newSentenceIndex });
        }
        
        setIsRoundOver(false);
        setIsWin(false);
    }, [sentenceBuilderUsed, onGameUpdate]);


    useEffect(() => {
        startNewRound(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const handleNextSentence = useCallback(() => {
        const newSentenceIndex = currentSentenceIndex + 1;
        
        if (newSentenceIndex >= currentRoundSentences.length) {
            const newCheckpoints = sentenceBuilderCheckpoints + 1;
            const didWin = newCheckpoints >= TOTAL_ROUNDS;
            
            setIsWin(didWin);
            setIsRoundOver(true);
            
            const newUsedSentences = [...sentenceBuilderUsed, ...currentRoundSentences.map(s => s.correct)];

            const updatedData = { 
                sentenceBuilderCheckpoints: didWin ? 0 : newCheckpoints,
                sentenceBuilderWins: didWin ? (gamesData.sentenceBuilderWins ?? 0) + 1 : (gamesData.sentenceBuilderWins ?? 0),
                sentenceBuilderUsed: didWin ? [] : newUsedSentences,
                sentenceBuilderCurrentSentence: 0 
            };
            onGameUpdate(updatedData);
        } else {
            setCurrentSentenceIndex(newSentenceIndex);
            onGameUpdate({ sentenceBuilderCurrentSentence: newSentenceIndex });
        }
    }, [currentSentenceIndex, currentRoundSentences, onGameUpdate, gamesData, sentenceBuilderCheckpoints, sentenceBuilderUsed]);

    useEffect(() => {
        if (currentRoundSentences.length > 0 && currentSentenceIndex < currentRoundSentences.length) {
            const sentenceDef = currentRoundSentences[currentSentenceIndex];
            setItems(shuffleArray(sentenceDef.words).map((word, i) => ({ id: `${word}_${i}`, text: word })));
            setFeedback(null);
        }
    }, [currentRoundSentences, currentSentenceIndex]);
    
    const currentSentenceDef = currentRoundSentences[currentSentenceIndex];
    
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const checkSentence = () => {
        if (isRoundOver) return;
        const userAnswer = items.map(item => item.text).join(' ');
        if (userAnswer === currentSentenceDef.correct) {
            setFeedback('correct');
            setTimeout(() => {
                handleNextSentence();
            }, 1500);

        } else {
            setFeedback('incorrect');
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

    const handlePlayAgain = () => {
        const resetData = {
            sentenceBuilderWins: gamesData.sentenceBuilderWins, // Keep the wins
            sentenceBuilderCheckpoints: 0,
            sentenceBuilderUsed: [],
            sentenceBuilderCurrentSentence: 0,
        };
        onGameUpdate(resetData);
        startNewRound();
    };

    const handleStartNextRound = () => {
        startNewRound();
    };
    
    if (isRoundOver) {
      if (isWin) {
        return (
          <div className="text-center space-y-4 py-8">
              <Award className="h-16 w-16 text-yellow-500 mx-auto"/>
              <h2 className="text-2xl font-bold">You're a Winner!</h2>
              <p className="text-muted-foreground">You completed all {TOTAL_ROUNDS} checkpoints. Fantastic work!</p>
              <Button onClick={handlePlayAgain}>Play Again</Button>
          </div>
        )
      }
      return (
          <div className="text-center space-y-4 py-8">
              <CheckCircle className="h-16 w-16 text-blue-500 mx-auto"/>
              <h2 className="text-2xl font-bold">Checkpoint Reached! ({sentenceBuilderCheckpoints}/{TOTAL_ROUNDS})</h2>
              <p className="text-muted-foreground">You finished the round. Keep up the great work!</p>
              <Button onClick={handleStartNextRound}>Start Next Round</Button>
          </div>
      )
    }

    if (!currentSentenceDef) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="space-y-4">
                <div className="flex justify-around text-muted-foreground font-semibold">
                    <span>Sentence: {currentSentenceIndex + 1} / {currentRoundSentences.length}</span>
                    <span>Checkpoint: {sentenceBuilderCheckpoints} / {TOTAL_ROUNDS}</span>
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

interface SentenceBuilderCardProps {
    gamesData: GamesData;
    onGameUpdate: (updatedData: Partial<GamesData>) => void;
}

function SentenceBuilderCard({ gamesData, onGameUpdate }: SentenceBuilderCardProps) {
    const { sentenceBuilderWins = 0, sentenceBuilderCheckpoints = 0 } = gamesData;
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Sentence Builder</CardTitle>
                  <div className="flex gap-4">
                    <Badge variant="secondary" className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500"/> Checkpoints: {sentenceBuilderCheckpoints}/{TOTAL_ROUNDS}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-500"/> Wins: {sentenceBuilderWins}
                    </Badge>
                  </div>
                </div>
                <CardDescription>Drag and drop words to build simple sentences.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                      <Button className="w-full mt-auto">Play Now</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                      <DialogHeader>
                          <DialogTitle>Build a Sentence</DialogTitle>
                      </DialogHeader>
                      {isOpen && <SentenceBuilderGame 
                          gamesData={gamesData}
                          onGameUpdate={onGameUpdate}
                      />}
                  </DialogContent>
              </Dialog>
            </CardContent>
        </Card>
    );
}


// --- MAIN TAB COMPONENT ---
interface GamesTabProps {
    plannerData: PlannerData;
    gamesData: GamesData;
    onUpdateGames: (newData: Partial<GamesData>) => void;
    onUpdatePlanner: (newData: Partial<PlannerData>) => void;
}
export default function GamesTab({ plannerData, gamesData, onUpdateGames, onUpdatePlanner }: GamesTabProps) {

  const handleGameUpdate = useCallback((updatedData: Partial<GamesData>) => {
    onUpdateGames({ ...gamesData, ...updatedData });
  }, [gamesData, onUpdateGames]);

  return (
    <div className="grid grid-cols-1 gap-6">
        <SentenceBuilderCard 
            gamesData={gamesData}
            onGameUpdate={handleGameUpdate}
        />
        <EmotionMatchCard 
            gamesData={gamesData}
            onGameUpdate={handleGameUpdate}
        />
    </div>
  );
}

    

    