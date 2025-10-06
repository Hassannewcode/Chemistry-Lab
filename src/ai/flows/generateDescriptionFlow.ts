
'use server';
/**
 * @fileOverview An AI flow to generate a description for a custom chemical.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateDescriptionInput,
  GenerateDescriptionInputSchema,
  GenerateDescriptionOutputSchema,
} from '../schemas/generateDescriptionSchema';

export async function generateDescription(input: GenerateDescriptionInput) {
  return generateDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDescriptionPrompt',
  input: {schema: GenerateDescriptionInputSchema},
  output: {schema: GenerateDescriptionOutputSchema},
  prompt: `You are a creative scientist writing a brief, engaging description for a new item in a lab simulation.
  The item is named: "{{name}}"

  Based on the name, write a one-paragraph description. It should be evocative and hint at the item's potential properties or use. Be imaginative but keep it grounded in a pseudo-scientific tone.

  For example, if the name is "Glowing Shard," a good description would be: "A crystalline fragment that pulses with a soft, internal luminescence. It feels cool to the touch and seems to hum at a frequency just beyond the range of normal hearing, suggesting it might react interestingly to energy inputs."

  If the name is a real chemical, like "Sodium Bicarbonate," describe it as if for a lab inventory: "A fine, white crystalline powder, commonly known as baking soda. It's a mild alkaline substance, often used as a leavening agent or for neutralization reactions."`,
});

const generateDescriptionFlow = ai.defineFlow(
  {
    name: 'generateDescriptionFlow',
    inputSchema: GenerateDescriptionInputSchema,
    outputSchema: GenerateDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
