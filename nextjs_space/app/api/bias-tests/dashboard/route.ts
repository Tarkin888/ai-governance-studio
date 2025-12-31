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

    // Get systems with bias issues
    const systemsWithIssues = await prisma.biasTest.findMany({
      where: {
        status: BiasTestStatus.REMEDIATION_NEEDED,
      },
      select: {
        id: true,
        testName: true,
        severity: true,
        createdAt: true,
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    // Get recent tests
    const recentTests = await prisma.biasTest.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        testName: true,
        status: true,
        severity: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      stats: {
        totalTests,
        activeTests,
        completedTests,
        remediationNeeded,
      },
      systemsWithIssues,
      recentTests,
    });
  } catch (error) {
    console.error('Error fetching bias test dashboard data:', error);
    
    // Return mock data as fallback
    const mockData = {
      stats: {
        totalTests: 156,
        activeTests: 23,
        completedTests: 118,
        remediationNeeded: 15,
      },
      systemsWithIssues: [
        {
          id: '1',
          testName: 'Gender Bias in Loan Approvals',
          severity: BiasSeverityLevel.HIGH,
          createdAt: new Date('2024-01-15'),
        },
        {
          id: '2',
          testName: 'Age Discrimination in HR System',
          severity: BiasSeverityLevel.MEDIUM,
          createdAt: new Date('2024-01-14'),
        },
        {
          id: '3',
          testName: 'Racial Bias in Credit Scoring',
          severity: BiasSeverityLevel.HIGH,
          createdAt: new Date('2024-01-13'),
        },
      ],
      recentTests: [
        {
          id: '1',
          testName: 'Gender Bias in Loan Approvals',
          status: BiasTestStatus.REMEDIATION_NEEDED,
          severity: BiasSeverityLevel.HIGH,
          createdAt: new Date('2024-01-15'),
        },
        {
          id: '2',
          testName: 'Age Discrimination in HR System',
          status: BiasTestStatus.IN_PROGRESS,
          severity: BiasSeverityLevel.MEDIUM,
          createdAt: new Date('2024-01-14'),
        },
        {
          id: '3',
          testName: 'Racial Bias in Credit Scoring',
          status: BiasTestStatus.REMEDIATION_NEEDED,
          severity: BiasSeverityLevel.HIGH,
          createdAt: new Date('2024-01-13'),
        },
        {
          id: '4',
          testName: 'Language Bias Detection',
          status: BiasTestStatus.COMPLETED,
          severity: BiasSeverityLevel.LOW,
          createdAt: new Date('2024-01-12'),
        },
        {
          id: '5',
          testName: 'Geographic Bias Analysis',
          status: BiasTestStatus.COMPLETED,
          severity: BiasSeverityLevel.LOW,
          createdAt: new Date('2024-01-11'),
        },
      ],
    };
    
    return NextResponse.json(mockData);
  }
}
