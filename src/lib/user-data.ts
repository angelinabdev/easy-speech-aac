
import { doc, setDoc, onSnapshot, DocumentData, Firestore } from 'firebase/firestore';
import { isObject } from 'lodash';

// Custom deep merge function that correctly handles array replacements
export function deepMerge(target: any, source: any): any {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      const targetValue = target[key];
      const sourceValue = source[key];

      if (Array.isArray(sourceValue)) {
        // If the source value is an array, it replaces the target value.
        // This is the key change: we check if the key exists in the *source* (fetched data)
        // and if it does, we use its value, even if it's an empty array.
        if (key in source) {
          output[key] = sourceValue;
        }
      } else if (isObject(targetValue) && !Array.isArray(targetValue) && isObject(sourceValue) && !Array.isArray(sourceValue)) {
        // If both are objects (but not arrays), recursively merge them.
        output[key] = deepMerge(targetValue, sourceValue);
      } else {
        // Otherwise (for primitives, or if one is not an object), just assign the source value.
        output[key] = sourceValue;
      }
    });
  }
  
  // After merging, ensure that if a key exists in the target (initial data) but not in the source (fetched data),
  // it gets added to the output. This handles cases where new properties are added to the initial data structure.
  Object.keys(target).forEach(key => {
    if (!source.hasOwnProperty(key)) {
      output[key] = target[key];
    }
  });


  return output;
}


// --- Data Types ---
export type Contact = { id: string; name: string; relation: string; phone: string };
export type ListItem = { id: string; text: string };
export type Phrase = { text: string; usageCount: number };
export type Favorite = { text: string; type: 'want' | 'need' | 'feel' | 'words' };
export type PhraseUsageLog = { text: string; type: 'want' | 'need' | 'feel' | 'words'; timestamp: string; };
export type MoodEntry = { mood: string; timestamp: string; id: string };
export type Activity = { text: string };
export type ScheduledActivity = { id: string; text: string; completed: boolean; startTime: string; endTime: string };
export type SavedSchedule = { id: string; name: string; activities: Omit<ScheduledActivity, 'id' | 'completed'>[] };
export type Emotion = { name: string; emoji: string; };
export type NoteCategory = 'general' | 'medical' | 'behavioral' | 'progress';
export type Note = {
  id: string;
  text: string;
  timestamp: string;
  pinned?: boolean;
  category?: NoteCategory;
};
export type SoundboardItem = { id: string; name: string; icon: string; };
export type CompletedTaskLog = { timestamp: string; text: string };


// --- Main User Data Structure ---
export interface UserData {
  aboutMe: AboutMeData;
  planner: PlannerData;
  phrases: PhrasesData;
  soundboard: SoundboardData;
  moods: MoodData;
  games: GamesData;
  metadata: UserMetadata;
  notes: Note[];
}

export type AboutMeData = {
  name: string | null;
  contacts: Contact[];
  medical: string | null;
  communication: string | null;
  likes: ListItem[];
  dislikes: ListItem[];
};

export type PlannerData = {
    customActivities: Activity[];
    hiddenDefaultActivities: string[];
    schedule: ScheduledActivity[];
    savedSchedules: SavedSchedule[];
    points: number;
    level: number;
    dailyGoal: number;
    completedToday: number;
    dailyBonusClaimed: boolean;
    completedTasksLog: CompletedTaskLog[];
};

export type PhrasesData = {
    want: Phrase[];
    need: Phrase[];
    feel: Phrase[];
    words: Phrase[];
    favorites: Favorite[];
    selectedVoiceURI: string | null;
    phraseUsageLog: PhraseUsageLog[];
};

export type SoundboardData = {
    items: SoundboardItem[];
};

export type MoodData = {
    history: MoodEntry[];
};

export type GamesData = {
    sentenceBuilderWins: number;
    sentenceBuilderCheckpoints: number;
    sentenceBuilderUsed: string[];
    sentenceBuilderCurrentSentence: number;
    emotionMatchWins: number;
    emotionMatchCheckpoints: number;
    emotionMatchUsed: string[];
    emotionMatchCurrentSentence: number;
};

export type UserMetadata = {
    role: 'user' | 'caregiver' | null;
    dailyStreak: number;
    lastLoginDate: string | null;
    streakRestores: number;
    streakBroken: boolean;
    lastWeeklySummaryDate: string | null;
    notesPasscode: string | null;
    calmMode: boolean;
    earnedBadgeNames: string[];
};


// --- Constants ---
export const ALL_EMOTIONS: Emotion[] = [
    { name: 'Happy', emoji: '😊' },
    { name: 'Sad', emoji: '😢' },
    { name: 'Angry', emoji: '😡' },
    { name: 'Worried', emoji: '😨' },
    { name: 'Freezing', emoji: '🥶' },
    { name: 'Mind-blown', emoji: '🤯' },
    { name: 'Sleepy', emoji: '😴' },
    { name: 'Sick', emoji: '🤒' },
    { name: 'Loved', emoji: '🥰' },
    { name: 'Thinking', emoji: '🤔' },
    { name: 'Relaxed', emoji: '😌' },
    { name: 'Neutral', emoji: '😐' },
];

export const EMOTION_DEFINITIONS: Record<string, string> = {
    'Happy': 'Feeling joyful and pleased. It’s like a sunny day inside you.',
    'Sad': 'Feeling low or disappointed. It is okay to feel this way sometimes.',
    'Angry': 'A strong feeling of being very upset. It’s important to find safe ways to express it.',
    'Worried': 'Feeling uneasy about something. Taking deep breaths can help calm this feeling.',
    'Freezing': 'The feeling of being very cold, which might make your body shiver.',
    'Mind-blown': 'Feeling extremely impressed or surprised by something new.',
    'Sleepy': 'Your body’s signal that it needs to rest and recharge its energy.',
    'Sick': 'Feeling unwell in your body. Rest is important to help you recover.',
    'Loved': 'A warm and safe feeling that comes from being cared for by others.',
    'Thinking': 'Using your mind to consider ideas or make decisions.',
    'Relaxed': 'A state of calm, free from tension, stress, or worry.',
    'Neutral': 'Not feeling strongly one way or another; just calm and observant.',
};


// --- Firestore Service ---
export const getInitialData = (): UserData => ({
    aboutMe: {
        name: null,
        contacts: [],
        medical: null,
        communication: null,
        likes: [],
        dislikes: []
    },
    planner: {
        customActivities: [],
        hiddenDefaultActivities: [],
        schedule: [],
        savedSchedules: [],
        points: 0,
        level: 1,
        dailyGoal: 4,
        completedToday: 0,
        dailyBonusClaimed: false,
        completedTasksLog: [],
    },
    phrases: {
        want: [
            { text: 'to eat', usageCount: 0 },
            { text: 'to drink', usageCount: 0 },
            { text: 'to go to the bathroom', usageCount: 0 },
            { text: 'to watch TV', usageCount: 0 },
            { text: 'a break', usageCount: 0 },
            { text: 'more', usageCount: 0 },
            { text: 'to play', usageCount: 0 },
        ],
        need: [
            { text: 'help', usageCount: 0 },
            { text: 'some space', usageCount: 0 },
            { text: 'a blanket', usageCount: 0 },
            { text: 'quiet time', usageCount: 0 },
            { text: 'a snack', usageCount: 0 },
        ],
        feel: [
            { text: 'happy', usageCount: 0 },
            { text: 'sad', usageCount: 0 },
            { text: 'angry', usageCount: 0 },
            { text: 'tired', usageCount: 0 },
            { text: 'sick', usageCount: 0 },
        ],
        words: [
            { text: 'Me', usageCount: 0 },
            { text: 'You', usageCount: 0 },
            { text: 'Good', usageCount: 0 },
            { text: 'Bad', usageCount: 0 },
        ],
        favorites: [],
        selectedVoiceURI: null,
        phraseUsageLog: [],
    },
    soundboard: {
        items: [
            { id: "1", name: 'Yes', icon: 'ThumbsUp' },
            { id: "2", name: 'No', icon: 'ThumbsDown' },
            { id: "3", name: 'Hello', icon: 'Hand' },
            { id: "4", name: 'Goodbye', icon: 'UserRoundX' },
            { id: "5", name: 'Thank you', icon: 'Handshake' },
            { id: "6", name: 'Okay', icon: 'Check' },
            { id: "7", name: 'Stop', icon: 'CircleStop' },
            { id: "8", name: 'All Done', icon: 'PartyPopper' },
            { id: "9", name: 'Please', icon: 'PlusCircle' },
            { id: "10", name: 'Maybe', icon: 'HelpCircle' },
            { id: "11", name: 'Toilet', icon: 'Toilet' },
            { id: "12", name: 'Help', icon: 'LifeBuoy' },
        ]
    },
    moods: {
        history: [],
    },
    games: {
        sentenceBuilderWins: 0,
        sentenceBuilderCheckpoints: 0,
        sentenceBuilderUsed: [],
        sentenceBuilderCurrentSentence: 0,
        emotionMatchWins: 0,
        emotionMatchCheckpoints: 0,
        emotionMatchUsed: [],
        emotionMatchCurrentSentence: 0,
    },
    metadata: {
        role: null,
        dailyStreak: 0,
        lastLoginDate: null,
        streakRestores: 1, // Start with one restore
        streakBroken: false,
        lastWeeklySummaryDate: null,
        notesPasscode: null,
        calmMode: false,
        earnedBadgeNames: [],
    },
    notes: [],
});

export const setUserData = async (db: Firestore, uid: string, data: Partial<UserData>) => {
  const docRef = doc(db, 'users', uid);
  await setDoc(docRef, data, { merge: true });
};


export const onUserDataSnapshot = (db: Firestore, uid: string, callback: (data: UserData | null) => void) => {
  const docRef = doc(db, 'users', uid);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const fetchedData = docSnap.data() as DocumentData;
      const initialData = getInitialData();
      const mergedData = deepMerge(initialData, fetchedData);
      callback(mergedData as UserData);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error("Error fetching user data:", error);
    callback(null);
  });
};
