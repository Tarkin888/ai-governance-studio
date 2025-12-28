import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const testId = searchParams.get('testId');
    const status = searchParams.get('status');

    const where: any = {};
    if (testId) where.test_id = testId;
    if (status) where.status = status;

    const actions = await prisma.remediationAction.findMany({
      where,
      include: {
        biasTest: {
          select: {
            test_name: true,
            aiSystem: {
              select: {
                system_name: true,
              },
            },
          },
        },
      },
      orderBy: [{ priority: 'asc' }, { created_at: 'desc' }],
    });

    return NextResponse.json(actions);
  } catch (error) {
    console.error('Error fetching remediation actions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch remediation actions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const action = await prisma.remediationAction.create({
      data: {
        test_id: data.test_id,
        issue_description: data.issue_description,
        recommended_action: data.recommended_action,
        assigned_to: data.assigned_to,
        priority: data.priority,
        status: data.status || 'NOT_STARTED',
        due_date: data.due_date ? new Date(data.due_date) : null,
        completion_date: data.completion_date ? new Date(data.completion_date) : null,
        notes: data.notes || null,
        follow_up_test_required: data.follow_up_test_required || false,
      },
    });

    return NextResponse.json(action, { status: 201 });
  } catch (error) {
    console.error('Error creating remediation action:', error);
    return NextResponse.json(
      { error: 'Failed to create remediation action' },
      { status: 500 }
    );
  }
}
