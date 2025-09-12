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
  prompt: `Based on the user's mood: {{mood}}, suggest one activity and one calming audio to improve their well-being. Be creative and empathetic.

Example for Sad:
Activity: "Drawing a picture of something that makes you happy."
Audio Suggestion: "The sound of gentle rain."

Example for Anxious:
Activity: "Counting five things you can see and four things you can touch."
Audio Suggestion: "A slow, calming heartbeat sound."

User's mood is: {{mood}}
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
