import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { systemId: string } }
) {
  try {
    const versions = await prisma.modelCard.findMany({
      where: { system_id: params.systemId },
      orderBy: {
        last_updated: 'desc',
      },
      select: {
        card_id: true,
        card_version: true,
        status: true,
        last_updated: true,
        updated_by: true,
        approved_by: true,
        approval_date: true,
      },
    });
    
    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error fetching model card versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}
