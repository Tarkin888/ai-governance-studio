import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    const action = await prisma.remediationAction.update({
      where: { action_id: params.id },
      data: {
        status: data.status,
        assigned_to: data.assigned_to,
        priority: data.priority,
        due_date: data.due_date ? new Date(data.due_date) : null,
        completion_date: data.completion_date ? new Date(data.completion_date) : null,
        notes: data.notes,
      },
    });

    // If action is completed, update the bias test status
    if (data.status === 'COMPLETED') {
      const test = await prisma.biasTest.findFirst({
        where: { test_id: action.test_id },
        include: { remediationActions: true },
      });

      if (test) {
        const allActionsCompleted = test.remediationActions.every(
          (a) => a.action_id === params.id || a.status === 'COMPLETED'
        );

        if (allActionsCompleted) {
          await prisma.biasTest.update({
            where: { test_id: action.test_id },
            data: { status: 'REMEDIATION_COMPLETE' },
          });
        }
      }
    }

    return NextResponse.json(action);
  } catch (error) {
    console.error('Error updating remediation action:', error);
    return NextResponse.json(
      { error: 'Failed to update remediation action' },
      { status: 500 }
    );
  }
}
