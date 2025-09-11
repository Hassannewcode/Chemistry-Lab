
'use client';

import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { ChemicalEffect } from './beaker-icon';

interface SoundManagerProps {
  effects: ChemicalEffect | null;
}

// Helper to map a value from one range to another
const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

export const SoundManager: React.FC<SoundManagerProps> = ({ effects }) => {
    const synths = useRef({
        fizz: null as Tone.Noise | null,
        hiss: null as Tone.Noise | null,
        crackle: null as Tone.Noise | null,
        explosion: null as Tone.MembraneSynth | null,
    });
    
    const filters = useRef({
        fizzFilter: null as Tone.AutoFilter | null,
        hissFilter: null as Tone.Filter | null,
    });
    
    const volumes = useRef({
        fizzVol: null as Tone.Volume | null,
        hissVol: null as Tone.Volume | null,
        crackleVol: null as Tone.Volume | null,
    });

    // Initialize synths and effects chain on component mount
    useEffect(() => {
        // Fizz/Bubble sound
        const fizzVol = new Tone.Volume(-Infinity).toDestination();
        const fizzFilter = new Tone.AutoFilter({
            frequency: '8n',
            baseFrequency: 400,
            octaves: 2,
        }).connect(fizzVol);
        const fizz = new Tone.Noise('pink').connect(fizzFilter);
        
        // Hiss/Smoke sound
        const hissVol = new Tone.Volume(-Infinity).toDestination();
        const hissFilter = new Tone.Filter(800, 'bandpass').connect(hissVol);
        const hiss = new Tone.Noise('white').connect(hissFilter);

        // Crackle/Sparkle sound
        const crackleVol = new Tone.Volume(-Infinity).toDestination();
        const crackle = new Tone.Noise('brown').connect(crackleVol);

        // Explosion sound
        const explosion = new Tone.MembraneSynth({
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
        }).toDestination();
        explosion.volume.value = -6;

        synths.current = { fizz, hiss, crackle, explosion };
        filters.current = { fizzFilter, hissFilter };
        volumes.current = { fizzVol, hissVol, crackleVol };

        return () => {
            // Cleanup on unmount
            Object.values(synths.current).forEach(synth => synth?.dispose());
            Object.values(filters.current).forEach(filter => filter?.dispose());
            Object.values(volumes.current).forEach(vol => vol?.dispose());
        };
    }, []);

    useEffect(() => {
        if (!effects) {
            return;
        }

        const { fizz, hiss, crackle, explosion } = synths.current;
        const { fizzFilter, hissFilter } = filters.current;
        const { fizzVol, hissVol, crackleVol } = volumes.current;

        // Ensure Tone.js is started on user interaction
        const startAudio = async () => {
            if (Tone.context.state !== 'running') {
                await Tone.start();
            }

            // Bubbles -> Fizz
            if (effects.bubbles > 0 && fizz && fizzFilter && fizzVol) {
                if (fizz.state === 'stopped') fizz.start();
                const fizzVolume = mapRange(effects.bubbles, 0, 10, -30, -10);
                fizzVol.volume.rampTo(fizzVolume, 0.1);
                fizzFilter.frequency.rampTo(effects.bubbles > 5 ? '4n' : '8n', 0.1);
            } else {
                fizzVol?.volume.rampTo(-Infinity, 0.5);
            }

            // Smoke -> Hiss
            if (effects.smoke > 0 && hiss && hissFilter && hissVol) {
                if (hiss.state === 'stopped') hiss.start();
                const hissVolume = mapRange(effects.smoke, 0, 1, -40, -15);
                hissVol.volume.rampTo(hissVolume, 0.1);
            } else {
                hissVol?.volume.rampTo(-Infinity, 0.5);
            }
            
            // Sparkles -> Crackle
            if (effects.sparkles > 0 && crackle && crackleVol) {
                if (crackle.state === 'stopped') crackle.start();
                const crackleVolume = mapRange(effects.sparkles, 0, 50, -35, -20);
                crackleVol.volume.rampTo(crackleVolume, 0.05);
                setTimeout(() => crackleVol.volume.rampTo(-Infinity, 0.1), 100 + effects.sparkles * 10);
            }

            // Explosion
            if (effects.explosion > 0 && explosion) {
                const explosionVolume = mapRange(effects.explosion, 0, 10, -15, 0);
                explosion.volume.value = explosionVolume;
                explosion.triggerAttackRelease('C1', '0.5s');
            }
        };

        startAudio();

    }, [effects]);

    return null; // This component does not render anything
};

    