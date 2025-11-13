
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
  **Chemical Grade**: {{grade}}
  **Freeze Speed**: {{freezeSpeed}}

  **Your Task:**
  Based *only* on the inputs above and established chemical principles, provide the following:

  1.  **Reaction Name**: The correct scientific name for the reaction. If non-chemical sprays or modifiers are used, give it a creative but descriptive name (e.g., "Catalyzed Graphene Mist").
  2.  **Description**: A clear, step-by-step description of the chemical process. **You MUST explain how 'temperature', 'concentration', and 'grade' affect the reaction's rate, equilibrium, and outcome.**
      -   For 'grade': Explain the impact of the selected grade. 'consumer' grade may have impurities leading to side reactions or lower yield. 'lab' grade is the standard. 'reagent' grade ensures high purity and optimal results. 'synthetic' implies it was created in a lab, which can mean high purity but different trace impurities than a naturally-sourced chemical; some chemicals can ONLY be synthetic. For 'consumer' grade, be realistic about what's "DIY"—e.g., getting Lithium from batteries is plausible, but synthesizing complex compounds is not.
      -   For 'temperature' and 'concentration': Explain their effect on reaction rate.
  3.  **Products**: The chemical formulas of the main products and their physical state (solid, liquid, gas, or aqueous). This must be chemically accurate. The 'grade' MUST affect the purity and presence of side-products.
  4.  **Safety Notes**: A brief, important safety note or a fun, factual observation. It MUST end with the disclaimer: "(Disclaimer: This is an AI simulation. Always verify with authoritative sources.)"
  5.  **Visual Effects**: Generate plausible visual effects (color, bubbles, smoke, etc.) that are a direct result of the products and the reaction conditions.
  6.  **Visual Preview**: A short, vivid, and scientifically-grounded text description of the final result.
  7.  **Real-World Probability**: Estimate the success vs. failure percentage in a real lab, considering the given conditions. 'consumer' grade should have a lower success chance.
  8.  **Destruction Scale**: A 0-10 rating of the potential destructive power. 0 is inert, 10 is a catastrophic explosion. This must be based on the reaction's energy release.
  9.  **Analogies**: Provide 2-3 simple, real-world analogies for the reaction's effects, grounded in the scale of the reaction.
  10. **Light Test**: Describe what happens if the products are exposed to a strong light source (e.g., UV), noting any fluorescence, degradation, or lack of reaction.
  11. **Flame Test**: Describe what happens if the products are exposed to a high-temperature flame, including flame color and reactivity.
  12. **Freeze Test**: Describe what happens if the products are rapidly frozen. Your description MUST be influenced by the 'freezeSpeed' input (e.g., 'rapid' freezing leads to smaller crystals).
  13. **Total Cost**: You MUST use the 'getChemicalPrice' tool for each reactant, passing the current 'grade'. Sum the prices to get the total cost. Format the final number with commas as thousand separators (e.g., "$1,234,567.89"). If the number is extremely large (e.g., over a billion), you may use suffixes (e.g., "$1.2 Billion").
  14. **Element I/O**: Analyze the elemental composition of all reactants and products. Provide two arrays for input and output elements and their total relative amounts. This MUST be an accurate accounting of all atoms.

  If the combination of chemicals does not react, state that clearly, explaining why. Still describe the visual mixing and provide analogies for the mixture itself.`,
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
