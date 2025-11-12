

'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';

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
        callback(); 
        
        timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                callback();
            }, speed);
        }, initialDelay);

    }, [callback, speed, initialDelay]);

    const increaseValue = () => {
        callback();
    }
    const decreaseValue = () => {
        callback();
    }

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
  value: number;
  onValueChange: (newValue: number) => void;
  unit: string;
  icon?: React.ReactNode;
  label: string;
}

export const VerticalSlider: React.FC<VerticalSliderProps> = ({ 
    className, 
    value,
    onValueChange,
    unit,
    icon, 
    label
}) => {
  
  const onIncrease = () => onValueChange(value + (label === 'Celsius' ? 5 : 0.1));
  const onDecrease = () => onValueChange(value - (label === 'Celsius' ? 5 : 0.1));

  const increaseProps = usePressAndHold(onIncrease);
  const decreaseProps = usePressAndHold(onDecrease);

  const [inputValue, setInputValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const sizeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (label === 'Molarity') {
        setInputValue(String(value.toFixed(1)));
    } else {
        setInputValue(String(value));
    }
  }, [value, label]);

  useEffect(() => {
    if (inputRef.current && sizeRef.current) {
        inputRef.current.style.width = `${sizeRef.current.offsetWidth + 2}px`;
    }
  }, [inputValue]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    let numericValue = parseFloat(inputValue);
    if (!isNaN(numericValue)) {
        onValueChange(numericValue);
    } else {
        setInputValue(String(value)); // Revert if invalid
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleInputBlur();
        inputRef.current?.blur();
    }
  };
  
  return (
    <div className={cn("flex flex-col items-center space-y-3 mx-2 sm:mx-4", className)} role="group" aria-label={`${label} control`}>
      <Button 
        size="icon" 
        {...increaseProps}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-800 hover:bg-gray-700 shadow-md select-none" 
        aria-label={`Increase ${label}`}
      >
        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
      <div className="relative bg-gray-800 text-white rounded-full w-10 sm:w-12 flex flex-col items-center justify-center p-1 text-center" style={{height: '140px'}}>
        <div className="flex flex-col items-center gap-1" aria-hidden="true">
            {icon}
            <div className="relative w-full flex items-center justify-center gap-1">
                <span ref={sizeRef} className="absolute invisible whitespace-pre text-base font-semibold">{inputValue}</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent text-white text-right font-semibold outline-none border-none p-0 text-base"
                    style={{ minWidth: '1ch' }}
                    aria-label={`${label} value`}
                    aria-live="polite"
                    aria-valuemin={label === 'Celsius' ? -273 : 0.1}
                    aria-valuemax={1000}
                    aria-valuenow={value}
                />
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="text-xs opacity-70 cursor-help">{unit}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{label}</p>
                        </TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
            </div>
        </div>
      </div>
      <Button 
        size="icon" 
        {...decreaseProps}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-800 hover:bg-gray-700 shadow-md select-none" 
        aria-label={`Decrease ${label}`}
      >
        <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
    </div>
  );
};

    