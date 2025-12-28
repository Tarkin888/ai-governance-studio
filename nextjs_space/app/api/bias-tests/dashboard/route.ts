import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { BiasTestStatus, BiasSeverityLevel } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Get total tests
    const totalTests = await prisma.biasTest.count();

    // Get tests by status
    const activeTests = await prisma.biasTest.count({
      where: { status: BiasTestStatus.IN_PROGRESS },
    });

    const completedTests = await prisma.biasTest.count({
      where: { status: BiasTestStatus.COMPLETED },
    });

    const remediationNeeded = await prisma.biasTest.count({
      where: { status: BiasTestStatus.REMEDIATION_NEEDED },
    });

    // Get tests with issues
    const criticalIssues = await prisma.biasTest.count({
      where: { severity_level: BiasSeverityLevel.CRITICAL },
    });

    const highIssues = await prisma.biasTest.count({
      where: { severity_level: BiasSeverityLevel.HIGH },
    });

    // Get systems with fairness issues
    const systemsWithIssues = await prisma.biasTest.findMany({
      where: { issues_detected: true },
      distinct: ['system_id'],
      select: {
        system_id: true,
        aiSystem: {
          select: {
            system_name: true,
          },
        },
      },
    });

    // Get recent tests
    const recentTests = await prisma.biasTest.findMany({
      take: 10,
      orderBy: { test_date: 'desc' },
      include: {
        aiSystem: {
          select: {
            system_name: true,
          },
        },
      },
    });

    // Get remediation backlog
    const openRemediations = await prisma.remediationAction.count({
      where: {
        status: {
          in: ['NOT_STARTED', 'IN_PROGRESS'],
        },
      },
    });

    return NextResponse.json({
      stats: {
        totalTests,
        activeTests,
        completedTests,
        remediationNeeded,
        criticalIssues,
        highIssues,
        openRemediations,
      },
      systemsWithIssues,
      recentTests,
    });
  } catch (error) {
    console.error('Error fetching bias testing dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
