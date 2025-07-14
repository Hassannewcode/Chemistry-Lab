import React from 'react';
import { cn } from '@/lib/utils';

// Simple hash function to get a color from a string
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

const mixColors = (color1: string, color2: string) => {
    const c1 = parseInt(color1.substring(1), 16);
    const c2 = parseInt(color2.substring(1), 16);
    const r = Math.floor((((c1 >> 16) & 0xFF) + ((c2 >> 16) & 0xFF)) / 2);
    const g = Math.floor((((c1 >> 8) & 0xFF) + ((c2 >> 8) & 0xFF)) / 2);
    const b = Math.floor(((c1 & 0xFF) + (c2 & 0xFF)) / 2);
    return `#${(r).toString(16).padStart(2, '0')}${(g).toString(16).padStart(2, '0')}${(b).toString(16).padStart(2, '0')}`;
}

interface BeakerIconProps extends React.SVGProps<SVGSVGElement> {
  contents?: string[];
}

export const BeakerIcon: React.FC<BeakerIconProps> = ({ contents = [], ...props }) => {
  const fillLevel = contents.length; // 0, 1, or 2

  let liquidColor = '#3b82f6'; // Default blue
  if (fillLevel === 1) {
    liquidColor = stringToColor(contents[0]);
  } else if (fillLevel === 2) {
    const color1 = stringToColor(contents[0]);
    const color2 = stringToColor(contents[1]);
    liquidColor = mixColors(color1, color2);
  }
  
  const liquidPath = [
      // Level 0 (Empty)
      "M 40 175 C 60 175, 140 175, 160 175 L 160 175 C 140 175, 60 175, 40 175 Z",
      // Level 1
      "M 40 175 C 60 160, 140 160, 160 175 L 160 130 C 140 145, 60 145, 40 130 Z",
      // Level 2
      "M 40 175 C 60 160, 140 160, 160 175 L 160 100 C 140 115, 60 115, 40 100 Z",
  ];
  
  const surfacePath = [
      // Level 0 (Empty)
      "M 40 175 C 60 175, 140 175, 160 175",
      // Level 1
      "M 40 130 C 60 145, 140 145, 160 130",
      // Level 2
      "M 40 100 C 60 115, 140 115, 160 100",
  ];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      {...props}
    >
      <defs>
        <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={liquidColor} stopOpacity="0.7" />
          <stop offset="100%" stopColor={liquidColor} stopOpacity="0.9" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
      </defs>
      
      {/* Beaker Glass */}
      <path
        d="M 30 180 L 30 40 Q 30 30 40 30 L 160 30 Q 170 30 170 40 L 170 180"
        fill="rgba(229, 231, 235, 0.3)" // Light gray, slightly transparent
        stroke="#9ca3af" // Gray-400
        strokeWidth="4"
      />
      <path
        d="M 25 180 Q 100 195 175 180"
        fill="rgba(229, 231, 235, 0.3)"
        stroke="#9ca3af"
        strokeWidth="4"
      />
      
      {/* Liquid */}
      {fillLevel > 0 && (
        <>
          <path
            d={liquidPath[fillLevel]}
            fill="url(#liquidGradient)"
            filter="url(#glow)"
            style={{ transition: 'd 0.5s ease-in-out' }}
          />
          <path
            d={surfacePath[fillLevel]}
            fill="none"
            stroke={liquidColor}
            strokeWidth="3"
            style={{ transition: 'd 0.5s ease-in-out' }}
          />
        </>
      )}

      {/* Bubbles */}
      {fillLevel > 0 && (
          <>
            <circle cx="70" cy="130" r="3" fill="white" opacity="0.7">
                <animate attributeName="cy" values="170;120;170" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="100" cy="150" r="4" fill="white" opacity="0.8">
                <animate attributeName="cy" values="175;110;175" dur="2.5s" begin="-1s" repeatCount="indefinite" />
            </circle>
            <circle cx="130" cy="120" r="2.5" fill="white" opacity="0.6">
                <animate attributeName="cy" values="165;130;165" dur="3.5s" begin="-0.5s" repeatCount="indefinite" />
            </circle>
          </>
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
