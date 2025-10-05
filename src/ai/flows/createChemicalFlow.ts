
'use server';
/**
 * @fileOverview An AI flow to create a new chemical from a name.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  CreateChemicalInputSchema,
  CreateChemicalOutputSchema,
  CreateChemicalInput,
} from '../schemas/createChemicalSchema';

// This is a "mock" tool that simulates looking up chemical data.
// In a real application, this could be a database lookup or a web search.
const getChemicalProperties = ai.defineTool(
  {
    name: 'getChemicalProperties',
    description: 'Looks up the formula and scientific name of a chemical from its common name.',
    inputSchema: z.object({name: z.string()}),
    outputSchema: z.object({
        name: z.string().describe('The scientific (IUPAC) name.'),
        formula: z.string().describe('The chemical formula.'),
        found: z.boolean().describe('Whether the chemical was found.'),
    }),
  },
  async (input) => {
    const commonChemicals: Record<string, { name: string; formula: string }> = {
      vinegar: { name: 'Acetic Acid', formula: 'CH3COOH' },
      'baking soda': { name: 'Sodium Bicarbonate', formula: 'NaHCO3' },
      'table salt': { name: 'Sodium Chloride', formula: 'NaCl' },
      'rubbing alcohol': { name: 'Isopropyl Alcohol', formula: 'C3H8O' },
      'bleach': { name: 'Sodium Hypochlorite', formula: 'NaClO' },
      'rust': { name: 'Iron(III) Oxide', formula: 'Fe2O3' },
      'laughing gas': { name: 'Nitrous Oxide', formula: 'N2O' },
      'quartz': { name: 'Silicon Dioxide', formula: 'SiO2' },
    };
    const lookupKey = input.name.toLowerCase();
    if (commonChemicals[lookupKey]) {
      return { ...commonChemicals[lookupKey], found: true };
    }
    return { name: '', formula: '', found: false };
  }
);

export async function createChemical(input: CreateChemicalInput) {
  return createChemicalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createChemicalPrompt',
  input: {schema: CreateChemicalInputSchema},
  output: {schema: CreateChemicalOutputSchema},
  tools: [getChemicalProperties],
  prompt: `You are a chemistry expert creating a new chemical for a simulation based on user input.

  The user wants to create a chemical named: "{{name}}".

  1. First, use the getChemicalProperties tool to determine if this is a known common chemical and to get its real formula and scientific name.
  2. If the tool returns 'found: false', you MUST respond with 'found: false' and do not fill out any other fields.
  3. If the tool returns 'found: true', you MUST use the exact 'name' and 'formula' provided by the tool. Do not hallucinate a different name or formula.
  4. Based on the real chemical properties, generate a simple set of visual effects for the simulation.
      - color: A hex code representing the chemical's appearance in a solution or as a substance.
      - bubbles: 0-10 intensity.
      - smoke: 0-1 density.
      - sparkles: 0-50 count.
      - glow: 0-2 intensity.
      - explosion: 0-10 intensity.
     Be scientifically plausible. For example, 'Sodium Bicarbonate' should produce bubbles, and 'Sodium' should have a high explosion potential with water. 'Sodium Chloride' (salt) should be inert.
  5. Set 'isElement' to false.
  6. Set 'found' to true.`,
});

const createChemicalFlow = ai.defineFlow(
  {
    name: 'createChemicalFlow',
    inputSchema: CreateChemicalInputSchema,
    outputSchema: CreateChemicalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
