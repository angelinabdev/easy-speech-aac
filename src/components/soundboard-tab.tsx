"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { SOUNDS, initAudio } from '@/lib/sounds';

export default function SoundboardTab() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    // Ensure AudioContext is created by a user gesture on the first click
    const init = () => initAudio();
    window.addEventListener('click', init, { once: true });
    
    return () => window.removeEventListener('click', init);
  }, []);

  if (!isClient) return null; // Or a loading skeleton

  return (
    <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle>Soundboard</CardTitle>
            <CardDescription>Use these sounds for quick, non-verbal communication and reactions. Just tap a button to play the sound.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {SOUNDS.map(sound => (
                    <Button 
                        key={sound.name}
                        onClick={sound.action}
                        className="h-24 text-lg flex-col gap-2"
                        variant="outline"
                    >
                        <sound.icon className="h-8 w-8" />
                        {sound.name}
                    </Button>
                ))}
            </div>
        </CardContent>
    </Card>
  );
}
