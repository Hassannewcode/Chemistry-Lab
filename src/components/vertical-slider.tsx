import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface VerticalSliderProps {
  className?: string;
  value?: number;
  label?: string;
  icon?: React.ReactNode;
}

export const VerticalSlider: React.FC<VerticalSliderProps> = ({ className, value, label, icon }) => {
  return (
    <div className={cn("flex flex-col items-center space-y-3", className)}>
      <Button size="icon" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 shadow-md">
        <Plus className="h-5 w-5" />
      </Button>
      <div className="relative bg-gray-800 text-white rounded-full w-10 flex flex-col items-center justify-between py-2" style={{height: '140px'}}>
        {label && <span className="text-base font-semibold">{label}</span>}
        {icon && <div className='absolute inset-0 flex items-center justify-center'>{icon}</div>}
        <div className="absolute bottom-2 top-2 left-1/2 -translate-x-1/2 w-1.5 bg-gray-600 rounded-full">
            <div 
              className="absolute bottom-0 w-full bg-gradient-to-t from-blue-400 to-red-500 rounded-full" 
              style={{height: icon ? '50%' : '0%'}}
            ></div>
        </div>
      </div>
      <Button size="icon" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 shadow-md">
        <Minus className="h-5 w-5" />
      </Button>
    </div>
  );
};
