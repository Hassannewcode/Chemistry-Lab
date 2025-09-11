
/**
 * @fileOverview Zod schemas for the chat flow.
 */

import {z} from 'genkit';
import {ConductReactionOutputSchema} from './reactionSchema';

export const ChatInputSchema = z.object({
  question: z.string().describe("The user's question about the reaction."),
  reactionContext: z
    .object({
      reactants: z
        .array(z.string())
        .describe('The chemical formulas of the reactants used.'),
      temperature: z
        .number()
        .describe('The temperature of the reaction in Celsius.'),
      concentration: z
        .number()
        .describe(
          'The concentration of the reactants in Molarity (M).'
        ),
      reactionResult: ConductReactionOutputSchema.describe(
        'The full results from the initial reaction simulation.'
      ),
    })
    .describe('The complete context of the reaction being discussed.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  answer: z
    .string()
    .describe(
      "A knowledgeable, direct, and helpful answer to the user's question."
    ),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;
