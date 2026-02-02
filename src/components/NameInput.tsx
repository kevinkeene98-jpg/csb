'use client';

import { useState } from 'react';

interface NameInputProps {
  onSubmit: (name: string) => void;
}

export function NameInput({ onSubmit }: NameInputProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="fade-in">
      <label className="block mb-2 text-sm uppercase tracking-wider text-receipt-black/60">
        Name for the order
      </label>
      <div className="flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 70))}
          placeholder="Enter name"
          maxLength={70}
          className="flex-1 px-4 py-3 bg-white border border-receipt-gray rounded-none font-mono text-receipt-black placeholder:text-receipt-black/40 focus:outline-none focus:border-receipt-black/40"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="px-6 py-3 bg-receipt-black text-receipt-white font-mono uppercase tracking-wider text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-receipt-black/80 transition-colors"
        >
          Start Order
        </button>
      </div>
    </form>
  );
}
