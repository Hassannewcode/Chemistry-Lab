
'use server';
/**
 * @fileOverview A tool for retrieving precise chemical pricing.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// This is our "database" of chemical prices. It provides consistent, accurate data.
const chemicalPrices: Record<string, { name?: string; price: number; unit: string; currency: string; country: string; }> = {
    // Elements (per 100g) - Lab Grade Prices
    'H': { price: 0.5, unit: '100g', currency: 'USD', country: 'USA' },
    'He': { price: 5.0, unit: '100g', currency: 'USD', country: 'USA' },
    'Li': { price: 20.0, unit: '100g', currency: 'USD', country: 'USA' },
    'C': { price: 1.0, unit: '100g', currency: 'USD', country: 'USA' },
    'N': { price: 0.8, unit: '100g', currency: 'USD', country: 'USA' },
    'O': { price: 0.7, unit: '100g', currency: 'USD', country: 'USA' },
    'Na': { price: 15.0, unit: '100g', currency: 'USD', country: 'USA' },
    'Mg': { price: 3.0, unit: '100g', currency: 'USD', country: 'USA' },
    'Al': { price: 2.5, unit: '100g', currency: 'USD', country: 'USA' },
    'S': { price: 1.2, unit: '100g', currency: 'USD', country: 'USA' },
    'Cl': { price: 2.0, unit: '100g', currency: 'USD', country: 'USA' },
    'K': { price: 25.0, unit: '100g', currency: 'USD', country: 'USA' },
    'Ca': { price: 4.0, unit: '100g', currency: 'USD', country: 'USA' },
    'Fe': { price: 0.5, unit: '100g', currency: 'USD', country: 'USA' },
    'Cu': { price: 8.0, unit: '100g', currency: 'USD', country: 'USA' },
    'Zn': { price: 3.5, unit: '100g', currency: 'USD', country: 'USA' },
    'Ag': { price: 80.0, unit: '100g', currency: 'USD', country: 'USA' },
    'Au': { price: 6000.0, unit: '100g', currency: 'USD', country: 'USA' },
    'U': { price: 40.0, unit: '100g', currency: 'USD', country: 'USA' },
    // Liquids (per Liter)
    'H2O': { price: 0.1, unit: 'L', currency: 'USD', country: 'USA' },
    'C2H5OH': { price: 5.0, unit: 'L', currency: 'USD', country: 'USA' },
    'H2O2': { price: 3.0, unit: 'L', currency: 'USD', country: 'USA' },
    // Acids (per Liter)
    'HCl': { price: 10.0, unit: 'L', currency: 'USD', country: 'USA' },
    'H2SO4': { price: 8.0, unit: 'L', currency: 'USD', country: 'USA' },
    'HNO3': { price: 12.0, unit: 'L', currency: 'USD', country: 'USA' },
    'CH3COOH': { price: 4.0, unit: 'L', currency: 'USD', country: 'USA' },
    // Bases (per kg)
    'NaOH': { price: 7.0, unit: 'kg', currency: 'USD', country: 'USA' },
    'KOH': { price: 10.0, unit: 'kg', currency: 'USD', country: 'USA' },
    'NH3': { price: 6.0, unit: 'kg', currency: 'USD', country: 'USA' },
    // Salts (per kg)
    'NaCl': { price: 0.5, unit: 'kg', currency: 'USD', country: 'USA' },
    'CuSO4': { price: 15.0, unit: 'kg', currency: 'USD', country: 'USA' },
    'KNO3': { price: 5.0, unit: 'kg', currency: 'USD', country: 'USA' },
    'NaHCO3': { price: 2.0, unit: 'kg', currency: 'USD', country: 'USA' },
    'KMnO4': { price: 25.0, unit: 'kg', currency: 'USD', country: 'USA' },
    // Common Names
    'Baking Soda': { name: 'NaHCO3', price: 2.0, unit: 'kg', currency: 'USD', country: 'USA' },
    'Vinegar': { name: 'CH3COOH', price: 4.0, unit: 'L', currency: 'USD', country: 'USA' },
    'Salt': { name: 'NaCl', price: 0.5, unit: 'kg', currency: 'USD', country: 'USA' },
};

// Define grade multipliers
const gradeMultipliers: Record<string, number> = {
    'consumer': 0.6, // 60% of lab grade price
    'lab': 1.0,      // Baseline price
    'reagent': 2.5,  // 250% of lab grade price
    'synthetic': 1.8 // 180% of lab grade price
};

export const getChemicalPrice = ai.defineTool(
  {
    name: 'getChemicalPrice',
    description: 'Retrieves the precise, non-negotiable price for a given chemical and its grade from the simulation\'s official price list.',
    inputSchema: z.object({
      chemicalIdentifier: z.string().describe('The chemical formula or common name (e.g., "H2O", "Sodium Chloride", "Baking Soda").'),
      grade: z.enum(['consumer', 'lab', 'reagent', 'synthetic']).describe('The purity grade of the chemical.'),
    }),
    outputSchema: z.object({
        found: z.boolean().describe('Whether a price was found for the chemical.'),
        price: z.number().optional().describe('The price of the chemical.'),
        unit: z.string().optional().describe('The unit of measurement (e.g., "kg", "L", "100g").'),
        currency: z.string().optional().describe('The currency (e.g., "USD").'),
        country: z.string().optional().describe('The country of origin for the price data.'),
    }),
  },
  async (input) => {
    const priceData = chemicalPrices[input.chemicalIdentifier] || Object.values(chemicalPrices).find(p => p.name?.toLowerCase() === input.chemicalIdentifier.toLowerCase());

    if (priceData) {
      const multiplier = gradeMultipliers[input.grade] || 1.0;
      const finalPrice = priceData.price * multiplier;

      return {
        found: true,
        price: finalPrice,
        unit: priceData.unit,
        currency: priceData.currency,
        country: priceData.country,
      };
    }
    
    // Francium and other unpriceable items will correctly not be found
    return { found: false };
  }
);
