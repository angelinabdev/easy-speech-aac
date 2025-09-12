'use server';
/**
 * @fileOverview An AI flow to generate personalized mood-based suggestions.
 *
 * - getSuggestion - A function that generates a helpful tip based on mood and user likes.
 * - SuggestionInput - The input type for the getSuggestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestionInputSchema = z.object({
  mood: z.string().describe('The user\'s current mood (e.g., Sad, Anxious, Angry).'),
  likes: z.array(z.string()).describe('A list of things the user enjoys.'),
});
export type SuggestionInput = z.infer<typeof SuggestionInputSchema>;

export async function getSuggestion(input: SuggestionInput): Promise<string> {
  return suggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestionPrompt',
  input: { schema: SuggestionInputSchema },
  output: { schema: z.string() },
  prompt: `You are a friendly and empathetic companion for an AAC app. Your goal is to provide a comforting and creative suggestion to a user who is feeling {{mood}}.

The user has shared a list of things they like:
{{#if likes}}
{{#each likes}}
- {{{this}}}
{{/each}}
{{else}}
(No specific likes were provided)
{{/if}}

Based on their mood and their likes, provide a single, short, creative, and gentle suggestion for an activity that might help them feel better. Frame it as a gentle question or a soft recommendation. Start with a comforting phrase. Keep the response to one or two sentences.

If the user's likes are available, try to incorporate one of them into your suggestion in a natural way.

Here are some specific guidelines for different moods:
- If the mood is 'Sad', suggest something comforting or creative that allows for quiet reflection. For example, if they like "drawing", suggest "It's okay to feel sad. How about you try drawing something that makes you feel cozy, like a warm blanket or a cup of tea?".
- If the mood is 'Anxious', suggest a calming, low-pressure activity that can help ground them. For example, if they like "music", suggest "I'm sorry you're feeling anxious. Maybe listening to a favorite album, focusing only on the music, could help bring some calm?".
- If the mood is 'Angry', suggest a safe and healthy outlet for that energy. For example, if they like "exercise", suggest "It's understandable to feel angry sometimes. Would it help to channel that energy into a short walk or some stretching?".

If no specific guidelines are given for the mood, provide a general, kind suggestion. If no likes are provided, give a general, kind suggestion appropriate for the {{mood}}.
`,
});

const suggestionFlow = ai.defineFlow(
  {
    name: 'suggestionFlow',
    inputSchema: SuggestionInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    // If likes are empty, provide a more generic prompt input for better suggestions.
    const effectiveInput = {
        ...input,
        likes: input.likes.length > 0 ? input.likes : [],
    };

    const { output } = await prompt(effectiveInput);
    return output!;
  }
);
