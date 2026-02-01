'use client';

export function LoadingState() {
  return (
    <div className="fade-in text-center py-12">
      <div className="text-sm uppercase tracking-wider text-receipt-black/60 mb-4">
        Preparing your order
      </div>
      <div className="text-2xl text-receipt-black loading-dots">
        Analyzing your corporate DNA
      </div>
      <div className="mt-8 text-sm text-receipt-black/40">
        --------------------------------
      </div>
    </div>
  );
}
