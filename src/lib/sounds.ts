

"use client";

import * as React from 'react';
import * as LucideIcons from 'lucide-react';

const ToiletIcon = (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', {
        xmlns: "http://www.w3.org/2000/svg",
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        ...props
    },
    [
        React.createElement('path', { d: "M4 12h16", key: 1 }),
        React.createElement('path', { d: "M4 18h16", key: 2 }),
        React.createElement('path', { d: "M12 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2", key: 3 }),
        React.createElement('path', { d: "M18 12v-2a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v2", key: 4 }),
        React.createElement('path', { d: "M12 12v6", key: 5 }),
        React.createElement('path', { d: "M10 18h4", key: 6 })
    ])
);


export const ALL_ICONS = {
    Toilet: ToiletIcon,
    ThumbsUp: LucideIcons.ThumbsUp,
    ThumbsDown: LucideIcons.ThumbsDown,
    Hand: LucideIcons.Hand,
    Check: LucideIcons.Check,
    CircleStop: LucideIcons.CircleStop,
    PartyPopper: LucideIcons.PartyPopper,
    HelpCircle: LucideIcons.HelpCircle,
    UserRoundX: LucideIcons.UserRoundX,
    Handshake: LucideIcons.Handshake,
    PlusCircle: LucideIcons.PlusCircle,
    Home: LucideIcons.Home,
    LifeBuoy: LucideIcons.LifeBuoy,
    Smile: LucideIcons.Smile,
    Frown: LucideIcons.Frown,
    Meh: LucideIcons.Meh,
    Heart: LucideIcons.Heart,
    Star: LucideIcons.Star,
    School: LucideIcons.School,
    Car: LucideIcons.Car,
    Plane: LucideIcons.Plane,
    Train: LucideIcons.Train,
    Bus: LucideIcons.Bus,
    Bike: LucideIcons.Bike,
    Pizza: LucideIcons.Pizza,
    Apple: LucideIcons.Apple,
    Cake: LucideIcons.CakeSlice,
    CupSoda: LucideIcons.CupSoda,
    Droplet: LucideIcons.Droplet,
    Bed: LucideIcons.Bed,
    Sun: LucideIcons.Sun,
    Moon: LucideIcons.Moon,
    Cloud: LucideIcons.Cloud,
    Wind: LucideIcons.Wind,
    Snowflake: LucideIcons.Snowflake,
    Zap: LucideIcons.Zap,
    Gift: LucideIcons.Gift,
    Gamepad2: LucideIcons.Gamepad2,
    Book: LucideIcons.Book,
    Music: LucideIcons.Music,
    Film: LucideIcons.Film,
    Brush: LucideIcons.Brush,
    Pen: LucideIcons.Pen,
    Plus: LucideIcons.Plus,
};


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

export const speakText = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        
        const excludedVoiceNames = [
          "zarvox", "wobble", "whisper", "trinoids", "shelley", "sandy", 
          "rocko", "reed", "ralph", "organ", "kathy", "junior", "karen", 
          "jester", "grandpa", "grandma", "good news", "flo", "eddy", 
          "cellos", "bubbles", "boing", "bells", "bahh", "bad news", "albert",
          "superstar", "rishi", "fred"
        ];

        let voices = window.speechSynthesis.getVoices()
          .filter(voice => voice.lang.startsWith('en'))
          .filter(voice => !excludedVoiceNames.some(excluded => voice.name.toLowerCase().includes(excluded)));

        const storedVoiceURI = localStorage.getItem('selected_voice_uri');
        const storedVoice = storedVoiceURI ? voices.find(v => v.voiceURI === JSON.parse(storedVoiceURI)) : null;
        const defaultVoice = voices.find(v => v.default);
        
        utterance.voice = storedVoice || defaultVoice || voices[0];
        window.speechSynthesis.speak(utterance);
    }
};

// Function to initialize audio context on user gesture
export const initAudio = () => {
    getAudioContext();
    // Pre-load voices for speech synthesis
    if (window.speechSynthesis && window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
        };
    }
};

export const playCorrectSound = () => {
  const audioCtx = getAudioContext();
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
  gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);

  oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.1); // C6
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
  
  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.2);
};



