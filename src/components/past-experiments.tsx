
'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Chemical } from '@/lib/chemicals';
import type { ConductReactionOutput } from '@/ai/schemas/reactionSchema';
import type { ChatMessage } from './chat-interface';
import { History, Save, Trash2, Upload } from 'lucide-react';

export interface LabState {
  beakerContents: Chemical[];
  customChemicals: Chemical[];
  temperature: number;
  concentration: number;
  reactionResult: ConductReactionOutput | null;
  chatHistory: ChatMessage[];
}

interface SavedLab extends LabState {
  id: string;
  savedAt: string;
}

interface PastExperimentsProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentLabState: LabState;
  onLoadLab: (state: LabState) => void;
}

export const PastExperiments: React.FC<PastExperimentsProps> = ({
  isOpen,
  onOpenChange,
  currentLabState,
  onLoadLab,
}) => {
  const [savedLabs, setSavedLabs] = useState<SavedLab[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      try {
        const storedLabs = localStorage.getItem('pastLabExperiments');
        if (storedLabs) {
          setSavedLabs(JSON.parse(storedLabs));
        }
      } catch (error) {
        console.error("Failed to load past labs from localStorage", error);
        toast({
          variant: "destructive",
          title: "Error Loading Labs",
          description: "Could not retrieve past experiments.",
        });
      }
    }
  }, [isOpen, toast]);

  const saveCurrentLab = () => {
    try {
      const newLab: SavedLab = {
        ...currentLabState,
        id: `lab-${Date.now()}`,
        savedAt: new Date().toLocaleString(),
      };
      
      const updatedLabs = [...savedLabs, newLab];
      localStorage.setItem('pastLabExperiments', JSON.stringify(updatedLabs));
      setSavedLabs(updatedLabs);
      
      toast({
        title: "Lab Saved!",
        description: "Your current experiment has been saved.",
      });
    } catch (error) {
      console.error("Failed to save lab", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "There was an error while saving your experiment.",
      });
    }
  };

  const handleLoadLab = (lab: SavedLab) => {
    onLoadLab(lab);
    onOpenChange(false);
  };

  const handleDeleteLab = (labId: string) => {
    try {
      const updatedLabs = savedLabs.filter(lab => lab.id !== labId);
      localStorage.setItem('pastLabExperiments', JSON.stringify(updatedLabs));
      setSavedLabs(updatedLabs);
      toast({
        title: "Lab Deleted",
        description: "The saved experiment has been removed.",
      });
    } catch (error) {
      console.error("Failed to delete lab", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not remove the saved experiment.",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle>Past Lab Experiments</SheetTitle>
          <SheetDescription>
            Save your current setup or load a previous experiment.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
            <div className="p-6 space-y-4">
                {savedLabs.length > 0 ? (
                savedLabs.map(lab => (
                    <Card key={lab.id} className="relative group">
                    <CardHeader>
                        <CardTitle className="text-lg">
                        {lab.reactionResult?.reactionName || 'Unreacted Chemicals'}
                        </CardTitle>
                        <CardDescription>Saved on: {lab.savedAt}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm">
                        <p>
                        <span className="font-semibold">Chemicals:</span>{' '}
                        {lab.beakerContents.map(c => c.formula).join(', ') || 'None'}
                        </p>
                        <p>
                        <span className="font-semibold">Temp:</span> {lab.temperature}°C,{' '}
                        <span className="font-semibold">Conc:</span> {lab.concentration}M
                        </p>
                    </CardContent>
                    <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm" onClick={() => handleLoadLab(lab)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Load
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this saved lab experiment.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteLab(lab.id)}>
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    </Card>
                ))
                ) : (
                <div className="text-center text-muted-foreground py-16">
                    <History className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold">No Saved Labs</h3>
                    <p className="mt-1 text-sm">Save your first experiment to see it here.</p>
                </div>
                )}
            </div>
            </ScrollArea>
        </div>
        <SheetFooter className="p-6 bg-background border-t">
          <Button className="w-full" onClick={saveCurrentLab}>
            <Save className="mr-2 h-4 w-4" />
            Save Current Lab
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

