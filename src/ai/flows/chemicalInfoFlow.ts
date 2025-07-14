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
  1.  **Description**: Briefly describe what this chemical is. What are its key properties (like color, state at room temperature)? What is it commonly used for?
  2.  **Experiment Tips**: Suggest some fun things the student could try with this chemical in the simulator. For example, 'Try mixing it with a strong acid like HCl and see the bubbles!' or 'Add some Sodium (Na) to see a colorful reaction!'. Keep it exciting and focused on the simulation.`,
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
