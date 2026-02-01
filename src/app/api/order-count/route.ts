import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const ORDER_COUNT_KEY = 'corporateslopbowl:order_count';

export async function GET() {
  try {
    const count = await redis.get<number>(ORDER_COUNT_KEY) || 0;
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error getting order count:', error);
    return NextResponse.json({ count: 0 });
  }
}

export async function POST() {
  try {
    const newCount = await redis.incr(ORDER_COUNT_KEY);
    return NextResponse.json({ count: newCount });
  } catch (error) {
    console.error('Error incrementing order count:', error);
    return NextResponse.json({ count: 1 });
  }
}
