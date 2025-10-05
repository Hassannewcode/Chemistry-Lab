
'use client';

import { useState, DragEvent, useMemo, useEffect } from 'react';
import { ChevronsRight, FlaskConical, Loader2, X, Info, Grid3x3, BarChart, Thermometer, Search, Lightbulb, PenSquare, Sparkles, Menu, History, RotateCcw, Beaker, Atom, Wrench, HelpCircle, Replace } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BeakerIcon, ChemicalEffect } from '@/components/beaker-icon';
import { VerticalSlider } from '@/components/vertical-slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { conductReaction } from '@/ai/flows/reactionFlow';
import { getChemicalInfo } from '@/ai/flows/chemicalInfoFlow';
import { getElementUsage } from '@/ai/flows/elementUsageFlow';
import { createChemical } from '@/ai/flows/createChemicalFlow';
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
import type { CreateChemicalInput } from '@/ai/schemas/createChemicalSchema';
import { Whiteboard } from '@/components/whiteboard';
import { PastExperiments, LabState } from '@/components/past-experiments';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type ChemicalCategory = keyof typeof CHEMICAL_CATEGORIES | 'CUSTOM';
const NAME_LENGTH_THRESHOLD = 18; // Names longer than this will trigger confirmation

type CustomCreationCategory = 'ordinary' | 'compound' | 'utility' | 'custom';

interface SimulationHistoryEntry {
  timestamp: string;
  state: LabState;
}

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
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isPastLabsOpen, setIsPastLabsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [simulationHistory, setSimulationHistory] = useState<SimulationHistoryEntry[]>([]);

  const [confirmingChemical, setConfirmingChemical] = useState<Chemical | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isCustomCreationOpen, setIsCustomCreationOpen] = useState(false);
  const [customCreationCategory, setCustomCreationCategory] = useState<CustomCreationCategory | null>(null);
  const [customChemicalName, setCustomChemicalName] = useState('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customChemicals, setCustomChemicals] = useState<Chemical[]>([]);
  const [showFormulasForCustom, setShowFormulasForCustom] = useState(false);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedBeakerContents = localStorage.getItem('beakerContents');
        if (savedBeakerContents) {
          setBeakerContents(JSON.parse(savedBeakerContents));
        }
        const savedCustomChemicals = localStorage.getItem('customChemicals');
        if (savedCustomChemicals) {
          setCustomChemicals(JSON.parse(savedCustomChemicals));
        }
        const savedTemperature = localStorage.getItem('temperature');
        if (savedTemperature) {
          setTemperature(JSON.parse(savedTemperature));
        }
        const savedConcentration = localStorage.getItem('concentration');
        if (savedConcentration) {
          setConcentration(JSON.parse(savedConcentration));
        }
      } catch (error) {
        console.error("Failed to load state from localStorage", error);
      }
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined' && isMounted) {
      try {
        localStorage.setItem('beakerContents', JSON.stringify(beakerContents));
        localStorage.setItem('customChemicals', JSON.stringify(customChemicals));
        localStorage.setItem('temperature', JSON.stringify(temperature));
        localStorage.setItem('concentration', JSON.stringify(concentration));
      } catch (error) {
        console.error("Failed to save state to localStorage", error);
      }
    }
  }, [beakerContents, customChemicals, temperature, concentration, isMounted]);

  const allChemicalCategories = useMemo(() => {
    const categories: Record<string, Chemical[]> = {...CHEMICAL_CATEGORIES};
    if (customChemicals.length > 0) {
      categories.CUSTOM = customChemicals;
    }
    return categories;
  }, [customChemicals]);

  const filteredChemicals = useMemo(() => {
    if (activeCategory === 'CUSTOM') {
        return customChemicals.filter(
            (chemical) =>
                (chemical.promptName && chemical.promptName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                chemical.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                chemical.formula.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    if (!searchQuery) {
      return allChemicalCategories[activeCategory] || [];
    }
    return (allChemicalCategories[activeCategory] || []).filter(
      (chemical) =>
        chemical.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chemical.formula.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeCategory, searchQuery, allChemicalCategories, customChemicals]);

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

  const getCurrentLabState = (): LabState => ({
    beakerContents,
    customChemicals,
    temperature,
    concentration,
    reactionResult,
    chatHistory,
  });

  const loadLabState = (state: LabState) => {
    setBeakerContents(state.beakerContents);
    setCustomChemicals(state.customChemicals);
    setTemperature(state.temperature);
    setConcentration(state.concentration);
    setReactionResult(state.reactionResult);
    setReactionEffects(state.reactionResult?.effects || null);
    setChatHistory(state.chatHistory);
    toast({ title: "Lab Loaded", description: "The experiment state has been restored." });
  };

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
      
      const currentState = getCurrentLabState();
      const stateWithResult = { ...currentState, reactionResult: result, chatHistory: [] };

      const newHistoryEntry: SimulationHistoryEntry = {
        timestamp: new Date().toLocaleString(),
        state: stateWithResult,
      };
      setSimulationHistory(prev => [newHistoryEntry, ...prev]);
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
  
  const handleOpenCustomCreation = () => {
    setIsCustomCreationOpen(true);
    setCustomCreationCategory(null);
    setCustomChemicalName('');
  };
  
  const handleCreateCustomChemical = async () => {
    if (!customChemicalName.trim() || !customCreationCategory) return;
    setIsCreatingCustom(true);
    try {
        const input: CreateChemicalInput = {
          name: customChemicalName,
          category: customCreationCategory
        };
        const result = await createChemical(input);
        if (result.found && result.formula && result.name) {
            const newChemical: Chemical = {
                formula: result.formula,
                name: result.name,
                isElement: result.isElement || false,
                effects: result.effects || {},
                promptName: customChemicalName, // Save the original user input
            };
            setCustomChemicals(prev => [...prev, newChemical]);
            setCustomChemicalName('');
            setCustomCreationCategory(null);
            setIsCustomCreationOpen(false);
            toast({
                title: 'Item Created!',
                description: `${newChemical.name} (${newChemical.formula}) is now available.`,
            });
        } else {
            toast({
                variant: "destructive",
                title: 'Creation Failed',
                description: `Could not create an item named "${customChemicalName}". It might not be a recognized chemical or compound.`,
            });
        }
    } catch (error) {
        console.error("Error creating custom chemical:", error);
        toast({
            variant: "destructive",
            title: "Creation Error",
            description: "An AI error occurred while creating the item.",
        });
    } finally {
        setIsCreatingCustom(false);
    }
};

const handleRevertHistory = (state: LabState) => {
    loadLabState(state);
    setIsHistoryOpen(false);
    toast({
      title: "State Reverted",
      description: "The lab has been reverted to the selected point in history.",
    });
  };

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

  if (!isMounted) {
    return null; // Or a loading spinner
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
            <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Select Chemicals</CardTitle>
                  <CardDescription>Choose up to 12 chemicals & sprays to mix.</CardDescription>
                </div>
                <div className='flex items-center gap-2'>
                   <Button variant="outline" size="icon" onClick={() => setIsPastLabsOpen(true)} aria-label="Open past labs">
                      <Menu className="h-4 w-4" />
                    </Button>
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-32"
                      />
                  </div>
                  <Button variant="outline" onClick={() => setIsPeriodicTableOpen(true)}>
                    <Grid3x3 className="mr-2 h-4 w-4" />
                    Periodic Table
                  </Button>
                   <Button variant="outline" size="icon" onClick={() => setIsWhiteboardOpen(true)} aria-label="Open whiteboard">
                    <PenSquare className="h-4 w-4" />
                  </Button>
                </div>
            </CardHeader>
            <CardContent>
               <div className="w-full bg-gray-200 p-1 rounded-full mb-6 flex flex-wrap justify-center gap-1">
                {(Object.keys(allChemicalCategories) as ChemicalCategory[]).map(category => (
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
              
              {activeCategory === 'CUSTOM' ? (
                 <TooltipProvider>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Button onClick={handleOpenCustomCreation} className="flex-1">
                                <Sparkles className="h-4 w-4 mr-2" />
                                Create a Custom Item
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => setShowFormulasForCustom(p => !p)} title="Toggle Name/Formula">
                                <Replace className="h-4 w-4" />
                            </Button>
                        </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-52 overflow-y-auto pr-2">
                        {customChemicals.length === 0 ? (
                        <p className="col-span-full text-center text-muted-foreground text-sm pt-4">No custom items created yet.</p>
                        ) : (
                        filteredChemicals.map(chemical => (
                            <Tooltip key={chemical.formula}>
                                <TooltipTrigger asChild>
                                    <div className="relative group">
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleChemicalClick(chemical)}
                                            disabled={beakerContents.length >= 12 || beakerContents.some(c => c.formula === chemical.formula)}
                                            title={chemical.name}
                                            className="w-full flex-col h-auto"
                                            aria-label={`Add ${chemical.name} to beaker`}
                                        >
                                            <span className="font-bold text-lg truncate w-full">{showFormulasForCustom ? chemical.formula : (chemical.promptName || chemical.name)}</span>
                                            <span className="text-xs text-muted-foreground truncate w-full">{showFormulasForCustom ? (chemical.promptName || chemical.name) : chemical.formula}</span>
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
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Scientific name: {chemical.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))
                        )}
                    </div>
                    </div>
                 </TooltipProvider>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Simulation */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center justify-between border-2 border-gray-200 min-h-[600px]">
          
          <div className="w-full">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">Beaker</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsHistoryOpen(true)} disabled={simulationHistory.length === 0}>
                        <History className="h-5 w-5" />
                    </Button>
                </div>
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
              aria-label={isLoading ? "Simulating reaction, please wait" : "Start chemical reaction"}
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

      <PastExperiments
        isOpen={isPastLabsOpen}
        onOpenChange={setIsPastLabsOpen}
        currentLabState={getCurrentLabState()}
        onLoadLab={loadLabState}
      />

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
                  {infoContent.priceData && infoContent.priceData.length > 0 && (
                    <div>
                        <h3 className="font-semibold mb-1">Average Price</h3>
                        <div className="space-y-1 text-xs">
                        {infoContent.priceData.map(data => (
                            <p key={data.country}><strong>{data.country}:</strong> {data.price} {data.unit}</p>
                        ))}
                        </div>
                    </div>
                  )}
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

      <Dialog open={isWhiteboardOpen} onOpenChange={setIsWhiteboardOpen}>
        <DialogContent className="max-w-none w-full h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-4 pb-0">
              <DialogTitle>Whiteboard</DialogTitle>
              <DialogDescription>
                An interactive whiteboard for jotting down notes and diagrams.
              </DialogDescription>
            </DialogHeader>
            <div className="relative flex-1">
              <Whiteboard chemicals={beakerContents} />
            </div>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10 bg-white">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </DialogClose>
        </DialogContent>
      </Dialog>
      
       <Dialog open={isCustomCreationOpen} onOpenChange={setIsCustomCreationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a Custom Item</DialogTitle>
            <DialogDescription>
              What kind of item do you want to create? The AI will generate its properties based on your choice.
            </DialogDescription>
          </DialogHeader>
          {!customCreationCategory ? (
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setCustomCreationCategory('ordinary')}>
                <Beaker className="h-6 w-6" />
                <span className="text-center">Ordinary Item</span>
                <p className="text-xs text-muted-foreground">e.g., "Vinegar", "Baking Soda"</p>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setCustomCreationCategory('compound')}>
                <Atom className="h-6 w-6" />
                <span className="text-center">Compound</span>
                <p className="text-xs text-muted-foreground">e.g., "Vinegar, Baking Soda"</p>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setCustomCreationCategory('utility')}>
                <Wrench className="h-6 w-6" />
                <span className="text-center">Utility</span>
                 <p className="text-xs text-muted-foreground">e.g., "Copper Wire", "Vacuum"</p>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setCustomCreationCategory('custom')}>
                <HelpCircle className="h-6 w-6" />
                <span className="text-center">Other</span>
                 <p className="text-xs text-muted-foreground">e.g., A fictional material</p>
              </Button>
            </div>
          ) : (
            <div className="pt-4 space-y-4">
                <p className="font-semibold text-center">
                    Creating a/an <span className="text-primary">{customCreationCategory}</span> item.
                </p>
                <Input
                    placeholder={
                        customCreationCategory === 'compound' ? "e.g., Vinegar, Baking Soda, Lemon" :
                        customCreationCategory === 'utility' ? "e.g., Copper Wire, Vacuum" :
                        "e.g., Baking Soda"
                    }
                    value={customChemicalName}
                    onChange={(e) => setCustomChemicalName(e.target.value)}
                    disabled={isCreatingCustom}
                />
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setCustomCreationCategory(null)} disabled={isCreatingCustom}>Back</Button>
                    <Button onClick={handleCreateCustomChemical} disabled={isCreatingCustom || !customChemicalName.trim()}>
                        {isCreatingCustom ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        <span className="ml-2">Create</span>
                    </Button>
                </div>
            </div>
          )}
        </DialogContent>
       </Dialog>

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Simulation History (Current Session)</DialogTitle>
            <DialogDescription>A log of all reactions run in this session. You can revert to a previous state.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-4">
            {simulationHistory.length > 0 ? (
              <div className="space-y-4">
                {simulationHistory.map((entry, index) => (
                  <Card key={index} className="relative group">
                    <CardHeader>
                      <CardTitle className="text-base">{entry.state.reactionResult?.reactionName}</CardTitle>
                      <CardDescription>{entry.timestamp}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        <span className="font-semibold">Reactants: </span>
                        {entry.state.beakerContents.map(p => p.formula).join(', ') || 'None'}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Products: </span>
                        {entry.state.reactionResult?.products.map(p => p.formula).join(', ') || 'None'}
                      </p>
                    </CardContent>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" onClick={() => handleRevertHistory(entry.state)}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Revert to this state
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p>No simulations run in this session yet.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

    

    