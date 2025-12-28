import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const modelCard = await prisma.modelCard.findUnique({
      where: { card_id: params.id },
      include: {
        aiSystem: {
          select: {
            system_name: true,
            business_owner: true,
            technical_owner: true,
            ai_model_type: true,
            deployment_date: true,
            deployment_status: true,
            data_sources: true,
          },
        },
      },
    });
    
    if (!modelCard) {
      return NextResponse.json(
        { error: 'Model card not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(modelCard);
  } catch (error) {
    console.error('Error fetching model card:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model card' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const modelCard = await prisma.modelCard.update({
      where: { card_id: params.id },
      data: {
        ...body,
        last_updated: new Date(),
      },
      include: {
        aiSystem: {
          select: {
            system_name: true,
          },
        },
      },
    });
    
    return NextResponse.json(modelCard);
  } catch (error) {
    console.error('Error updating model card:', error);
    return NextResponse.json(
      { error: 'Failed to update model card' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.modelCard.delete({
      where: { card_id: params.id },
    });
    
    return NextResponse.json({ message: 'Model card deleted successfully' });
  } catch (error) {
    console.error('Error deleting model card:', error);
    return NextResponse.json(
      { error: 'Failed to delete model card' },
      { status: 500 }
    );
  }
}
