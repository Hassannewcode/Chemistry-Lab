
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
  chemicals: z.array(z.string()).describe('An array of up to 12 chemical formulas or spray names to react.'),
  temperature: z.number().describe('The temperature for the reaction in Celsius.'),
  concentration: z.number().describe('The concentration of the reactants in Molarity (M).'),
});
export type ConductReactionInput = z.infer<typeof ConductReactionInputSchema>;

const ProductSchema = z.object({
  formula: z.string().describe('The chemical formula of the product.'),
  state: z.enum(['s', 'l', 'g', 'aq']).describe('The physical state of the product: solid (s), liquid (l), gas (g), or aqueous (aq).')
});

const ConductReactionOutputSchema = z.object({
    reactionName: z.string().describe("The common or scientific name of the reaction, e.g., 'Neutralization' or 'Single Replacement'. If including sprays, name it something creative like 'Sparkling Volcano'."),
    description: z.string().describe('A detailed but easy-to-understand description of what happens during the reaction. If sprays are involved, describe their visual effect on the reaction.'),
    products: z.array(ProductSchema).describe('An array of the chemical products formed, including their formula and physical state (solid, liquid, gas, or aqueous).'),
    safetyNotes: z.string().describe('Important safety warnings or interesting facts about the reaction. Be concise. Mention any spectacular visual results from sprays.'),
    visualPreview: z.string().describe("A vivid, imaginative description of the final result, like a mini demo. e.g., 'A brilliant blue liquid now fizzes gently, with tiny silver flakes suspended within, glowing faintly.'"),
    realWorldProbability: z.object({
      success: z.number().min(0).max(100).describe('The probability percentage (0-100) that this reaction would occur as described under ideal real-world lab conditions.'),
      failure: z.number().min(0).max(100).describe('The probability percentage (0-100) that this reaction would fail or not occur as described in the real world.'),
    }).describe('The estimated probability of this reaction occurring in a real lab.'),
    destructionScale: z.number().min(0).max(10).describe('A rating from 0 (completely inert) to 10 (catastrophically destructive) of the potential destructive power of this reaction.'),
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
  prompt: `You are a chemistry expert simulating a chemical reaction for a student. Some items might be non-chemical 'sprays' that add visual effects. Your analysis must be as realistic as possible.

  Reactants: {{chemicals}}
  Temperature: {{temperature}}°C
  Concentration: {{concentration}}M

  Based on these inputs, provide the following:
  1. The name of the reaction. If sprays are used, you MUST give it a fun, descriptive, creative name (e.g. "Sparkling Volcano", "Graphene Mist").
  2. A clear, step-by-step description of the chemical process. Explain what is happening at a molecular level in simple, realistic terms.
  3. The chemical formulas of the main products and their physical state (solid, liquid, gas, or aqueous). If no reaction occurs, state that and list the original chemicals. Sprays don't create products but affect the visual description.
  4. A brief, important safety note or a fun fact.
  5. The visual effects of the final products (color, bubbles, smoke, sparkles, glow, explosion). Be creative but scientifically plausible. An explosion must be for a highly exothermic or volatile reaction (e.g., alkali metals in water).
  6. A "Visual Preview": A short, vivid, and imaginative text description of the final result, as if giving a demo.
  7. "Real-World Probability": Estimate the percentage chance of success vs. failure for this reaction in a real lab. Consider purity, conditions, etc. The two probabilities must sum to 100.
  8. "Destruction Scale": A 0-10 rating of the potential destructive power. 0 is inert, 10 is a catastrophic explosion.

  If the combination of chemicals does not react under the given conditions, state that clearly, but still describe the visual mixing.`,
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
