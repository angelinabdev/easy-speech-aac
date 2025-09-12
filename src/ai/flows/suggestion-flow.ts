'use server';
/**
 * @fileOverview An AI flow to generate personalized mood-based suggestions.
 *
 * - getSuggestion - A function that generates a helpful tip based on mood and user profile.
 * - SuggestionInput - The input type for the getSuggestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestionInputSchema = z.object({
  mood: z.string().describe("The user's current mood (e.g., Sad, Anxious, Angry)."),
  likes: z.array(z.string()).describe("A list of things the user enjoys."),
  dislikes: z.array(z.string()).describe("A list of things the user dislikes."),
  communication: z.string().optional().describe("The user's preferred communication style."),
});
export type SuggestionInput = z.infer<typeof SuggestionInputSchema>;

export async function getSuggestion(input: SuggestionInput): Promise<string> {
  return suggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestionPrompt',
  input: { schema: SuggestionInputSchema },
  output: { schema: z.string() },
  prompt: `You are a friendly and empathetic companion for an AAC app. Your goal is to provide a comforting and creative suggestion to a user.

Here is what you know about the user:
- Their current mood is: {{mood}}
- Things they like:
{{#if likes}}
{{#each likes}}
- {{{this}}}
{{/each}}
{{else}}
(No specific likes were provided)
{{/if}}
- Things they dislike:
{{#if dislikes}}
{{#each dislikes}}
- {{{this}}}
{{/each}}
{{else}}
(No specific dislikes were provided)
{{/if}}
- Their communication style: {{#if communication}}{{communication}}{{else}}(Not specified){{/if}}

Based on all this information, provide a single, short, creative, and gentle suggestion for an activity that might help them feel better. Frame it as a gentle question or a soft recommendation. Start with a comforting phrase. Keep the response to one or two sentences.

Guidelines:
- If likes are available, try to incorporate one into your suggestion.
- Avoid suggesting things from their dislikes list.
- Tailor the suggestion to their mood. For example:
  - If 'Sad', suggest something comforting or creative for quiet reflection. (e.g., "It's okay to feel sad. How about you try drawing something that makes you feel cozy, like a warm blanket?").
  - If 'Anxious', suggest a calming, low-pressure activity to help them ground themselves. (e.g., "I'm sorry you're feeling anxious. Maybe listening to a favorite album, focusing only on the music, could bring some calm?").
  - If 'Angry', suggest a safe, healthy outlet for that energy. (e.g., "It's understandable to feel angry. Would it help to channel that energy into a short walk?").
- If no specific likes are provided, give a general but kind suggestion appropriate for the {{mood}}.
`,
});

const suggestionFlow = ai.defineFlow(
  {
    name: 'suggestionFlow',
    inputSchema: SuggestionInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
