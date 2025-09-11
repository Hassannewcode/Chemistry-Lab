/**
 * @fileOverview Zod schemas for the reaction flow.
 */

import {z} from 'genkit';

export const ConductReactionInputSchema = z.object({
  chemicals: z
    .array(z.string())
    .describe(
      'An array of up to 12 chemical formulas or spray names to react.'
    ),
  temperature: z
    .number()
    .describe('The temperature for the reaction in Celsius.'),
  concentration: z
    .number()
    .describe('The concentration of the reactants in Molarity (M).'),
});
export type ConductReactionInput = z.infer<typeof ConductReactionInputSchema>;

const ProductSchema = z.object({
  formula: z.string().describe('The chemical formula of a product.'),
  state: z
    .enum(['s', 'l', 'g', 'aq'])
    .describe(
      'The physical state of the product: solid (s), liquid (l), gas (g), or aqueous (aq).'
    ),
});

const AnalogySchema = z.object({
  aspect: z
    .string()
    .describe('The aspect of the reaction being compared (e.g., "Energy Release", "Color", "Sound").'),
  comparison: z
    .string()
    .describe("The real-world object or phenomenon it's being compared to (e.g., 'a small firecracker', 'the color of a sapphire', 'a gentle fizz')."),
});


export const ConductReactionOutputSchema = z.object({
  reactionName: z
    .string()
    .describe(
      "The common or scientific name of the reaction, e.g., 'Neutralization' or 'Single Replacement'. If including sprays, name it something creative like 'Sparkling Volcano'."
    ),
  description: z
    .string()
    .describe(
      'A detailed but easy-to-understand description of what happens during the reaction. If sprays are involved, describe their visual effect on the reaction.'
    ),
  products: z
    .array(ProductSchema)
    .describe(
      'An array of the chemical products formed, including their formula and physical state (solid, liquid, gas, or aqueous).'
    ),
  safetyNotes: z
    .string()
    .describe(
      'Important safety warnings or interesting facts about the reaction. Be concise. Mention any spectacular visual results from sprays.'
    ),
  visualPreview: z
    .string()
    .describe(
      "A vivid, imaginative description of the final result, like a mini demo. e.g., 'A brilliant blue liquid now fizzes gently, with tiny silver flakes suspended within, glowing faintly.'"
    ),
  realWorldProbability: z
    .object({
      success: z
        .number()
        .min(0)
        .max(100)
        .describe(
          'The probability percentage (0-100) that this reaction would occur as described under ideal real-world lab conditions.'
        ),
      failure: z
        .number()
        .min(0)
        .max(100)
        .describe(
          'The probability percentage (0-100) that this reaction would fail or not occur as described in the real world.'
        ),
    })
    .describe(
      'The estimated probability of this reaction occurring in a real lab.'
    ),
  destructionScale: z
    .number()
    .min(0)
    .max(10)
    .describe(
      'A rating from 0 (completely inert) to 10 (catastrophically destructive) of the potential destructive power of this reaction.'
    ),
  analogies: z
    .array(AnalogySchema)
    .describe(
        "An array of 2-3 simple, real-world analogies to help visualize the reaction's scale or effects. For instance, if there's an explosion, compare its energy to 'a small firecracker.' If it glows, compare the brightness to 'a camera flash.' If it's a certain color, compare it to a common object like 'the color of a sapphire.'"
    ),
  effects: z
    .object({
      color: z
        .string()
        .describe(
          "A hex color code (e.g., '#ff0000') for the final liquid mixture. This should reflect the color of the products."
        ),
      bubbles: z
        .number()
        .min(0)
        .max(10)
        .describe(
          'The intensity of bubble formation, from 0 (none) to 10 (very intense).'
        ),
      smoke: z
        .number()
        .min(0)
        .max(1)
        .describe('The density of smoke produced, from 0 (none) to 1 (thick smoke).'),
      sparkles: z
        .number()
        .min(0)
        .max(50)
        .describe('The number of sparkles to show, from 0 to 50.'),
      glow: z
        .number()
        .min(0)
        .max(2)
        .describe(
          'The intensity of the glow effect, from 0 (none) to 2 (bright glow).'
        ),
      explosion: z
        .number()
        .min(0)
        .max(10)
        .describe(
          'The intensity of an explosion, from 0 (none) to 10 (massive). An explosion is a rapid release of energy and should be used for highly exothermic or volatile reactions.'
        ),
    })
    .describe('The visual effects of the resulting reaction products.'),
});
export type ConductReactionOutput = z.infer<typeof ConductReactionOutputSchema>;

    