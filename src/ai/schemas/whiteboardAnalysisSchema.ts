
/**
 * @fileOverview Zod schemas for the whiteboard analysis flow.
 */

import {z} from 'genkit';

export const WhiteboardAnalysisInputSchema = z.object({
  diagram: z
    .string()
    .describe(
      "A PNG image of the user's whiteboard diagram, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:image/png;base64,<encoded_data>'."
    ),
});
export type WhiteboardAnalysisInput = z.infer<typeof WhiteboardAnalysisInputSchema>;

export const WhiteboardAnalysisOutputSchema = z.object({
  title: z
    .string()
    .describe(
      "A plausible, scientific-sounding name for the experiment or apparatus shown in the diagram."
    ),
  apparatus: z
    .string()
    .describe(
      'A description of the experimental setup. Identify components and their connections.'
    ),
  prediction: z
    .string()
    .describe(
      'A prediction of the chemical process and outcome based on the diagram. Mention any potential hazards or required conditions.'
    ),
});
export type WhiteboardAnalysisOutput = z.infer<typeof WhiteboardAnalysisOutputSchema>;
