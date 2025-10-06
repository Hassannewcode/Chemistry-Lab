
'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
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
  value: number;
  onValueChange: (newValue: number) => void;
  unit: string;
  icon?: React.ReactNode;
  onIncrease: () => void;
  onDecrease: () => void;
  ariaLabel: string;
}

export const VerticalSlider: React.FC<VerticalSliderProps> = ({ 
    className, 
    value,
    onValueChange,
    unit,
    icon, 
    onIncrease, 
    onDecrease, 
    ariaLabel 
}) => {
  const increaseProps = usePressAndHold(onIncrease);
  const decreaseProps = usePressAndHold(onDecrease);
  const [inputValue, setInputValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  useEffect(() => {
    if (inputRef.current) {
        const baseFontSize = 1; // base font size in rem
        const maxLength = 5; // characters before scaling
        const scaleFactor = 0.1;

        let newSize = baseFontSize;
        if (inputValue.length > maxLength) {
            newSize = baseFontSize - (inputValue.length - maxLength) * scaleFactor;
        }
        
        inputRef.current.style.fontSize = `${Math.max(newSize, 0.6)}rem`;
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
             <div className="relative w-full px-1">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent text-white text-center font-semibold outline-none border-none p-0"
                    style={{ fontSize: '1rem' }}
                />
                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs opacity-70" style={{pointerEvents: 'none'}}>
                    {unit}
                </span>
            </div>
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
