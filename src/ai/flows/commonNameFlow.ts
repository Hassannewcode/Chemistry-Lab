
'use server';
/**
 * @fileOverview An AI flow to find the common name of a chemical.
 */

import {ai} from '@/ai/genkit';
import {
  CommonNameInput,
  CommonNameInputSchema,
  CommonNameOutputSchema,
} from '../schemas/commonNameSchema';

export async function getCommonName(input: CommonNameInput) {
  return commonNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'commonNamePrompt',
  input: {schema: CommonNameInputSchema},
  output: {schema: CommonNameOutputSchema},
  prompt: `You are a chemist and an expert in nomenclature. Your task is to find the most common, simple, or household name for a given chemical.

  Scientific Name: {{scientificName}}
  Formula: {{formula}}

  If the chemical has a very common name (e.g., Sodium Bicarbonate is "Baking Soda"; Acetic Acid is "Vinegar"), provide that name.
  If it has a well-known, but not necessarily household, name (e.g., Sodium Chloride is "Table Salt"), provide that.
  If the scientific name is already the most common name used, just return the scientific name.
  Do not provide a description, just the name.`,
});

const commonNameFlow = ai.defineFlow(
  {
    name: 'commonNameFlow',
    inputSchema: CommonNameInputSchema,
    outputSchema: CommonNameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
