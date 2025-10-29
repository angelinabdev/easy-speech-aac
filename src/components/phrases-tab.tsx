
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Star, Trash2, Volume2, Plus } from 'lucide-react';
import { Label } from './ui/label';
import { PhrasesData, Phrase, Favorite, getInitialData, PhraseUsageLog } from '@/lib/user-data';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

type Category = 'want' | 'need' | 'feel' | 'words';

interface PhraseListProps {
  type: Category;
  phrases: Phrase[];
  favorites: Favorite[];
  selectedVoice: string | null;
  onDataChange: (type: Category, newPhrrases: Phrase[]) => void;
  onFavoriteToggle: (text: string, type: Category) => void;
  onSpeak: (text: string, type: Category) => void;
}

const PhraseList = ({
  type,
  phrases,
  favorites,
  onDataChange,
  onFavoriteToggle,
  onSpeak,
}: PhraseListProps) => {
  const [newPhrase, setNewPhrase] = useState('');
  const [sort, setSort] = useState('az');
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const addPhrase = () => {
    if (newPhrase.trim() && !phrases.some(p => p.text.toLowerCase() === newPhrase.trim().toLowerCase())) {
      onDataChange(type, [...phrases, { text: newPhrase.trim(), usageCount: 0 }]);
      toast({
          title: "Phrase Added",
          description: `"${newPhrase.trim()}" has been added.`,
      });
      setNewPhrase('');
    }
  };
  
  const deletePhrase = (text: string) => {
    onDataChange(type, phrases.filter(p => p.text !== text));
  };
  
  const sortedAndFilteredPhrases = useMemo(() => {
    let result = [...phrases];
    if (search) {
        result = result.filter(p => p.text.toLowerCase().includes(search.toLowerCase()));
    }
    switch (sort) {
        case 'za': result.sort((a,b) => b.text.localeCompare(a.text)); break;
        case 'usage': result.sort((a,b) => (b.usageCount || 0) - (a.usageCount || 0)); break;
        default: result.sort((a,b) => a.text.localeCompare(a.text)); break;
    }
    return result;
  }, [phrases, sort, search]);

  return (
    <div className="space-y-4">
        <div className="flex gap-2">
            <Input placeholder={`Type a word or phrase to add...`} value={newPhrase} onChange={e => setNewPhrase(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPhrase()} />
            <Button onClick={addPhrase} aria-label="Add new phrase"><Plus className="h-4 w-4"/></Button>
        </div>
        <div className="flex gap-2">
             <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="az">A-Z</SelectItem>
                    <SelectItem value="za">Z-A</SelectItem>
                    <SelectItem value="usage">Most Used</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
            {sortedAndFilteredPhrases.map((phrase) => (
                <div key={`${phrase.text}-${type}`} className="flex items-center justify-between p-2 rounded-md bg-secondary group">
                    <button onClick={() => onSpeak(phrase.text, type)} className="flex-grow text-left flex items-center gap-2 transition-transform active:scale-[0.98]" aria-label={`Speak phrase: I ${type} ${phrase.text}`}>
                        <Volume2 className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="flex-grow">{phrase.text}</span>
                    </button>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onFavoriteToggle(phrase.text, type)} className="transition-transform active:scale-95" aria-label={`Favorite phrase: ${phrase.text}`}>
                            <Star className={`h-4 w-4 ${favorites.some(f => f.text === phrase.text && f.type === type) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="transition-transform active:scale-95" aria-label={`Delete phrase: ${phrase.text}`}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete "{phrase.text}".
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deletePhrase(phrase.text)}>
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

interface PhrasesTabProps {
    phrasesData: PhrasesData;
    onUpdate: (newData: Partial<PhrasesData>) => void;
}

export default function PhrasesTab({ phrasesData = getInitialData().phrases, onUpdate }: PhrasesTabProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const handlePhraseDataChange = useCallback((updatedPhrasesData: Partial<PhrasesData>) => {
      onUpdate(updatedPhrasesData);
  }, [onUpdate]);
  
  const handlePhraseListChange = useCallback((type: Category, newPhrases: Phrase[]) => {
      handlePhraseDataChange({ [type]: newPhrases });
  }, [handlePhraseDataChange]);
  
  const toggleFavorite = useCallback((text: string, type: Category) => {
    const currentFavorites = phrasesData.favorites ?? [];
    const isAlreadyFavorite = currentFavorites.some(fav => fav.text === text && fav.type === type);

    let newFavorites: Favorite[];
    if (isAlreadyFavorite) {
      newFavorites = currentFavorites.filter(fav => fav.text !== text || fav.type !== type);
    } else {
      newFavorites = [...currentFavorites, { text, type }];
    }
    
    handlePhraseDataChange({ favorites: newFavorites });
  }, [phrasesData.favorites, handlePhraseDataChange]);


  const handleVoiceChange = (voiceURI: string) => {
      handlePhraseDataChange({ selectedVoiceURI: voiceURI });
  };

  const speakAndLog = (text: string, type: Category) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const textToSpeak = type === 'words' ? text : `I ${type} ${text}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (phrasesData.selectedVoiceURI) {
        const voice = voices.find(v => v.voiceURI === phrasesData.selectedVoiceURI);
        if (voice) {
            utterance.voice = voice;
        }
    }
    window.speechSynthesis.speak(utterance);
    
    // Log usage
    const newLogEntry: PhraseUsageLog = { text, type, timestamp: new Date().toISOString() };
    const updatedLog = [...(phrasesData.phraseUsageLog || []), newLogEntry];

    // Also update usage count for sorting
    const phraseList = phrasesData[type] || [];
    const updatedPhrases = phraseList.map(p => 
        p.text === text ? { ...p, usageCount: (p.usageCount || 0) + 1 } : p
    );
    
    handlePhraseDataChange({
        phraseUsageLog: updatedLog,
        [type]: updatedPhrases
    });
  }
  
  const excludedVoiceNames = [
    "zarvox", "wobble", "whisper", "trinoids", "shelley", "sandy", 
    "rocko", "reed", "ralph", "organ", "kathy", "junior", "karen", 
    "jester", "grandpa", "grandma", "good news", "flo", "eddy", 
    "cellos", "bubbles", "boing", "bells", "bahh", "bad news", "albert",
    "superstar", "rishi", "fred"
  ];

  useEffect(() => {
    const loadVoices = () => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      let availableVoices = window.speechSynthesis.getVoices()
        .filter(voice => voice.lang.startsWith('en'))
        .filter(voice => !excludedVoiceNames.some(excluded => voice.name.toLowerCase().includes(excluded)));
      
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        if(!phrasesData.selectedVoiceURI || !availableVoices.some(v => v.voiceURI === phrasesData.selectedVoiceURI)) {
            const defaultVoice = availableVoices.find(v => v.default)?.voiceURI || availableVoices[0]?.voiceURI;
            if (defaultVoice) {
                handleVoiceChange(defaultVoice);
            }
        }
      }
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
    
    return () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
           window.speechSynthesis.onvoiceschanged = null;
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClearFavorites = () => {
    handlePhraseDataChange({ favorites: [] });
  };
  
  const currentFavorites = phrasesData.favorites ?? [];
  const uniqueFavorites = Array.from(new Map(currentFavorites.map(fav => [`${fav.text}-${fav.type}`, fav])).values());

  const favoriteWants = uniqueFavorites.filter(f => f.type === 'want');
  const favoriteNeeds = uniqueFavorites.filter(f => f.type === 'need');
  const favoriteFeels = uniqueFavorites.filter(f => f.type === 'feel');
  const favoriteWords = uniqueFavorites.filter(f => f.type === 'words');

  return (
    <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader><CardTitle className="text-3xl">My Phrases & Words</CardTitle></CardHeader>
                <CardContent>
                    <Tabs defaultValue="want">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="want">Want</TabsTrigger>
                            <TabsTrigger value="need">Need</TabsTrigger>
                            <TabsTrigger value="feel">Feel</TabsTrigger>
                            <TabsTrigger value="words">Words</TabsTrigger>
                        </TabsList>
                        <TabsContent value="want" className="mt-4">
                            <PhraseList type="want" phrases={phrasesData.want || []} favorites={phrasesData.favorites ?? []} onDataChange={handlePhraseListChange} onFavoriteToggle={toggleFavorite} selectedVoice={phrasesData.selectedVoiceURI} onSpeak={speakAndLog} />
                        </TabsContent>
                        <TabsContent value="need" className="mt-4">
                             <PhraseList type="need" phrases={phrasesData.need || []} favorites={phrasesData.favorites ?? []} onDataChange={handlePhraseListChange} onFavoriteToggle={toggleFavorite} selectedVoice={phrasesData.selectedVoiceURI} onSpeak={speakAndLog}/>
                        </TabsContent>
                        <TabsContent value="feel" className="mt-4">
                             <PhraseList type="feel" phrases={phrasesData.feel || []} favorites={phrasesData.favorites ?? []} onDataChange={handlePhraseListChange} onFavoriteToggle={toggleFavorite} selectedVoice={phrasesData.selectedVoiceURI} onSpeak={speakAndLog}/>
                        </TabsContent>
                         <TabsContent value="words" className="mt-4">
                             <PhraseList type="words" phrases={phrasesData.words || []} favorites={phrasesData.favorites ?? []} onDataChange={handlePhraseListChange} onFavoriteToggle={toggleFavorite} selectedVoice={phrasesData.selectedVoiceURI} onSpeak={speakAndLog}/>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Custom Voice</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="voice-select">Select a Voice</Label>
                        <Select onValueChange={handleVoiceChange} value={phrasesData.selectedVoiceURI ?? ""}>
                            <SelectTrigger id="voice-select">
                                <SelectValue placeholder="Select a voice" />
                            </SelectTrigger>
                            <SelectContent>
                                {voices.map(voice => (
                                    <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                                        {voice.name} ({voice.lang})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <CardTitle className="mb-2 sm:mb-0">Favorites</CardTitle>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={currentFavorites.length === 0} aria-label="Clear all favorite phrases">
                                    <Trash2 className="h-4 w-4 mr-1"/> Clear
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will clear all of your favorites.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClearFavorites}>Clear</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>
                <CardContent className="max-h-[calc(100vh-18rem)] overflow-y-auto space-y-2 pr-4">
                    {uniqueFavorites.length === 0 ? (<p className="text-muted-foreground text-sm">No favorites yet. Click the star next to an item to add it here.</p>) : (
                      <>
                        {favoriteWants.length > 0 && <h4 className="font-semibold text-sm text-muted-foreground">Want</h4>}
                        {favoriteWants.map((fav) => <p key={`${fav.text}-${fav.type}`} className="p-2 bg-secondary rounded-md cursor-pointer text-sm transition-transform active:scale-[0.98]" onClick={() => speakAndLog(fav.text, 'want')}>{fav.text}</p>)}
                        
                        {favoriteNeeds.length > 0 && <h4 className="font-semibold text-sm text-muted-foreground mt-2">Need</h4>}
                        {favoriteNeeds.map((fav) => <p key={`${fav.text}-${fav.type}`} className="p-2 bg-secondary rounded-md cursor-pointer text-sm transition-transform active:scale-[0.98]" onClick={() => speakAndLog(fav.text, 'need')}>{fav.text}</p>)}
                        
                        {favoriteFeels.length > 0 && <h4 className="font-semibold text-sm text-muted-foreground mt-2">Feel</h4>}
                        {favoriteFeels.map((fav) => <p key={`${fav.text}-${fav.type}`} className="p-2 bg-secondary rounded-md cursor-pointer text-sm transition-transform active:scale-[0.98]" onClick={() => speakAndLog(fav.text, 'feel')}>{fav.text}</p>)}

                        {favoriteWords.length > 0 && <h4 className="font-semibold text-sm text-muted-foreground mt-2">Words</h4>}
                        {favoriteWords.map((fav) => <p key={`${fav.text}-${fav.type}`} className="p-2 bg-secondary rounded-md cursor-pointer text-sm transition-transform active:scale-[0.98]" onClick={() => speakAndLog(fav.text, 'words')}>{fav.text}</p>)}
                      </>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

    