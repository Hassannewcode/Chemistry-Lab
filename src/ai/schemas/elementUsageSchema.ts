
/**
 * @fileOverview Zod schemas for the element usage flow.
 */

import {z} from 'genkit';

export const ElementUsageInputSchema = z.object({
  name: z
    .string()
    .describe('The common name of the element (e.g., "Carbon", "Gold").'),
});
export type ElementUsageInput = z.infer<typeof ElementUsageInputSchema>;

export const ElementUsageOutputSchema = z.object({
  overview: z
    .string()
    .describe(
      "A brief, engaging overview of the element's importance and primary role in technology and nature."
    ),
  dailyObjects: z
    .array(z.string())
    .describe(
      "A list of 3-5 common, everyday objects where this element is found. (e.g., 'Smartphones', 'Jewelry', 'Car Batteries')."
    ),
  usage: z
    .array(
      z.object({
        name: z
          .string()
          .describe(
            "The name of the usage category (e.g., 'Electronics', 'Jewelry', 'Industrial')."
          ),
        value: z
          .number()
          .min(0)
          .max(100)
          .describe(
            "The percentage of the element's total usage this category represents. All values should sum to 100."
          ),
      })
    )
    .describe(
      'An array of objects representing the primary uses of the element and their approximate percentage of total use. Provide 3-5 of the most common uses. Ensure the percentages sum to 100.'
    ),
  sources: z
    .array(
      z.object({
        name: z
          .string()
          .describe(
            "The name of the source or location (e.g., 'Earth's Crust', 'Atmosphere', 'Asteroids')."
          ),
        value: z
          .number()
          .min(0)
          .max(100)
          .describe(
            'The relative abundance in this source as a percentage. All values should sum to 100.'
          ),
      })
    )
    .describe(
      'An array of objects representing the primary natural sources of the element and its relative abundance there. Provide 2-4 common sources. Ensure percentages sum to 100.'
    ),
});
export type ElementUsageOutput = z.infer<typeof ElementUsageOutputSchema>;
