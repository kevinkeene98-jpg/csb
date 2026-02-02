'use client';

import Image from 'next/image';
import { Restaurant } from '@/lib/questions';

interface ResultCardProps {
  restaurant: Restaurant;
  roast: string;
  secretWeapon: string;
  blurb: string;
  scores: Record<Restaurant, number>;
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
  blurb,
  scores,
  name,
  onRestart,
}: ResultCardProps) {
  // Calculate percentages and sort by score
  const totalScore = scores.Chipotle + scores.Sweetgreen + scores.Cava;
  const percentages = (Object.entries(scores) as [Restaurant, number][])
    .map(([name, score]) => ({
      name,
      percentage: Math.round((score / totalScore) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // If there's a tie with the winner, give winner +1% and take 1% from second
  if (percentages[0].name !== restaurant) {
    const winnerIndex = percentages.findIndex(p => p.name === restaurant);
    if (winnerIndex > 0 && percentages[winnerIndex].percentage === percentages[0].percentage) {
      percentages[winnerIndex].percentage += 1;
      percentages[0].percentage -= 1;
      percentages.sort((a, b) => b.percentage - a.percentage);
    }
  } else if (percentages.length > 1 && percentages[0].percentage === percentages[1].percentage) {
    percentages[0].percentage += 1;
    percentages[1].percentage -= 1;
  }
  return (
    <div className={`fade-in ${restaurantStyles[restaurant]}`}>
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-bold mb-1 accent`}>{restaurant}</h2>
        <p className="text-sm text-receipt-black/60 italic mb-2">{blurb}</p>
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

      <div className="mb-6">
        <div className="text-sm uppercase tracking-wider text-receipt-black/60 mb-3">
          Compatibility
        </div>
        <div className="space-y-2">
          {percentages.map(({ name, percentage }) => (
            <div key={name} className="flex justify-between items-center">
              <span className="text-receipt-black">{name}</span>
              <span className="text-receipt-black/60">{percentage}%</span>
            </div>
          ))}
        </div>
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
