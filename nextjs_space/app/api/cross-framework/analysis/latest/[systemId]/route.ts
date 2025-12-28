import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { systemId: string } }
) {
  try {
    const analysis = await prisma.crossFrameworkAnalysis.findFirst({
      where: { system_id: params.systemId },
      orderBy: { analysis_date: 'desc' },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'No analysis found for this system' },
        { status: 404 }
      );
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error fetching latest cross-framework analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest analysis' },
      { status: 500 }
    );
  }
}
