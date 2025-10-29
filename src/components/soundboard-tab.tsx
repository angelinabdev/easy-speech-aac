
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { SoundboardData, SoundboardItem } from '@/lib/user-data';
import { speakText, initAudio, ALL_ICONS } from '@/lib/sounds';
import { Plus, X, Settings } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Switch } from './ui/switch';
import { ScrollArea } from './ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';


interface SoundboardTabProps {
    soundboardData: SoundboardData;
    onUpdate: (newData: SoundboardData) => void;
}

const IconPicker = ({ onSelectIcon }: { onSelectIcon: (iconName: string) => void }) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Select Icon</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Choose an Icon</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-72">
                    <div className="grid grid-cols-6 gap-2 p-4">
                        {Object.entries(ALL_ICONS).map(([name, Icon]) => (
                            <DialogTrigger asChild key={name}>
                                <Button variant="outline" size="icon" onClick={() => onSelectIcon(name)} aria-label={`Select icon: ${name}`}>
                                    <Icon className="h-6 w-6" />
                                </Button>
                            </DialogTrigger>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

const AddSoundDialog = ({ onAddSound }: { onAddSound: (name: string, icon: string) => void }) => {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('Smile');
    const [isOpen, setIsOpen] = useState(false);

    const handleAdd = () => {
        if (name.trim()) {
            onAddSound(name.trim(), icon);
            setName('');
            setIcon('Smile');
            setIsOpen(false);
        }
    };
    
    const CurrentIcon = ALL_ICONS[icon as keyof typeof ALL_ICONS] || ALL_ICONS['Smile'];

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-24 text-lg flex-col gap-2 border-dashed transition-transform active:scale-95" aria-label="Add new sound">
                    <Plus className="h-8 w-8" />
                    Add New
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Sound</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="sound-name">Name</Label>
                        <Input id="sound-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Happy" />
                    </div>
                    <div>
                        <Label>Icon</Label>
                        <div className="flex items-center gap-4 mt-2">
                           <div className="p-2 border rounded-md">
                                <CurrentIcon className="h-8 w-8" />
                           </div>
                           <IconPicker onSelectIcon={setIcon} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleAdd}>Add Sound</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function SoundboardTab({ soundboardData, onUpdate }: SoundboardTabProps) {
  const [isClient, setIsClient] = useState(false);
  const [isCustomizeMode, setIsCustomizeMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const init = () => initAudio();
    window.addEventListener('click', init, { once: true });
    
    return () => window.removeEventListener('click', init);
  }, []);

  const handleAddSound = (name: string, icon: string) => {
    const newItem: SoundboardItem = {
      id: Date.now().toString(),
      name,
      icon,
    };
    onUpdate({ items: [...soundboardData.items, newItem] });
    toast({
        title: "Sound Added",
        description: `"${name}" has been added to the soundboard.`,
    });
  };

  const handleDeleteSound = (id: string) => {
    onUpdate({ items: soundboardData.items.filter(item => item.id !== id) });
  };


  if (!isClient) return null;

  return (
    <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <CardTitle className="text-3xl">Soundboard</CardTitle>
                <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <Switch
                        id="customize-mode"
                        checked={isCustomizeMode}
                        onCheckedChange={setIsCustomizeMode}
                        aria-label="Toggle customize mode"
                    />
                    <Label htmlFor="customize-mode">Customize</Label>
                </div>
            </div>
            <CardDescription className="pt-2">Tap a button for quick, nonverbal communication.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {soundboardData.items.map(sound => {
                    const Icon = ALL_ICONS[sound.icon as keyof typeof ALL_ICONS] || Plus;
                    return (
                        <div key={sound.id} className="relative group">
                            <Button 
                                onClick={() => !isCustomizeMode && speakText(sound.name)}
                                className="h-24 w-full text-lg flex-col gap-2 transition-transform active:scale-95"
                                variant="outline"
                                disabled={isCustomizeMode}
                                aria-label={`Play sound: ${sound.name}`}
                            >
                                <Icon className="h-8 w-8" />
                                {sound.name}
                            </Button>
                            {isCustomizeMode && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-7 w-7 rounded-full transition-transform active:scale-95" aria-label={`Delete sound: ${sound.name}`}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete "{sound.name}"?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete this sound from your soundboard.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteSound(sound.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    );
                })}
                {isCustomizeMode && <AddSoundDialog onAddSound={handleAddSound} />}
            </div>
        </CardContent>
    </Card>
  );
}

    

    