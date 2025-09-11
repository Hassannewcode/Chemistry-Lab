
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

export async function getChemicalInfo(input: ChemicalInfoInput) {
  return chemicalInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chemicalInfoPrompt',
  input: {schema: ChemicalInfoInputSchema},
  output: {schema: ChemicalInfoOutputSchema},
  prompt: `You are a friendly chemistry teacher explaining a substance to a student for a virtual lab simulation.

  Chemical Name: {{name}}
  Formula: {{formula}}

  Please provide the following in a concise and engaging way:
  1.  **Description**: Briefly describe what this chemical is, its key properties, and common uses.
  2.  **Traits**: Summarize its most important traits (e.g., 'Corrosive, volatile, strong odor').
  3.  **Possible Reactions**: Suggest some specific reaction partners from the simulation and what to look for (e.g., 'Mix with NaOH to see a neutralization reaction.').
  4.  **Ratings**: Provide a 0-10 rating for its reactivity, flammability, explosiveness, radioactivity, toxicity, and corrosiveness.
  5.  **Experiment Tips**: Give some fun, creative ideas for the simulator. For example, 'Try mixing it with a strong acid like HCl and see the bubbles!' or 'Add some Sodium (Na) to see a colorful reaction!'. Keep it exciting and focused on the simulation.`,
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
