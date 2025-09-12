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

Based on their mood and their likes, provide a single, short, creative, and gentle suggestion for an activity that might help them feel better.

If the user's likes are available, try to incorporate one of them into your suggestion in a natural way. For example, if they like "cartoons," you could suggest "Maybe you could try drawing your favorite cartoon character?".
If no likes are provided, give a general, kind suggestion.

Keep the response to one or two sentences. Frame it as a gentle question or a soft recommendation. Start with a comforting phrase like "It's okay to feel {{mood}}." or "I'm sorry you're feeling {{mood}}."
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
