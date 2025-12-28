import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ModelCardStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Get all model cards with system info
    const allCards = await prisma.modelCard.findMany({
      include: {
        aiSystem: {
          select: {
            system_name: true,
            business_owner: true,
            risk_classification: true,
          },
        },
      },
      orderBy: {
        last_updated: 'desc',
      },
    });
    
    // Calculate statistics
    const totalCards = allCards.length;
    const draftCards = allCards.filter(c => c.status === ModelCardStatus.DRAFT).length;
    const underReviewCards = allCards.filter(c => c.status === ModelCardStatus.UNDER_REVIEW).length;
    const approvedCards = allCards.filter(c => c.status === ModelCardStatus.APPROVED).length;
    const publishedCards = allCards.filter(c => c.status === ModelCardStatus.PUBLISHED).length;
    
    // Get all AI systems and check documentation status
    const totalSystems = await prisma.aISystem.count();
    const systemsWithCards = await prisma.aISystem.count({
      where: {
        modelCards: {
          some: {},
        },
      },
    });
    const undocumentedSystems = totalSystems - systemsWithCards;
    
    // Get systems that need documentation (high-risk without published cards)
    const systemsNeedingDocumentation = await prisma.aISystem.findMany({
      where: {
        OR: [
          {
            modelCards: {
              none: {},
            },
          },
          {
            modelCards: {
              none: {
                status: ModelCardStatus.PUBLISHED,
              },
            },
          },
        ],
      },
      select: {
        system_id: true,
        system_name: true,
        risk_classification: true,
        business_owner: true,
      },
      take: 5,
    });
    
    // Get recent cards (last 10)
    const recentCards = allCards.slice(0, 10);
    
    return NextResponse.json({
      stats: {
        totalCards,
        draftCards,
        underReviewCards,
        approvedCards,
        publishedCards,
        totalSystems,
        systemsWithCards,
        undocumentedSystems,
      },
      systemsNeedingDocumentation,
      recentCards,
    });
  } catch (error) {
    console.error('Error fetching model card dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
