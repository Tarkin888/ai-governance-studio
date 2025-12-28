import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const systemId = searchParams.get('systemId');

    if (systemId) {
      const assessments = await prisma.nISTAIRMFAssessment.findMany({
        where: { system_id: systemId },
        orderBy: { assessment_date: 'desc' },
      });
      return NextResponse.json(assessments);
    }

    const assessments = await prisma.nISTAIRMFAssessment.findMany({
      include: {
        aiSystem: {
          select: {
            system_name: true,
            business_owner: true,
          },
        },
      },
      orderBy: { assessment_date: 'desc' },
    });

    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Error fetching NIST AI RMF assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const assessment = await prisma.nISTAIRMFAssessment.create({
      data: {
        system_id: data.system_id,
        govern_score: data.govern_score,
        map_score: data.map_score,
        measure_score: data.measure_score,
        manage_score: data.manage_score,
        trustworthy_characteristics: data.trustworthy_characteristics || null,
        overall_maturity_level: data.overall_maturity_level,
        recommendations: data.recommendations || [],
        assessed_by: data.assessed_by,
        notes: data.notes || null,
        questionnaire_responses: data.questionnaire_responses || null,
      },
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    console.error('Error creating NIST AI RMF assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}
