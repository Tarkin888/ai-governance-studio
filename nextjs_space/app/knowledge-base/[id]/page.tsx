// ============================================================================
// PAGE: KNOWLEDGE BASE ARTICLE DETAIL
// ============================================================================

import { notFound } from 'next/link';
import Link from 'next/link';
import { ChevronLeft, ExternalLink, Calendar, Eye } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { IncidentTypeBadge } from '@/components/incidents/badges'
  import { KBFeedbackButtons } from '@/components/incidents/kb-feedback-buttons';
import { formatRelativeTime } from '@/lib/module-7-utils';

// ============================================================================
// FETCH ARTICLE
// ============================================================================

async function getArticle(id: string) {
  const article = await prisma.knowledgeBaseArticle.findUnique({
    where: { id },
    include: {
      incident: {
        select: {
          id: true,
          incidentNumber: true,
          title: true
        }
      }
    }
  });

  if (!article || article.status !== 'PUBLISHED') {
    notFound();
  }

  return article;
}

// ============================================================================
// INCREMENT VIEW COUNT
// ============================================================================

async function incrementViewCount(id: string) {
  await prisma.knowledgeBaseArticle.update({
    where: { id },
    data: {
      viewCount: {
        increment: 1
      }
    }
  });
}

// ============================================================================
// PAGE PROPS
// ============================================================================

interface ArticleDetailPageProps {
  params: {
    id: string;
  };
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default async function ArticleDetailPage({
  params
}: ArticleDetailPageProps) {
  const article = await getArticle(params.id);

  // Increment view count (fire and forget)
  incrementViewCount(params.id).catch(console.error);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center mb-4">
            <Link
              href="/incidents/knowledge-base"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <nav className="ml-2 flex items-center text-sm">
              <Link
                href="/incidents/knowledge-base"
                className="text-gray-600 hover:text-gray-900"
              >
                Knowledge Base
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-900">Article</span>
            </nav>
          </div>

          {/* Title & Metadata */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <IncidentTypeBadge type={article.category} />
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                {formatRelativeTime(new Date(article.publishedAt!))}
              </span>
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-1.5" />
                {article.viewCount + 1} views
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium">
              {article.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Problem Statement */}
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-600 text-sm font-bold mr-3">
                1
              </span>
              Problem Statement
            </h2>
            <div className="pl-11">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {article.problemStatement}
              </p>
            </div>
          </section>

          {/* Solution */}
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-600 text-sm font-bold mr-3">
                2
              </span>
              Solution
            </h2>
            <div className="pl-11">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {article.solution}
              </p>
            </div>
          </section>

          {/* Prevention Guidance */}
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold mr-3">
                3
              </span>
              Prevention Guidance
            </h2>
            <div className="pl-11">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {article.preventionGuidance}
              </p>
            </div>
          </section>

          {/* Source Incident */}
          {article.incident && (
            <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Source Incident
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {article.incident.incidentNumber}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {article.incident.title}
                  </p>
                </div>
                <Link
                  href={`/incidents/${article.incident.id}`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  View Incident
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </section>
          )}

          {/* Feedback */}
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Was this article helpful?
            </h3>
            <KBFeedbackButtons articleId={article.id} />
          </section>

          {/* Related Articles Placeholder */}
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Looking for more information?</strong> Browse the{' '}
              <Link
                href={`/incidents/knowledge-base?category=${article.category}`}
                className="underline hover:text-blue-900"
              >
                {article.category}
              </Link>{' '}
              category for related articles.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// METADATA
// ============================================================================

export async function generateMetadata({
  params
}: {
  params: { id: string };
}) {
  const article = await getArticle(params.id);

  return {
    title: `${article.title} | Knowledge Base | AI Governance Studio`,
    description: article.summary
  };
}
