// ============================================================================
// KNOWLEDGE BASE: ARTICLE CARD COMPONENT
// ============================================================================

'use client';

import Link from 'next/link';
import { FileText, Eye, Calendar } from 'lucide-react';
import { IncidentType } from '@prisma/client';
import { IncidentTypeBadge } from './badges';
import { formatRelativeTime } from '@/lib/module-7-utils';

// ============================================================================
// TYPES
// ============================================================================

interface KBArticleCardProps {
  article: {
    id: string;
    title: string;
    summary: string;
    category: IncidentType;
    publishedAt: Date;
    viewCount: number;
    incidentId: string | null;
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function KBArticleCard({ article }: KBArticleCardProps) {
  return (
    <Link
      href={`/incidents/knowledge-base/${article.id}`}
      className="block bg-white border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-300 transition-all"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {article.title}
            </h3>
            <IncidentTypeBadge type={article.category} />
          </div>
          <div className="ml-3 flex-shrink-0">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {article.summary}
        </p>

        {/* Metadata Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            {/* Published Date */}
            <span className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {formatRelativeTime(new Date(article.publishedAt))}
            </span>

            {/* View Count */}
            <span className="flex items-center">
              <Eye className="h-3.5 w-3.5 mr-1" />
              {article.viewCount} {article.viewCount === 1 ? 'view' : 'views'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

export function KBArticleCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        <div className="ml-3">
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
      </div>
      <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
        <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
      </div>
    </div>
  );
}
