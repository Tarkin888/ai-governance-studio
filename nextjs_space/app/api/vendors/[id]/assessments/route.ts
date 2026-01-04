import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { 
  VendorAssessmentFormData,
  calculateCategoryScore,
  calculateOverallRiskScore,
  getRiskTierFromScore,
  RISK_WEIGHTS
} from '@/types/vendor';

export const dynamic = 'force-dynamic';

// GET /api/vendors/[id]/assessments - Get all assessments for a vendor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;

    const assessments = await prisma.vendorRiskAssessment.findMany({
      where: { vendorId: id },
      orderBy: { assessmentDate: 'desc' },
    });

    return NextResponse.json(assessments);
  } catch (error: any) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/vendors/[id]/assessments - Create new assessment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    const data: VendorAssessmentFormData = await request.json();

    // Verify vendor exists
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Calculate category scores
    const securityScore = calculateCategoryScore([
      data.dataProtection,
      data.accessControls,
      data.incidentResponse,
      data.securityTesting,
      data.encryptionPractices,
    ]);

    const complianceScore = calculateCategoryScore([
      data.regulatoryCompliance,
      data.certificationStatus,
      data.auditHistory,
      data.dataPrivacy,
    ]);

    const operationalScore = calculateCategoryScore([
      data.serviceReliability,
      data.supportQuality,
      data.changeManagement,
      data.documentationQuality,
    ]);

    const financialScore = calculateCategoryScore([
      data.financialStability,
      data.insuranceCoverage,
      data.contractTerms,
    ]);

    const aiSpecificScore = calculateCategoryScore([
      data.modelTransparency,
      data.biasAssessment,
      data.explainability,
      data.humanOversight,
    ]);

    // Calculate overall score and risk level
    const assessmentWithScores = {
      ...data,
      securityScore,
      complianceScore,
      operationalScore,
      financialScore,
      aiSpecificScore,
    };

    const overallScore = calculateOverallRiskScore(assessmentWithScores);
    const riskLevel = getRiskTierFromScore(overallScore);

    // Create assessment
    const assessment = await prisma.vendorRiskAssessment.create({
      data: {
        ...data,
        vendorId: id,
        securityScore,
        complianceScore,
        operationalScore,
        financialScore,
        aiSpecificScore,
        overallScore,
        riskLevel,
      },
    });

    // Update vendor's overall risk score and tier
    await prisma.vendorProfile.update({
      where: { id },
      data: {
        overallRiskScore: overallScore,
        riskTier: riskLevel,
        lastAssessmentDate: assessment.assessmentDate,
      },
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (error: any) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment', details: error?.message },
      { status: 500 }
    );
  }
}




