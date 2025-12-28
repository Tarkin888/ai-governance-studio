import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { systemId: string } }
) {
  try {
    const assessment = await prisma.eUAIActAssessment.findFirst({
      where: { system_id: params.systemId },
      orderBy: { assessment_date: 'desc' },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'No assessment found for this system' },
        { status: 404 }
      );
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error fetching latest assessment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest assessment' },
      { status: 500 }
    );
  }
}
