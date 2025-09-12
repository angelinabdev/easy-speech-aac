"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Star, Trash2, Volume2, Plus, X } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Label } from './ui/label';

type Phrase = { text: string; usageCount: number };
type Favorite = { text: string; type: 'want' | 'need' | 'feel' };
type Category = 'want' | 'need' | 'feel';

const PhraseList = ({
  type,
  phrases,
  setPhrases,
  favorites,
  toggleFavorite,
  selectedVoice
}: {
  type: Category,
  phrases: Phrase[],
  setPhrases: (phrases: Phrase[]) => void,
  favorites: Favorite[],
  toggleFavorite: (text: string, type: Category) => void,
  selectedVoice: string | undefined
}) => {
  const [newPhrase, setNewPhrase] = useState('');
  const [sort, setSort] = useState('az');
  const [search, setSearch] = useState('');

  const addPhrase = () => {
    if (newPhrase.trim() && !phrases.some(p => p.text === newPhrase.trim())) {
      setPhrases([...phrases, { text: newPhrase.trim(), usageCount: 0 }]);
      setNewPhrase('');
    }
  };
  
  const deletePhrase = (text: string) => {
    setPhrases(phrases.filter(p => p.text !== text));
  };
  
  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(`I ${type} ${text}`);
    if (selectedVoice) {
        const voice = window.speechSynthesis.getVoices().find(v => v.voiceURI === selectedVoice);
        if (voice) {
            utterance.voice = voice;
        }
    }
    window.speechSynthesis.speak(utterance);
    const updatedPhrases = phrases.map(p => p.text === text ? {...p, usageCount: p.usageCount + 1} : p);
    setPhrases(updatedPhrases);
  };

  const sortedAndFilteredPhrases = useMemo(() => {
    let result = [...phrases];
    if (search) {
        result = result.filter(p => p.text.toLowerCase().includes(search.toLowerCase()));
    }
    switch (sort) {
        case 'za': result.sort((a,b) => b.text.localeCompare(a.text)); break;
        case 'usage': result.sort((a,b) => b.usageCount - a.usageCount); break;
        default: result.sort((a,b) => a.text.localeCompare(b.text)); break;
    }
    return result;
  }, [phrases, sort, search]);

  return (
    <div className="space-y-4">
        <div className="flex gap-2">
            <Input placeholder={`Add a '${type}' phrase...`} value={newPhrase} onChange={e => setNewPhrase(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPhrase()} />
            <Button onClick={addPhrase}><Plus className="h-4 w-4"/></Button>
        </div>
        <div className="flex gap-2">
             <Input placeholder="Search phrases..." value={search} onChange={e => setSearch(e.target.value)} />
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
                        <Button variant="ghost" size="icon" onClick={() => toggleFavorite(phrase.text, type)}>
                            <Star className={`h-4 w-4 ${favorites.some(f => f.text === phrase.text && f.type === type) ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deletePhrase(phrase.text)}><X className="h-4 w-4 text-destructive"/></Button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};


export default function PhrasesTab() {
  const [wantPhrases, setWantPhrases] = useLocalStorage<Phrase[]>('phrases_want', []);
  const [needPhrases, setNeedPhrases] = useLocalStorage<Phrase[]>('phrases_need', []);
  const [feelPhrases, setFeelPhrases] = useLocalStorage<Phrase[]>('phrases_feel', []);
  const [favorites, setFavorites] = useLocalStorage<Favorite[]>('phrases_favorites', []);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useLocalStorage<string | undefined>('selected_voice_uri', undefined);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices().filter(voice => voice.lang.startsWith('en'));
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        if(!selectedVoice) {
            setSelectedVoice(availableVoices.find(v => v.default)?.voiceURI);
        }
      }
    };

    // The 'voiceschanged' event is fired when the list of voices is ready
    window.speechSynthesis.onvoiceschanged = loadVoices;
    // Call it once initially in case the voices are already loaded
    loadVoices();
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [setSelectedVoice, selectedVoice]);

  const toggleFavorite = (text: string, type: Category) => {
    const isFav = favorites.some(fav => fav.text === text && fav.type === type);
    if(isFav) {
        setFavorites(favorites.filter(fav => fav.text !== text || fav.type !== type));
    } else {
        setFavorites([...favorites, { text, type }]);
    }
  };

  const speakFavorite = (text: string, type: Category) => {
    const utterance = new SpeechSynthesisUtterance(`I ${type} ${text}`);
    if (selectedVoice) {
        const voice = voices.find(v => v.voiceURI === selectedVoice);
        if (voice) {
            utterance.voice = voice;
        }
    }
    window.speechSynthesis.speak(utterance);
  }
  
  return (
    <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle>My Phrases</CardTitle></CardHeader>
                <CardContent>
                    <Tabs defaultValue="want">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="want">Want</TabsTrigger>
                            <TabsTrigger value="need">Need</TabsTrigger>
                            <TabsTrigger value="feel">Feel</TabsTrigger>
                        </TabsList>
                        <TabsContent value="want" className="mt-4">
                            <PhraseList type="want" phrases={wantPhrases} setPhrases={setWantPhrases} favorites={favorites} toggleFavorite={toggleFavorite} selectedVoice={selectedVoice} />
                        </TabsContent>
                        <TabsContent value="need" className="mt-4">
                             <PhraseList type="need" phrases={needPhrases} setPhrases={setNeedPhrases} favorites={favorites} toggleFavorite={toggleFavorite} selectedVoice={selectedVoice}/>
                        </TabsContent>
                        <TabsContent value="feel" className="mt-4">
                             <PhraseList type="feel" phrases={feelPhrases} setPhrases={setFeelPhrases} favorites={favorites} toggleFavorite={toggleFavorite} selectedVoice={selectedVoice}/>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Custom Voice</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="voice-select">Select a Voice</Label>
                        <Select onValueChange={setSelectedVoice} value={selectedVoice}>
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
                        <CardTitle>⭐ Favorite Phrases</CardTitle>
                        <Button variant="destructive" size="sm" onClick={() => setFavorites([])}>
                            <Trash2 className="h-4 w-4 mr-1"/> Clear
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto space-y-2">
                    {favorites.length === 0 ? <p className="text-muted-foreground">No favorites yet.</p> : null}
                    {favorites.filter(f => f.type === 'want').length > 0 && <h4 className="font-semibold">Want</h4>}
                    {favorites.filter(f => f.type === 'want').map(fav => <p key={fav.text} className="p-2 bg-secondary rounded-md cursor-pointer" onClick={() => speakFavorite(fav.text, 'want')}>{fav.text}</p>)}
                    {favorites.filter(f => f.type === 'need').length > 0 && <h4 className="font-semibold mt-2">Need</h4>}
                    {favorites.filter(f => f.type === 'need').map(fav => <p key={fav.text} className="p-2 bg-secondary rounded-md cursor-pointer" onClick={() => speakFavorite(fav.text, 'need')}>{fav.text}</p>)}
                    {favorites.filter(f => f.type === 'feel').length > 0 && <h4 className="font-semibold mt-2">Feel</h4>}
                    {favorites.filter(f => f.type === 'feel').map(fav => <p key={fav.text} className="p-2 bg-secondary rounded-md cursor-pointer" onClick={() => speakFavorite(fav.text, 'feel')}>{fav.text}</p>)}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
