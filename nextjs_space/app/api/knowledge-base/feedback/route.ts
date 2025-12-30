// ============================================================================
// API ROUTE: KB ARTICLE FEEDBACK
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ============================================================================
// POST: Submit Feedback
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { feedback } = body;

    // Validate feedback value
    if (!feedback || !['helpful', 'not_helpful'].includes(feedback)) {
      return NextResponse.json(
        { error: { message: 'Invalid feedback value' } },
        { status: 400 }
      );
    }

    // Check if article exists
    const article = await prisma.knowledgeBaseArticle.findUnique({
      where: { id: params.id },
      select: { id: true, status: true }
    });

    if (!article) {
      return NextResponse.json(
        { error: { message: 'Article not found' } },
        { status: 404 }
      );
    }

    if (article.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: { message: 'Cannot provide feedback on unpublished article' } },
        { status: 400 }
      );
    }

    // Update feedback count
    const updateData =
      feedback === 'helpful'
        ? { helpfulCount: { increment: 1 } }
        : { notHelpfulCount: { increment: 1 } };

    const updatedArticle = await prisma.knowledgeBaseArticle.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        helpfulCount: true,
        notHelpfulCount: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedArticle
    });
  } catch (error) {
    console.error('Error submitting KB feedback:', error);
    return NextResponse.json(
      {
        error: {
          message: 'Failed to submit feedback',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}
