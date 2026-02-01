'use client';

import Image from 'next/image';
import { Restaurant } from '@/lib/questions';

interface ResultCardProps {
  restaurant: Restaurant;
  roast: string;
  secretWeapon: string;
  name: string;
  onRestart: () => void;
}

const restaurantStyles: Record<Restaurant, string> = {
  Chipotle: 'result-chipotle',
  Sweetgreen: 'result-sweetgreen',
  Cava: 'result-cava',
};

export function ResultCard({
  restaurant,
  roast,
  secretWeapon,
  name,
  onRestart,
}: ResultCardProps) {
  return (
    <div className={`fade-in ${restaurantStyles[restaurant]}`}>
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-bold mb-2 accent`}>{restaurant}</h2>
        {restaurant === 'Sweetgreen' && (
          <div className="mt-4">
            <Image
              src="/sweetgreen-bowl.png"
              alt="Sweetgreen bowl"
              width={600}
              height={400}
              className="w-full rounded"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        )}
        {restaurant === 'Cava' && (
          <div className="mt-4">
            <Image
              src="/cava-bowl.png"
              alt="Cava bowl"
              width={600}
              height={400}
              className="w-full rounded"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        )}
        {restaurant === 'Chipotle' && (
          <div className="mt-4">
            <Image
              src="/chipotle-bowl.png"
              alt="Chipotle bowl"
              width={600}
              height={400}
              className="w-full rounded"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        )}
      </div>

      <div className="border-b border-receipt-gray pb-6 mb-6">
        <p className="text-lg leading-relaxed text-receipt-black">{roast}</p>
      </div>

      <div className="mb-8">
        <div className="text-sm uppercase tracking-wider text-receipt-black/60 mb-2">
          Your secret weapon
        </div>
        <p className="text-receipt-black italic">{secretWeapon}</p>
      </div>

      <div className="text-center text-sm text-receipt-black/40 mb-6">
        --------------------------------
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onRestart}
          className="w-full px-6 py-3 bg-receipt-black text-receipt-white font-mono uppercase tracking-wider text-sm hover:bg-receipt-black/80 transition-colors"
        >
          New Order
        </button>
      </div>
    </div>
  );
}
