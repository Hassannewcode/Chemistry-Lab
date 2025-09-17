
'use server';
/**
 * @fileOverview An AI flow for analyzing a user's diagram on the whiteboard.
 */

import {ai} from '@/ai/genkit';
import {
    WhiteboardAnalysisInput,
    WhiteboardAnalysisInputSchema,
    WhiteboardAnalysisOutputSchema,
} from '../schemas/whiteboardAnalysisSchema';


export async function analyzeWhiteboard(input: WhiteboardAnalysisInput) {
  return whiteboardAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'whiteboardAnalysisPrompt',
  input: {schema: WhiteboardAnalysisInputSchema},
  output: {schema: WhiteboardAnalysisOutputSchema},
  prompt: `You are an expert chemist and inventor analyzing a diagram drawn by a student.
  The user has provided a diagram of a potential experimental setup.
  Your task is to analyze this diagram and provide a structured breakdown.

  **Diagram:**
  {{media url=diagram}}

  **Analysis Steps:**
  1.  **Title**: Give the invention or experiment a plausible, scientific-sounding name based on the diagram.
  2.  **Apparatus Description**: Describe the setup shown in the diagram. Identify the components (e.g., beakers, tubes, heat sources) and how they are connected. Infer the purpose of each part of the diagram.
  3.  **Process Prediction**: Based on the arrangement and any chemical formulas shown, predict the chemical process that is intended to occur. Be realistic about the potential outcomes, including successes, failures, or hazards. If it's unclear, state what information is missing.`,
});

const whiteboardAnalysisFlow = ai.defineFlow(
  {
    name: 'whiteboardAnalysisFlow',
    inputSchema: WhiteboardAnalysisInputSchema,
    outputSchema: WhiteboardAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
    
