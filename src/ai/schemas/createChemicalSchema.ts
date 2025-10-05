
/**
 * @fileOverview Zod schemas for the create chemical flow.
 */

import {z} from 'genkit';

export const CreateChemicalInputSchema = z.object({
  name: z.string().describe('The common name of the chemical to create.'),
});
export type CreateChemicalInput = z.infer<typeof CreateChemicalInputSchema>;

export const CreateChemicalOutputSchema = z.object({
  found: z.boolean().describe('Whether a real chemical was found.'),
  formula: z.string().optional().describe('The chemical formula of the created chemical.'),
  name: z.string().optional().describe('The scientific name of the created chemical.'),
  isElement: z.boolean().optional().describe('Always false for custom chemicals.'),
  effects: z.object({
      color: z
        .string()
        .describe(
          "A hex color code (e.g., '#ff0000') for the chemical's appearance."
        ),
      bubbles: z
        .number()
        .min(0)
        .max(10)
        .describe(
          'The intensity of bubble formation, from 0 (none) to 10 (very intense).'
        ),
      smoke: z
        .number()
        .min(0)
        .max(1)
        .describe('The density of smoke produced, from 0 (none) to 1 (thick smoke).'),
      sparkles: z
        .number()
        .min(0)
        .max(50)
        .describe('The number of sparkles to show, from 0 to 50.'),
      glow: z
        .number()
        .min(0)
        .max(2)
        .describe(
          'The intensity of the glow effect, from 0 (none) to 2 (bright glow).'
        ),
      explosion: z
        .number()
        .min(0)
        .max(10)
        .describe(
          'The intensity of an explosion, from 0 (none) to 10 (massive).'
        ),
    }).optional().describe('The visual effects of the chemical.'),
});

export type CreateChemicalOutput = z.infer<typeof CreateChemicalOutputSchema>;
