import { NextResponse } from 'next/server';

export async function GET() {
  // TEMP: Unblock deployment - real bias dashboard coming soon
  return NextResponse.json({ 
    message: "Bias dashboard API - maintenance mode", 
    data: [],
    total: 0,
    status: "ok"
  });
}
