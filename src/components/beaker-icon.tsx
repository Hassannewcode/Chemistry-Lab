import React from 'react';
import { cn } from '@/lib/utils';

export const BeakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      {...props}
    >
      <defs>
        <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.9" />
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
        fill="rgba(255, 255, 255, 0.2)"
        stroke="#e5e7eb"
        strokeWidth="4"
      />
      <path
        d="M 25 180 Q 100 195 175 180"
        fill="rgba(255, 255, 255, 0.2)"
        stroke="#e5e7eb"
        strokeWidth="4"
      />
      
      {/* Water */}
      <path
        d="M 40 175 C 60 160, 140 160, 160 175 L 160 100 C 140 115, 60 115, 40 100 Z"
        fill="url(#waterGradient)"
        filter="url(#glow)"
      />
      <path
        d="M 40 100 C 60 115, 140 115, 160 100"
        fill="none"
        stroke="#93c5fd"
        strokeWidth="3"
      />

      {/* Bubbles */}
      <circle cx="70" cy="130" r="3" fill="white" opacity="0.7">
        <animate attributeName="cy" values="170;120;170" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="150" r="4" fill="white" opacity="0.8">
        <animate attributeName="cy" values="175;110;175" dur="2.5s" begin="-1s" repeatCount="indefinite" />
      </circle>
      <circle cx="130" cy="120" r="2.5" fill="white" opacity="0.6">
        <animate attributeName="cy" values="165;130;165" dur="3.5s" begin="-0.5s" repeatCount="indefinite" />
      </circle>
      
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
