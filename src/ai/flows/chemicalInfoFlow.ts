
'use server';
/**
 * @fileOverview An AI flow to retrieve information about a chemical.
 */

import {ai} from '@/ai/genkit';
import {
  ChemicalInfoInput,
  ChemicalInfoInputSchema,
  ChemicalInfoOutputSchema,
} from '../schemas/chemicalInfoSchema';
import { getChemicalPrice } from '../tools/pricingTool';

export async function getChemicalInfo(input: ChemicalInfoInput) {
  return chemicalInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chemicalInfoPrompt',
  input: {schema: ChemicalInfoInputSchema},
  output: {schema: ChemicalInfoOutputSchema},
  tools: [getChemicalPrice],
  prompt: `You are a friendly chemistry teacher and market analyst explaining a substance for a virtual lab.

  Chemical Name: {{name}}
  Formula: {{formula}}

  Please provide the following in a concise and engaging way:
  1.  **Description**: Briefly describe what this chemical is, its key properties, and common uses.
  2.  **Traits**: Summarize its most important traits (e.g., 'Corrosive, volatile, strong odor').
  3.  **Possible Reactions**: Suggest some specific reaction partners from the simulation and what to look for (e.g., 'Mix with NaOH to see a neutralization reaction.').
  4.  **Ratings**: Provide a 0-10 rating for its reactivity, flammability, explosiveness, radioactivity, toxicity, and corrosiveness.
  5.  **Experiment Tips**: Give some fun, creative ideas for the simulator. For example, 'Try mixing it with a strong acid like HCl and see the bubbles!' or 'Add some Sodium (Na) to see a colorful reaction!'. Keep it exciting and focused on the simulation.
  6.  **Price Data**: You MUST use the 'getChemicalPrice' tool to get the official, non-negotiable price for this chemical. Display it exactly as returned by the tool. Do not invent or estimate a price. If the tool does not find a price, state that the price is unavailable.`,
});

const chemicalInfoFlow = ai.defineFlow(
  {
    name: 'chemicalInfoFlow',
    inputSchema: ChemicalInfoInputSchema,
    outputSchema: ChemicalInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
