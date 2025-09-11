
'use server';
/**
 * @fileOverview An AI flow to retrieve usage data for a chemical element.
 */

import {ai} from '@/ai/genkit';
import {
  ElementUsageInput,
  ElementUsageInputSchema,
  ElementUsageOutputSchema,
} from '../schemas/elementUsageSchema';

export async function getElementUsage(input: ElementUsageInput) {
  return elementUsageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'elementUsagePrompt',
  input: {schema: ElementUsageInputSchema},
  output: {schema: ElementUsageOutputSchema},
  prompt: `You are a data visualization expert and science communicator.
  For the element "{{name}}", provide a breakdown of its common uses, natural sources, and everyday relevance.

  1.  **Overview**: Write a brief, engaging summary about this element's significance.
  2.  **Daily Objects**: List 3-5 common, everyday items that contain this element.
  3.  **Usage**: List the top 3-5 applications for this element and estimate their percentage of its total commercial/industrial use. These percentages must sum to 100.
  4.  **Sources**: List the top 2-4 places this element is found naturally and its relative abundance in those sources. These percentages must sum to 100.

  Provide the output in the specified JSON format. Be accurate but provide simplified, rounded percentages for educational purposes.`,
});

const elementUsageFlow = ai.defineFlow(
  {
    name: 'elementUsageFlow',
    inputSchema: ElementUsageInputSchema,
    outputSchema: ElementUsageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
