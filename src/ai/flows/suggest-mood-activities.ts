'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting calming audios or activities
 * tailored to a user's tracked mood to improve their well-being.
 *
 * @example
 * // Example usage:
 * const mood = 'Sad';
 * const suggestions = await suggestMoodActivities(mood);
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MoodInputSchema = z.string().describe('The current mood of the user.');
export type MoodInput = z.infer<typeof MoodInputSchema>;

const MoodActivitySuggestionSchema = z.object({
  activity: z.string().describe('A suggested activity based on the mood.'),
  audioSuggestion: z.string().describe('A suggested audio to help with mood.'),
});
export type MoodActivitySuggestion = z.infer<typeof MoodActivitySuggestionSchema>;

export async function suggestMoodActivities(mood: MoodInput): Promise<MoodActivitySuggestion> {
  return suggestMoodActivitiesFlow(mood);
}

const suggestMoodActivitiesPrompt = ai.definePrompt({
  name: 'suggestMoodActivitiesPrompt',
  input: {schema: z.object({mood: MoodInputSchema})},
  output: {schema: MoodActivitySuggestionSchema},
  prompt: `You are an empathetic AI assistant for an app that helps users with communication challenges, including autism. Your goal is to provide supportive and actionable suggestions based on the user's logged mood.

The user's mood is: {{mood}}

Please provide one activity and one audio suggestion tailored to this mood. The suggestions should be simple, calming, and suitable for someone who might be overwhelmed or non-verbal.

---
Here are some examples of good suggestions for different moods:

**For "Sad" 😢:**
- Activity: "Wrap yourself in a soft, weighted blanket if you have one."
- Audio Suggestion: "The sound of a gentle, purring cat."

**For "Angry" 😡:**
- Activity: "Squeeze a stress ball or a soft toy tightly."
- Audio Suggestion: "A low, humming sound, like a fan."

**For "Anxious" 😰:**
- Activity: "Rock gently back and forth in a quiet space."
- Audio Suggestion: "Listen to a slow, steady heartbeat sound."

**For "Happy" 😊:**
- Activity: "Flap your hands or rock to the rhythm of a favorite song."
- Audio Suggestion: "The sound of happy, cheerful birds singing."

**For "Calm" 😌:**
- Activity: "Gently trace shapes on your arm with your finger."
- Audio Suggestion: "The quiet sound of wind rustling through leaves."

**For "Tired" 😴:**
- Activity: "Lie down in a dim room and close your eyes for a few minutes."
- Audio Suggestion: "The sound of soft, instrumental music."
---

Now, based on the user's mood of "{{mood}}", provide your suggestions.
`,
});

const suggestMoodActivitiesFlow = ai.defineFlow(
  {
    name: 'suggestMoodActivitiesFlow',
    inputSchema: MoodInputSchema,
    outputSchema: MoodActivitySuggestionSchema,
  },
  async mood => {
    const {output} = await suggestMoodActivitiesPrompt({mood});
    return output!;
  }
);
