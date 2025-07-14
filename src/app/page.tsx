'use client';

import { Beaker, Plus, Minus, Thermometer, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BeakerIcon } from '@/components/beaker-icon';
import { VerticalSlider } from '@/components/vertical-slider';

export default function Home() {
  return (
    <div className="bg-[#f0f2f5] min-h-screen flex items-center justify-center p-8 font-sans text-[#3D3D3D]">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column: Information */}
        <div className="flex flex-col justify-center">
          <div className="text-left mb-8">
            <h1 className="text-8xl font-bold text-[#E91E63]">Simulate</h1>
            <p className="text-5xl font-semibold text-gray-600">
              2000+ reactions
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-md">
                <div className="bg-gray-200 p-1 rounded-full flex gap-1 max-w-xs mx-auto">
                <Button
                    variant="outline"
                    className="flex-1 rounded-full bg-white text-gray-500 border-gray-300"
                >
                    CONTENTS
                </Button>
                <Button className="flex-1 rounded-full bg-gray-800 text-white hover:bg-gray-700">
                    REACTIONS
                </Button>
                </div>
            </div>

            <div className="bg-gray-800 text-white p-6 rounded-2xl text-center shadow-lg">
              <p className="text-lg">Cu(CH₃COO)₂ + 2LiOH</p>
              <ChevronsRight className="mx-auto my-2 h-5 w-5" />
              <p className="text-lg">Cu(OH)₂ + 2LiCH₃COO</p>
            </div>

            <div className="bg-[#E91E63] text-white p-6 rounded-2xl text-center shadow-lg">
              <p className="text-6xl font-bold">2000+</p>
              <p className="text-3xl">experiments</p>
            </div>
          </div>
        </div>

        {/* Right Column: Simulation */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center justify-between border-2 border-gray-200">
          <div className="w-full bg-gray-800 p-2 rounded-full mb-6">
              <div className="flex justify-around">
                  <Button variant="ghost" className="text-white rounded-full flex-1">
                  WATER
                  </Button>
                  <Button
                  variant="ghost"
                  className="bg-orange-500 text-white rounded-full flex-1"
                  >
                  ACIDS
                  </Button>
                  <Button variant="ghost" className="text-white rounded-full flex-1">
                  BASES
                  </Button>
                  <Button variant="ghost" className="text-white rounded-full flex-1">
                  SALTS
                  </Button>
                  <Button variant="ghost" className="text-white rounded-full flex-1">
                  NEUTR
                  </Button>
              </div>
          </div>

          <div className="relative w-full flex-1 flex items-center justify-center">
            <VerticalSlider
              className="absolute left-0"
              value={0.5}
              label="0.5"
            />
            <VerticalSlider
              className="absolute left-16"
              icon={<Thermometer className="h-5 w-5" />}
            />

            <BeakerIcon className="h-72 w-72 text-blue-400" />
            
            <div className="absolute right-0 flex flex-col items-center">
                <div className="w-2.5 h-20 bg-gray-300 rounded-full flex items-end">
                    <div className="w-full h-1/2 bg-[#E91E63] rounded-full"></div>
                </div>
            </div>
             <div className="absolute bottom-4 right-4 bg-gray-800 p-3 rounded-xl shadow-lg">
                <Beaker className="h-8 w-8 text-[#E91E63]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
