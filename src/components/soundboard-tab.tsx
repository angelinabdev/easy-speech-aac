"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Bell, Check, Laugh, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { useState, useEffect } from 'react';

// A single AudioContext is reused to prevent creating multiple instances
let audioContext: AudioContext | null = null;
const getAudioContext = () => {
  if (typeof window !== 'undefined') {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }
  return audioContext;
};


const playTone = (freq1: number, freq2: number, duration: number) => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  const oscillator1 = ctx.createOscillator();
  oscillator1.type = 'sine';
  oscillator1.frequency.setValueAtTime(freq1, ctx.currentTime);

  const oscillator2 = ctx.createOscillator();
  oscillator2.type = 'sine';
  oscillator2.frequency.setValueAtTime(freq2, ctx.currentTime);
  
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

  oscillator1.connect(gainNode);
  oscillator2.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator1.start();
  oscillator2.start();
  oscillator1.stop(ctx.currentTime + duration);
  oscillator2.stop(ctx.currentTime + duration);
};

const playNoise = (duration: number) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    noise.connect(gainNode);
    gainNode.connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + duration);
};

const SOUNDS = [
    { name: "Yes", icon: ThumbsUp, action: () => playTone(523.25, 659.25, 0.3) },
    { name: "No", icon: ThumbsDown, action: () => playTone(349.23, 261.63, 0.4) },
    { name: "Bell", icon: Bell, action: () => playTone(1046.50, 1396.91, 0.5) },
    { name: "Okay", icon: Check, action: () => { playTone(587.33, 0.15); setTimeout(() => playTone(880, 0.2), 150) } },
    { name: "Oops", icon: X, action: () => playTone(220, 185, 0.3) },
    { name: "Haha", icon: Laugh, action: () => { playTone(600, 800, 0.1); setTimeout(() => playTone(500, 700, 0.1), 150) } },
];


export default function SoundboardTab() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    // Ensure AudioContext is created by a user gesture on the first click
    const initAudio = () => {
        getAudioContext();
        window.removeEventListener('click', initAudio);
    };
    window.addEventListener('click', initAudio);
    return () => window.removeEventListener('click', initAudio);
  }, []);

  if (!isClient) return null; // Or a loading skeleton

  return (
    <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle>Soundboard</CardTitle>
            <CardDescription>Use these sounds for quick, non-verbal communication and reactions. Just tap a button to play the sound.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
