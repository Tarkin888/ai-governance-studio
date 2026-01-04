import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/vendors/stats - Get vendor dashboard statistics
export async function GET(request: NextRequest) {
  try {
    // Get all vendors
    const allVendors = await prisma.vendorProfile.findMany({
      select: {
        id: true,
        approvalStatus: true,
        onboardingStatus: true,
        riskTier: true,
        overallRiskScore: true,
        lastAssessmentDate: true,
        gdprCompliant: true,
        iso42001Certified: true,
        contracts: {
          select: {
            expiryDate: true,
            status: true,
          },
        },
        incidents: {
          select: {
            incidentDate: true,
          },
          where: {
            incidentDate: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        },
      },
    });

    // Calculate statistics
    const totalVendors = allVendors.length;
    const activeVendors = allVendors.filter(
      v => v.onboardingStatus === 'Active'
    ).length;
    
    const highRiskVendors = allVendors.filter(
      v => v.riskTier === 'High' || v.riskTier === 'Critical'
    ).length;

    // Count pending assessments (vendors without assessment or with old assessment)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const pendingAssessments = allVendors.filter(
      v => !v.lastAssessmentDate || v.lastAssessmentDate < oneYearAgo
    ).length;

    // Count expiring contracts (within next 90 days)
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    
    const expiringContracts = allVendors.reduce((count, vendor) => {
      return count + vendor.contracts.filter(
        contract => contract.status === 'Active' &&
        contract.expiryDate <= ninetyDaysFromNow &&
        contract.expiryDate > new Date()
      ).length;
    }, 0);

    // Count recent incidents (last 30 days)
    const recentIncidents = allVendors.reduce((count, vendor) => {
      return count + vendor.incidents.length;
    }, 0);

    // Calculate average risk score
    const vendorsWithScores = allVendors.filter(v => v.overallRiskScore !== null);
    const averageRiskScore = vendorsWithScores.length > 0
      ? vendorsWithScores.reduce((sum, v) => sum + (v.overallRiskScore || 0), 0) / vendorsWithScores.length
      : 0;

    // Calculate compliance rate (vendors with GDPR or ISO 42001)
    const compliantVendors = allVendors.filter(
      v => v.gdprCompliant || v.iso42001Certified
    ).length;
    const complianceRate = totalVendors > 0
      ? (compliantVendors / totalVendors) * 100
      : 0;

    return NextResponse.json({
      totalVendors,
      activeVendors,
      highRiskVendors,
      pendingAssessments,
      expiringContracts,
      recentIncidents,
      averageRiskScore,
      complianceRate,
    });
  } catch (error: any) {
    console.error('Error fetching vendor stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor statistics', details: error?.message },
      { status: 500 }
    );
  }
}



