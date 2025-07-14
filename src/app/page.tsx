'use client';

import { Beaker, Plus, Minus, Thermometer, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BeakerIcon } from '@/components/beaker-icon';
import { VerticalSlider } from '@/components/vertical-slider';

export default function Home() {
  return (
    <div className="bg-[#f0f2f5] min-h-screen flex flex-col items-center justify-center p-4 font-sans text-[#3D3D3D]">
      <div className="text-center mb-8">
        <h1 className="text-7xl font-bold text-[#E91E63]">Simulate</h1>
        <p className="text-4xl font-semibold text-gray-600">
          2000+ reactions
        </p>
      </div>

      <div className="relative w-full max-w-sm mx-auto bg-white rounded-[40px] shadow-2xl p-4 border-4 border-gray-800">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-800 rounded-b-lg"></div>
        <div className="mt-8 space-y-4">
          <div className="flex justify-center">
            <div className="bg-gray-200 p-1 rounded-full flex gap-1">
              <Button
                variant="outline"
                className="rounded-full bg-white text-gray-500 border-gray-300"
              >
                CONTENTS
              </Button>
              <Button className="rounded-full bg-gray-800 text-white hover:bg-gray-700">
                REACTIONS
              </Button>
            </div>
          </div>

          <div className="bg-gray-800 text-white p-4 rounded-xl text-center">
            <p>Cu(CH₃COO)₂ + 2LiOH</p>
            <ChevronsRight className="mx-auto my-1 h-4 w-4" />
            <p>Cu(OH)₂ + 2LiCH₃COO</p>
          </div>

          <div className="bg-[#E91E63] text-white p-4 rounded-2xl text-center">
            <p className="text-5xl font-bold">2000+</p>
            <p className="text-2xl">experiments</p>
          </div>

          <div className="relative h-64 flex items-center justify-center">
            <VerticalSlider
              className="absolute left-0"
              value={0.5}
              label="0.5"
            />
            <VerticalSlider
              className="absolute left-12"
              icon={<Thermometer className="h-4 w-4" />}
            />

            <BeakerIcon className="h-56 w-56 text-blue-400" />
            
            <div className="absolute right-0 flex flex-col items-center">
                <div className="w-2 h-16 bg-gray-300 rounded-full flex items-end">
                    <div className="w-full h-1/2 bg-[#E91E63] rounded-full"></div>
                </div>
            </div>
             <div className="absolute bottom-2 right-4 bg-gray-800 p-2 rounded-lg">
                <Beaker className="h-6 w-6 text-[#E91E63]" />
            </div>
          </div>

          <div className="bg-gray-800 p-2 rounded-full">
            <div className="flex justify-around">
              <Button variant="ghost" className="text-white rounded-full">
                WATER
              </Button>
              <Button
                variant="ghost"
                className="bg-orange-500 text-white rounded-full"
              >
                ACIDS
              </Button>
              <Button variant="ghost" className="text-white rounded-full">
                BASES
              </Button>
              <Button variant="ghost" className="text-white rounded-full">
                SALTS
              </Button>
              <Button variant="ghost" className="text-white rounded-full">
                NEUTR
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
