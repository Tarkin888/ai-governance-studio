// ============================================================================
// PAGE: KNOWLEDGE BASE ARTICLES LIST
// ============================================================================

import { Suspense } from 'react';
import Link from 'next/link';
import { BookOpen, Search } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { KBArticleCard, KBArticleCardSkeleton } from '@/components/incidents/kb-article-card';
import { IncidentType } from '@prisma/client';

// ============================================================================
// FETCH ARTICLES
// ============================================================================

async function getArticles(searchQuery?: string, categoryFilter?: string) {
  const where: any = {
    status: 'PUBLISHED'
  };

  // Category filter
  if (categoryFilter && categoryFilter !== 'ALL') {
    where.category = categoryFilter as IncidentType;
  }

  // Search filter
  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery, mode: 'insensitive' } },
      { summary: { contains: searchQuery, mode: 'insensitive' } },
      { problemStatement: { contains: searchQuery, mode: 'insensitive' } },
      { solution: { contains: searchQuery, mode: 'insensitive' } }
    ];
  }

  const articles = await prisma.knowledgeBaseArticle.findMany({
    where,
    select: {
      id: true,
      title: true,
      summary: true,
      category: true,
      publishedAt: true,
      viewCount: true,
      incidentId: true
    },
    orderBy: [
      { publishedAt: 'desc' }
    ]
  });

  return articles;
}

// ============================================================================
// GET STATISTICS
// ============================================================================

async function getStatistics() {
  const [total, byCategory] = await Promise.all([
    prisma.knowledgeBaseArticle.count({
      where: { status: 'PUBLISHED' }
    }),
    prisma.knowledgeBaseArticle.groupBy({
      by: ['category'],
      where: { status: 'PUBLISHED' },
      _count: true
    })
  ]);

  const totalViews = await prisma.knowledgeBaseArticle.aggregate({
    where: { status: 'PUBLISHED' },
    _sum: { viewCount: true }
  });

  return {
    total,
    totalViews: totalViews._sum.viewCount || 0,
    byCategory
  };
}

// ============================================================================
// PAGE PROPS
// ============================================================================

interface KnowledgeBasePageProps {
  searchParams: {
    q?: string;
    category?: string;
  };
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default async function KnowledgeBasePage({ searchParams }: KnowledgeBasePageProps) {
  const searchQuery = searchParams.q || '';
  const categoryFilter = searchParams.category || 'ALL';

  const [articles, stats] = await Promise.all([
    getArticles(searchQuery, categoryFilter),
    getStatistics()
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Knowledge Base
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Learn from past incidents and documented solutions
              </p>
            </div>
            <Link
              href="/incidents"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Back to Incidents
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Published Articles
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Total Views
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Search className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Categories
                </p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {stats.byCategory.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <form method="GET" className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search articles by keyword..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">
                Category:
              </span>
              <CategoryButton
                label="All"
                value="ALL"
                currentCategory={categoryFilter}
              />
              <CategoryButton
                label="Bias"
                value="BIAS_DISCRIMINATION"
                currentCategory={categoryFilter}
              />
              <CategoryButton
                label="Data Breach"
                value="DATA_BREACH"
                currentCategory={categoryFilter}
              />
              <CategoryButton
                label="Model Drift"
                value="MODEL_DRIFT"
                currentCategory={categoryFilter}
              />
              <CategoryButton
                label="System Failure"
                value="SYSTEM_FAILURE"
                currentCategory={categoryFilter}
              />
              <CategoryButton
                label="Security"
                value="SECURITY_VULNERABILITY"
                currentCategory={categoryFilter}
              />
            </div>
          </form>
        </div>

        {/* Results Count */}
        {(searchQuery || categoryFilter !== 'ALL') && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Found {articles.length}{' '}
              {articles.length === 1 ? 'article' : 'articles'}
              {searchQuery && ` matching "${searchQuery}"`}
              {categoryFilter !== 'ALL' && ` in ${categoryFilter}`}
            </p>
          </div>
        )}

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <KBArticleCard
                key={article.id}
                article={article}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Articles Found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? `No articles match your search for "${searchQuery}".`
                : categoryFilter !== 'ALL'
                ? `No articles available in this category yet.`
                : 'No published articles available yet.'}
            </p>
            <p className="text-sm text-gray-500">
              Knowledge base articles are automatically created when incidents
              are closed with complete root cause analysis.
            </p>
          </div>
        )}

        {/* Info Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>How it works:</strong> When an incident is closed with
            completed root cause analysis, lessons learned, and preventive
            actions, a draft Knowledge Base article is automatically created.
            Administrators can review and publish these articles to share
            learnings across the organisation.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CATEGORY BUTTON COMPONENT
// ============================================================================

function CategoryButton({
  label,
  value,
  currentCategory
}: {
  label: string;
  value: string;
  currentCategory: string;
}) {
  const isActive = currentCategory === value;

  return (
    <Link
      href={`/incidents/knowledge-base?category=${value}`}
      className={`
        inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors
        ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }
      `}
    >
      {label}
    </Link>
  );
}

// ============================================================================
// METADATA
// ============================================================================

export const metadata = {
  title: 'Knowledge Base | AI Governance Studio',
  description: 'Browse incident learnings and documented solutions'
};
