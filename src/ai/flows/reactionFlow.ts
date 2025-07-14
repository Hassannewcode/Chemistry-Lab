'use server';
/**
 * @fileOverview A chemical reaction simulation AI flow.
 *
 * - conductReaction - A function that simulates a chemical reaction.
 * - ConductReactionInput - The input type for the conductReaction function.
 * - ConductReactionOutput - The return type for the conductReaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConductReactionInputSchema = z.object({
  chemicals: z.array(z.string()).describe('An array of up to 2 chemical formulas to react.'),
  temperature: z.number().describe('The temperature for the reaction in Celsius.'),
  concentration: z.number().describe('The concentration of the reactants in Molarity (M).'),
});
export type ConductReactionInput = z.infer<typeof ConductReactionInputSchema>;

const ConductReactionOutputSchema = z.object({
    reactionName: z.string().describe("The common or scientific name of the reaction, e.g., 'Neutralization' or 'Single Replacement'."),
    description: z.string().describe('A detailed but easy-to-understand description of what happens during the reaction.'),
    products: z.array(z.string()).describe('An array of chemical formulas for the products formed.'),
    safetyNotes: z.string().describe('Important safety warnings or interesting facts about the reaction. Be concise.'),
});
export type ConductReactionOutput = z.infer<typeof ConductReactionOutputSchema>;

export async function conductReaction(input: ConductReactionInput): Promise<ConductReactionOutput> {
  return reactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reactionPrompt',
  input: {schema: ConductReactionInputSchema},
  output: {schema: ConductReactionOutputSchema},
  prompt: `You are a chemistry expert simulating a chemical reaction for a student.
  
  Reactants: {{chemicals}}
  Temperature: {{temperature}}°C
  Concentration: {{concentration}}M

  Based on these inputs, provide the following:
  1. The name of the reaction.
  2. A clear, step-by-step description of the chemical process. Explain what is happening at a molecular level in simple terms.
  3. The chemical formulas of the main products. If no reaction occurs, state that and list the original chemicals as the products.
  4. A brief, important safety note or a fun fact related to the reaction or chemicals involved.

  Keep the language accessible and engaging for a high school student.
  If the combination of chemicals does not typically react under the given conditions, state that clearly in the description.`,
});

const reactionFlow = ai.defineFlow(
  {
    name: 'reactionFlow',
    inputSchema: ConductReactionInputSchema,
    outputSchema: ConductReactionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
