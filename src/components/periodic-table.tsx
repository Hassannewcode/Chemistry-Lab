
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import type { Chemical } from '@/lib/chemicals';

interface PeriodicTableProps {
  onElementClick: (elementName: string) => void;
  beakerContents: Chemical[];
}

const elements = [
  { number: 1, symbol: 'H', name: 'Hydrogen', group: 1, period: 1, category: 'diatomic-nonmetal' },
  { number: 2, symbol: 'He', name: 'Helium', group: 18, period: 1, category: 'noble-gas' },
  { number: 3, symbol: 'Li', name: 'Lithium', group: 1, period: 2, category: 'alkali-metal' },
  { number: 4, symbol: 'Be', name: 'Beryllium', group: 2, period: 2, category: 'alkaline-earth-metal' },
  { number: 5, symbol: 'B', name: 'Boron', group: 13, period: 2, category: 'metalloid' },
  { number: 6, symbol: 'C', name: 'Carbon', group: 14, period: 2, category: 'polyatomic-nonmetal' },
  { number: 7, symbol: 'N', name: 'Nitrogen', group: 15, period: 2, category: 'diatomic-nonmetal' },
  { number: 8, symbol: 'O', name: 'Oxygen', group: 16, period: 2, category: 'diatomic-nonmetal' },
  { number: 9, symbol: 'F', name: 'Fluorine', group: 17, period: 2, category: 'diatomic-nonmetal' },
  { number: 10, symbol: 'Ne', name: 'Neon', group: 18, period: 2, category: 'noble-gas' },
  { number: 11, symbol: 'Na', name: 'Sodium', group: 1, period: 3, category: 'alkali-metal' },
  { number: 12, symbol: 'Mg', name: 'Magnesium', group: 2, period: 3, category: 'alkaline-earth-metal' },
  { number: 13, symbol: 'Al', name: 'Aluminum', group: 13, period: 3, category: 'post-transition-metal' },
  { number: 14, symbol: 'Si', name: 'Silicon', group: 14, period: 3, category: 'metalloid' },
  { number: 15, symbol: 'P', name: 'Phosphorus', group: 15, period: 3, category: 'polyatomic-nonmetal' },
  { number: 16, symbol: 'S', name: 'Sulfur', group: 16, period: 3, category: 'polyatomic-nonmetal' },
  { number: 17, symbol: 'Cl', name: 'Chlorine', group: 17, period: 3, category: 'diatomic-nonmetal' },
  { number: 18, symbol: 'Ar', name: 'Argon', group: 18, period: 3, category: 'noble-gas' },
  { number: 19, symbol: 'K', name: 'Potassium', group: 1, period: 4, category: 'alkali-metal' },
  { number: 20, symbol: 'Ca', name: 'Calcium', group: 2, period: 4, category: 'alkaline-earth-metal' },
  { number: 21, symbol: 'Sc', name: 'Scandium', group: 3, period: 4, category: 'transition-metal' },
  { number: 22, symbol: 'Ti', name: 'Titanium', group: 4, period: 4, category: 'transition-metal' },
  { number: 23, symbol: 'V', name: 'Vanadium', group: 5, period: 4, category: 'transition-metal' },
  { number: 24, symbol: 'Cr', name: 'Chromium', group: 6, period: 4, category: 'transition-metal' },
  { number: 25, symbol: 'Mn', name: 'Manganese', group: 7, period: 4, category: 'transition-metal' },
  { number: 26, symbol: 'Fe', name: 'Iron', group: 8, period: 4, category: 'transition-metal' },
  { number: 27, symbol: 'Co', name: 'Cobalt', group: 9, period: 4, category: 'transition-metal' },
  { number: 28, symbol: 'Ni', name: 'Nickel', group: 10, period: 4, category: 'transition-metal' },
  { number: 29, symbol: 'Cu', name: 'Copper', group: 11, period: 4, category: 'transition-metal' },
  { number: 30, symbol: 'Zn', name: 'Zinc', group: 12, period: 4, category: 'transition-metal' },
  { number: 31, symbol: 'Ga', name: 'Gallium', group: 13, period: 4, category: 'post-transition-metal' },
  { number: 32, symbol: 'Ge', name: 'Germanium', group: 14, period: 4, category: 'metalloid' },
  { number: 33, symbol: 'As', name: 'Arsenic', group: 15, period: 4, category: 'metalloid' },
  { number: 34, symbol: 'Se', name: 'Selenium', group: 16, period: 4, category: 'polyatomic-nonmetal' },
  { number: 35, symbol: 'Br', name: 'Bromine', group: 17, period: 4, category: 'diatomic-nonmetal' },
  { number: 36, symbol: 'Kr', name: 'Krypton', group: 18, period: 4, category: 'noble-gas' },
  { number: 37, symbol: 'Rb', name: 'Rubidium', group: 1, period: 5, category: 'alkali-metal' },
  { number: 38, symbol: 'Sr', name: 'Strontium', group: 2, period: 5, category: 'alkaline-earth-metal' },
  { number: 39, symbol: 'Y', name: 'Yttrium', group: 3, period: 5, category: 'transition-metal' },
  { number: 40, symbol: 'Zr', name: 'Zirconium', group: 4, period: 5, category: 'transition-metal' },
  { number: 41, symbol: 'Nb', name: 'Niobium', group: 5, period: 5, category: 'transition-metal' },
  { number: 42, symbol: 'Mo', name: 'Molybdenum', group: 6, period: 5, category: 'transition-metal' },
  { number: 43, symbol: 'Tc', name: 'Technetium', group: 7, period: 5, category: 'transition-metal' },
  { number: 44, symbol: 'Ru', name: 'Ruthenium', group: 8, period: 5, category: 'transition-metal' },
  { number: 45, symbol: 'Rh', name: 'Rhodium', group: 9, period: 5, category: 'transition-metal' },
  { number: 46, symbol: 'Pd', name: 'Palladium', group: 10, period: 5, category: 'transition-metal' },
  { number: 47, symbol: 'Ag', name: 'Silver', group: 11, period: 5, category: 'transition-metal' },
  { number: 48, symbol: 'Cd', name: 'Cadmium', group: 12, period: 5, category: 'transition-metal' },
  { number: 49, symbol: 'In', name: 'Indium', group: 13, period: 5, category: 'post-transition-metal' },
  { number: 50, symbol: 'Sn', name: 'Tin', group: 14, period: 5, category: 'post-transition-metal' },
  { number: 51, symbol: 'Sb', name: 'Antimony', group: 15, period: 5, category: 'metalloid' },
  { number: 52, symbol: 'Te', name: 'Tellurium', group: 16, period: 5, category: 'metalloid' },
  { number: 53, symbol: 'I', name: 'Iodine', group: 17, period: 5, category: 'diatomic-nonmetal' },
  { number: 54, symbol: 'Xe', name: 'Xenon', group: 18, period: 5, category: 'noble-gas' },
  { number: 55, symbol: 'Cs', name: 'Caesium', group: 1, period: 6, category: 'alkali-metal' },
  { number: 56, symbol: 'Ba', name: 'Barium', group: 2, period: 6, category: 'alkaline-earth-metal' },
  { number: 57, symbol: 'La', name: 'Lanthanum', group: 3, period: 9, category: 'lanthanide' },
  { number: 72, symbol: 'Hf', name: 'Hafnium', group: 4, period: 6, category: 'transition-metal' },
  { number: 73, symbol: 'Ta', name: 'Tantalum', group: 5, period: 6, category: 'transition-metal' },
  { number: 74, symbol: 'W', name: 'Tungsten', group: 6, period: 6, category: 'transition-metal' },
  { number: 75, symbol: 'Re', name: 'Rhenium', group: 7, period: 6, category: 'transition-metal' },
  { number: 76, symbol: 'Os', name: 'Osmium', group: 8, period: 6, category: 'transition-metal' },
  { number: 77, symbol: 'Ir', name: 'Iridium', group: 9, period: 6, category: 'transition-metal' },
  { number: 78, symbol: 'Pt', name: 'Platinum', group: 10, period: 6, category: 'transition-metal' },
  { number: 79, symbol: 'Au', name: 'Gold', group: 11, period: 6, category: 'transition-metal' },
  { number: 80, symbol: 'Hg', name: 'Mercury', group: 12, period: 6, category: 'transition-metal' },
  { number: 81, symbol: 'Tl', name: 'Thallium', group: 13, period: 6, category: 'post-transition-metal' },
  { number: 82, symbol: 'Pb', name: 'Lead', group: 14, period: 6, category: 'post-transition-metal' },
  { number: 83, symbol: 'Bi', name: 'Bismuth', group: 15, period: 6, category: 'post-transition-metal' },
  { number: 84, symbol: 'Po', name: 'Polonium', group: 16, period: 6, category: 'post-transition-metal' },
  { number: 85, symbol: 'At', name: 'Astatine', group: 17, period: 6, category: 'metalloid' },
  { number: 86, symbol: 'Rn', name: 'Radon', group: 18, period: 6, category: 'noble-gas' },
  { number: 87, symbol: 'Fr', name: 'Francium', group: 1, period: 7, category: 'alkali-metal' },
  { number: 88, symbol: 'Ra', name: 'Radium', group: 2, period: 7, category: 'alkaline-earth-metal' },
  { number: 89, symbol: 'Ac', name: 'Actinium', group: 3, period: 10, category: 'actinide' },
  { number: 104, symbol: 'Rf', name: 'Rutherfordium', group: 4, period: 7, category: 'transition-metal' },
  { number: 105, symbol: 'Db', name: 'Dubnium', group: 5, period: 7, category: 'transition-metal' },
  { number: 106, symbol: 'Sg', name: 'Seaborgium', group: 6, period: 7, category: 'transition-metal' },
  { number: 107, symbol: 'Bh', name: 'Bohrium', group: 7, period: 7, category: 'transition-metal' },
  { number: 108, symbol: 'Hs', name: 'Hassium', group: 8, period: 7, category: 'transition-metal' },
  { number: 109, symbol: 'Mt', name: 'Meitnerium', group: 9, period: 7, category: 'transition-metal' },
  { number: 110, symbol: 'Ds', name: 'Darmstadtium', group: 10, period: 7, category: 'transition-metal' },
  { number: 111, symbol: 'Rg', name: 'Roentgenium', group: 11, period: 7, category: 'transition-metal' },
  { number: 112, symbol: 'Cn', name: 'Copernicium', group: 12, period: 7, category: 'transition-metal' },
  { number: 113, symbol: 'Nh', name: 'Nihonium', group: 13, period: 7, category: 'post-transition-metal' },
  { number: 114, symbol: 'Fl', name: 'Flerovium', group: 14, period: 7, category: 'post-transition-metal' },
  { number: 115, symbol: 'Mc', name: 'Moscovium', group: 15, period: 7, category: 'post-transition-metal' },
  { number: 116, symbol: 'Lv', name: 'Livermorium', group: 16, period: 7, category: 'post-transition-metal' },
  { number: 117, symbol: 'Ts', name: 'Tennessine', group: 17, period: 7, category: 'metalloid' },
  { number: 118, symbol: 'Og', name: 'Oganesson', group: 18, period: 7, category: 'noble-gas' },
  // Lanthanides
  { number: 58, symbol: 'Ce', name: 'Cerium', group: 4, period: 9, category: 'lanthanide' },
  { number: 59, symbol: 'Pr', name: 'Praseodymium', group: 5, period: 9, category: 'lanthanide' },
  { number: 60, symbol: 'Nd', name: 'Neodymium', group: 6, period: 9, category: 'lanthanide' },
  { number: 61, symbol: 'Pm', name: 'Promethium', group: 7, period: 9, category: 'lanthanide' },
  { number: 62, symbol: 'Sm', name: 'Samarium', group: 8, period: 9, category: 'lanthanide' },
  { number: 63, symbol: 'Eu', name: 'Europium', group: 9, period: 9, category: 'lanthanide' },
  { number: 64, symbol: 'Gd', name: 'Gadolinium', group: 10, period: 9, category: 'lanthanide' },
  { number: 65, symbol: 'Tb', name: 'Terbium', group: 11, period: 9, category: 'lanthanide' },
  { number: 66, symbol: 'Dy', name: 'Dysprosium', group: 12, period: 9, category: 'lanthanide' },
  { number: 67, symbol: 'Ho', name: 'Holmium', group: 13, period: 9, category: 'lanthanide' },
  { number: 68, symbol: 'Er', name: 'Erbium', group: 14, period: 9, category: 'lanthanide' },
  { number: 69, symbol: 'Tm', name: 'Thulium', group: 15, period: 9, category: 'lanthanide' },
  { number: 70, symbol: 'Yb', name: 'Ytterbium', group: 16, period: 9, category: 'lanthanide' },
  { number: 71, symbol: 'Lu', name: 'Lutetium', group: 17, period: 9, category: 'lanthanide' },
  // Actinides
  { number: 90, symbol: 'Th', name: 'Thorium', group: 4, period: 10, category: 'actinide' },
  { number: 91, symbol: 'Pa', name: 'Protactinium', group: 5, period: 10, category: 'actinide' },
  { number: 92, symbol: 'U', name: 'Uranium', group: 6, period: 10, category: 'actinide' },
  { number: 93, symbol: 'Np', name: 'Neptunium', group: 7, period: 10, category: 'actinide' },
  { number: 94, symbol: 'Pu', name: 'Plutonium', group: 8, period: 10, category: 'actinide' },
  { number: 95, symbol: 'Am', name: 'Americium', group: 9, period: 10, category: 'actinide' },
  { number: 96, symbol: 'Cm', name: 'Curium', group: 10, period: 10, category: 'actinide' },
  { number: 97, symbol: 'Bk', name: 'Berkelium', group: 11, period: 10, category: 'actinide' },
  { number: 98, symbol: 'Cf', name: 'Californium', group: 12, period: 10, category: 'actinide' },
  { number: 99, symbol: 'Es', name: 'Einsteinium', group: 13, period: 10, category: 'actinide' },
  { number: 100, symbol: 'Fm', name: 'Fermium', group: 14, period: 10, category: 'actinide' },
  { number: 101, symbol: 'Md', name: 'Mendelevium', group: 15, period: 10, category: 'actinide' },
  { number: 102, symbol: 'No', name: 'Nobelium', group: 16, period: 10, category: 'actinide' },
  { number: 103, symbol: 'Lr', name: 'Lawrencium', group: 17, period: 10, category: 'actinide' },
];

const categoryColors: Record<string, string> = {
    'diatomic-nonmetal': 'bg-green-200 hover:bg-green-300',
    'polyatomic-nonmetal': 'bg-green-200 hover:bg-green-300',
    'noble-gas': 'bg-purple-200 hover:bg-purple-300',
    'alkali-metal': 'bg-red-200 hover:bg-red-300',
    'alkaline-earth-metal': 'bg-orange-200 hover:bg-orange-300',
    'metalloid': 'bg-yellow-200 hover:bg-yellow-300',
    'post-transition-metal': 'bg-blue-200 hover:bg-blue-300',
    'transition-metal': 'bg-blue-300 hover:bg-blue-400',
    'lanthanide': 'bg-indigo-200 hover:bg-indigo-300',
    'actinide': 'bg-pink-200 hover:bg-pink-300',
};


export const PeriodicTable: React.FC<PeriodicTableProps> = ({ onElementClick, beakerContents }) => {
    return (
        <TooltipProvider>
            <div className="grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1 text-xs">
                {elements.map((el) => {
                    const isDisabled = beakerContents.length >= 12 || beakerContents.some(c => c.formula === el.symbol);
                    return (
                    <Tooltip key={el.number}>
                        <TooltipTrigger asChild>
                        <div
                            style={{ gridColumn: el.group, gridRow: el.period }}
                            className="flex items-center justify-center"
                        >
                            <Button
                                variant="outline"
                                onClick={() => onElementClick(el.name)}
                                disabled={isDisabled}
                                className={cn(
                                    "w-12 h-12 flex flex-col p-1 leading-none transition-all duration-150 transform hover:scale-110",
                                    categoryColors[el.category],
                                    isDisabled && "opacity-50 cursor-not-allowed hover:scale-100"
                                )}
                                aria-label={isDisabled ? `${el.name} (disabled)` : `Add ${el.name}`}
                            >
                                <span className="text-gray-600 text-[10px]">{el.number}</span>
                                <span className="font-bold text-base">{el.symbol}</span>
                            </Button>
                        </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{el.name}</p>
                        </TooltipContent>
                    </Tooltip>
                )})}
                 {/* Placeholder for Lanthanide Series Link */}
                 <div style={{ gridColumn: 3, gridRow: 6 }} className="flex items-center justify-center text-center text-xs font-semibold p-1 bg-indigo-100 rounded">57-71</div>
                
                 {/* Placeholder for Actinide Series Link */}
                 <div style={{ gridColumn: 3, gridRow: 7 }} className="flex items-center justify-center text-center text-xs font-semibold p-1 bg-pink-100 rounded">89-103</div>

                {/* Lanthanide and Actinide Series Title */}
                <div style={{ gridColumn: '1 / span 2', gridRow: 9 }} className="flex items-center justify-end pr-2 text-sm font-semibold text-gray-600" aria-hidden="true">Lanthanides</div>
                <div style={{ gridColumn: '1 / span 2', gridRow: 10 }} className="flex items-center justify-end pr-2 text-sm font-semibold text-gray-600" aria-hidden="true">Actinides</div>
            </div>
        </TooltipProvider>
    );
};

    