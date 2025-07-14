
'use client';

import { useState } from 'react';
import { Beaker, Plus, Minus, Thermometer, ChevronsRight, FlaskConical, Loader2, X, Info, Grid3x3, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BeakerIcon, ChemicalEffect } from '@/components/beaker-icon';
import { VerticalSlider } from '@/components/vertical-slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { conductReaction, ConductReactionInput, ConductReactionOutput } from '@/ai/flows/reactionFlow';
import { getChemicalInfo, ChemicalInfoOutput } from '@/ai/flows/chemicalInfoFlow';
import { getElementUsage, ElementUsageOutput } from '@/ai/flows/elementUsageFlow';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { SoundManager } from '@/components/sound-manager';
import { Progress } from '@/components/ui/progress';
import { PeriodicTable } from '@/components/periodic-table';
import { UsageChart } from '@/components/usage-chart';

interface Chemical {
  formula: string;
  name: string;
  isElement?: boolean;
  effects?: Partial<ChemicalEffect>;
}

const CHEMICAL_CATEGORIES: Record<string, Chemical[]> = {
    ELEMENTS: [
        { formula: 'H', name: 'Hydrogen', isElement: true, effects: { color: '#f0f8ff', glow: 0.1 } }, { formula: 'He', name: 'Helium', isElement: true, effects: { color: '#d3d3d3', bubbles: 1 } },
        { formula: 'Li', name: 'Lithium', isElement: true, effects: { color: '#e0e0e0', explosion: 2 } }, { formula: 'Be', name: 'Beryllium', isElement: true, effects: { color: '#c0c0c0' } },
        { formula: 'B', name: 'Boron', isElement: true, effects: { color: '#a0a0a0' } }, { formula: 'C', name: 'Carbon', isElement: true, effects: { color: '#36454f' } },
        { formula: 'N', name: 'Nitrogen', isElement: true, effects: { color: '#add8e6', bubbles: 1 } }, { formula: 'O', name: 'Oxygen', isElement: true, effects: { color: '#87ceeb', bubbles: 1 } },
        { formula: 'F', name: 'Fluorine', isElement: true, effects: { color: '#98fb98', explosion: 0.1 } }, { formula: 'Ne', name: 'Neon', isElement: true, effects: { color: '#ffc0cb', glow: 0.5 } },
        { formula: 'Na', name: 'Sodium', isElement: true, effects: { color: '#fafad2', explosion: 5 } }, { formula: 'Mg', name: 'Magnesium', isElement: true, effects: { color: '#dcdcdc' } },
        { formula: 'Al', name: 'Aluminum', isElement: true, effects: { color: '#d3d3d3' } }, { formula: 'Si', name: 'Silicon', isElement: true, effects: { color: '#808080' } },
        { formula: 'P', name: 'Phosphorus', isElement: true, effects: { color: '#ffc0cb', glow: 0.2, explosion: 1.5 } }, { formula: 'S', name: 'Sulfur', isElement: true, effects: { color: '#ffff00', smoke: 0.2 } },
        { formula: 'Cl', name: 'Chlorine', isElement: true, effects: { color: '#90ee90', explosion: 0.1 } }, { formula: 'Ar', name: 'Argon', isElement: true, effects: { color: '#dda0dd', glow: 0.4 } },
        { formula: 'K', name: 'Potassium', isElement: true, effects: { color: '#f0e68c', explosion: 6 } }, { formula: 'Ca', name: 'Calcium', isElement: true, effects: { color: '#f5f5dc' } },
        { formula: 'Sc', name: 'Scandium', isElement: true, effects: { color: '#c0c0c0' } }, { formula: 'Ti', name: 'Titanium', isElement: true, effects: { color: '#b0c4de' } },
        { formula: 'V', name: 'Vanadium', isElement: true, effects: { color: '#6a5acd' } }, { formula: 'Cr', name: 'Chromium', isElement: true, effects: { color: '#e6e6fa' } },
        { formula: 'Mn', name: 'Manganese', isElement: true, effects: { color: '#ffdab9' } }, { formula: 'Fe', name: 'Iron', isElement: true, effects: { color: '#a0522d', smoke: 0.1 } },
        { formula: 'Co', name: 'Cobalt', isElement: true, effects: { color: '#4682b4' } }, { formula: 'Ni', name: 'Nickel', isElement: true, effects: { color: '#b0e0e6' } },
        { formula: 'Cu', name: 'Copper', isElement: true, effects: { color: '#b87333' } }, { formula: 'Zn', name: 'Zinc', isElement: true, effects: { color: '#d3d3d3' } },
        { formula: 'Ga', name: 'Gallium', isElement: true, effects: { color: '#c0c0c0' } }, { formula: 'Ge', name: 'Germanium', isElement: true, effects: { color: '#a9a9a9' } },
        { formula: 'As', name: 'Arsenic', isElement: true, effects: { color: '#808080' } }, { formula: 'Se', name: 'Selenium', isElement: true, effects: { color: '#ffc0cb' } },
        { formula: 'Br', name: 'Bromine', isElement: true, effects: { color: '#a52a2a' } }, { formula: 'Kr', name: 'Krypton', isElement: true, effects: { color: '#afeeee', glow: 0.6 } },
        { formula: 'Rb', name: 'Rubidium', isElement: true, effects: { color: '#f0e68c', explosion: 7 } }, { formula: 'Sr', name: 'Strontium', isElement: true, effects: { color: '#ff6347', glow: 0.3 } },
        { formula: 'Y', name: 'Yttrium', isElement: true, effects: { color: '#d3d3d3' } }, { formula: 'Zr', name: 'Zirconium', isElement: true, effects: { color: '#c0c0c0' } },
        { formula: 'Nb', name: 'Niobium', isElement: true, effects: { color: '#d3d3d3' } }, { formula: 'Mo', name: 'Molybdenum', isElement: true, effects: { color: '#b0c4de' } },
        { formula: 'Tc', name: 'Technetium', isElement: true, effects: { color: '#c0c0c0', glow: 1.2 } }, { formula: 'Ru', name: 'Ruthenium', isElement: true, effects: { color: '#d3d3d3' } },
        { formula: 'Rh', name: 'Rhodium', isElement: true, effects: { color: '#e6e6fa' } }, { formula: 'Pd', name: 'Palladium', isElement: true, effects: { color: '#d3d3d3' } },
        { formula: 'Ag', name: 'Silver', isElement: true, effects: { color: '#c0c0c0', sparkles: 2 } }, { formula: 'Cd', name: 'Cadmium', isElement: true, effects: { color: '#d3d3d3' } },
        { formula: 'In', name: 'Indium', isElement: true, effects: { color: '#c0c0c0' } }, { formula: 'Sn', name: 'Tin', isElement: true, effects: { color: '#d3d3d3' } },
        { formula: 'Sb', name: 'Antimony', isElement: true, effects: { color: '#a9a9a9' } }, { formula: 'Te', name: 'Tellurium', isElement: true, effects: { color: '#808080' } },
        { formula: 'I', name: 'Iodine', isElement: true, effects: { color: '#4b0082' } }, { formula: 'Xe', name: 'Xenon', isElement: true, effects: { color: '#87ceeb', glow: 0.8 } },
        { formula: 'Cs', name: 'Caesium', isElement: true, effects: { color: '#f0e68c', explosion: 8 } }, { formula: 'Ba', name: 'Barium', isElement: true, effects: { color: '#f5f5dc' } },
        { formula: 'La', name: 'Lanthanum', isElement: true, effects: { color: '#d3d3d3' } }, { formula: 'W', name: 'Tungsten', isElement: true, effects: { color: '#808080' } },
        { formula: 'Re', name: 'Rhenium', isElement: true, effects: { color: '#c0c0c0' } }, { formula: 'Os', name: 'Osmium', isElement: true, effects: { color: '#b0c4de' } },
        { formula: 'Ir', name: 'Iridium', isElement: true, effects: { color: '#e6e6fa' } }, { formula: 'Pt', name: 'Platinum', isElement: true, effects: { color: '#d3d3d3', sparkles: 1 } },
        { formula: 'Au', name: 'Gold', isElement: true, effects: { color: '#ffd700', sparkles: 5 } }, { formula: 'Hg', name: 'Mercury', isElement: true, effects: { color: '#e0e0e0', smoke: 0.3 } },
        { formula: 'Tl', name: 'Thallium', isElement: true, effects: { color: '#696969' } }, { formula: 'Pb', name: 'Lead', isElement: true, effects: { color: '#696969' } },
        { formula: 'Bi', name: 'Bismuth', isElement: true, effects: { color: '#ffc0cb', sparkles: 1 } }, { formula: 'Po', name: 'Polonium', isElement: true, effects: { color: '#add8e6', glow: 1.8 } },
        { formula: 'At', name: 'Astatine', isElement: true, effects: { color: '#4b0082', glow: 1.4 } }, { formula: 'Rn', name: 'Radon', isElement: true, effects: { color: '#e0ffff', glow: 1 } },
        { formula: 'Fr', name: 'Francium', isElement: true, effects: { color: '#f0e68c', explosion: 9 } }, { formula: 'Ra', name: 'Radium', isElement: true, effects: { color: '#f5f5dc', glow: 1.5 } },
        { formula: 'Ac', name: 'Actinium', isElement: true, effects: { color: '#c0c0c0', glow: 1.6 } }, { formula: 'Th', name: 'Thorium', isElement: true, effects: { color: '#a9a9a9', glow: 0.6 } },
        { formula: 'Pa', name: 'Protactinium', isElement: true, effects: { color: '#d3d3d3', glow: 1.1 } }, { formula: 'U', name: 'Uranium', isElement: true, effects: { color: '#90ee90', glow: 0.7 } },
        { formula: 'Np', name: 'Neptunium', isElement: true, effects: { color: '#4682b4', glow: 1.3 } }, { formula: 'Pu', name: 'Plutonium', isElement: true, effects: { color: '#ff69b4', glow: 0.9, explosion: 4 } },
    ],
    LIQUIDS: [
        { formula: 'H2O', name: 'Water', effects: { color: '#add8e6' } },
        { formula: 'C2H5OH', name: 'Ethanol', effects: { color: '#f0f8ff' } },
        { formula: 'CH3OH', name: 'Methanol', effects: { color: '#f8f8ff' } },
        { formula: 'CH3COCH3', name: 'Acetone', effects: { color: '#f0ffff' } },
        { formula: 'C3H8O3', name: 'Glycerin', effects: { color: '#fafafa' } },
        { formula: 'C6H14', name: 'Hexane', effects: { color: '#f5f5f5' } },
        { formula: 'H2O2', name: 'Hydrogen Peroxide', effects: { color: '#e0ffff', bubbles: 1 } },
    ],
    ACIDS: [
        { formula: 'HCl', name: 'Hydrochloric Acid', effects: { color: '#b0e0e6', smoke: 0.1 } }, { formula: 'H2SO4', name: 'Sulfuric Acid', effects: { color: '#f0f8ff', smoke: 0.4 } },
        { formula: 'HNO3', name: 'Nitric Acid', effects: { color: '#fafad2', smoke: 0.3 } }, { formula: 'CH3COOH', name: 'Acetic Acid', effects: { color: '#f5f5f5' } },
        { formula: 'H3PO4', name: 'Phosphoric Acid', effects: { color: '#f0fff0' } }, { formula: 'H2CO3', name: 'Carbonic Acid', effects: { color: '#f0ffff', bubbles: 2 } },
        { formula: 'HF', name: 'Hydrofluoric Acid', effects: { color: '#e0ffff', smoke: 0.6 } }, { formula: 'HBr', name: 'Hydrobromic Acid', effects: { color: '#e6e6fa', smoke: 0.2 } },
        { formula: 'HI', name: 'Hydroiodic Acid', effects: { color: '#fff0f5', smoke: 0.2 } }, { formula: 'HClO4', name: 'Perchloric Acid', effects: { color: '#f8f8ff', explosion: 0.2 } },
        { formula: 'HCN', name: 'Hydrogen Cyanide', effects: { color: '#e0ffff', smoke: 0.2 } }, { formula: 'H2S', name: 'Hydrosulfuric Acid', effects: { color: '#f5f5f5', smoke: 0.5 } },
        { formula: 'H3BO3', name: 'Boric Acid', effects: { color: '#fafafa' } },
    ],
    BASES: [
        { formula: 'NaOH', name: 'Sodium Hydroxide', effects: { color: '#f8f8ff' } }, { formula: 'KOH', name: 'Potassium Hydroxide', effects: { color: '#faf0e6' } },
        { formula: 'Ca(OH)2', name: 'Calcium Hydroxide', effects: { color: '#fdf5e6' } }, { formula: 'NH3', name: 'Ammonia', effects: { color: '#f0fff0', smoke: 0.1 } },
        { formula: 'Mg(OH)2', name: 'Magnesium Hydroxide', effects: { color: '#fffafa' } }, { formula: 'LiOH', name: 'Lithium Hydroxide', effects: { color: '#f5fffa' } },
        { formula: 'Ba(OH)2', name: 'Barium Hydroxide', effects: { color: '#fff5ee' } }, { formula: 'Sr(OH)2', name: 'Strontium Hydroxide', effects: { color: '#ffefd5' } },
        { formula: 'NH4OH', name: 'Ammonium Hydroxide', effects: { color: '#f0f8ff' } }, { formula: 'Al(OH)3', name: 'Aluminum Hydroxide', effects: { color: '#f0fff0' } },
        { formula: 'Fe(OH)2', name: 'Iron(II) Hydroxide', effects: { color: '#f5f5f5' } }, { formula: 'Fe(OH)3', name: 'Iron(III) Hydroxide', effects: { color: '#e0cdac' } },
    ],
    SALTS: [
        { formula: 'NaCl', name: 'Sodium Chloride', effects: { color: '#ffffff' } }, { formula: 'CuSO4', name: 'Copper Sulfate', effects: { color: '#87ceeb' } },
        { formula: 'KNO3', name: 'Potassium Nitrate', effects: { color: '#f8f8ff' } }, { formula: 'NaHCO3', name: 'Sodium Bicarbonate', effects: { color: '#f5f5f5', bubbles: 4 } },
        { formula: 'AgNO3', name: 'Silver Nitrate', effects: { color: '#e6e6fa' } }, { formula: 'KCl', name: 'Potassium Chloride', effects: { color: '#fffafa' } },
        { formula: 'CaCO3', name: 'Calcium Carbonate', effects: { color: '#fafafa' } }, { formula: 'FeCl3', name: 'Iron(III) Chloride', effects: { color: '#f5deb3' } },
        { formula: 'KI', name: 'Potassium Iodide', effects: { color: '#fafad2' } }, { formula: 'AgCl', name: 'Silver Chloride', effects: { color: '#f8f8ff' } },
        { formula: 'Pb(NO3)2', name: 'Lead(II) Nitrate', effects: { color: '#fffafa' } }, { formula: 'KMnO4', name: 'Potassium Permanganate', effects: { color: '#8a2be2', explosion: 0.1 } },
        { formula: 'CuCl2', name: 'Copper(II) Chloride', effects: { color: '#add8e6' } }, { formula: 'Na2CO3', name: 'Sodium Carbonate', effects: { color: '#f0f0f0' } },
        { formula: 'Na2SO4', name: 'Sodium Sulfate', effects: { color: '#f5f5f5' } }, { formula: 'K2Cr2O7', name: 'Potassium Dichromate', effects: { color: '#ffa500', explosion: 0.2 } },
        { formula: 'NaCN', name: 'Sodium Cyanide', effects: { color: '#f5f5f5' } }, { formula: 'CaSO4', name: 'Calcium Sulfate', effects: { color: '#f0f0f0' } },
    ],
    GASES: [
        { formula: 'O2', name: 'Oxygen', effects: { bubbles: 3 } }, { formula: 'H2', name: 'Hydrogen', effects: { bubbles: 5, explosion: 0.2 } },
        { formula: 'N2', name: 'Nitrogen', effects: { bubbles: 2 } }, { formula: 'Cl2', name: 'Chlorine', effects: { color: '#90ee90', smoke: 0.5 } },
        { formula: 'CO2', name: 'Carbon Dioxide', effects: { bubbles: 4, smoke: 0.1 } }, { formula: 'SO2', name: 'Sulfur Dioxide', effects: { color: '#f0e68c', smoke: 0.7 } },
        { formula: 'NO2', name: 'Nitrogen Dioxide', effects: { color: '#a0522d', smoke: 0.8 } }, { formula: 'NH3', name: 'Ammonia', effects: { smoke: 0.1 } },
        { formula: 'SO3', name: 'Sulfur Trioxide', effects: { smoke: 0.9 } }, { formula: 'O3', name: 'Ozone', effects: { color: '#87ceeb', bubbles: 2 } },
    ],
    HALOGENS: [
        { formula: 'F2', name: 'Fluorine', effects: { color: '#98fb98', smoke: 0.4, explosion: 0.3 } }, { formula: 'Cl2', name: 'Chlorine', effects: { color: '#90ee90', smoke: 0.5 } },
        { formula: 'Br2', name: 'Bromine', effects: { color: '#a52a2a', smoke: 0.4 } }, { formula: 'I2', name: 'Iodine', effects: { color: '#4b0082', smoke: 0.3 } },
    ],
    ORGANIC: [
        { formula: 'CH4', name: 'Methane', effects: { bubbles: 3, explosion: 0.1 } }, { formula: 'C6H12O6', name: 'Glucose', effects: { color: '#fafad2' } },
        { formula: 'C3H8', name: 'Propane', effects: { bubbles: 4, explosion: 0.15 } }, { formula: 'C6H6', name: 'Benzene', effects: { color: '#fffacd' } },
        { formula: 'C2H2', name: 'Acetylene', effects: { bubbles: 5, explosion: 0.25 } },
        { formula: 'C7H8', name: 'Toluene', effects: { color: '#fffafa' } }, { formula: 'C8H18', name: 'Octane', effects: { explosion: 0.2 } },
        { formula: 'C6H5OH', name: 'Phenol', effects: { color: '#f5f5f5' } }, { formula: 'CH2O', name: 'Formaldehyde', effects: { color: '#f0f8ff' } },
    ],
    SPRAYS: [
        { formula: 'Fine Metal Dust', name: 'Fine Metal Dust', effects: { sparkles: 20 } },
        { formula: 'Smoke Powder', name: 'Smoke Powder', effects: { smoke: 1 } },
        { formula: 'Luminol Solution', name: 'Luminol Solution', effects: { glow: 2 } },
        { formula: 'Saturated Carbonate', name: 'Saturated Carbonate', effects: { bubbles: 10 } },
        { formula: 'High-Energy Catalyst', name: 'High-Energy Catalyst', effects: { explosion: 10 } },
        { formula: 'Combustion Promoter', name: 'Combustion Promoter', effects: { color: '#ff4500', glow: 1.5, smoke: 0.5, explosion: 0.1 } },
        { formula: 'Endothermic Agent', name: 'Endothermic Agent', effects: { color: '#e0ffff', glow: 0.5, sparkles: 5 } },
        { formula: 'pH Indicator', name: 'pH Indicator Dye', effects: { color: '#ff00ff' } },
        { formula: 'Graphene Aerogel', name: 'Graphene Aerogel', effects: { bubbles: 8, glow: 0.5, color: '#333333' } },
        { formula: 'Surfactant', name: 'Surfactant', effects: { sparkles: 10, bubbles: 2 } },
        { formula: 'Fire Spray', name: 'Fire Spray', effects: { color: '#ff6600', glow: 1, smoke: 0.5, explosion: 0.05 } },
        { formula: 'Ice Spray', name: 'Ice Spray', effects: { color: '#a6d9f7', glow: 0.3, sparkles: 3 } },
    ],
};

type ChemicalCategory = keyof typeof CHEMICAL_CATEGORIES;

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<ChemicalCategory>('ELEMENTS');
  const [beakerContents, setBeakerContents] = useState<Chemical[]>([]);
  const [temperature, setTemperature] = useState(25); // in Celsius
  const [concentration, setConcentration] = useState(1); // in Molarity (M)
  
  const [reactionResult, setReactionResult] = useState<ConductReactionOutput | null>(null);
  const [reactionEffects, setReactionEffects] = useState<ChemicalEffect | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [infoChemical, setInfoChemical] = useState<Chemical | null>(null);
  const [infoContent, setInfoContent] = useState<ChemicalInfoOutput | null>(null);
  const [usageContent, setUsageContent] = useState<ElementUsageOutput | null>(null);
  const [isInfoLoading, setIsInfoLoading] = useState(false);
  const [isPeriodicTableOpen, setIsPeriodicTableOpen] = useState(false);
  const [isUsageChartOpen, setIsUsageChartOpen] = useState(false);


  const handleAddChemical = (chemical: Chemical) => {
    if (beakerContents.length < 12) {
      setReactionEffects(null);
      setReactionResult(null);
      setBeakerContents([...beakerContents, chemical]);
    }
  };
  
  const handleAddElementFromTable = (elementName: string) => {
    const element = CHEMICAL_CATEGORIES.ELEMENTS.find(el => el.name === elementName);
    if (element) {
        handleAddChemical(element);
        toast({ title: `Added ${element.name} to beaker!` });
    }
  };

  const handleRemoveChemical = (chemicalFormula: string) => {
    setReactionEffects(null);
    setReactionResult(null);
    setBeakerContents(beakerContents.filter(c => c.formula !== chemicalFormula));
  };
  
  const handleClearBeaker = () => {
    setBeakerContents([]);
    setReactionResult(null);
    setReactionEffects(null);
  }

  const handleShowInfo = async (chemical: Chemical) => {
    setInfoChemical(chemical);
    setIsInfoLoading(true);
    setInfoContent(null);
    setUsageContent(null);
    setIsUsageChartOpen(false);
    try {
      const result = await getChemicalInfo({ name: chemical.name, formula: chemical.formula });
      setInfoContent(result);
    } catch (error) {
      console.error("Error fetching chemical info:", error);
      toast({
        variant: "destructive",
        title: "Info Error",
        description: "Could not fetch information for this chemical.",
      });
      setInfoChemical(null); // Close dialog on error
    } finally {
      setIsInfoLoading(false);
    }
  };

  const handleShowUsageChart = async () => {
    if (!infoChemical) return;
    setIsInfoLoading(true);
    setUsageContent(null);
    try {
      const result = await getElementUsage({ name: infoChemical.name });
      setUsageContent(result);
      setIsUsageChartOpen(true);
    } catch (error) {
      console.error("Error fetching element usage:", error);
      toast({
        variant: "destructive",
        title: "Usage Data Error",
        description: "Could not fetch usage data for this element.",
      });
    } finally {
      setIsInfoLoading(false);
    }
  }

  const handleStartReaction = async () => {
    if (beakerContents.length < 2) return;
    setIsLoading(true);
    setReactionResult(null);
    setReactionEffects(null);
    try {
      const input: ConductReactionInput = {
        chemicals: beakerContents.map(c => c.formula),
        temperature,
        concentration
      };
      const result = await conductReaction(input);
      setReactionResult(result);
      setReactionEffects(result.effects);
    } catch (error) {
      console.error("Error conducting reaction:", error);
      toast({
        variant: "destructive",
        title: "Simulation Error",
        description: "An unexpected error occurred during the simulation. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const changeTemperature = (amount: number) => {
    setTemperature(prev => Math.max(-273, prev + amount));
  }

  const changeConcentration = (amount: number) => {
    setConcentration(prev => Math.max(0.1, Math.round((prev + amount) * 10)/10 ));
  }


  return (
    <div className="bg-[#f0f2f5] min-h-screen flex items-center justify-center p-4 md:p-8 font-sans text-[#3D3D3D]">
      <SoundManager effects={reactionEffects} />
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Information & Controls */}
        <div className="flex flex-col justify-center space-y-8">
          <div className="text-left">
            <h1 className="text-6xl md:text-8xl font-bold text-[#E91E63]">Simulate</h1>
            <p className="text-3xl md:text-5xl font-semibold text-gray-600">
              Chemical Reactions
            </p>
          </div>
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Select Chemicals</CardTitle>
                    <CardDescription>Choose up to 12 chemicals & sprays to mix in the beaker.</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setIsPeriodicTableOpen(true)}>
                    <Grid3x3 className="mr-2 h-4 w-4" />
                    Periodic Table
                  </Button>
              </div>
            </CardHeader>
            <CardContent>
               <div className="w-full bg-gray-200 p-1 rounded-full mb-6 flex flex-wrap justify-center gap-1">
                {(Object.keys(CHEMICAL_CATEGORIES) as ChemicalCategory[]).map(category => (
                  <Button 
                    key={category}
                    variant={activeCategory === category ? 'default' : 'ghost'}
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full flex-1 text-xs md:text-sm ${activeCategory === category ? 'bg-primary text-primary-foreground shadow' : 'text-gray-600'}`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-60 overflow-y-auto pr-2">
                {CHEMICAL_CATEGORIES[activeCategory].map(chemical => (
                   <div key={chemical.formula} className="relative group">
                    <Button 
                      variant="outline"
                      onClick={() => handleAddChemical(chemical)}
                      disabled={beakerContents.length >= 12 || beakerContents.some(c => c.formula === chemical.formula)}
                      title={chemical.name}
                      className="w-full flex-col h-auto"
                    >
                      <span className="font-bold text-lg">{chemical.formula}</span>
                      <span className="text-xs text-muted-foreground">{chemical.name}</span>
                    </Button>
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="absolute top-0 right-0 h-6 w-6 opacity-50 group-hover:opacity-100"
                        onClick={() => handleShowInfo(chemical)}
                        title={`Info on ${chemical.name}`}
                    >
                        <Info size={14} />
                    </Button>
                   </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Simulation */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center justify-between border-2 border-gray-200 min-h-[600px]">
          
          <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Beaker</h2>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <p className="font-semibold">Contents:</p>
                  {beakerContents.length > 0 ? (
                    beakerContents.map(c => (
                      <span key={c.formula} className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                        {c.formula}
                        <button onClick={() => handleRemoveChemical(c.formula)} className="ml-2 text-blue-600 hover:text-blue-800">
                          <X size={14}/>
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">Empty</p>
                  )}
                  {beakerContents.length > 0 && 
                    <Button variant="destructive" size="sm" onClick={handleClearBeaker}>Clear</Button>
                  }
                </div>
            </div>
            
            <div className="relative w-full flex-1 flex items-center justify-center min-h-[300px]">
              <VerticalSlider
                label={`${concentration.toFixed(1)}M`}
                icon={<FlaskConical className="h-5 w-5" />}
                onIncrease={() => changeConcentration(0.1)}
                onDecrease={() => changeConcentration(-0.1)}
              />
              <VerticalSlider
                label={`${temperature}°C`}
                icon={<Thermometer className="h-5 w-5" />}
                onIncrease={() => changeTemperature(5)}
                onDecrease={() => changeTemperature(-5)}
              />

              <BeakerIcon contents={beakerContents} overrideEffects={reactionEffects} className="h-72 w-72" />
            </div>
          </div>
          
          <div className='w-full mt-4'>
            {reactionResult && !isLoading && (
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle>{reactionResult.reactionName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">{reactionResult.description}</p>
                  <p className="mb-2"><b>Products:</b> {reactionResult.products.join(', ')}</p>
                  <p className="mb-2 text-sm italic text-gray-600"><b>Analogy:</b> {reactionResult.analogy}</p>
                  <p className="text-sm text-yellow-800 bg-yellow-100 p-2 rounded-md"><b>Safety:</b> {reactionResult.safetyNotes}</p>
                </CardContent>
              </Card>
            )}
            <Button 
              className="w-full mt-4 h-14 text-xl" 
              onClick={handleStartReaction} 
              disabled={beakerContents.length < 2 || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <ChevronsRight className="mr-2 h-6 w-6" />
                  Start Reaction
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      <Toaster />
      <Dialog open={!!infoChemical} onOpenChange={(isOpen) => !isOpen && setInfoChemical(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>About {infoChemical?.name} ({infoChemical?.formula})</DialogTitle>
              {infoChemical?.isElement && (
                  <Button variant="outline" size="sm" onClick={handleShowUsageChart} disabled={isInfoLoading}>
                      <BarChart className="mr-2 h-4 w-4"/>
                      Usage
                  </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground pt-2 max-h-[70vh] overflow-y-auto pr-4">
              {isInfoLoading && !infoContent && (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {infoContent && !isUsageChartOpen && (
                <div className="mt-4 space-y-4 text-left text-sm text-foreground">
                  <div>
                    <h3 className="font-semibold mb-1">Description</h3>
                    <p>{infoContent.description}</p>
                  </div>
                   <div>
                    <h3 className="font-semibold mb-1">Traits</h3>
                    <p>{infoContent.traits}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Ratings</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-28">Reactivity</span>
                      <Progress value={infoContent.ratings.reactivity * 10} className="w-[60%]" />
                    </div>
                     <div className="flex items-center gap-2">
                      <span className="w-28">Flammability</span>
                      <Progress value={infoContent.ratings.flammability * 10} className="w-[60%]" />
                    </div>
                     <div className="flex items-center gap-2">
                      <span className="w-28">Explosiveness</span>
                      <Progress value={infoContent.ratings.explosiveness * 10} className="w-[60%]" />
                    </div>
                     <div className="flex items-center gap-2">
                      <span className="w-28">Radioactivity</span>
                      <Progress value={infoContent.ratings.radioactivity * 10} className="w-[60%]" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-28">Toxicity</span>
                      <Progress value={infoContent.ratings.toxicity * 10} className="w-[60%]" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-28">Corrosiveness</span>
                      <Progress value={infoContent.ratings.corrosiveness * 10} className="w-[60%]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Possible Reactions</h3>
                    <p>{infoContent.possibleReactions}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Experiment Tips</h3>
                    <p>{infoContent.experimentTips}</p>
                  </div>
                </div>
              )}
              {isUsageChartOpen && usageContent && (
                <UsageChart data={usageContent} />
              )}
              {isInfoLoading && isUsageChartOpen && (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog open={isPeriodicTableOpen} onOpenChange={setIsPeriodicTableOpen}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Periodic Table of Elements</DialogTitle>
                <DialogDescription>
                    Click an element to add it to the beaker.
                </DialogDescription>
            </DialogHeader>
            <PeriodicTable onElementClick={handleAddElementFromTable} beakerContents={beakerContents} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
