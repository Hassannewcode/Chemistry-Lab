'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

export const useLabSounds = () => {
  const synths = useRef<{
    fizz: Tone.NoiseSynth | null;
    hiss: Tone.NoiseSynth | null;
    pop: Tone.MembraneSynth | null;
    hissFilter: Tone.AutoFilter | null;
  }>({ fizz: null, hiss: null, pop: null, hissFilter: null });

  useEffect(() => {
    // Initialize synths only once on the client
    const fizz = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.2 },
      volume: -25,
    }).toDestination();

    const hissFilter = new Tone.AutoFilter({
        frequency: '4n',
        baseFrequency: 400,
        octaves: 4
    }).toDestination();

    const hiss = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.5, decay: 0.1, sustain: 1 },
        volume: -15
    }).connect(hissFilter);

    const pop = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 10,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0.01,
        release: 1.4,
        attackCurve: 'exponential',
      },
      volume: -10,
    }).toDestination();

    synths.current = { fizz, hiss, pop, hissFilter };

    return () => {
      // Cleanup on unmount
      fizz.dispose();
      hiss.dispose();
      pop.dispose();
      hissFilter.dispose();
    };
  }, []);

  const startReactionSound = useCallback(() => {
    Tone.start(); // Ensure audio context is running
    synths.current.fizz?.triggerAttack();
    synths.current.hissFilter?.start();
    synths.current.hiss?.triggerAttack();
  }, []);

  const stopReactionSound = useCallback(() => {
    synths.current.fizz?.triggerRelease();
    synths.current.hiss?.triggerRelease();
    synths.current.hissFilter?.stop();
  }, []);

  const playPop = useCallback(() => {
    synths.current.pop?.triggerAttackRelease('C1', '8n', Tone.now());
  }, []);

  return { startReactionSound, stopReactionSound, playPop };
};
