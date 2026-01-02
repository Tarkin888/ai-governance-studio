import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: "Bias dashboard API - maintenance mode", 
    data: [],
    total: 0 
  });
}
