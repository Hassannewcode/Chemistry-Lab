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
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      <Button size="icon" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700">
        <Plus className="h-4 w-4" />
      </Button>
      <div className="relative bg-gray-800 text-white rounded-full w-8 flex flex-col items-center justify-between py-2" style={{height: '100px'}}>
        {label && <span className="text-sm font-semibold">{label}</span>}
        {icon && <div className='absolute inset-0 flex items-center justify-center'>{icon}</div>}
        <div className="absolute bottom-2 top-2 left-1/2 -translate-x-1/2 w-1 bg-gray-600 rounded-full">
            <div 
              className="absolute bottom-0 w-full bg-gradient-to-t from-blue-400 to-red-500 rounded-full" 
              style={{height: icon ? '50%' : '0%'}}
            ></div>
        </div>
      </div>
      <Button size="icon" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700">
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  );
};
