
/**
 * @fileOverview Zod schemas for the common name flow.
 */

import {z} from 'genkit';

export const CommonNameInputSchema = z.object({
  scientificName: z.string().describe('The scientific name of the chemical.'),
  formula: z.string().describe('The chemical formula.'),
});
export type CommonNameInput = z.infer<typeof CommonNameInputSchema>;

export const CommonNameOutputSchema = z.object({
  commonName: z
    .string()
    .describe('The most common, simple, or household name for the chemical.'),
});
export type CommonNameOutput = z.infer<typeof CommonNameOutputSchema>;
