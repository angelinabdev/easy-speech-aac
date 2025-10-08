
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Star, Trash2, Volume2, Plus } from 'lucide-react';
import { Label } from './ui/label';
import { PhrasesData, Phrase, Favorite } from '@/lib/user-data';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

type Category = 'want' | 'need' | 'feel' | 'words';

interface PhraseListProps {
  type: Category;
  phrases: Phrase[];
  favorites: Favorite[];
  selectedVoice: string | null;
  onDataChange: (type: Category, newPhrases: Phrase[]) => void;
  onFavoriteToggle: (text: string, type: Category) => void;
}

const PhraseList = ({
  type,
  phrases,
  favorites,
  selectedVoice,
  onDataChange,
  onFavoriteToggle
}: PhraseListProps) => {
  const [newPhrase, setNewPhrase] = useState('');
  const [sort, setSort] = useState('az');
  const [search, setSearch] = useState('');

  const addPhrase = () => {
    if (newPhrase.trim() && !phrases.some(p => p.text === newPhrase.trim())) {
      onDataChange(type, [...phrases, { text: newPhrase.trim(), usageCount: 0 }]);
      setNewPhrase('');
    }
  };
  
  const deletePhrase = (text: string) => {
    onDataChange(type, phrases.filter(p => p.text !== text));
  };
  
  const speakText = (text: string) => {
    const textToSpeak = type === 'words' ? text : `I ${type} ${text}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (selectedVoice) {
        const voice = window.speechSynthesis.getVoices().find(v => v.voiceURI === selectedVoice);
        if (voice) {
            utterance.voice = voice;
        }
    }
    window.speechSynthesis.speak(utterance);
    const updatedPhrases = phrases.map(p => p.text === text ? {...p, usageCount: p.usageCount + 1} : p);
    onDataChange(type, updatedPhrases);
  };

  const sortedAndFilteredPhrases = useMemo(() => {
    let result = [...phrases];
    if (search) {
        result = result.filter(p => p.text.toLowerCase().includes(search.toLowerCase()));
    }
    switch (sort) {
        case 'za': result.sort((a,b) => b.text.localeCompare(a.text)); break;
        case 'usage': result.sort((a,b) => b.usageCount - a.usageCount); break;
        default: result.sort((a,b) => a.text.localeCompare(a.text)); break;
    }
    return result;
  }, [phrases, sort, search]);

  return (
    <div className="space-y-4">
        <div className="flex gap-2">
            <Input placeholder={`Add a new word or phrase...`} value={newPhrase} onChange={e => setNewPhrase(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPhrase()} />
            <Button onClick={addPhrase}><Plus className="h-4 w-4"/></Button>
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
                <div key={phrase.text} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                    <span>{phrase.text}</span>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => speakText(phrase.text)}><Volume2 className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon" onClick={() => onFavoriteToggle(phrase.text, type)}>
                            <Star className={`h-4 w-4 ${favorites.some(f => f.text === phrase.text && f.type === type) ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive"/></Button>
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
    onUpdate: (newData: PhrasesData) => void;
}

export default function PhrasesTab({ phrasesData, onUpdate }: PhrasesTabProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [activeTab, setActiveTab] = useState('want');

  const handlePhraseListChange = (type: Category, newPhrases: Phrase[]) => {
      onUpdate({ ...phrasesData, [type]: newPhrases });
  };
  
  const toggleFavorite = (text: string, type: Category) => {
    const favorites = phrasesData.favorites ?? [];
    const isFav = favorites.some(fav => fav.text === text && fav.type === type);
    let newFavorites: Favorite[];
    if(isFav) {
        newFavorites = favorites.filter(fav => fav.text !== text || fav.type !== type);
    } else {
        newFavorites = [...favorites, { text, type }];
    }
    onUpdate({ ...phrasesData, favorites: newFavorites });
  };

  const handleVoiceChange = (voiceURI: string) => {
      onUpdate({ ...phrasesData, selectedVoiceURI: voiceURI });
  };

  const speakFavorite = (text: string, type: Category) => {
    const textToSpeak = type === 'words' ? text : `I ${type} ${text}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (phrasesData.selectedVoiceURI) {
        const voice = voices.find(v => v.voiceURI === phrasesData.selectedVoiceURI);
        if (voice) {
            utterance.voice = voice;
        }
    }
    window.speechSynthesis.speak(utterance);
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
      window.speechSynthesis.onvoiceschanged = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClearFavorites = () => {
    onUpdate({ ...phrasesData, favorites: [] });
  };
  
  const currentFavorites = phrasesData.favorites ?? [];
  const favoriteWants = currentFavorites.filter(f => f.type === 'want');
  const favoriteNeeds = currentFavorites.filter(f => f.type === 'need');
  const favoriteFeels = currentFavorites.filter(f => f.type === 'feel');
  const favoriteWords = currentFavorites.filter(f => f.type === 'words');

  return (
    <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle>My Phrases & Words</CardTitle></CardHeader>
                <CardContent>
                    <Tabs defaultValue="want" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="want">Want</TabsTrigger>
                            <TabsTrigger value="need">Need</TabsTrigger>
                            <TabsTrigger value="feel">Feel</TabsTrigger>
                            <TabsTrigger value="words">Single Words</TabsTrigger>
                        </TabsList>
                        <TabsContent value="want" className="mt-4">
                            <PhraseList type="want" phrases={phrasesData.want} favorites={currentFavorites} onDataChange={handlePhraseListChange} onFavoriteToggle={toggleFavorite} selectedVoice={phrasesData.selectedVoiceURI} />
                        </TabsContent>
                        <TabsContent value="need" className="mt-4">
                             <PhraseList type="need" phrases={phrasesData.need} favorites={currentFavorites} onDataChange={handlePhraseListChange} onFavoriteToggle={toggleFavorite} selectedVoice={phrasesData.selectedVoiceURI}/>
                        </TabsContent>
                        <TabsContent value="feel" className="mt-4">
                             <PhraseList type="feel" phrases={phrasesData.feel} favorites={currentFavorites} onDataChange={handlePhraseListChange} onFavoriteToggle={toggleFavorite} selectedVoice={phrasesData.selectedVoiceURI}/>
                        </TabsContent>
                         <TabsContent value="words" className="mt-4">
                             <PhraseList type="words" phrases={phrasesData.words} favorites={currentFavorites} onDataChange={handlePhraseListChange} onFavoriteToggle={toggleFavorite} selectedVoice={phrasesData.selectedVoiceURI}/>
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
                    <div className="flex justify-between items-center">
                        <CardTitle>⭐ Favorites</CardTitle>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={currentFavorites.length === 0}>
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
                <CardContent className="max-h-96 overflow-y-auto space-y-2 pr-4">
                    {currentFavorites.length === 0 ? (<p className="text-muted-foreground text-sm">No favorites yet. Click the star next to an item to add it here.</p>) : (
                      <>
                        {favoriteWants.length > 0 && <h4 className="font-semibold text-sm text-muted-foreground">Want</h4>}
                        {favoriteWants.map(fav => <p key={`${fav.text}-want`} className="p-2 bg-secondary rounded-md cursor-pointer text-sm" onClick={() => speakFavorite(fav.text, 'want')}>{fav.text}</p>)}
                        
                        {favoriteNeeds.length > 0 && <h4 className="font-semibold text-sm text-muted-foreground mt-2">Need</h4>}
                        {favoriteNeeds.map(fav => <p key={`${fav.text}-need`} className="p-2 bg-secondary rounded-md cursor-pointer text-sm" onClick={() => speakFavorite(fav.text, 'need')}>{fav.text}</p>)}
                        
                        {favoriteFeels.length > 0 && <h4 className="font-semibold text-sm text-muted-foreground mt-2">Feel</h4>}
                        {favoriteFeels.map(fav => <p key={`${fav.text}-feel`} className="p-2 bg-secondary rounded-md cursor-pointer text-sm" onClick={() => speakFavorite(fav.text, 'feel')}>{fav.text}</p>)}

                        {favoriteWords.length > 0 && <h4 className="font-semibold text-sm text-muted-foreground mt-2">Words</h4>}
                        {favoriteWords.map(fav => <p key={`${fav.text}-words`} className="p-2 bg-secondary rounded-md cursor-pointer text-sm" onClick={() => speakFavorite(fav.text, 'words')}>{fav.text}</p>)}
                      </>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

    