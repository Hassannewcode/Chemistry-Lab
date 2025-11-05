
'use server';
/**
 * @fileOverview An AI flow to simulate a reaction from whiteboard text shapes.
 */

import {ai} from '@/ai/genkit';
import {
  SimulateWhiteboardInput,
  SimulateWhiteboardInputSchema,
  SimulateWhiteboardOutputSchema,
} from '../schemas/simulateWhiteboardSchema';

export async function simulateWhiteboard(input: SimulateWhiteboardInput) {
  return simulateWhiteboardFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateWhiteboardPrompt',
  input: {schema: SimulateWhiteboardInputSchema},
  output: {schema: SimulateWhiteboardOutputSchema},
  prompt: `You are an expert chemist interpreting a student's notes from a digital whiteboard.
  The user will provide a list of text strings that are labels of shapes on the board.
  Your task is to identify which of these strings are likely to be chemical reactants.

  Whiteboard Text: {{shapes}}

  - Identify all strings that are valid chemical formulas or common chemical names.
  - Ignore any text that is clearly a note, a title, or a question (e.g., "My Experiment", "What happens if...?", "NaOH + HCl").
  - Return a list of the identified chemical formulas or names.
  - If no chemicals are found, return an empty array.`,
});

const simulateWhiteboardFlow = ai.defineFlow(
  {
    name: 'simulateWhiteboardFlow',
    inputSchema: SimulateWhiteboardInputSchema,
    outputSchema: SimulateWhiteboardOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
