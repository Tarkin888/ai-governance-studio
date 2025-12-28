import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const systemId = searchParams.get('systemId');
    const status = searchParams.get('status');

    const where: any = {};
    if (systemId) where.system_id = systemId;
    if (status) where.status = status;

    const tests = await prisma.biasTest.findMany({
      where,
      include: {
        aiSystem: {
          select: {
            system_name: true,
            business_owner: true,
          },
        },
        testResults: true,
        remediationActions: true,
      },
      orderBy: { test_date: 'desc' },
    });

    return NextResponse.json(tests);
  } catch (error) {
    console.error('Error fetching bias tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bias tests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const test = await prisma.biasTest.create({
      data: {
        system_id: data.system_id,
        test_name: data.test_name,
        test_type: data.test_type,
        protected_attributes_tested: data.protected_attributes_tested || [],
        dataset_description: data.dataset_description,
        sample_size: data.sample_size,
        tested_by: data.tested_by,
        test_methodology: data.test_methodology,
        results: data.results || null,
        overall_fairness_score: data.overall_fairness_score || 0,
        issues_detected: data.issues_detected || false,
        severity_level: data.severity_level,
        status: data.status,
        notes: data.notes || null,
      },
    });

    // Create test results if provided
    if (data.testResults && data.testResults.length > 0) {
      await prisma.biasTestResult.createMany({
        data: data.testResults.map((result: any) => ({
          test_id: test.test_id,
          ...result,
        })),
      });
    }

    // Create remediation actions if provided
    if (data.remediationActions && data.remediationActions.length > 0) {
      await prisma.remediationAction.createMany({
        data: data.remediationActions.map((action: any) => ({
          test_id: test.test_id,
          ...action,
        })),
      });
    }

    const createdTest = await prisma.biasTest.findUnique({
      where: { test_id: test.test_id },
      include: {
        testResults: true,
        remediationActions: true,
      },
    });

    return NextResponse.json(createdTest, { status: 201 });
  } catch (error) {
    console.error('Error creating bias test:', error);
    return NextResponse.json(
      { error: 'Failed to create bias test' },
      { status: 500 }
    );
  }
}
