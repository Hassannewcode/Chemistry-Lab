
/**
 * @fileOverview Zod schemas for the create chemical flow.
 */

import {z} from 'genkit';

export const CreateChemicalInputSchema = z.object({
  name: z.string().describe('The common name or title of the chemical/item to create.'),
  category: z.enum(['ordinary', 'compound', 'utility', 'custom', 'modifier']).describe('The user-selected category for the creation request.'),
  description: z.string().optional().describe('A user-provided description for a custom item.'),
  isEditing: z.boolean().optional().describe('A flag to indicate if the user is editing an existing item.'),
});
export type CreateChemicalInput = z.infer<typeof CreateChemicalInputSchema>;

export const CreateChemicalOutputSchema = z.object({
  found: z.boolean().describe('Whether a real chemical was found or an item was successfully created.'),
  suggestion: z.string().optional().describe("An informative message for the user if a category was auto-corrected (e.g., 'I noticed this is a utility, so I've categorized it as such.')."),
  formula: z.string().optional().describe('The chemical formula of the created chemical.'),
  name: z.string().optional().describe('The scientific or common name of the created chemical.'),
  commonName: z.string().optional().describe('The simple, common name for the item (e.g., "Baking Soda").'),
  isElement: z.boolean().optional().describe('True if the item is a single element, false otherwise.'),
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

    