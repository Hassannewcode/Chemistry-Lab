'use client';

import { useState, DragEvent, useMemo, useEffect } from 'react';
import { Sun, ChevronsRight, FlaskConical, Loader2, X, Info, Grid3x3, BarChart, Thermometer, Search, Lightbulb, PenSquare, Sparkles, Menu, History, RotateCcw, Beaker, Atom, Wrench, HelpCircle, Trash2, Flame, Snowflake } from 'lucide-react';
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
import { getCommonName } from '@/ai/flows/commonNameFlow';
import { generateDescription } from '@/ai/flows/generateDescriptionFlow';
import { simulateWhiteboard } from '@/ai/flows/simulateWhiteboardFlow';
import { useToast } from "@/hooks/use-toast";
import { SoundManager } from '@/components/sound-manager';
import { Progress } from '@/components/ui/progress';
import { PeriodicTable } from '@/components/periodic-table';
import { UsageChart } from '@/components/usage-chart';
import { CHEMICAL_CATEGORIES, Chemical } from '@/lib/chemicals';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChatInterface, ChatMessage } from '@/components/chat-interface';
import type { ConductReactionInput, ConductReactionOutput } from '@/ai/schemas/reactionSchema';
import type { ChemicalInfoOutput } from '@/ai/schemas/chemicalInfoSchema';
import type { ElementUsageOutput } from '@/ai/schemas/elementUsageSchema';
import type { CreateChemicalInput } from '@/ai/schemas/createChemicalSchema';
import { Whiteboard, WhiteboardCallbacks } from '@/components/whiteboard';
import { PastExperiments, LabState } from '@/components/past-experiments';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MAX_BEAKER_CONTENTS } from '@/lib/constants';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type ChemicalCategory = keyof typeof CHEMICAL_CATEGORIES | 'CUSTOM';
const NAME_LENGTH_THRESHOLD = 18; // Names longer than this will trigger confirmation

type CustomCreationCategory = 'ordinary' | 'compound' | 'utility' | 'custom' | 'modifier';

interface SimulationHistoryEntry {
  timestamp: string;
  state: LabState;
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<ChemicalCategory>('ELEMENTS');
  const [beakerContents, setBeakerContents] = useState<Chemical[]>([]);
  const [temperature, setTemperature] = useState(25); // in Celsius
  const [concentration, setConcentration] = useState(1); // in Molarity (M)
  const [freezeSpeed, setFreezeSpeed] = useState<'normal' | 'rapid'>('normal');
  
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
  const [isModifiersOpen, setIsModifiersOpen] = useState(false);
  const [isUsageChartOpen, setIsUsageChartOpen] = useState(false);
  const [whiteboardCallbacks, setWhiteboardCallbacks] = useState<WhiteboardCallbacks | null>(null);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isPastLabsOpen, setIsPastLabsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [simulationHistory, setSimulationHistory] = useState<SimulationHistoryEntry[]>([]);

  const [confirmingChemical, setConfirmingChemical] = useState<Chemical | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isCustomCreationOpen, setIsCustomCreationOpen] = useState(false);
  const [editingChemical, setEditingChemical] = useState<Chemical | null>(null);
  const [deletingChemical, setDeletingChemical] = useState<Chemical | null>(null);
  const [customCreationCategory, setCustomCreationCategory] = useState<CustomCreationCategory | null>(null);
  const [customChemicalName, setCustomChemicalName] = useState('');
  const [customChemicalDescription, setCustomChemicalDescription] = useState('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [customChemicals, setCustomChemicals] = useState<Chemical[]>([]);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [isFindingCommonName, setIsFindingCommonName] = useState(false);
  const [foundCommonName, setFoundCommonName] = useState<string | null>(null);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedBeakerContents = localStorage.getItem('beakerContents');
        if (savedBeakerContents) setBeakerContents(JSON.parse(savedBeakerContents));
        
        const savedCustomChemicals = localStorage.getItem('customChemicals');
        if (savedCustomChemicals) setCustomChemicals(JSON.parse(savedCustomChemicals));
        
        const savedTemperature = localStorage.getItem('temperature');
        if (savedTemperature) setTemperature(JSON.parse(savedTemperature));
        
        const savedConcentration = localStorage.getItem('concentration');
        if (savedConcentration) setConcentration(JSON.parse(savedConcentration));
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
  
  const visibleCategories = Object.keys(allChemicalCategories).filter(cat => cat !== 'MODIFIERS') as ChemicalCategory[];


  const filteredChemicals = useMemo(() => {
    const currentCategoryChemicals = allChemicalCategories[activeCategory] || [];
    if (!searchQuery) {
      return currentCategoryChemicals;
    }
    return currentCategoryChemicals.filter(chemical =>
        (chemical.promptName && chemical.promptName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (chemical.commonName && chemical.commonName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (chemical.name && chemical.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (chemical.formula && chemical.formula.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [activeCategory, searchQuery, allChemicalCategories]);

  const resetSimulationState = () => {
    setReactionResult(null);
    setReactionEffects(null);
    setChatHistory([]);
  }

  const handleAddChemical = (chemical: Chemical) => {
    if (beakerContents.length < MAX_BEAKER_CONTENTS) {
      resetSimulationState();
      setBeakerContents([...beakerContents, chemical]);
    }
  };
  
  const handleChemicalClick = (chemical: Chemical) => {
    if (chemical.name.length > NAME_LENGTH_THRESHOLD) {
      setConfirmingChemical(chemical);
    } else {
      handleAddChemical(chemical);
      toast({ title: `Added ${chemical.commonName || chemical.name} to beaker!` });
    }
  }
  
  const handleModifierClick = (modifier: Chemical) => {
      handleAddChemical(modifier);
      toast({ title: `Added ${modifier.commonName || modifier.name} modifier!` });
  };

  const handleConfirmAddChemical = () => {
    if (confirmingChemical) {
      handleAddChemical(confirmingChemical);
      toast({ title: `Added ${confirmingChemical.commonName || confirmingChemical.name} to beaker!` });
      setConfirmingChemical(null);
    }
  };
  
  const handleAddElementFromTable = (elementName: string) => {
    const element = CHEMICAL_CATEGORIES.ELEMENTS.find(el => el.name === elementName);
    if (element) {
        if (beakerContents.length < MAX_BEAKER_CONTENTS) {
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
    setFoundCommonName(null);
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

  const handleFindCommonName = async () => {
    if (!infoChemical) return;
    setIsFindingCommonName(true);
    setFoundCommonName(null);
    try {
        const result = await getCommonName({ scientificName: infoChemical.name, formula: infoChemical.formula });
        setFoundCommonName(result.commonName);
    } catch (error) {
        console.error("Error finding common name:", error);
        toast({
            variant: "destructive",
            title: "AI Error",
            description: "Could not find a common name for this chemical.",
        });
    } finally {
        setIsFindingCommonName(false);
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

  const handleStartReaction = async (chemicals: string[] = beakerContents.map(c => c.promptName || c.formula)) => {
    if (chemicals.length < 2) return;
    setIsLoading(true);
    resetSimulationState();
    try {
      const input: ConductReactionInput = {
        chemicals,
        temperature,
        concentration,
        freezeSpeed
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

  const handleSimulateWhiteboard = async (textShapes: string[]) => {
      setIsLoading(true);
      resetSimulationState();
      try {
          const { chemicals } = await simulateWhiteboard({ shapes: textShapes });
          if (chemicals && chemicals.length > 0) {
              const foundChemicals: Chemical[] = [];
              const allChemicals = Object.values(CHEMICAL_CATEGORIES).flat().concat(customChemicals);
              
              chemicals.forEach(nameOrFormula => {
                  const found = allChemicals.find(c => c.formula === nameOrFormula || c.name === nameOrFormula || c.commonName === nameOrFormula || c.promptName === nameOrFormula);
                  if (found) {
                      foundChemicals.push(found);
                  }
              });

              if (foundChemicals.length > 0) {
                setBeakerContents(foundChemicals.slice(0, MAX_BEAKER_CONTENTS));
                
                const input: ConductReactionInput = {
                    chemicals: foundChemicals.slice(0, MAX_BEAKER_CONTENTS).map(c => c.promptName || c.formula),
                    temperature,
                    concentration,
                    freezeSpeed
                };
                const reactionResult = await conductReaction(input);
                setReactionResult(reactionResult);
                setReactionEffects(reactionResult.effects);
              } else {
                 toast({ variant: 'destructive', title: 'No Chemicals Found', description: 'The AI could not match the text to any available chemicals.' });
              }
          } else {
              toast({ variant: 'destructive', title: 'No Chemicals Found', description: 'The AI could not identify any chemicals from the whiteboard.' });
          }
      } catch (error) {
          console.error("Error simulating from whiteboard:", error);
          toast({
              variant: "destructive",
              title: "Simulation Error",
              description: "An error occurred while simulating from the whiteboard.",
          });
      } finally {
          setIsLoading(false);
          setIsWhiteboardOpen(false);
      }
  };
  
  useEffect(() => {
    setWhiteboardCallbacks({ onSimulate: handleSimulateWhiteboard });
  }, [temperature, concentration, customChemicals, freezeSpeed]);


  const handleSendChatMessage = async (message: string) => {
    if (!reactionResult) return;
    
    const newUserMessage: ChatMessage = { role: 'user', content: message };
    setChatHistory(prev => [...prev, newUserMessage]);
    setIsChatLoading(true);

    try {
        const result = await chatAboutReaction({
            question: message,
            reactionContext: {
                reactants: beakerContents.map(c => c.promptName || c.formula),
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
  
  const handleOpenCustomCreation = (chemicalToEdit: Chemical | null = null, defaultCategory: CustomCreationCategory | null = null) => {
    if (chemicalToEdit) {
        setEditingChemical(chemicalToEdit);
        setCustomChemicalName(chemicalToEdit.promptName || chemicalToEdit.name);
        // When editing, always treat it as custom to show the description field.
        setCustomCreationCategory('custom');
        setCustomChemicalDescription(chemicalToEdit.description || '');
    } else {
        setEditingChemical(null);
        setCustomChemicalName('');
        setCustomChemicalDescription('');
        setCustomCreationCategory(defaultCategory);
    }
    setIsCustomCreationOpen(true);
  };
  
  const handleCreateOrUpdateCustomChemical = async () => {
    if (!customChemicalName.trim() || !customCreationCategory) return;
    setIsCreatingCustom(true);
    try {
        const input: CreateChemicalInput = {
            name: customChemicalName,
            category: customCreationCategory,
            description: customChemicalDescription,
            isEditing: !!editingChemical,
        };
        const result = await createChemical(input);

        if (result.found && result.formula && result.name && result.commonName) {
            const newChemical: Chemical = {
                formula: result.formula,
                name: result.name,
                commonName: result.commonName,
                isElement: result.isElement || false,
                effects: result.effects || {},
                promptName: customChemicalName,
                description: customChemicalDescription || result.name, // Fallback to name if description is empty
            };

            if (editingChemical) {
                setCustomChemicals(prev => prev.map(c => c.formula === editingChemical.formula ? newChemical : c));
                toast({
                    title: 'Item Updated!',
                    description: result.suggestion 
                        ? `${newChemical.commonName} has been updated. ${result.suggestion}`
                        : `${newChemical.commonName} has been updated.`,
                });
            } else {
                setCustomChemicals(prev => [...prev, newChemical]);
                 toast({
                    title: 'Item Created!',
                    description: result.suggestion 
                        ? `${newChemical.commonName} is now available. ${result.suggestion}`
                        : `${newChemical.commonName} (${newChemical.formula}) is now available.`,
                });
            }
           
            setIsCustomCreationOpen(false);
            setEditingChemical(null);

        } else {
            toast({
                variant: "destructive",
                title: editingChemical ? 'Update Failed' : 'Creation Failed',
                description: result.suggestion || `Could not process an item named "${customChemicalName}".`,
            });
        }
    } catch (error) {
        console.error("Error creating/updating custom chemical:", error);
        toast({
            variant: "destructive",
            title: "AI Error",
            description: "An AI error occurred while processing the item.",
        });
    } finally {
        setIsCreatingCustom(false);
    }
};

const handleGenerateDescription = async () => {
    if (!customChemicalName.trim()) return;
    setIsGeneratingDescription(true);
    try {
        const result = await generateDescription({ name: customChemicalName });
        setCustomChemicalDescription(result.description);
    } catch (error) {
        console.error("Error generating description:", error);
        toast({
            variant: "destructive",
            title: "AI Error",
            description: "Could not generate a description for this item.",
        });
    } finally {
        setIsGeneratingDescription(false);
    }
};

const handleDeleteCustomChemical = () => {
    if (!deletingChemical) return;
    setCustomChemicals(prev => prev.filter(c => c.formula !== deletingChemical.formula));
    setBeakerContents(prev => prev.filter(c => c.formula !== deletingChemical.formula));
    toast({ title: 'Item Deleted', description: `${deletingChemical.commonName} has been removed.` });
    setDeletingChemical(null);
}

const handleRevertHistory = (state: LabState) => {
    loadLabState(state);
    setIsHistoryOpen(false);
    toast({
      title: "State Reverted",
      description: "The lab has been reverted to the selected point in history.",
    });
  };

  const handleTemperatureChange = (newTemp: number) => {
    setTemperature(Math.max(-273, newTemp));
  };

  const handleConcentrationChange = (newConc: number) => {
    setConcentration(Math.max(0.1, newConc));
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData("chemicalIndex", index.toString());
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData("chemicalIndex"), 10);
    if (isNaN(dragIndex)) return;
    const newContents = [...beakerContents];
    const [draggedItem] = newContents.splice(dragIndex, 1);
    newContents.splice(dropIndex, 0, draggedItem);
    setBeakerContents(newContents);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  if (!isMounted) {
    return <div className="fixed inset-0 flex items-center justify-center bg-background"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  }

  return (
    <>
      <SoundManager effects={reactionEffects} />
      <main className="container py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="flex flex-col justify-center space-y-8">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold text-primary">Simulate</h1>
              <p className="text-3xl sm:text-4xl md:text-5xl font-semibold text-muted-foreground">
                Chemical Reactions
              </p>
            </div>
            <Card className="shadow-lg">
              <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <CardTitle>Select Chemicals</CardTitle>
                        <CardDescription>Choose up to {MAX_BEAKER_CONTENTS} items to mix.</CardDescription>
                    </div>
                    <div className='flex items-center gap-2 flex-wrap justify-start sm:justify-end'>
                       <Button variant="outline" size="icon" onClick={() => setIsPastLabsOpen(true)} aria-label="Open past labs">
                          <Menu className="h-4 w-4" />
                        </Button>
                      <div className="relative w-full sm:w-auto">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                              placeholder="Search..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 w-full sm:w-32"
                              aria-label="Search for chemicals"
                          />
                      </div>
                      <Button variant="outline" onClick={() => setIsPeriodicTableOpen(true)}>
                        <Grid3x3 className="mr-2 h-4 w-4" />
                        Periodic Table
                      </Button>
                       <Button variant="outline" size="icon" onClick={() => setIsWhiteboardOpen(true)} aria-label="Open whiteboard">
                        <PenSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setIsModifiersOpen(true)} aria-label="Open modifiers">
                        <Wrench className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
              </CardHeader>
              <CardContent>
                 <div className="w-full bg-gray-200 p-1 rounded-full mb-6 flex flex-wrap justify-center gap-1">
                  {visibleCategories.map(category => (
                    <Button 
                      key={category}
                      variant={activeCategory === category ? 'default' : 'ghost'}
                      onClick={() => setActiveCategory(category)}
                      className={`rounded-full flex-1 text-xs md:text-sm ${activeCategory === category ? 'bg-primary text-primary-foreground shadow' : 'text-gray-600'}`}
                      aria-pressed={activeCategory === category}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
                
                {activeCategory === 'CUSTOM' ? (
                   <TooltipProvider>
                      <div className="space-y-4">
                          <div className="flex gap-2">
                              <Button onClick={() => handleOpenCustomCreation()} className="flex-1">
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Create a Custom Item
                              </Button>
                          </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-52 overflow-y-auto pr-2">
                          {filteredChemicals.length === 0 ? (
                          <p className="col-span-full text-center text-muted-foreground text-sm pt-4">
                            {searchQuery ? 'No custom items match your search.' : 'No custom items created yet.'}
                          </p>
                          ) : (
                          filteredChemicals.map((chemical, index) => (
                              <Tooltip key={`${chemical.formula}-${index}`}>
                                  <TooltipTrigger asChild>
                                      <div className="relative group">
                                          <Button 
                                              variant="outline"
                                              onClick={() => handleChemicalClick(chemical)}
                                              disabled={beakerContents.length >= MAX_BEAKER_CONTENTS || beakerContents.some(c => c.formula === chemical.formula)}
                                              title={chemical.name}
                                              className="w-full flex-col h-auto text-left p-2"
                                              aria-label={`Add ${chemical.commonName} to beaker`}
                                          >
                                              <span className="font-bold text-base truncate w-full">{chemical.commonName}</span>
                                              <span className="text-xs text-muted-foreground truncate w-full">{chemical.formula}</span>
                                          </Button>
                                          <div className="absolute top-0 right-0 flex opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-tr-md rounded-bl-md">
                                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleShowInfo(chemical); }} title={`Info on ${chemical.name}`} aria-label={`Show info for ${chemical.name}`}>
                                                  <Info size={14} />
                                              </Button>
                                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleOpenCustomCreation(chemical); }} title={`Edit ${chemical.name}`} aria-label={`Edit ${chemical.name}`}>
                                                  <PenSquare size={14} />
                                              </Button>
                                              <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeletingChemical(chemical); }} title={`Delete ${chemical.name}`} aria-label={`Delete ${chemical.name}`}>
                                                  <Trash2 size={14} />
                                              </Button>
                                          </div>
                                      </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                      <p>Scientific: {chemical.name}</p>
                                      <p>Original: {chemical.promptName}</p>
                                  </TooltipContent>
                              </Tooltip>
                          ))
                          )}
                      </div>
                      </div>
                   </TooltipProvider>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-60 overflow-y-auto pr-2">
                    {filteredChemicals.map((chemical, index) => (
                      <div key={`${activeCategory}-${chemical.formula}-${index}`} className="relative group">
                        <Button 
                          variant="outline"
                          onClick={() => handleChemicalClick(chemical)}
                          disabled={beakerContents.length >= MAX_BEAKER_CONTENTS || beakerContents.some(c => c.formula === chemical.formula)}
                          title={chemical.name}
                          className="w-full flex-col h-auto text-left p-2"
                          aria-label={`Add ${chemical.name} to beaker`}
                        >
                          <span className="font-bold text-base truncate w-full">{chemical.commonName || chemical.formula}</span>
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

          <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 flex flex-col items-center justify-between border-2 border-gray-200 min-h-[500px] lg:min-h-[600px]">
            
            <div className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">Beaker</h2>
                      <Button variant="ghost" size="icon" onClick={() => setIsHistoryOpen(true)} disabled={simulationHistory.length === 0} aria-label="Show simulation history">
                          <History className="h-5 w-5" />
                      </Button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end max-w-full" onDragOver={handleDragOver}>
                    <p className="font-semibold text-sm">Contents:</p>
                    {beakerContents.length > 0 ? (
                      beakerContents.map((c, index) => (
                        <div
                          key={`${c.formula}-${index}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDrop={(e) => handleDrop(e, index)}
                          onDragOver={handleDragOver}
                          className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium pl-2.5 pr-1 py-0.5 rounded-full cursor-grab active:cursor-grabbing"
                          aria-label={`Chemical: ${c.commonName || c.name}. Drag to reorder.`}
                        >
                          {c.commonName || c.name}
                          <button onClick={() => handleRemoveChemical(c.formula)} className="ml-2 text-blue-600 hover:text-blue-800 rounded-full p-0.5" aria-label={`Remove ${c.name}`}>
                            <X size={14}/>
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">Empty</p>
                    )}
                    {beakerContents.length > 0 && 
                      <Button variant="destructive" size="sm" onClick={handleClearBeaker}>Clear</Button>
                    }
                  </div>
              </div>
              
              <div className="relative w-full flex-1 flex items-center justify-center my-4 min-h-[250px] sm:min-h-[300px]">
                <VerticalSlider
                  value={concentration}
                  onValueChange={handleConcentrationChange}
                  unit="M"
                  icon={<FlaskConical className="h-5 w-5" />}
                  ariaLabel="Concentration"
                />
                <BeakerIcon contents={beakerContents} overrideEffects={reactionEffects} className="h-64 w-64 sm:h-72 sm:w-72" />
                <VerticalSlider
                  value={temperature}
                  onValueChange={handleTemperatureChange}
                  unit="°C"
                  icon={<Thermometer className="h-5 w-5" />}
                  ariaLabel="Temperature"
                />
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
                                      <div key={index} className="flex items-start gap-2 text-xs p-2 bg-gray-100 rounded-md">
                                          <Lightbulb className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                          <p><span className="font-semibold">{analogy.aspect}:</span> ~{analogy.comparison}</p>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3 rounded-lg border p-3">
                              <Sun className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
                              <div>
                                  <h4 className="font-semibold">Light Test</h4>
                                  <p className="text-muted-foreground">{reactionResult.lightTest}</p>
                              </div>
                          </div>
                          <div className="flex items-start gap-3 rounded-lg border p-3">
                              <Flame className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
                              <div>
                                  <h4 className="font-semibold">Flame Test</h4>
                                  <p className="text-muted-foreground">{reactionResult.flameTest}</p>
                              </div>
                          </div>
                      </div>
                      <div className="rounded-lg border p-3">
                          <div className="flex items-start gap-3">
                            <Snowflake className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold">Freeze Test</h4>
                                <p className="text-muted-foreground">{reactionResult.freezeTest}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-end">
                            <ToggleGroup type="single" value={freezeSpeed} onValueChange={(value: 'normal' | 'rapid') => value && setFreezeSpeed(value)} aria-label="Freeze Test Speed">
                              <ToggleGroupItem value="normal" aria-label="Normal speed">Normal</ToggleGroupItem>
                              <ToggleGroupItem value="rapid" aria-label="Rapid speed">Rapid</ToggleGroupItem>
                            </ToggleGroup>
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
                onClick={() => handleStartReaction()} 
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
      </main>

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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <DialogTitle>About {infoChemical?.name} ({infoChemical?.formula})</DialogTitle>
                <div className='flex items-center gap-2 flex-wrap'>
                  {infoChemical?.isElement && (
                      <Button variant="outline" size="sm" onClick={handleShowUsageChart} disabled={isInfoLoading || isUsageChartLoading}>
                          <BarChart className="mr-2 h-4 w-4"/>
                          {isUsageChartLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Usage'}
                      </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleFindCommonName} disabled={isFindingCommonName || isInfoLoading}>
                        {isFindingCommonName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        <span className="ml-2">Find Common Name</span>
                  </Button>
                </div>
            </div>
            {foundCommonName && (
                <DialogDescription className="text-lg text-primary font-semibold pt-2">
                    Common Name: {foundCommonName}
                </DialogDescription>
            )}
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
                      <span className="w-28 shrink-0">Reactivity</span>
                      <Progress value={infoContent.ratings.reactivity * 10} className="w-full" aria-label={`Reactivity: ${infoContent.ratings.reactivity} out of 10`} />
                    </div>
                     <div className="flex items-center gap-2">
                      <span className="w-28 shrink-0">Flammability</span>
                      <Progress value={infoContent.ratings.flammability * 10} className="w-full" aria-label={`Flammability: ${infoContent.ratings.flammability} out of 10`} />
                    </div>
                     <div className="flex items-center gap-2">
                      <span className="w-28 shrink-0">Explosiveness</span>
                      <Progress value={infoContent.ratings.explosiveness * 10} className="w-full" aria-label={`Explosiveness: ${infoContent.ratings.explosiveness} out of 10`} />
                    </div>
                     <div className="flex items-center gap-2">
                      <span className="w-28 shrink-0">Radioactivity</span>
                      <Progress value={infoContent.ratings.radioactivity * 10} className="w-full" aria-label={`Radioactivity: ${infoContent.ratings.radioactivity} out of 10`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-28 shrink-0">Toxicity</span>
                      <Progress value={infoContent.ratings.toxicity * 10} className="w-full" aria-label={`Toxicity: ${infoContent.ratings.toxicity} out of 10`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-28 shrink-0">Corrosiveness</span>
                      <Progress value={infoContent.ratings.corrosiveness * 10} className="w-full" aria-label={`Corrosiveness: ${infoContent.ratings.corrosiveness} out of 10`} />
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
      
      <Dialog open={isModifiersOpen} onOpenChange={setIsModifiersOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Simulation Modifiers</DialogTitle>
            <DialogDescription>
              Select a modifier to influence the reaction's outcome, or create a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                 {CHEMICAL_CATEGORIES.MODIFIERS.map((modifier) => (
                    <Button 
                        key={modifier.formula}
                        variant="outline"
                        onClick={() => handleModifierClick(modifier)}
                        disabled={beakerContents.length >= MAX_BEAKER_CONTENTS || beakerContents.some(c => c.formula === modifier.formula)}
                        title={modifier.name}
                        className="w-full flex-col h-auto p-2"
                        aria-label={`Add ${modifier.name} to beaker`}
                    >
                        <span className="font-bold text-base truncate w-full">{modifier.commonName}</span>
                        <span className="text-xs text-muted-foreground truncate w-full">{modifier.name}</span>
                    </Button>
                ))}
             </div>
             <Button onClick={() => handleOpenCustomCreation(null, 'modifier')} className="w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                Create a Custom Modifier
            </Button>
          </div>
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
              <Whiteboard chemicals={beakerContents} callbacks={whiteboardCallbacks} />
            </div>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10 bg-white">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </DialogClose>
        </DialogContent>
      </Dialog>
      
       <Dialog open={isCustomCreationOpen} onOpenChange={(isOpen) => { if (!isOpen) setCustomCreationCategory(null); setIsCustomCreationOpen(isOpen);}}>
        <DialogContent>
          <DialogHeader>
             <DialogTitle>{editingChemical ? 'Edit Custom Item' : 'Create a Custom Item'}</DialogTitle>
            <DialogDescription>
              {customCreationCategory === 'custom'
                ? "Invent a new material. Give it a name and describe it, or let the AI generate a description for you."
                : "What kind of item do you want to create? The AI will generate its properties based on your choice."
              }
            </DialogDescription>
          </DialogHeader>
          {!customCreationCategory && !editingChemical ? (
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setCustomCreationCategory('ordinary')}>
                <Beaker className="h-6 w-6" />
                <span className="text-center">Ordinary Item</span>
                <p className="text-xs text-muted-foreground text-center">e.g., "Vinegar", "Baking Soda"</p>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setCustomCreationCategory('compound')}>
                <Atom className="h-6 w-6" />
                <span className="text-center">Compound</span>
                <p className="text-xs text-muted-foreground text-center">e.g., "Vinegar, Baking Soda"</p>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setCustomCreationCategory('utility')}>
                <Wrench className="h-6 w-6" />
                <span className="text-center">Utility</span>
                 <p className="text-xs text-muted-foreground text-center">e.g., "Copper Wire", "Vacuum"</p>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setCustomCreationCategory('modifier')}>
                <Wrench className="h-6 w-6" />
                <span className="text-center">Modifier</span>
                 <p className="text-xs text-muted-foreground text-center">e.g., "Solidify", "Stabilize"</p>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2 col-span-2" onClick={() => setCustomCreationCategory('custom')}>
                <HelpCircle className="h-6 w-6" />
                <span className="text-center">Other (Invent)</span>
                 <p className="text-xs text-muted-foreground text-center">Invent a fictional material from scratch</p>
              </Button>
            </div>
          ) : (
            <div className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                    <p className="font-semibold">
                        {editingChemical ? 'Editing' : 'Creating a/an'} <span className="text-primary capitalize">{customCreationCategory}</span> item.
                    </p>
                    {!editingChemical && (
                        <Button variant="link" onClick={() => setCustomCreationCategory(null)}>Change</Button>
                    )}
                </div>
                <Input
                    placeholder={
                        customCreationCategory === 'compound' ? "e.g., Vinegar, Baking Soda, Lemon" :
                        customCreationCategory === 'utility' ? "e.g., Copper Wire, Vacuum" :
                        customCreationCategory === 'modifier' ? "e.g., Solidify, Accelerate" :
                        customCreationCategory === 'custom' ? "Item Name (e.g., Glowing Shard)" :
                        "e.g., Baking Soda"
                    }
                    value={customChemicalName}
                    onChange={(e) => setCustomChemicalName(e.target.value)}
                    disabled={isCreatingCustom || isGeneratingDescription}
                    aria-label="Custom item name"
                />
                {(customCreationCategory === 'custom' || editingChemical) && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="custom-description" className="text-sm font-medium">Description</label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleGenerateDescription}
                        disabled={isGeneratingDescription || !customChemicalName.trim()}
                        aria-label="Generate description with AI"
                      >
                        {isGeneratingDescription ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4" />
                        )}
                        <span className="ml-2">Generate</span>
                      </Button>
                    </div>
                    <Textarea
                      id="custom-description"
                      placeholder="Describe it... or let the AI generate one for you."
                      value={customChemicalDescription}
                      onChange={(e) => setCustomChemicalDescription(e.target.value)}
                      disabled={isCreatingCustom || isGeneratingDescription}
                      rows={3}
                      aria-label="Custom item description"
                    />
                  </div>
                )}
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsCustomCreationOpen(false)} disabled={isCreatingCustom}>Cancel</Button>
                    <Button onClick={handleCreateOrUpdateCustomChemical} disabled={isCreatingCustom || !customChemicalName.trim() || isGeneratingDescription}>
                        {isCreatingCustom ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        <span className="ml-2">{editingChemical ? 'Update' : 'Create'}</span>
                    </Button>
                </div>
            </div>
          )}
        </DialogContent>
       </Dialog>
      
       <AlertDialog open={!!deletingChemical} onOpenChange={(isOpen) => !isOpen && setDeletingChemical(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deletingChemical?.commonName}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingChemical(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCustomChemical} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                        {entry.state.beakerContents.map(p => p.commonName || p.name).join(', ') || 'None'}
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
              <p className="text-center py-8 text-muted-foreground">No simulations run in this session yet.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
