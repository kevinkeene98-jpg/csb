'use client';

interface OrderHeaderProps {
  orderNumber: number;
  name?: string;
}

export function OrderHeader({ orderNumber, name }: OrderHeaderProps) {
  return (
    <div className="border-b border-receipt-gray pb-4 mb-6">
      <div className="flex justify-between items-start text-sm text-receipt-black/60">
        <div>
          <div className="uppercase tracking-wider text-xs">Order #</div>
          <div className="font-bold text-lg text-receipt-black">
            {String(orderNumber).padStart(5, '0')}
          </div>
        </div>
        {name && (
          <div className="text-right">
            <div className="uppercase tracking-wider text-xs">Name</div>
            <div className="font-bold text-lg text-receipt-black">{name}</div>
          </div>
        )}
      </div>
    </div>
  );
}
