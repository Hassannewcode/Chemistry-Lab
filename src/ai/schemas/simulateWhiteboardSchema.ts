
/**
 * @fileOverview Zod schemas for the whiteboard simulation flow.
 */

import {z} from 'genkit';

export const SimulateWhiteboardInputSchema = z.object({
  shapes: z
    .array(z.string())
    .describe(
      'An array of text strings extracted from shapes on the whiteboard.'
    ),
});
export type SimulateWhiteboardInput = z.infer<
  typeof SimulateWhiteboardInputSchema
>;

export const SimulateWhiteboardOutputSchema = z.object({
  chemicals: z
    .array(z.string())
    .describe(
      'A list of chemical formulas or names identified from the whiteboard text.'
    ),
});
export type SimulateWhiteboardOutput = z.infer<
  typeof SimulateWhiteboardOutputSchema
>;
