
'use client';

import { useState } from 'react';
import { Beaker, Plus, Minus, Thermometer, ChevronsRight, FlaskConical, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BeakerIcon } from '@/components/beaker-icon';
import { VerticalSlider } from '@/components/vertical-slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { conductReaction, ConductReactionInput, ConductReactionOutput } from '@/ai/flows/reactionFlow';

const CHEMICAL_CATEGORIES = {
  WATER: ['H2O'],
  ACIDS: ['HCl', 'H2SO4', 'HNO3', 'CH3COOH', 'H3PO4', 'H2CO3', 'HF', 'HBr', 'HI'],
  BASES: ['NaOH', 'KOH', 'Ca(OH)2', 'NH3', 'Mg(OH)2', 'LiOH', 'Ba(OH)2', 'Sr(OH)2'],
  SALTS: ['NaCl', 'CuSO4', 'KNO3', 'NaHCO3', 'AgNO3', 'KCl', 'CaCO3', 'FeCl3', 'KI', 'AgCl', 'Pb(NO3)2'],
  METALS: ['Fe', 'Mg', 'Zn', 'Cu', 'Al', 'Pb', 'Na', 'K', 'Li', 'Ca', 'Ag', 'Au', 'Pt'],
  GASES: ['O2', 'H2', 'N2', 'Cl2', 'CO2', 'SO2', 'NO2', 'He', 'Ar'],
  HALOGENS: ['F2', 'Cl2', 'Br2', 'I2'],
  ORGANIC: ['CH4', 'C2H5OH', 'CH3OH', 'C6H12O6', 'C3H8', 'C6H6', 'CH3COCH3'],
};

type ChemicalCategory = keyof typeof CHEMICAL_CATEGORIES;

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<ChemicalCategory>('ACIDS');
  const [beakerContents, setBeakerContents] = useState<string[]>([]);
  const [temperature, setTemperature] = useState(25); // in Celsius
  const [concentration, setConcentration] = useState(1); // in Molarity (M)
  
  const [reactionResult, setReactionResult] = useState<ConductReactionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddChemical = (chemical: string) => {
    if (beakerContents.length < 2) {
      setBeakerContents([...beakerContents, chemical]);
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {CHEMICAL_CATEGORIES[activeCategory].map(chemical => (
                   <Button 
                    key={chemical} 
                    variant="outline"
                    onClick={() => handleAddChemical(chemical)}
                    disabled={beakerContents.length >= 2 || beakerContents.includes(chemical)}
                  >
                     {chemical}
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

              <BeakerIcon className="h-72 w-72 text-blue-400" />
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
