'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const logos = [
  { src: '/logos/chipotle.svg', alt: 'Chipotle' },
  { src: '/logos/sweetgreen.png', alt: 'Sweetgreen' },
  { src: '/logos/cava.svg', alt: 'Cava' },
];

export function LogoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % logos.length);
      setKey((prev) => prev + 1); // Force re-mount to trigger animation
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-12 overflow-hidden my-4">
      <div
        key={key}
        className="absolute inset-0 flex items-center justify-center animate-slide-in"
      >
        <Image
          src={logos[currentIndex].src}
          alt={logos[currentIndex].alt}
          width={140}
          height={40}
          className="object-contain"
          style={{ width: 'auto', height: 'auto', maxHeight: '40px', maxWidth: '140px' }}
        />
      </div>
    </div>
  );
}
