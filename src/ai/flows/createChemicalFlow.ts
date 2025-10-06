
'use server';
/**
 * @fileOverview An AI flow to create a new chemical from a name.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  CreateChemicalInputSchema,
  CreateChemicalOutputSchema,
  CreateChemicalInput,
} from '../schemas/createChemicalSchema';

// This is a "mock" tool that simulates looking up chemical data.
// In a real application, this could be a database lookup or a web search.
const getChemicalProperties = ai.defineTool(
  {
    name: 'getChemicalProperties',
    description: 'Looks up the formula, scientific name, and common name of a chemical from its common name.',
    inputSchema: z.object({name: z.string()}),
    outputSchema: z.object({
        name: z.string().describe('The scientific (IUPAC) name.'),
        commonName: z.string().describe('The simple, common name (e.g., "Baking Soda").'),
        formula: z.string().describe('The chemical formula.'),
        found: z.boolean().describe('Whether the chemical was found.'),
    }),
  },
  async (input) => {
    const commonChemicals: Record<string, { name: string; commonName: string; formula: string }> = {
      vinegar: { name: 'Acetic Acid', commonName: 'Vinegar', formula: 'CH3COOH' },
      'baking soda': { name: 'Sodium Bicarbonate', commonName: 'Baking Soda', formula: 'NaHCO3' },
      'table salt': { name: 'Sodium Chloride', commonName: 'Salt', formula: 'NaCl' },
      'rubbing alcohol': { name: 'Isopropyl Alcohol', commonName: 'Rubbing Alcohol', formula: 'C3H8O' },
      'bleach': { name: 'Sodium Hypochlorite', commonName: 'Bleach', formula: 'NaClO' },
      'rust': { name: 'Iron(III) Oxide', commonName: 'Rust', formula: 'Fe2O3' },
      'laughing gas': { name: 'Nitrous Oxide', commonName: 'Laughing Gas', formula: 'N2O' },
      'quartz': { name: 'Silicon Dioxide', commonName: 'Quartz', formula: 'SiO2' },
      'lemon': { name: 'Citric Acid', commonName: 'Lemon Juice', formula: 'C6H8O7' },
      'copper wire': { name: 'Copper', commonName: 'Copper Wire', formula: 'Cu' },
      'vacuum': { name: 'Vacuum', commonName: 'Vacuum', formula: 'Vac' },
    };
    const lookupKey = input.name.toLowerCase();
    if (commonChemicals[lookupKey]) {
      return { ...commonChemicals[lookupKey], found: true };
    }
    // Fallback for names that might be both common and scientific
    for (const key in commonChemicals) {
        if (commonChemicals[key].name.toLowerCase() === lookupKey) {
            return { ...commonChemicals[key], found: true };
        }
    }
    return { name: '', commonName: '', formula: '', found: false };
  }
);

export async function createChemical(input: CreateChemicalInput) {
  return createChemicalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createChemicalPrompt',
  input: {schema: CreateChemicalInputSchema},
  output: {schema: CreateChemicalOutputSchema},
  tools: [getChemicalProperties],
  prompt: `You are a chemistry expert creating a new item for a simulation based on user input. Your goal is to create the item as requested, and automatically correct the category if it seems mismatched, informing the user of the change.

  The user wants to create an item named: "{{name}}"
  They have categorized this item as: "{{category}}"
  Description (if provided): "{{description}}"

  1.  **Analyze and Auto-Correct Category**:
      -   First, determine if the user's input 'name' is mismatched for the selected 'category'.
      -   **If Mismatch Detected**:
          -   If the user chose 'ordinary' but the name is a comma-separated list (e.g., "Vinegar, Baking Soda"), you MUST change the category to 'compound' and set the suggestion to: "I noticed this is a mixture, so I've categorized it as a 'Compound' for you and created the resulting product."
          -   If the user chose 'ordinary' but the name is "Vacuum" or "Copper Wire" (a non-chemical utility), you MUST change the category to 'utility' and set the suggestion to: "I noticed '{{name}}' is a tool, so I've categorized it as a 'Utility' for you."
          -   If the user chose 'utility' but the name is "Water" or "Sodium Bicarbonate" (a simple chemical), you MUST change the category to 'ordinary' and set the suggestion to: "I noticed '{{name}}' is a chemical, so I've categorized it as an 'Ordinary' item for you."
      -   **If no mismatch is detected, proceed with the user's chosen category.**

  2.  **Process by the Final Category**:
      -   If the final category is **'ordinary'**: The user wants a single, simple chemical. Use the 'name' to find its properties using the getChemicalProperties tool.
      -   If the final category is **'compound'**: The user is listing multiple items to mix. The 'name' will be a comma-separated list (e.g., "Vinegar, Baking Soda"). You MUST treat this as a pre-reaction. Generate a new name, formula, and a simple common name for the *resulting mixture* (e.g., "Sodium Acetate Solution"). For the visual effects, simulate the reaction of these components (e.g., Vinegar + Baking Soda = lots of bubbles).
      -   If the final category is **'utility'**: The user is creating a tool or non-chemical item (e.g., "Copper Wire", "Vacuum"). Do not treat it as a chemical. For 'Copper Wire', find the properties for 'Copper'. For something like 'Vacuum', give it a unique formula like 'Vac' and inert effects (0 for all). The name and common name should be the utility name.
      -   If the final category is **'custom'**: The user is inventing an item. Use the 'name' and 'description' to be creative. Generate a plausible but fictional scientific name, a cool common name, and a unique formula (e.g., 'Xy-7b'). The effects should match the description. For example, if the description says "a glowing, unstable rock," generate high glow and explosion values.

  3.  **Get Properties (If applicable)**:
      -   For 'ordinary' and 'utility' items that map to a real chemical, use the getChemicalProperties tool to find the real formula, scientific name, and common name.
      -   For 'compound' or 'custom' items, you will determine the name, common name, and formula yourself based on the components or description.

  4.  **Handle Not Found**: If the tool is used and returns 'found: false' for an 'ordinary' item, you MUST respond with 'found: false' and do not fill out any other fields, except for a suggestion if applicable.

  5.  **Use Correct Info**: If the tool returns 'found: true', you MUST use the exact 'name', 'commonName', and 'formula' provided by the tool.

  6.  **Generate Effects**: Based on the final chemical/item, generate plausible visual effects. Be scientifically plausible. 'Sodium Bicarbonate' should produce bubbles. 'Sodium' should have a high explosion potential with water. 'NaCl' should be inert. For 'custom' items, base effects on the description.

  7.  **Set isElement**: This is 'true' only if the final item is a single element from the periodic table (e.g., 'Cu' from 'Copper Wire'). Otherwise, it is 'false'.

  8.  **Set 'found'**: Set to true if you successfully create an item.`,
});

const createChemicalFlow = ai.defineFlow(
  {
    name: 'createChemicalFlow',
    inputSchema: CreateChemicalInputSchema,
    outputSchema: CreateChemicalOutputSchema,
  },
  async input => {
    // If we are editing, we don't want to auto-correct the category.
    // The main prompt doesn't know about editing, so we can just bypass the auto-correction logic here.
    if (input.isEditing) {
        const {output} = await prompt(input);
        return output!;
    }
    
    const {output} = await prompt(input);
    return output!;
  }
);
