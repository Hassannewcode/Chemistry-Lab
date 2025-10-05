
'use server';
/**
 * @fileOverview A chemical reaction simulation AI flow.
 */

import {ai} from '@/ai/genkit';
import {
  ConductReactionInput,
  ConductReactionInputSchema,
  ConductReactionOutputSchema,
} from '../schemas/reactionSchema';

export async function conductReaction(input: ConductReactionInput) {
  return reactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reactionPrompt',
  input: {schema: ConductReactionInputSchema},
  output: {schema: ConductReactionOutputSchema},
  prompt: `You are a chemistry expert simulating a chemical reaction for a student. Some items might be non-chemical 'sprays' that add visual effects, or user-defined items. Your analysis must be as realistic as possible.

  Reactants: {{chemicals}}
  Temperature: {{temperature}}°C
  Concentration: {{concentration}}M

  Based on these inputs, provide the following:
  1. The name of the reaction. If sprays or unusual items are used, you MUST give it a fun, descriptive, creative name (e.g. "Sparkling Volcano", "Graphene Mist").
  2. A clear, step-by-step description of the chemical process. Explain what is happening at a molecular level in simple, realistic terms. If a user-provided name (like 'Baking Soda') is given, use that name in the description.
  3. The chemical formulas of the main products and their physical state (solid, liquid, gas, or aqueous). If no reaction occurs, state that and list the original chemicals. Sprays don't create products but affect the visual description.
  4. A brief, important safety note or a fun fact.
  5. The visual effects of the final products (color, bubbles, smoke, sparkles, glow, explosion). Be creative but scientifically plausible. An explosion must be for a highly exothermic or volatile reaction (e.g., alkali metals in water).
  6. A "Visual Preview": A short, vivid, and imaginative text description of the final result, as if giving a demo.
  7. "Real-World Probability": Estimate the percentage chance of success vs. failure for this reaction in a real lab. Consider purity, conditions, etc. The two probabilities must sum to 100.
  8. "Destruction Scale": A 0-10 rating of the potential destructive power. 0 is inert, 10 is a catastrophic explosion.
  9. "Analogies": Provide 2-3 simple, real-world analogies for the reaction's effects. For instance, if there's an explosion, compare its energy to 'a small firecracker.' If it glows, compare the brightness to 'a camera flash.' If it's a certain color, compare it to a common object like 'the color of a sapphire.'

  If the combination of chemicals does not react under the given conditions, state that clearly, but still describe the visual mixing and provide analogies for the mixture itself.`,
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

    