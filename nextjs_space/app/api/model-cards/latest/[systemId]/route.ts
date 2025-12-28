import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { systemId: string } }
) {
  try {
    const latestCard = await prisma.modelCard.findFirst({
      where: { system_id: params.systemId },
      orderBy: {
        last_updated: 'desc',
      },
      include: {
        aiSystem: {
          select: {
            system_name: true,
            business_owner: true,
            technical_owner: true,
          },
        },
      },
    });
    
    if (!latestCard) {
      return NextResponse.json(
        { error: 'No model card found for this system' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(latestCard);
  } catch (error) {
    console.error('Error fetching latest model card:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest model card' },
      { status: 500 }
    );
  }
}
