import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const systemId = searchParams.get('systemId');

    if (systemId) {
      const analyses = await prisma.crossFrameworkAnalysis.findMany({
        where: { system_id: systemId },
        orderBy: { analysis_date: 'desc' },
      });
      return NextResponse.json(analyses);
    }

    const analyses = await prisma.crossFrameworkAnalysis.findMany({
      include: {
        aiSystem: {
          select: {
            system_name: true,
            business_owner: true,
          },
        },
      },
      orderBy: { analysis_date: 'desc' },
    });

    return NextResponse.json(analyses);
  } catch (error) {
    console.error('Error fetching cross-framework analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analyses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const analysis = await prisma.crossFrameworkAnalysis.create({
      data: {
        system_id: data.system_id,
        frameworks_assessed: data.frameworks_assessed,
        coverage_gaps: data.coverage_gaps || [],
        overlapping_requirements: data.overlapping_requirements || [],
        priority_actions: data.priority_actions || [],
        compliance_confidence_level: data.compliance_confidence_level,
        next_review_date: data.next_review_date || null,
        assessed_by: data.assessed_by,
        notes: data.notes || null,
      },
    });

    return NextResponse.json(analysis, { status: 201 });
  } catch (error) {
    console.error('Error creating cross-framework analysis:', error);
    return NextResponse.json(
      { error: 'Failed to create analysis' },
      { status: 500 }
    );
  }
}
