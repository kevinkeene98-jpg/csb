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
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // Check if Web Share API with files is supported
    const checkShareSupport = async () => {
      if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function') {
        // Create a test file to check if file sharing is supported
        const testFile = new File(['test'], 'test.png', { type: 'image/png' });
        try {
          const supported = navigator.canShare({ files: [testFile] });
          setCanShare(supported);
        } catch {
          setCanShare(false);
        }
      }
    };
    checkShareSupport();
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

  const handleShare = async () => {
    const blob = await generateImage();
    if (!blob) return;

    const file = new File([blob], `corporateslopbowl-${restaurant.toLowerCase()}.png`, { type: 'image/png' });

    if (canShare) {
      // Mobile: Use Web Share API
      try {
        await navigator.share({
          files: [file],
          title: `I'm ${restaurant}!`,
          text: `I'm ${restaurant} on CorporateSlopBowl.com`,
        });
      } catch (error) {
        // User cancelled or error - fall back to download
        if ((error as Error).name !== 'AbortError') {
          downloadImage(blob);
        }
      }
    } else {
      // Desktop: Download the image
      downloadImage(blob);
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
          onClick={handleShare}
          className="w-full px-6 py-3 bg-receipt-black text-receipt-white font-mono uppercase tracking-wider text-sm hover:bg-receipt-black/80 transition-colors"
        >
          {canShare ? 'Share' : 'Save Image'}
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
