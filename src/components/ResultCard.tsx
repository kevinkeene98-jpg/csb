'use client';

import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Restaurant } from '@/lib/questions';

interface ResultCardProps {
  restaurant: Restaurant;
  roast: string;
  secretWeapon: string;
  blurb: string;
  scores: Record<Restaurant, number>;
  name: string;
  orderNumber: number;
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
  orderNumber,
  onRestart,
}: ResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /android|iphone|ipad|ipod|webos|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
    };
    checkMobile();
  }, []);

  const generateImage = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#faf9f7',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          const header = clonedDoc.getElementById('download-header');
          if (header) {
            header.classList.remove('hidden');
          }
          const images = clonedDoc.querySelectorAll('img');
          images.forEach((img) => {
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.maxWidth = '100%';
          });
        },
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      });
    } catch (error) {
      console.error('Error generating image:', error);
      return null;
    }
  };

  const handleSaveImage = async () => {
    const blob = await generateImage();
    if (!blob) return;
    downloadImage(blob);
  };

  const handleShareMobile = async () => {
    const blob = await generateImage();
    if (!blob) return;

    try {
      const file = new File([blob], `corporateslopbowl-${restaurant.toLowerCase()}.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        // Fallback to download if share not supported
        downloadImage(blob);
      }
    } catch (error) {
      // User cancelled share - that's fine, don't download
      if ((error as Error).name !== 'AbortError') {
        downloadImage(blob);
      }
    }
  };

  const downloadImage = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `corporateslopbowl-${restaurant.toLowerCase()}.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Calculate percentages using largest remainder method to ensure sum = 100%
  const totalScore = scores.Chipotle + scores.Sweetgreen + scores.Cava;
  const rawPercentages = (Object.entries(scores) as [Restaurant, number][])
    .map(([name, score]) => {
      const exact = (score / totalScore) * 100;
      return {
        name,
        exact,
        floored: Math.floor(exact),
        remainder: exact - Math.floor(exact),
      };
    });

  // Distribute the remaining percentage points to entries with largest remainders
  let remaining = 100 - rawPercentages.reduce((sum, p) => sum + p.floored, 0);
  const sortedByRemainder = [...rawPercentages].sort((a, b) => b.remainder - a.remainder);
  
  for (const entry of sortedByRemainder) {
    if (remaining <= 0) break;
    entry.floored += 1;
    remaining -= 1;
  }

  // Convert to final format and sort by percentage
  const percentages = rawPercentages
    .map(({ name, floored }) => ({ name, percentage: floored }))
    .sort((a, b) => b.percentage - a.percentage);

  // Handle tiebreaker: if winner isn't first due to tie, swap percentages to put winner first
  const winnerIndex = percentages.findIndex(p => p.name === restaurant);
  if (winnerIndex > 0 && percentages[winnerIndex].percentage === percentages[0].percentage) {
    // Swap the winner to first position by giving them +1 and taking from current first
    percentages[winnerIndex].percentage += 1;
    percentages[0].percentage -= 1;
    percentages.sort((a, b) => b.percentage - a.percentage);
  }

  return (
    <div className={`fade-in ${restaurantStyles[restaurant]}`}>
      {/* Shareable content area */}
      <div ref={cardRef} className="bg-receipt-white p-6 -m-6 mb-0">
        {/* Hidden header for image download only */}
        <div id="download-header" className="hidden">
          <div className="text-center text-lg font-bold text-receipt-black/80 mb-4">
            CorporateSlopBowl.com
          </div>
          <div className="flex justify-between items-start text-sm text-receipt-black/60 border-b border-receipt-gray pb-4 mb-6">
            <div>
              <div className="uppercase tracking-wider text-xs">Order #</div>
              <div className="font-bold text-lg text-receipt-black">
                {String(orderNumber).padStart(5, '0')}
              </div>
            </div>
            <div className="text-right">
              <div className="uppercase tracking-wider text-xs">Name</div>
              <div className="font-bold text-lg text-receipt-black">{name}</div>
            </div>
          </div>
        </div>
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold mb-1 accent`}>{restaurant}</h2>
          <p className="text-sm text-receipt-black/60 italic mb-2">{blurb}</p>
          {restaurant === 'Sweetgreen' && (
            <div className="mt-4">
              <img
                src="/sweetgreen-bowl.png"
                alt="Sweetgreen bowl"
                className="w-full rounded"
              />
            </div>
          )}
          {restaurant === 'Cava' && (
            <div className="mt-4">
              <img
                src="/cava-bowl.png"
                alt="Cava bowl"
                className="w-full rounded"
              />
            </div>
          )}
          {restaurant === 'Chipotle' && (
            <div className="mt-4">
              <img
                src="/chipotle-bowl.png"
                alt="Chipotle bowl"
                className="w-full rounded"
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

        <div>
          <div className="text-sm uppercase tracking-wider text-receipt-black/60 mb-2">
            Your secret weapon
          </div>
          <p className="text-receipt-black italic">{secretWeapon}</p>
        </div>
      </div>
      {/* End shareable content */}

      <div className="text-center text-sm text-receipt-black/40 py-3">
        --------------------------------
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={isMobile ? handleShareMobile : handleSaveImage}
          className="w-full px-6 py-3 bg-receipt-black text-receipt-white font-mono uppercase tracking-wider text-sm hover:bg-receipt-black/80 transition-colors"
        >
          Save Image
        </button>
        <button
          onClick={onRestart}
          className="w-full px-6 py-3 border border-receipt-gray font-mono uppercase tracking-wider text-sm hover:bg-receipt-gray/30 transition-colors"
        >
          New Order
        </button>
      </div>
    </div>
  );
}
