
'use server';
/**
 * @fileOverview An AI flow to retrieve information about a chemical.
 *
 * - getChemicalInfo - A function that provides details about a specific chemical.
 * - ChemicalInfoInput - The input type for the getChemicalInfo function.
 * - ChemicalInfoOutput - The return type for the getChemicalInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChemicalInfoInputSchema = z.object({
  name: z.string().describe('The common name of the chemical.'),
  formula: z.string().describe('The chemical formula.'),
});
export type ChemicalInfoInput = z.infer<typeof ChemicalInfoInputSchema>;

const ChemicalInfoOutputSchema = z.object({
  description: z.string().describe('A brief, easy-to-understand description of the chemical, its properties, and common uses.'),
  traits: z.string().describe("A summary of the chemical's key traits (e.g., 'Highly corrosive, strong oxidizer')."),
  possibleReactions: z.string().describe("A few interesting reaction combinations to suggest to the user for the simulator."),
  ratings: z.object({
      reactivity: z.number().min(0).max(10).describe('A rating from 0 (inert) to 10 (highly reactive).'),
      flammability: z.number().min(0).max(10).describe('A rating from 0 (non-flammable) to 10 (highly flammable).'),
      explosiveness: z.number().min(0).max(10).describe('A rating from 0 (stable) to 10 (highly explosive).'),
      radioactivity: z.number().min(0).max(10).describe('A rating from 0 (not radioactive) to 10 (highly radioactive).'),
      toxicity: z.number().min(0).max(10).describe('A rating from 0 (harmless) to 10 (highly toxic).'),
      corrosiveness: z.number().min(0).max(10).describe('A rating from 0 (non-corrosive) to 10 (highly corrosive).'),
  }).describe('Safety and property ratings on a scale of 0 to 10.'),
  experimentTips: z.string().describe('A few fun, simple, and safe experiment ideas or combinations to try with this chemical in the simulator. Be creative and encouraging.'),
});
export type ChemicalInfoOutput = z.infer<typeof ChemicalInfoOutputSchema>;

export async function getChemicalInfo(input: ChemicalInfoInput): Promise<ChemicalInfoOutput> {
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
    