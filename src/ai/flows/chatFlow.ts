
'use server';
/**
 * @fileOverview An AI flow for a conversational chemistry expert.
 */

import {ai} from '@/ai/genkit';
import {ChatInput, ChatInputSchema, ChatOutputSchema} from '../schemas/chatSchema';


export async function chatAboutReaction(input: ChatInput) {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are a brilliant, knowledgeable, and direct chemistry expert. You are analyzing the results of a virtual experiment.
  A user will ask you a question about the reaction that just occurred. Use the provided context to form your answer.
  Be helpful, accurate, and straightforward. Do not be evasive. If the user asks about the potential dangers or destructive power, answer factually based on the data.
  When referring to reactants, use their common name if available (e.g. 'Baking Soda' instead of 'NaHCO3').

  **Reaction Context:**
  - **Reactants**: {{reactionContext.reactants}}
  - **Temperature**: {{reactionContext.temperature}}°C
  - **Concentration**: {{reactionContext.concentration}}M

  **Simulation Results:**
  - **Reaction Name**: {{reactionContext.reactionResult.reactionName}}
  - **Description**: {{reactionContext.reactionResult.description}}
  - **Products**: {{#each reactionContext.reactionResult.products}}{{this.formula}} ({{this.state}}){{#unless @last}}, {{/unless}}{{/each}}
  - **Visual Preview**: "{{reactionContext.reactionResult.visualPreview}}"
  - **Safety Notes**: {{reactionContext.reactionResult.safetyNotes}}
  - **Destruction Scale (0-10)**: {{reactionContext.reactionResult.destructionScale}}
  - **Real-World Success Probability**: {{reactionContext.reactionResult.realWorldProbability.success}}%
  - **Visual Effects**:
    - Color: {{reactionContext.reactionResult.effects.color}}
    - Bubbles (0-10): {{reactionContext.reactionResult.effects.bubbles}}
    - Smoke (0-1): {{reactionContext.reactionResult.effects.smoke}}
    - Sparkles (0-50): {{reactionContext.reactionResult.effects.sparkles}}
    - Glow (0-2): {{reactionContext.reactionResult.effects.glow}}
    - Explosion (0-10): {{reactionContext.reactionResult.effects.explosion}}

  ---

  **User's Question**: "{{question}}"

  Based on all the data above, provide a clear and expert answer.`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
       {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ]
  }
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
    