import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { CreateAssessmentInput } from '@/lib/types/vendor'
import { calculateOverallRiskScore, determineRiskTier, calculateNextAssessmentDate } from '@/lib/utils/vendor'

// POST /api/vendors/[id]/assessments - Create vendor assessment
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body: CreateAssessmentInput = await request.json()

    // Calculate overall score and determine risk tier
    const overallScore = calculateOverallRiskScore(body as any)
    const riskTier = body.risk_tier || determineRiskTier(overallScore)
    const nextAssessmentDue = calculateNextAssessmentDate(riskTier)

    const assessment = await prisma.vendorAssessment.create({
      data: {
        vendor_id: id,
        assessed_by: body.assessed_by,
        assessment_status: body.assessment_status || 'DRAFT',
        security_score: body.security_score,
        privacy_score: body.privacy_score,
        ai_ethics_score: body.ai_ethics_score,
        reliability_score: body.reliability_score,
        compliance_score: body.compliance_score,
        transparency_score: body.transparency_score,
        overall_score: overallScore,
        risk_tier: riskTier,
        strengths: body.strengths || [],
        weaknesses: body.weaknesses || [],
        red_flags: body.red_flags || [],
        recommendations: body.recommendations || [],
        approval_decision: body.approval_decision,
        approval_conditions: body.approval_conditions,
        questionnaire_responses: body.questionnaire_responses || {},
      },
    })

    // Update vendor's last assessment date and next due date
    await prisma.vendor.update({
      where: { vendor_id: id },
      data: {
        last_assessment_date: new Date(),
        next_assessment_due: nextAssessmentDue,
        current_risk_tier: riskTier,
      },
    })

    return NextResponse.json(assessment, { status: 201 })
  } catch (error) {
    console.error('Error creating assessment:', error)
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    )
  }
}
