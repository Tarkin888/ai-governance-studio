import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { RiskClassification } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Get total systems count
    const totalSystems = await prisma.aISystem.count();

    // Get counts by risk classification
    const prohibited = await prisma.aISystem.count({
      where: { risk_classification: RiskClassification.PROHIBITED },
    });

    const highRisk = await prisma.aISystem.count({
      where: { risk_classification: RiskClassification.HIGH_RISK },
    });

    const limitedRisk = await prisma.aISystem.count({
      where: { risk_classification: RiskClassification.LIMITED_RISK },
    });

    const minimalRisk = await prisma.aISystem.count({
      where: { risk_classification: RiskClassification.MINIMAL_RISK },
    });

    const notAssessed = await prisma.aISystem.count({
      where: { risk_classification: RiskClassification.NOT_YET_ASSESSED },
    });

    // Get total assessments count
    const totalAssessments = await prisma.eUAIActAssessment.count();

    // Get all systems with their latest assessment info
    const systems = await prisma.aISystem.findMany({
      select: {
        system_id: true,
        system_name: true,
        business_owner: true,
        deployment_status: true,
        risk_classification: true,
        last_modified: true,
        euAIActAssessments: {
          take: 1,
          orderBy: { assessment_date: 'desc' },
          select: {
            assessment_id: true,
            assessment_date: true,
            assessed_by: true,
          },
        },
      },
      orderBy: { last_modified: 'desc' },
    });

    return NextResponse.json({
      stats: {
        totalSystems,
        totalAssessments,
        prohibited,
        highRisk,
        limitedRisk,
        minimalRisk,
        notAssessed,
      },
      systems,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
