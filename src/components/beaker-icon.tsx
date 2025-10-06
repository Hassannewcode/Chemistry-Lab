
import React, { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MAX_BEAKER_CONTENTS } from '@/lib/constants';

// Effect properties for each chemical
export interface ChemicalEffect {
  color: string;
  bubbles: number; // 0-10, intensity
  smoke: number;   // 0-1, density
  sparkles: number; // count
  glow: number;    // 0-2, intensity
  explosion: number; // 0-10, intensity
}

interface Chemical {
    formula: string;
    name: string;
    isElement?: boolean;
    effects?: Partial<ChemicalEffect>;
}

interface BeakerIconProps extends React.SVGProps<SVGSVGElement> {
  contents?: Chemical[];
  overrideEffects?: ChemicalEffect | null;
}

// Default effects for the liquid base
const defaultEffects: ChemicalEffect = {
  color: '#add8e6', // Water blue
  bubbles: 0,
  smoke: 0,
  sparkles: 0,
  glow: 0,
  explosion: 0,
};

// Helper to mix hex colors
const mixHexColors = (colors: string[]): string => {
  if (colors.length === 0) return defaultEffects.color;
  let r = 0, g = 0, b = 0;
  colors.forEach(hex => {
    const color = parseInt(hex.substring(1), 16);
    r += (color >> 16) & 0xFF;
    g += (color >> 8) & 0xFF;
    b += color & 0xFF;
  });
  r = Math.floor(r / colors.length);
  g = Math.floor(g / colors.length);
  b = Math.floor(b / colors.length);
  return `#${(r).toString(16).padStart(2, '0')}${(g).toString(16).padStart(2, '0')}${(b).toString(16).padStart(2, '0')}`;
};

const SmokeParticle: React.FC<{ delay: string, duration: string }> = ({ delay, duration }) => (
    <path
      d="M 100 150 Q 90 130 100 110 T 100 70"
      fill="none"
      stroke="rgba(200, 200, 200, 0.3)"
      strokeWidth="10"
      strokeLinecap="round"
    >
      <animateTransform
        attributeName="transform"
        type="translate"
        values="0 0; 5 -10; -5 -20; 0 -30; 5 -40"
        dur={duration}
        repeatCount="indefinite"
        begin={delay}
      />
      <animate
        attributeName="opacity"
        values="0; 1; 1; 0"
        dur={duration}
        repeatCount="indefinite"
        begin={delay}
      />
    </path>
);

const Sparkle: React.FC<{ cx: number; cy: number; size: number; delay: string; duration: string }> = ({ cx, cy, size, delay, duration }) => (
  <path
    d={`M${cx},${cy - size} L${cx + size * 0.2},${cy - size * 0.2} L${cx + size},${cy} L${cx + size * 0.2},${cy + size * 0.2} L${cx},${cy + size} L${cx - size * 0.2},${cy + size * 0.2} L${cx - size},${cy} L${cx - size * 0.2},${cy - size * 0.2} Z`}
    fill="white"
  >
    <animate
      attributeName="opacity"
      values="0; 1; 0"
      dur={duration}
      begin={delay}
      repeatCount="indefinite"
    />
    <animateTransform
      attributeName="transform"
      type="scale"
      values="0.5; 1; 0.5"
      dur={duration}
      begin={delay}
      repeatCount="indefinite"
      additive="sum"
    />
  </path>
);

const Explosion: React.FC<{ intensity: number }> = ({ intensity }) => {
    if (intensity <= 0) return null;
    const size = 10 + intensity * 18; // Increased max size
    const duration = 0.6 / Math.max(0.5, intensity * 0.3);

    return (
        <g>
            {/* Main Blast Wave */}
            <circle cx="100" cy="120" r="5" fill="#FFD700" opacity="0.8">
                <animate attributeName="r" from="5" to={size} dur={`${duration}s`} begin="0s" fill="freeze" />
                <animate attributeName="opacity" from="0.8" to="0" dur={`${duration}s`} begin="0s" fill="freeze" />
            </circle>
            {/* Secondary Inner Blast */}
            <circle cx="100" cy="120" r="2" fill="#FF8C00" opacity="1">
                <animate attributeName="r" from="2" to={size * 0.6} dur={`${duration * 0.8}s`} begin="0.05s" fill="freeze" />
                <animate attributeName="opacity" from="1" to="0" dur={`${duration * 0.8}s`} begin="0.05s" fill="freeze" />
            </circle>
            {/* Shockwave Rings */}
            {Array.from({ length: Math.min(Math.floor(intensity / 2), 4) }).map((_, i) => (
              <circle key={i} cx="100" cy="120" r="0" fill="none" stroke="#FFA500" strokeWidth="3" opacity="0.7">
                  <animate attributeName="r" from="0" to={size * 1.2} dur={`${duration * 1.5}s`} begin={`${i * 0.08}s`} fill="freeze" />
                  <animate attributeName="opacity" from="0.7" to="0" dur={`${duration * 1.5}s`} begin={`${i * 0.08}s`} fill="freeze" />
                  <animate attributeName="stroke-width" from="3" to="0" dur={`${duration * 1.5}s`} begin={`${i * 0.08}s`} fill="freeze" />
              </circle>
            ))}
        </g>
    );
};


export const BeakerIcon: React.FC<BeakerIconProps> = ({ contents = [], overrideEffects = null, ...props }) => {
  const [explosionKey, setExplosionKey] = useState(0);
  
  const fillLevel = useMemo(() => {
    return Math.floor((contents.length / MAX_BEAKER_CONTENTS) * 12);
  }, [contents.length]);

  const combinedEffects = useMemo<ChemicalEffect>(() => {
    if (overrideEffects) return overrideEffects;
    if (contents.length === 0) return defaultEffects;

    const effects = contents.reduce((acc, chemical) => {
        const chemEffects = { ...defaultEffects, ...chemical.effects };
        acc.color.push(chemEffects.color);
        acc.bubbles += chemEffects.bubbles;
        acc.smoke += chemEffects.smoke;
        acc.sparkles += chemEffects.sparkles;
        acc.glow += chemEffects.glow;
        acc.explosion += chemEffects.explosion; // Accumulate explosion potential
        return acc;
    }, { color: [] as string[], bubbles: 0, smoke: 0, sparkles: 0, glow: 0, explosion: 0 });

    return {
        color: mixHexColors(effects.color),
        bubbles: Math.min(effects.bubbles, 10),
        smoke: Math.min(effects.smoke, 1),
        sparkles: Math.floor(Math.min(effects.sparkles, 50)),
        glow: Math.min(effects.glow, 2),
        explosion: Math.min(effects.explosion, 10),
    };
  }, [contents, overrideEffects]);

  useEffect(() => {
    if (overrideEffects?.explosion && overrideEffects.explosion > 0) {
      setExplosionKey(prev => prev + 1);
    }
  }, [overrideEffects])

  const liquidPath = [
    "M 40 175 C 60 175, 140 175, 160 175 L 160 175 C 140 175, 60 175, 40 175 Z", // Level 0
    "M 40 175 C 60 160, 140 160, 160 175 L 160 165 C 140 180, 60 180, 40 165 Z", // Level 1
    "M 40 175 C 60 160, 140 160, 160 175 L 160 155 C 140 170, 60 170, 40 155 Z", // Level 2
    "M 40 175 C 60 160, 140 160, 160 175 L 160 145 C 140 160, 60 160, 40 145 Z", // Level 3
    "M 40 175 C 60 160, 140 160, 160 175 L 160 130 C 140 145, 60 145, 40 130 Z", // Level 4
    "M 40 175 C 60 160, 140 160, 160 175 L 160 115 C 140 130, 60 130, 40 115 Z", // Level 5
    "M 40 175 C 60 160, 140 160, 160 175 L 160 100 C 140 115, 60 115, 40 100 Z", // Level 6
    "M 40 175 C 60 160, 140 160, 160 175 L 160, 85 C 140, 100, 60, 100, 40, 85 Z", // Level 7
    "M 40 175 C 60 160, 140 160, 160 175 L 160, 70 C 140, 85, 60, 85, 40, 70 Z",  // Level 8
    "M 40 175 C 60 160, 140 160, 160 175 L 160, 55 C 140, 70, 60, 70, 40, 55 Z",  // Level 9
    "M 40 175 C 60 160, 140 160, 160 175 L 160, 40 C 140, 55, 60, 55, 40, 40 Z",  // Level 10
    "M 40 175 C 60 160, 140 160, 160 175 L 160, 40 C 140, 55, 60, 55, 40, 40 Z",  // Level 11 (max visual fill)
    "M 40 175 C 60 160, 140 160, 160 175 L 160, 40 C 140, 55, 60, 55, 40, 40 Z",  // Level 12 (max visual fill)
  ];
  
  const surfacePath = [
    "M 40 175 C 60 175, 140 175, 160 175", // Level 0
    "M 40 165 C 60 180, 140 180, 160 165", // Level 1
    "M 40 155 C 60 170, 140 170, 160 155", // Level 2
    "M 40 145 C 60 160, 140 160, 160 145", // Level 3
    "M 40 130 C 60 145, 140 145, 160 130", // Level 4
    "M 40 115 C 60 130, 140 130, 160 115", // Level 5
    "M 40 100 C 60 115, 140 115, 160 100", // Level 6
    "M 40, 85 C 60, 100, 140, 100, 160, 85", // Level 7
    "M 40, 70 C 60, 85, 140, 85, 160, 70", // Level 8
    "M 40, 55 C 60, 70, 140, 70, 160, 55", // Level 9
    "M 40, 40 C 60, 55, 140, 55, 160, 40", // Level 10
    "M 40, 40 C 60, 55, 140, 55, 160, 40", // Level 11 (max visual fill)
    "M 40, 40 C 60, 55, 140, 55, 160, 40", // Level 12 (max visual fill)
  ];

  const currentLiquidPath = liquidPath[Math.min(fillLevel, 12)];
  const currentSurfacePath = surfacePath[Math.min(fillLevel, 12)];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      {...props}
    >
      <defs>
        <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={combinedEffects.color} stopOpacity="0.7" />
          <stop offset="100%" stopColor={combinedEffects.color} stopOpacity="0.9" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={combinedEffects.glow} result="coloredBlur" />
            <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
      </defs>
      
      {/* Liquid */}
      {contents.length > 0 && (
        <g filter={combinedEffects.glow > 0 ? "url(#glow)" : undefined}>
          <path
            d={currentLiquidPath}
            fill="url(#liquidGradient)"
            style={{ transition: 'd 0.5s ease-in-out' }}
          />
          <path
            d={currentSurfacePath}
            fill="none"
            stroke={combinedEffects.color}
            strokeWidth="3"
            style={{ transition: 'd 0.5s ease-in-out' }}
          />
        </g>
      )}

      {/* Beaker Glass */}
      <path
        d="M 30 180 L 30 40 Q 30 30 40 30 L 160 30 Q 170 30 170 40 L 170 180"
        fill="rgba(229, 231, 235, 0.3)"
        stroke="#9ca3af"
        strokeWidth="4"
      />
      <path
        d="M 25 180 Q 100 195 175 180"
        fill="rgba(229, 231, 235, 0.3)"
        stroke="#9ca3af"
        strokeWidth="4"
      />
      
      {/* Effects */}
      <g opacity={combinedEffects.smoke}>
        <SmokeParticle delay="0s" duration="5s" />
        <SmokeParticle delay="-1s" duration="6s" />
        <SmokeParticle delay="-2.5s" duration="4s" />
      </g>
      
      {Array.from({ length: combinedEffects.sparkles }).map((_, i) => (
        <Sparkle
          key={i}
          cx={60 + Math.random() * 80}
          cy={100 + Math.random() * 70}
          size={1 + Math.random() * 2}
          delay={`${Math.random() * 2}s`}
          duration={`${0.5 + Math.random() * 0.5}s`}
        />
      ))}

      {Array.from({ length: Math.floor(combinedEffects.bubbles) }).map((_, i) => (
         <circle key={i} cx={60 + Math.random() * 80} cy="170" r={1 + Math.random() * 3} fill="white" opacity="0.7">
              <animate attributeName="cy" values="170;100" dur={`${2 + Math.random() * 2}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0" dur={`${2 + Math.random() * 2}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
          </circle>
      ))}

      {/* Explosion Effect - keyed to re-trigger */}
      {combinedEffects.explosion > 0 && (
          <g key={explosionKey}>
            <Explosion intensity={combinedEffects.explosion} />
          </g>
      )}
      
      {/* Markings */}
      <g stroke="#a0aec0" strokeWidth="1.5">
        <line x1="150" y1="150" x2="160" y2="150" />
        <text x="145" y="153" textAnchor="end" fontSize="8">50</text>
        
        <line x1="150" y1="120" x2="160" y2="120" />
        <text x="145" y="123" textAnchor="end" fontSize="8">150</text>
        
        <line x1="150" y1="90" x2="160" y2="90" />
        <text x="145" y="93" textAnchor="end" fontSize="8">250</text>
        
        <line x1="150" y1="60" x2="160" y2="60" />
        <text x="145" y="63" textAnchor="end" fontSize="8">350ml</text>
      </g>
    </svg>
  );
};
