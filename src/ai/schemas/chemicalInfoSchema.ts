
/**
 * @fileOverview Zod schemas for the chemical info flow.
 */

import {z} from 'genkit';

export const ChemicalInfoInputSchema = z.object({
  name: z.string().describe('The common name of the chemical.'),
  formula: z.string().describe('The chemical formula.'),
});
export type ChemicalInfoInput = z.infer<typeof ChemicalInfoInputSchema>;

export const ChemicalInfoOutputSchema = z.object({
  description: z
    .string()
    .describe(
      'A brief, easy-to-understand description of the chemical, its properties, and common uses.'
    ),
  traits: z
    .string()
    .describe(
      "A summary of the chemical's key traits (e.g., 'Highly corrosive, strong oxidizer')."
    ),
  possibleReactions: z
    .string()
    .describe(
      'A few interesting reaction combinations to suggest to the user for the simulator.'
    ),
  ratings: z
    .object({
      reactivity: z
        .number()
        .min(0)
        .max(10)
        .describe('A rating from 0 (inert) to 10 (highly reactive).'),
      flammability: z
        .number()
        .min(0)
        .max(10)
        .describe('A rating from 0 (non-flammable) to 10 (highly flammable).'),
      explosiveness: z
        .number()
        .min(0)
        .max(10)
        .describe('A rating from 0 (stable) to 10 (highly explosive).'),
      radioactivity: z
        .number()
        .min(0)
        .max(10)
        .describe(
          'A rating from 0 (not radioactive) to 10 (highly radioactive).'
        ),
      toxicity: z
        .number()
        .min(0)
        .max(10)
        .describe('A rating from 0 (harmless) to 10 (highly toxic).'),
      corrosiveness: z
        .number()
        .min(0)
        .max(10)
        .describe('A rating from 0 (non-corrosive) to 10 (highly corrosive).'),
    })
    .describe('Safety and property ratings on a scale of 0 to 10.'),
  experimentTips: z
    .string()
    .describe(
      'A few fun, simple, and safe experiment ideas or combinations to try with this chemical in the simulator. Be creative and encouraging.'
    ),
  priceData: z.array(z.object({
    country: z.string().describe('A major producing country.'),
    price: z.string().describe('The average price per unit, including currency.'),
    unit: z.string().describe('The unit of measurement (e.g., "per kg", "per liter").')
  })).describe('Average pricing information from major producing countries.'),
});
export type ChemicalInfoOutput = z.infer<typeof ChemicalInfoOutputSchema>;
