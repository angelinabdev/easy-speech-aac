
"use client";

import {
    ThumbsUp,
    ThumbsDown,
    Hand,
    Check,
    CircleStop,
    PartyPopper,
    HelpCircle,
    UserRoundX,
    Handshake,
    PlusCircle,
    Toilet,
    LifeBuoy
} from 'lucide-react';


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

const playSound = (src: string) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const audio = new Audio(src);
    audio.play().catch(e => console.error("Error playing audio:", e));
};


const speakText = (text: string) => {
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

export const SOUNDS = [
    { name: "Yes", icon: ThumbsUp, action: () => speakText("Yes") },
    { name: "No", icon: ThumbsDown, action: () => speakText("No") },
    { name: "Hello", icon: Hand, action: () => speakText("Hello") },
    { name: "Goodbye", icon: UserRoundX, action: () => speakText("Goodbye") },
    { name: "Thank you", icon: Handshake, action: () => speakText("Thank you") },
    { name: "Okay", icon: Check, action: () => speakText("Okay") },
    { name: "Stop", icon: CircleStop, action: () => speakText("Stop") },
    { name: "All Done", icon: PartyPopper, action: () => speakText("All done") },
    { name: "Please", icon: PlusCircle, action: () => speakText("Please") },
    { name: "Maybe", icon: HelpCircle, action: () => speakText("Maybe") },
    { name: "Toilet", icon: Toilet, action: () => speakText("Toilet") },
    { name: "Help", icon: LifeBuoy, action: () => speakText("Help") },
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
};




