/**
 * @fileOverview Types for the suggestion flow.
 *
 * - SuggestionInputSchema - The Zod schema for the suggestion flow input.
 * - SuggestionInput - The input type for the getSuggestion function.
 */
import {z} from 'genkit';

export const SuggestionInputSchema = z.object({
  mood: z
    .string()
    .describe('The current mood of the user (e.g., Sad, Anxious, Happy).'),
  likes: z
    .array(z.string())
    .describe("A list of the user's favorite things or hobbies."),
  dislikes: z
    .array(z.string())
    .describe("A list of things the user dislikes."),
  communication: z
    .string()
    .describe("Notes on the user's communication style."),
});
export type SuggestionInput = z.infer<typeof SuggestionInputSchema>;
