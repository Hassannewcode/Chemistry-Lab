
import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface VerticalSliderProps {
  className?: string;
  label?: string;
  icon?: React.ReactNode;
  onIncrease: () => void;
  onDecrease: () => void;
  ariaLabel: string;
}

export const VerticalSlider: React.FC<VerticalSliderProps> = ({ className, label, icon, onIncrease, onDecrease, ariaLabel }) => {
  return (
    <div className={cn("flex flex-col items-center space-y-3 mx-4", className)} role="group" aria-label={ariaLabel}>
      <Button size="icon" onClick={onIncrease} className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 shadow-md" aria-label={`Increase ${ariaLabel}`}>
        <Plus className="h-5 w-5" />
      </Button>
      <div className="relative bg-gray-800 text-white rounded-full w-12 flex flex-col items-center justify-between py-2 text-center" style={{height: '140px'}}>
        <div className='absolute inset-0 flex flex-col items-center justify-center p-1' aria-hidden="true">
            {icon}
            {label && <span className="text-sm font-semibold mt-1">{label}</span>}
        </div>
      </div>
      <Button size="icon" onClick={onDecrease} className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 shadow-md" aria-label={`Decrease ${ariaLabel}`}>
        <Minus className="h-5 w-5" />
      </Button>
    </div>
  );
};

    