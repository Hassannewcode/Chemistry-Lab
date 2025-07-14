
'use client';

import { useState } from 'react';
import { ChevronsRight, FlaskConical, Loader2, X, Info, Grid3x3, BarChart, Thermometer } from 'lucide-react';
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
import { CHEMICAL_CATEGORIES, Chemical } from '@/lib/chemicals';

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
  const [isUsageChartLoading, setIsUsageChartLoading] = useState(false);
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
        if (beakerContents.length < 12) {
            handleAddChemical(element);
            toast({ title: `Added ${element.name} to beaker!` });
        } else {
            toast({ title: "Beaker is full!", variant: "destructive" });
        }
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
    setIsUsageChartLoading(true);
    setUsageContent(null);
    setIsUsageChartOpen(true);
    try {
      const result = await getElementUsage({ name: infoChemical.name });
      setUsageContent(result);
    } catch (error) {
      console.error("Error fetching element usage:", error);
      toast({
        variant: "destructive",
        title: "Usage Data Error",
        description: "Could not fetch usage data for this element.",
      });
      // Revert to info view on error
      setIsUsageChartOpen(false);
    } finally {
      setIsUsageChartLoading(false);
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
                  <Button variant="outline" size="sm" onClick={handleShowUsageChart} disabled={isInfoLoading || isUsageChartLoading}>
                      <BarChart className="mr-2 h-4 w-4"/>
                      {isUsageChartLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Usage'}
                  </Button>
              )}
            </div>
          </DialogHeader>
          <div className="text-sm text-muted-foreground pt-2 max-h-[70vh] overflow-y-auto pr-4">
              {isInfoLoading && (
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
              {isUsageChartOpen && usageContent && !isUsageChartLoading && (
                <UsageChart data={usageContent} />
              )}
              {isUsageChartLoading && (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>
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
