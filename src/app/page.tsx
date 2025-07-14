
'use client';

import { useState } from 'react';
import { Beaker, Plus, Minus, Thermometer, ChevronsRight, FlaskConical, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BeakerIcon } from '@/components/beaker-icon';
import { VerticalSlider } from '@/components/vertical-slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { conductReaction, ConductReactionInput, ConductReactionOutput } from '@/ai/flows/reactionFlow';

interface Chemical {
  formula: string;
  name: string;
}

const CHEMICAL_CATEGORIES: Record<string, Chemical[]> = {
  ELEMENTS: [
    { formula: 'H', name: 'Hydrogen' }, { formula: 'He', name: 'Helium' }, { formula: 'Li', name: 'Lithium' },
    { formula: 'Be', name: 'Beryllium' }, { formula: 'B', name: 'Boron' }, { formula: 'C', name: 'Carbon' },
    { formula: 'N', name: 'Nitrogen' }, { formula: 'O', name: 'Oxygen' }, { formula: 'F', name: 'Fluorine' },
    { formula: 'Ne', name: 'Neon' }, { formula: 'Na', name: 'Sodium' }, { formula: 'Mg', name: 'Magnesium' },
    { formula: 'Al', name: 'Aluminum' }, { formula: 'Si', name: 'Silicon' }, { formula: 'P', name: 'Phosphorus' },
    { formula: 'S', name: 'Sulfur' }, { formula: 'Cl', name: 'Chlorine' }, { formula: 'Ar', name: 'Argon' },
    { formula: 'K', name: 'Potassium' }, { formula: 'Ca', name: 'Calcium' }, { formula: 'Sc', name: 'Scandium' },
    { formula: 'Ti', name: 'Titanium' }, { formula: 'V', name: 'Vanadium' }, { formula: 'Cr', name: 'Chromium' },
    { formula: 'Mn', name: 'Manganese' }, { formula: 'Fe', name: 'Iron' }, { formula: 'Co', name: 'Cobalt' },
    { formula: 'Ni', name: 'Nickel' }, { formula: 'Cu', name: 'Copper' }, { formula: 'Zn', name: 'Zinc' },
    { formula: 'Ga', name: 'Gallium' }, { formula: 'Ge', name: 'Germanium' }, { formula: 'As', name: 'Arsenic' },
    { formula: 'Se', name: 'Selenium' }, { formula: 'Br', name: 'Bromine' }, { formula: 'Kr', name: 'Krypton' },
    { formula: 'Rb', name: 'Rubidium' }, { formula: 'Sr', name: 'Strontium' }, { formula: 'Y', name: 'Yttrium' },
    { formula: 'Zr', name: 'Zirconium' }, { formula: 'Ag', name: 'Silver' }, { formula: 'Cd', name: 'Cadmium' },
    { formula: 'Sn', name: 'Tin' }, { formula: 'I', name: 'Iodine' }, { formula: 'Xe', name: 'Xenon' },
    { formula: 'Cs', name: 'Caesium' }, { formula: 'Ba', name: 'Barium' }, { formula: 'W', name: 'Tungsten' },
    { formula: 'Pt', name: 'Platinum' }, { formula: 'Au', name: 'Gold' }, { formula: 'Hg', name: 'Mercury' },
    { formula: 'Pb', name: 'Lead' }, { formula: 'Rn', name: 'Radon' }, { formula: 'Fr', name: 'Francium' },
    { formula: 'Ra', name: 'Radium' }, { formula: 'U', name: 'Uranium' }, { formula: 'Pu', name: 'Plutonium' },
  ],
  WATER: [{ formula: 'H2O', name: 'Water' }],
  ACIDS: [
    { formula: 'HCl', name: 'Hydrochloric Acid' }, { formula: 'H2SO4', name: 'Sulfuric Acid' },
    { formula: 'HNO3', name: 'Nitric Acid' }, { formula: 'CH3COOH', name: 'Acetic Acid' },
    { formula: 'H3PO4', name: 'Phosphoric Acid' }, { formula: 'H2CO3', name: 'Carbonic Acid' },
    { formula: 'HF', name: 'Hydrofluoric Acid' }, { formula: 'HBr', name: 'Hydrobromic Acid' },
    { formula: 'HI', name: 'Hydroiodic Acid' },
  ],
  BASES: [
    { formula: 'NaOH', name: 'Sodium Hydroxide' }, { formula: 'KOH', name: 'Potassium Hydroxide' },
    { formula: 'Ca(OH)2', name: 'Calcium Hydroxide' }, { formula: 'NH3', name: 'Ammonia' },
    { formula: 'Mg(OH)2', name: 'Magnesium Hydroxide' }, { formula: 'LiOH', name: 'Lithium Hydroxide' },
    { formula: 'Ba(OH)2', name: 'Barium Hydroxide' }, { formula: 'Sr(OH)2', name: 'Strontium Hydroxide' },
  ],
  SALTS: [
    { formula: 'NaCl', name: 'Sodium Chloride' }, { formula: 'CuSO4', name: 'Copper Sulfate' },
    { formula: 'KNO3', name: 'Potassium Nitrate' }, { formula: 'NaHCO3', name: 'Sodium Bicarbonate' },
    { formula: 'AgNO3', name: 'Silver Nitrate' }, { formula: 'KCl', name: 'Potassium Chloride' },
    { formula: 'CaCO3', name: 'Calcium Carbonate' }, { formula: 'FeCl3', name: 'Iron(III) Chloride' },
    { formula: 'KI', name: 'Potassium Iodide' }, { formula: 'AgCl', name: 'Silver Chloride' },
    { formula: 'Pb(NO3)2', name: 'Lead(II) Nitrate' },
  ],
  GASES: [
    { formula: 'O2', name: 'Oxygen' }, { formula: 'H2', name: 'Hydrogen' }, { formula: 'N2', name: 'Nitrogen' },
    { formula: 'Cl2', name: 'Chlorine' }, { formula: 'CO2', name: 'Carbon Dioxide' },
    { formula: 'SO2', name: 'Sulfur Dioxide' }, { formula: 'NO2', name: 'Nitrogen Dioxide' },
  ],
  HALOGENS: [
    { formula: 'F2', name: 'Fluorine' }, { formula: 'Cl2', name: 'Chlorine' },
    { formula: 'Br2', name: 'Bromine' }, { formula: 'I2', name: 'Iodine' },
  ],
  ORGANIC: [
    { formula: 'CH4', name: 'Methane' }, { formula: 'C2H5OH', name: 'Ethanol' },
    { formula: 'CH3OH', name: 'Methanol' }, { formula: 'C6H12O6', name: 'Glucose' },
    { formula: 'C3H8', name: 'Propane' }, { formula: 'C6H6', name: 'Benzene' },
    { formula: 'CH3COCH3', name: 'Acetone' },
  ],
};

type ChemicalCategory = keyof typeof CHEMICAL_CATEGORIES;

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<ChemicalCategory>('ELEMENTS');
  const [beakerContents, setBeakerContents] = useState<string[]>([]);
  const [temperature, setTemperature] = useState(25); // in Celsius
  const [concentration, setConcentration] = useState(1); // in Molarity (M)
  
  const [reactionResult, setReactionResult] = useState<ConductReactionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddChemical = (chemical: Chemical) => {
    if (beakerContents.length < 2) {
      setBeakerContents([...beakerContents, chemical.formula]);
    }
  };

  const handleRemoveChemical = (chemical: string) => {
    setBeakerContents(beakerContents.filter(c => c !== chemical));
  };
  
  const handleClearBeaker = () => {
    setBeakerContents([]);
    setReactionResult(null);
  }

  const handleStartReaction = async () => {
    if (beakerContents.length < 2) return;
    setIsLoading(true);
    setReactionResult(null);
    try {
      const input: ConductReactionInput = {
        chemicals: beakerContents,
        temperature,
        concentration
      };
      const result = await conductReaction(input);
      setReactionResult(result);
    } catch (error) {
      console.error("Error conducting reaction:", error);
      setReactionResult({
        reactionName: "Error",
        description: "An error occurred while simulating the reaction. Please try again.",
        products: [],
        safetyNotes: "Ensure all inputs are correct."
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
              <CardTitle>Select Chemicals</CardTitle>
              <CardDescription>Choose up to 2 chemicals to mix in the beaker.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="w-full bg-gray-800 p-2 rounded-full mb-6 flex flex-wrap justify-center gap-1">
                {(Object.keys(CHEMICAL_CATEGORIES) as ChemicalCategory[]).map(category => (
                  <Button 
                    key={category}
                    variant={activeCategory === category ? 'secondary' : 'ghost'}
                    onClick={() => setActiveCategory(category)}
                    className={`text-white rounded-full flex-1 ${activeCategory === category ? 'bg-orange-500' : ''}`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-60 overflow-y-auto pr-2">
                {CHEMICAL_CATEGORIES[activeCategory].map(chemical => (
                   <Button 
                    key={chemical.formula} 
                    variant="outline"
                    onClick={() => handleAddChemical(chemical)}
                    disabled={beakerContents.length >= 2 || beakerContents.includes(chemical.formula)}
                    title={chemical.formula}
                    className="flex-col h-auto"
                  >
                     <span className="font-bold text-lg">{chemical.formula}</span>
                     <span className="text-xs text-muted-foreground">{chemical.name}</span>
                   </Button>
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
                <div className="flex items-center gap-2">
                  <p className="font-semibold">Contents:</p>
                  {beakerContents.length > 0 ? (
                    beakerContents.map(c => (
                      <span key={c} className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full">
                        {c}
                        <button onClick={() => handleRemoveChemical(c)} className="ml-2 text-blue-600 hover:text-blue-800">
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

              <BeakerIcon contents={beakerContents} className="h-72 w-72" />
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
    </div>
  );
}
