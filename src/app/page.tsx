
'use client';

import { useState, DragEvent, useMemo } from 'react';
import { ChevronsRight, FlaskConical, Loader2, X, Info, Grid3x3, BarChart, Thermometer, Search, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BeakerIcon, ChemicalEffect } from '@/components/beaker-icon';
import { VerticalSlider } from '@/components/vertical-slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { conductReaction } from '@/ai/flows/reactionFlow';
import { getChemicalInfo } from '@/ai/flows/chemicalInfoFlow';
import { getElementUsage } from '@/ai/flows/elementUsageFlow';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { SoundManager } from '@/components/sound-manager';
import { Progress } from '@/components/ui/progress';
import { PeriodicTable } from '@/components/periodic-table';
import { UsageChart } from '@/components/usage-chart';
import { CHEMICAL_CATEGORIES, Chemical } from '@/lib/chemicals';
import { Input } from '@/components/ui/input';
import { ChatInterface, ChatMessage } from '@/components/chat-interface';
import { chatAboutReaction } from '@/ai/flows/chatFlow';
import type { ConductReactionInput, ConductReactionOutput } from '@/ai/schemas/reactionSchema';
import type { ChemicalInfoOutput } from '@/ai/schemas/chemicalInfoSchema';
import type { ElementUsageOutput } from '@/ai/schemas/elementUsageSchema';


type ChemicalCategory = keyof typeof CHEMICAL_CATEGORIES;
const NAME_LENGTH_THRESHOLD = 18; // Names longer than this will trigger confirmation

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

  const [confirmingChemical, setConfirmingChemical] = useState<Chemical | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const filteredChemicals = useMemo(() => {
    if (!searchQuery) {
      return CHEMICAL_CATEGORIES[activeCategory];
    }
    return CHEMICAL_CATEGORIES[activeCategory].filter(
      (chemical) =>
        chemical.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chemical.formula.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeCategory, searchQuery]);

  const resetSimulationState = () => {
    setReactionResult(null);
    setReactionEffects(null);
    setChatHistory([]);
  }

  const handleAddChemical = (chemical: Chemical) => {
    if (beakerContents.length < 12) {
      resetSimulationState();
      setBeakerContents([...beakerContents, chemical]);
    }
  };
  
  const handleChemicalClick = (chemical: Chemical) => {
    if (chemical.name.length > NAME_LENGTH_THRESHOLD) {
      setConfirmingChemical(chemical);
    } else {
      handleAddChemical(chemical);
      toast({ title: `Added ${chemical.name} to beaker!` });
    }
  }

  const handleConfirmAddChemical = () => {
    if (confirmingChemical) {
      handleAddChemical(confirmingChemical);
      toast({ title: `Added ${confirmingChemical.name} to beaker!` });
      setConfirmingChemical(null);
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
    resetSimulationState();
    setBeakerContents(beakerContents.filter(c => c.formula !== chemicalFormula));
  };
  
  const handleClearBeaker = () => {
    setBeakerContents([]);
    resetSimulationState();
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
    resetSimulationState();
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

  const handleSendChatMessage = async (message: string) => {
    if (!reactionResult) return;
    
    const newUserMessage: ChatMessage = { role: 'user', content: message };
    setChatHistory(prev => [...prev, newUserMessage]);
    setIsChatLoading(true);

    try {
        const result = await chatAboutReaction({
            question: message,
            reactionContext: {
                reactants: beakerContents.map(c => c.formula),
                temperature,
                concentration,
                reactionResult,
            }
        });
        const aiMessage: ChatMessage = { role: 'assistant', content: result.answer };
        setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
        console.error("Error in chat:", error);
        const errorMessage: ChatMessage = { role: 'assistant', content: "Sorry, I encountered an error trying to respond. Please try again." };
        setChatHistory(prev => [...prev, errorMessage]);
    } finally {
        setIsChatLoading(false);
    }
  }

  const changeTemperature = (amount: number) => {
    setTemperature(prev => Math.max(-273, prev + amount));
  }

  const changeConcentration = (amount: number) => {
    setConcentration(prev => Math.max(0.1, Math.round((prev + amount) * 10)/10 ));
  }

  // Drag and drop handlers for beaker contents
  const handleDragStart = (e: DragEvent<HTMLSpanElement>, index: number) => {
    e.dataTransfer.setData("chemicalIndex", index.toString());
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData("chemicalIndex"), 10);
    const newContents = [...beakerContents];
    const [draggedItem] = newContents.splice(dragIndex, 1);
    newContents.splice(dropIndex, 0, draggedItem);
    setBeakerContents(newContents);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

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
              <div className="flex justify-between items-start flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <CardTitle>Select Chemicals</CardTitle>
                    <CardDescription>Choose up to 12 chemicals & sprays to mix.</CardDescription>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-40"
                        />
                    </div>
                    <Button variant="outline" onClick={() => setIsPeriodicTableOpen(true)}>
                      <Grid3x3 className="mr-2 h-4 w-4" />
                      Periodic Table
                    </Button>
                  </div>
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
                {filteredChemicals.map(chemical => (
                   <div key={chemical.formula} className="relative group">
                    <Button 
                      variant="outline"
                      onClick={() => handleChemicalClick(chemical)}
                      disabled={beakerContents.length >= 12 || beakerContents.some(c => c.formula === chemical.formula)}
                      title={chemical.name}
                      className="w-full flex-col h-auto"
                      aria-label={`Add ${chemical.name} to beaker`}
                    >
                      <span className="font-bold text-lg truncate w-full">{chemical.formula}</span>
                      <span className="text-xs text-muted-foreground truncate w-full">{chemical.name}</span>
                    </Button>
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="absolute top-0 right-0 h-6 w-6 opacity-50 group-hover:opacity-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleShowInfo(chemical);
                        }}
                        title={`Info on ${chemical.name}`}
                        aria-label={`Show info for ${chemical.name}`}
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
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h2 className="text-2xl font-bold">Beaker</h2>
                <div className="flex items-center gap-2 flex-wrap justify-end" onDragOver={handleDragOver}>
                  <p className="font-semibold">Contents:</p>
                  {beakerContents.length > 0 ? (
                    beakerContents.map((c, index) => (
                      <span 
                        key={c.formula}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full cursor-grab active:cursor-grabbing"
                      >
                        {c.formula}
                        <button onClick={() => handleRemoveChemical(c.formula)} className="ml-2 text-blue-600 hover:text-blue-800" aria-label={`Remove ${c.name}`}>
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
                ariaLabel="Concentration"
              />
              <VerticalSlider
                label={`${temperature}°C`}
                icon={<Thermometer className="h-5 w-5" />}
                onIncrease={() => changeTemperature(5)}
                onDecrease={() => changeTemperature(-5)}
                ariaLabel="Temperature"
              />

              <BeakerIcon contents={beakerContents} overrideEffects={reactionEffects} className="h-72 w-72" />
            </div>
          </div>
          
          <div className='w-full mt-4'>
            {reactionResult && !isLoading && (
              <div className='max-h-[40vh] overflow-y-auto pr-2 space-y-4'>
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle>{reactionResult.reactionName}</CardTitle>
                    <CardDescription className="!mt-2 text-base italic text-gray-600">
                        "{reactionResult.visualPreview}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                     <div>
                      <h3 className="font-semibold mb-1">Description</h3>
                      <p>{reactionResult.description}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Products</h3>
                      <p>
                        {reactionResult.products.length > 0 ? reactionResult.products.map(p => `${p.formula} (${p.state})`).join(', ') : 'No new products formed.'}
                      </p>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold mb-1">Real-World Analogies</h3>
                            <div className="space-y-2">
                                {reactionResult.analogies.map((analogy, index) => (
                                    <div key={index} className="flex items-center gap-2 text-xs p-2 bg-gray-100 rounded-md">
                                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                                        <span className="font-semibold">{analogy.aspect}:</span>
                                        <span>~ {analogy.comparison}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                           <div>
                              <h3 className="font-semibold mb-1">Destruction Scale</h3>
                              <div className="flex items-center gap-2">
                                  <Progress value={reactionResult.destructionScale * 10} className="w-[80%]" aria-label={`Destruction scale: ${reactionResult.destructionScale} out of 10`} />
                                  <span>{reactionResult.destructionScale}/10</span>
                              </div>
                          </div>
                          <div>
                              <h3 className="font-semibold mb-1">Real-World Success</h3>
                              <p>{reactionResult.realWorldProbability.success}%</p>
                          </div>
                        </div>
                      </div>
                    <p className="text-sm text-yellow-800 bg-yellow-100 p-2 rounded-md"><b>Safety:</b> {reactionResult.safetyNotes}</p>
                  </CardContent>
                </Card>
                <ChatInterface
                    messages={chatHistory}
                    onSendMessage={handleSendChatMessage}
                    isLoading={isChatLoading}
                />
              </div>
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

      <AlertDialog open={!!confirmingChemical} onOpenChange={(isOpen) => !isOpen && setConfirmingChemical(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Chemical</AlertDialogTitle>
            <AlertDialogDescription>
              The item you selected is <strong>{confirmingChemical?.name} ({confirmingChemical?.formula})</strong>. Are you sure you want to add it to the beaker?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmingChemical(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAddChemical}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                      <Progress value={infoContent.ratings.reactivity * 10} className="w-[60%]" aria-label={`Reactivity: ${infoContent.ratings.reactivity} out of 10`} />
                    </div>
                     <div className="flex items-center gap-2">
                      <span className="w-28">Flammability</span>
                      <Progress value={infoContent.ratings.flammability * 10} className="w-[60%]" aria-label={`Flammability: ${infoContent.ratings.flammability} out of 10`} />
                    </div>
                     <div className="flex items-center gap-2">
                      <span className="w-28">Explosiveness</span>
                      <Progress value={infoContent.ratings.explosiveness * 10} className="w-[60%]" aria-label={`Explosiveness: ${infoContent.ratings.explosiveness} out of 10`} />
                    </div>
                     <div className="flex items-center gap-2">
                      <span className="w-28">Radioactivity</span>
                      <Progress value={infoContent.ratings.radioactivity * 10} className="w-[60%]" aria-label={`Radioactivity: ${infoContent.ratings.radioactivity} out of 10`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-28">Toxicity</span>
                      <Progress value={infoContent.ratings.toxicity * 10} className="w-[60%]" aria-label={`Toxicity: ${infoContent.ratings.toxicity} out of 10`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-28">Corrosiveness</span>
                      <Progress value={infoContent.ratings.corrosiveness * 10} className="w-[60%]" aria-label={`Corrosiveness: ${infoContent.ratings.corrosiveness} out of 10`} />
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

    