"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Bell, ThumbsUp, ThumbsDown, Clapperboard, Laugh, Siren, Volume2 } from 'lucide-react';

const sounds = [
  { name: 'Bell', icon: Bell, file: '/sounds/bell.mp3' },
  { name: 'Yes', icon: ThumbsUp, file: '/sounds/yes.mp3' },
  { name: 'No', icon: ThumbsDown, file: '/sounds/no.mp3' },
  { name: 'Applause', icon: Clapperboard, file: '/sounds/applause.mp3' },
  { name: 'Laughter', icon: Laugh, file: '/sounds/laughter.mp3' },
  { name: 'Alarm', icon: Siren, file: '/sounds/alarm.mp3' },
];

export default function SoundboardTab() {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const playSound = (soundFile: string) => {
    if (audio) {
      audio.pause();
    }
    const newAudio = new Audio(soundFile);
    newAudio.play();
    setAudio(newAudio);
  };

  useEffect(() => {
    // Cleanup function to pause audio when component unmounts
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Soundboard</CardTitle>
        <CardDescription>Use these sounds for quick, non-verbal communication.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sounds.map((sound) => (
            <Button
              key={sound.name}
              variant="outline"
              className="h-28 flex flex-col items-center justify-center gap-2 text-lg"
              onClick={() => playSound(sound.file)}
            >
              <sound.icon className="h-8 w-8" />
              <span>{sound.name}</span>
            </Button>
          ))}
          <Button
            variant="outline"
            className="h-28 flex flex-col items-center justify-center gap-2 text-lg"
            onClick={() => window.speechSynthesis.speak(new SpeechSynthesisUtterance("I need help"))}
          >
            <Volume2 className="h-8 w-8" />
            <span>I need help</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
