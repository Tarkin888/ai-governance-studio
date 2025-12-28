import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const systemId = searchParams.get('systemId');

    if (systemId) {
      const assessments = await prisma.uKAIRegulationAssessment.findMany({
        where: { system_id: systemId },
        orderBy: { assessment_date: 'desc' },
      });
      return NextResponse.json(assessments);
    }

    const assessments = await prisma.uKAIRegulationAssessment.findMany({
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
    console.error('Error fetching UK AI Regulation assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const assessment = await prisma.uKAIRegulationAssessment.create({
      data: {
        system_id: data.system_id,
        safety_security_robustness: data.safety_security_robustness,
        transparency_explainability: data.transparency_explainability,
        fairness: data.fairness,
        accountability_governance: data.accountability_governance,
        contestability_redress: data.contestability_redress,
        sector_specific_requirements: data.sector_specific_requirements || [],
        overall_compliance_score: data.overall_compliance_score,
        gaps_identified: data.gaps_identified || [],
        assessed_by: data.assessed_by,
        notes: data.notes || null,
        questionnaire_responses: data.questionnaire_responses || null,
      },
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    console.error('Error creating UK AI Regulation assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}
