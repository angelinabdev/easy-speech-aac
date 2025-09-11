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
  input: {schema: MoodInputSchema},
  output: {schema: MoodActivitySuggestionSchema},
  prompt: `Based on the user's mood: {{{mood}}}, suggest one activity and one calming audio to improve their well-being.\n\nActivity: // Suggest an activity related to improving the user's mood
Calming Audio: //Suggest a calming audio to improve mood.`,
});

const suggestMoodActivitiesFlow = ai.defineFlow(
  {
    name: 'suggestMoodActivitiesFlow',
    inputSchema: MoodInputSchema,
    outputSchema: MoodActivitySuggestionSchema,
  },
  async mood => {
    const {output} = await suggestMoodActivitiesPrompt(mood);
    return output!;
  }
);
