'use client';

import { useState } from 'react';
import { LabScene } from '@/components/lab-scene';
import { Button } from '@/components/ui/button';
import { type ExperimentState } from '@/lib/types';
import { Beaker, RefreshCw, FlaskConical } from 'lucide-react';

export default function Home() {
  const [experimentState, setExperimentState] = useState<ExperimentState>('Ready');

  const getStatusMessage = () => {
    switch (experimentState) {
      case 'Ready':
        return 'Ready for experiment.';
      case 'Dropping':
        return 'Dropping sodium...';
      case 'Reacting':
        return 'Reaction in progress...';
      case 'Complete':
        return 'Reaction complete.';
      case 'Resetting':
        return 'Resetting experiment...';
      default:
        return '';
    }
  };

  return (
    <main className="dark h-screen w-screen bg-background relative overflow-hidden">
      <LabScene experimentState={experimentState} setExperimentState={setExperimentState} />

      <div className="absolute top-6 left-6 flex items-center gap-3 text-primary">
        <FlaskConical className="w-8 h-8" />
        <h1 className="text-2xl font-bold font-headline">
          Interactive Chemical Lab
        </h1>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center">
        <div className="w-full max-w-md p-4 bg-card/50 backdrop-blur-md rounded-lg border border-border shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-center sm:text-left text-muted-foreground font-medium">
            Status: <span className="text-foreground">{getStatusMessage()}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setExperimentState('Dropping')}
              disabled={experimentState !== 'Ready'}
            >
              <Beaker className="mr-2 h-4 w-4" />
              Drop Sodium
            </Button>
            <Button
              variant="outline"
              onClick={() => setExperimentState('Resetting')}
              disabled={experimentState === 'Ready' || experimentState === 'Dropping' || experimentState === 'Resetting'}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
