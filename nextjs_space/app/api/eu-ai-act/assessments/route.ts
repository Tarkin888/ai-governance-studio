import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { RiskClassification } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const systemId = searchParams.get('systemId');

    if (systemId) {
      // Get all assessments for a specific system
      const assessments = await prisma.eUAIActAssessment.findMany({
        where: { system_id: systemId },
        orderBy: { assessment_date: 'desc' },
      });
      return NextResponse.json(assessments);
    }

    // Get all assessments
    const assessments = await prisma.eUAIActAssessment.findMany({
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
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Create the assessment
    const assessment = await prisma.eUAIActAssessment.create({
      data: {
        system_id: data.system_id,
        risk_tier: data.risk_tier,
        prohibited_trigger: data.prohibited_trigger || null,
        high_risk_categories: data.high_risk_categories || [],
        compliance_requirements: data.compliance_requirements || [],
        conformity_assessment_needed: data.conformity_assessment_needed || false,
        ce_marking_required: data.ce_marking_required || false,
        human_oversight_required: data.human_oversight_required || false,
        transparency_obligations: data.transparency_obligations || [],
        assessed_by: data.assessed_by,
        notes: data.notes || null,
        prohibited_responses: data.prohibited_responses || null,
        high_risk_responses: data.high_risk_responses || null,
        limited_risk_responses: data.limited_risk_responses || null,
      },
    });

    // Update the AI system's risk classification
    await prisma.aISystem.update({
      where: { system_id: data.system_id },
      data: { 
        risk_classification: data.risk_tier,
        modified_by: data.assessed_by,
      },
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}
