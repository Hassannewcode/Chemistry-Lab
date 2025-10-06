
/**
 * @fileOverview Zod schemas for the generate description flow.
 */

import {z} from 'genkit';

export const GenerateDescriptionInputSchema = z.object({
  name: z.string().describe('The name of the item to describe.'),
});
export type GenerateDescriptionInput = z.infer<
  typeof GenerateDescriptionInputSchema
>;

export const GenerateDescriptionOutputSchema = z.object({
  description: z
    .string()
    .describe(
      'A creative, one-paragraph description for the item. It should sound scientific but can be imaginative.'
    ),
});
export type GenerateDescriptionOutput = z.infer<
  typeof GenerateDescriptionOutputSchema
>;
