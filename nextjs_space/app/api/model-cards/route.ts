import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const systemId = searchParams.get('systemId');
    const status = searchParams.get('status');
    
    const where: any = {};
    if (systemId) where.system_id = systemId;
    if (status) where.status = status;
    
    const modelCards = await prisma.modelCard.findMany({
      where,
      include: {
        aiSystem: {
          select: {
            system_name: true,
            business_owner: true,
            technical_owner: true,
          },
        },
      },
      orderBy: {
        last_updated: 'desc',
      },
    });
    
    return NextResponse.json(modelCards);
  } catch (error) {
    console.error('Error fetching model cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model cards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const modelCard = await prisma.modelCard.create({
      data: {
        ...body,
        last_updated: new Date(),
      },
      include: {
        aiSystem: {
          select: {
            system_name: true,
            business_owner: true,
          },
        },
      },
    });
    
    return NextResponse.json(modelCard, { status: 201 });
  } catch (error) {
    console.error('Error creating model card:', error);
    return NextResponse.json(
      { error: 'Failed to create model card' },
      { status: 500 }
    );
  }
}
