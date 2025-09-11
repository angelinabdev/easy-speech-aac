'use server';

import { suggestMoodActivities as suggestMoodActivitiesFlow } from '@/ai/flows/suggest-mood-activities';
import { z } from 'zod';

const MoodInputSchema = z.string().describe('The current mood of the user.');

export async function getMoodSuggestions(mood: string) {
    try {
        const validatedMood = MoodInputSchema.parse(mood);
        const suggestions = await suggestMoodActivitiesFlow(validatedMood);
        return { success: true, data: suggestions };
    } catch (error) {
        console.error("Error getting mood suggestions:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: "Invalid mood input." };
        }
        return { success: false, error: "Failed to get suggestions from AI." };
    }
}
