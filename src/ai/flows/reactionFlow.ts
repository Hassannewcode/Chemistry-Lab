
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
  chemicals: z.array(z.string()).describe('An array of up to 8 chemical formulas or spray names to react.'),
  temperature: z.number().describe('The temperature for the reaction in Celsius.'),
  concentration: z.number().describe('The concentration of the reactants in Molarity (M).'),
});
export type ConductReactionInput = z.infer<typeof ConductReactionInputSchema>;

const ConductReactionOutputSchema = z.object({
    reactionName: z.string().describe("The common or scientific name of the reaction, e.g., 'Neutralization' or 'Single Replacement'. If including sprays, name it something creative like 'Sparkling Volcano'."),
    description: z.string().describe('A detailed but easy-to-understand description of what happens during the reaction. If sprays are involved, describe their visual effect on the reaction.'),
    products: z.array(z.string()).describe('An array of chemical formulas for the products formed. Sprays might not produce chemical products, but can be listed if they persist.'),
    safetyNotes: z.string().describe('Important safety warnings or interesting facts about the reaction. Be concise. Mention any spectacular visual results from sprays.'),
    effects: z.object({
      color: z.string().describe("A hex color code (e.g., '#ff0000') for the final liquid mixture. This should reflect the color of the products."),
      bubbles: z.number().min(0).max(10).describe("The intensity of bubble formation, from 0 (none) to 10 (very intense)."),
      smoke: z.number().min(0).max(1).describe("The density of smoke produced, from 0 (none) to 1 (thick smoke)."),
      sparkles: z.number().min(0).max(50).describe("The number of sparkles to show, from 0 to 50."),
      glow: z.number().min(0).max(2).describe("The intensity of the glow effect, from 0 (none) to 2 (bright glow)."),
      explosion: z.number().min(0).max(10).describe("The intensity of an explosion, from 0 (none) to 10 (massive). An explosion is a rapid release of energy and should be used for highly exothermic or volatile reactions."),
    }).describe("The visual effects of the resulting reaction products.")
});
export type ConductReactionOutput = z.infer<typeof ConductReactionOutputSchema>;

export async function conductReaction(input: ConductReactionInput): Promise<ConductReactionOutput> {
  return reactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reactionPrompt',
  input: {schema: ConductReactionInputSchema},
  output: {schema: ConductReactionOutputSchema},
  prompt: `You are a chemistry expert simulating a chemical reaction for a student. Some items might be non-chemical 'sprays' that add visual effects.

  Reactants: {{chemicals}}
  Temperature: {{temperature}}°C
  Concentration: {{concentration}}M

  Based on these inputs, provide the following:
  1. The name of the reaction. If sprays are used, give it a fun, descriptive name.
  2. A clear, step-by-step description of the chemical process. Explain what is happening at a molecular level in simple terms. Incorporate the visual effects of any sprays into the description.
  3. The chemical formulas of the main products. If no reaction occurs, state that and list the original chemicals as the products. Sprays generally don't create new products but can be mentioned.
  4. A brief, important safety note or a fun fact related to the reaction or chemicals involved. Comment on the visual results.
  5. The visual effects of the final products. Determine the resulting color, bubbles, smoke, sparkles, glow, and explosion intensity. Be creative and scientifically plausible. For example, a vigorous reaction might produce lots of bubbles and smoke. A reaction with gold might sparkle. A reaction involving alkali metals and water should be explosive.

  Keep the language accessible and engaging for a high school student.
  If the combination of chemicals does not typically react under the given conditions, state that clearly in the description, but still describe the visual mixing of the substances and set the final effects to be the average of the initial ingredients.`,
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
