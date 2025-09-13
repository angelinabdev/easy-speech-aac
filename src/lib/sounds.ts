"use client";

import { Bell, Check, ThumbsDown, ThumbsUp } from 'lucide-react';

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

const speakText = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices().filter(voice => voice.lang.startsWith('en'));
        const defaultVoice = voices.find(v => v.default);
        const storedVoiceURI = localStorage.getItem('selected_voice_uri');
        const storedVoice = storedVoiceURI ? voices.find(v => v.voiceURI === JSON.parse(storedVoiceURI)) : null;
        
        utterance.voice = storedVoice || defaultVoice || voices[0];
        window.speechSynthesis.speak(utterance);
    }
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

export const SOUNDS = [
    { name: "Yes", icon: ThumbsUp, action: () => speakText("Yes") },
    { name: "No", icon: ThumbsDown, action: () => speakText("No") },
    { name: "Bell", icon: Bell, action: () => playTone(987.77, 1318.51, 0.5) },
    { name: "Okay", icon: Check, action: () => speakText("Okay") },
];

// Function to initialize audio context on user gesture
export const initAudio = () => {
    getAudioContext();
    // Pre-load voices for speech synthesis
    if (window.speechSynthesis && window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
        };
    }
    window.removeEventListener('click', initAudio);
};