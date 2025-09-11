
'use server';
/**
 * @fileOverview An AI flow to retrieve usage data for a chemical element.
 *
 * - getElementUsage - A function that provides world usage data for an element.
 * - ElementUsageInput - The input type for the getElementUsage function.
 * - ElementUsageOutput - The return type for the getElementUsage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ElementUsageInputSchema = z.object({
  name: z.string().describe('The common name of the element (e.g., "Carbon", "Gold").'),
});
export type ElementUsageInput = z.infer<typeof ElementUsageInputSchema>;

const ElementUsageOutputSchema = z.object({
  overview: z.string().describe("A brief, engaging overview of the element's importance and primary role in technology and nature."),
  dailyObjects: z.array(z.string()).describe("A list of 3-5 common, everyday objects where this element is found. (e.g., 'Smartphones', 'Jewelry', 'Car Batteries')."),
  usage: z.array(z.object({
    name: z.string().describe("The name of the usage category (e.g., 'Electronics', 'Jewelry', 'Industrial')."),
    value: z.number().min(0).max(100).describe("The percentage of the element's total usage this category represents. All values should sum to 100."),
  })).describe("An array of objects representing the primary uses of the element and their approximate percentage of total use. Provide 3-5 of the most common uses. Ensure the percentages sum to 100."),
  sources: z.array(z.object({
      name: z.string().describe("The name of the source or location (e.g., 'Earth's Crust', 'Atmosphere', 'Asteroids')."),
      value: z.number().min(0).max(100).describe("The relative abundance in this source as a percentage. All values should sum to 100."),
  })).describe("An array of objects representing the primary natural sources of the element and its relative abundance there. Provide 2-4 common sources. Ensure percentages sum to 100."),
});
export type ElementUsageOutput = z.infer<typeof ElementUsageOutputSchema>;

export async function getElementUsage(input: ElementUsageInput): Promise<ElementUsageOutput> {
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

    