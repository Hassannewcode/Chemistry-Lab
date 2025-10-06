
'use client';

import React, { useRef, useCallback } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

// Custom hook for press-and-hold functionality
const usePressAndHold = (callback: () => void, speed: number = 50, initialDelay: number = 400) => {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const stop = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const start = useCallback((event: React.MouseEvent | React.TouchEvent) => {
        event.preventDefault();
        // Initial action on first press
        callback(); 
        
        timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                callback();
            }, speed);
        }, initialDelay);

    }, [callback, speed, initialDelay]);

    return {
        onMouseDown: (e: React.MouseEvent) => start(e),
        onTouchStart: (e: React.TouchEvent) => start(e),
        onMouseUp: stop,
        onMouseLeave: stop,
        onTouchEnd: stop,
    };
};

interface VerticalSliderProps {
  className?: string;
  label?: string;
  icon?: React.ReactNode;
  onIncrease: () => void;
  onDecrease: () => void;
  ariaLabel: string;
}

export const VerticalSlider: React.FC<VerticalSliderProps> = ({ className, label, icon, onIncrease, onDecrease, ariaLabel }) => {
  const increaseProps = usePressAndHold(onIncrease);
  const decreaseProps = usePressAndHold(onDecrease);
  
  return (
    <div className={cn("flex flex-col items-center space-y-3 mx-4", className)} role="group" aria-label={`${ariaLabel} control`}>
      <Button 
        size="icon" 
        {...increaseProps}
        className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 shadow-md select-none" 
        aria-label={`Increase ${ariaLabel}`}
      >
        <Plus className="h-5 w-5" />
      </Button>
      <div className="relative bg-gray-800 text-white rounded-full w-12 flex flex-col items-center justify-between py-2 text-center" style={{height: '140px'}}>
        <div className='absolute inset-0 flex flex-col items-center justify-center p-1' aria-hidden="true">
            {icon}
            {label && <span className="text-sm font-semibold mt-1">{label}</span>}
        </div>
      </div>
      <Button 
        size="icon" 
        {...decreaseProps}
        className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 shadow-md select-none" 
        aria-label={`Decrease ${ariaLabel}`}
      >
        <Minus className="h-5 w-5" />
      </Button>
    </div>
  );
};
