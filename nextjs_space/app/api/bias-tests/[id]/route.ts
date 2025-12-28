import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const test = await prisma.biasTest.findUnique({
      where: { test_id: params.id },
      include: {
        aiSystem: true,
        testResults: true,
        remediationActions: {
          orderBy: { priority: 'asc' },
        },
      },
    });

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(test);
  } catch (error) {
    console.error('Error fetching bias test:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bias test' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    const test = await prisma.biasTest.update({
      where: { test_id: params.id },
      data: {
        test_name: data.test_name,
        status: data.status,
        severity_level: data.severity_level,
        issues_detected: data.issues_detected,
        overall_fairness_score: data.overall_fairness_score,
        results: data.results,
        notes: data.notes,
      },
      include: {
        testResults: true,
        remediationActions: true,
      },
    });

    return NextResponse.json(test);
  } catch (error) {
    console.error('Error updating bias test:', error);
    return NextResponse.json(
      { error: 'Failed to update bias test' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.biasTest.delete({
      where: { test_id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bias test:', error);
    return NextResponse.json(
      { error: 'Failed to delete bias test' },
      { status: 500 }
    );
  }
}
