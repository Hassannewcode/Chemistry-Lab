
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
import { getChemicalPrice } from '../tools/pricingTool';

export async function conductReaction(input: ConductReactionInput) {
  return reactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reactionPrompt',
  input: {schema: ConductReactionInputSchema},
  output: {schema: ConductReactionOutputSchema},
  tools: [getChemicalPrice],
  prompt: `You are a chemistry expert simulating a chemical reaction for a student. Your analysis must be as realistic and factual as possible, strictly adhering to chemical principles. Every detail of your output must be directly influenced by the provided inputs.

  **Reactants**: {{chemicals}}
  **Temperature**: {{temperature}}°C
  **Concentration**: {{concentration}}M
  **Freeze Speed**: {{freezeSpeed}}

  **Your Task:**
  Based *only* on the inputs above and established chemical principles, provide the following:

  1.  **Reaction Name**: The correct scientific name for the reaction. If non-chemical sprays or modifiers are used, give it a creative but descriptive name (e.g., "Catalyzed Graphene Mist").
  2.  **Description**: A clear, step-by-step description of the chemical process. **You MUST explain how the specified 'temperature' and 'concentration' affect the reaction's rate, equilibrium, and outcome.** For example, state "At {{temperature}}°C, the reaction rate increases, favoring the formation of..." or "The high {{concentration}}M concentration drives the reaction forward, resulting in...". If a 'modifier' is present, explain its precise effect (e.g., "The 'Solidify' modifier then rapidly cools the mixture, causing precipitation.").
  3.  **Products**: The chemical formulas of the main products and their physical state (solid, liquid, gas, or aqueous). This must be chemically accurate. Modifiers like 'Solidify', 'Liquefy', or 'Vaporize' MUST influence the final state of the products. Sprays do not create products but affect the visual description.
  4.  **Safety Notes**: A brief, important safety note or a fun, factual observation. It MUST end with the disclaimer: "(Disclaimer: This is an AI simulation. Always verify with authoritative sources.)"
  5.  **Visual Effects**: Generate plausible visual effects (color, bubbles, smoke, etc.) that are a direct result of the products and the reaction conditions. An explosion MUST only be for a valid exothermic or volatile reaction.
  6.  **Visual Preview**: A short, vivid, and scientifically-grounded text description of the final result.
  7.  **Real-World Probability**: Estimate the success vs. failure percentage in a real lab, considering the given conditions. The two probabilities must sum to 100.
  8.  **Destruction Scale**: A 0-10 rating of the potential destructive power. 0 is inert, 10 is a catastrophic explosion. This must be based on the reaction's energy release.
  9.  **Analogies**: Provide 2-3 simple, real-world analogies for the reaction's effects, grounded in the scale of the reaction.
  10. **Light Test**: Describe what happens if the products are exposed to a strong light source (e.g., UV), noting any fluorescence, degradation, or lack of reaction.
  11. **Flame Test**: Describe what happens if the products are exposed to a high-temperature flame, including flame color and reactivity.
  12. **Freeze Test**: Describe what happens if the products are rapidly frozen. Your description MUST be influenced by the 'freezeSpeed' input (e.g., 'rapid' freezing leads to smaller crystals).
  13. **Total Cost**: You MUST use the 'getChemicalPrice' tool for each reactant to get its official price. Sum the prices to get the total cost. Format as a precise number (e.g., "$15.50").
  14. **Element I/O**: Analyze the elemental composition of all reactants and products. Provide two arrays for input and output elements and their total relative amounts. This MUST be an accurate accounting of all atoms.

  If the combination of chemicals does not react under the given conditions, state that clearly, explaining why (e.g., "At this low temperature, the activation energy is not met."). Still describe the visual mixing and provide analogies for the mixture itself. Do not invent a reaction where none would occur.`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
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

    