'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Copy,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Upload,
  Filter,
} from 'lucide-react';
import { formatDate } from '@/lib/format-utils';
import { ModelCardStatus } from '@prisma/client';

interface DashboardData {
  stats: {
    totalCards: number;
    draftCards: number;
    underReviewCards: number;
    approvedCards: number;
    publishedCards: number;
    totalSystems: number;
    systemsWithCards: number;
    undocumentedSystems: number;
  };
  systemsNeedingDocumentation: any[];
  recentCards: any[];
}

export function ModelCardLibraryClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/model-cards/dashboard');
      if (!response.ok) throw new Error('Failed to fetch data');
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: ModelCardStatus) => {
    const variants: Record<ModelCardStatus, { color: string; label: string }> = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      UNDER_REVIEW: { color: 'bg-blue-100 text-blue-800', label: 'Under Review' },
      APPROVED: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      PUBLISHED: { color: 'bg-purple-100 text-purple-800', label: 'Published' },
      ARCHIVED: { color: 'bg-gray-100 text-gray-600', label: 'Archived' },
    };
    const variant = variants[status];
    return (
      <Badge className={variant.color}>
        {variant.label}
      </Badge>
    );
  };

  const filteredCards = data?.recentCards
    .filter(card => {
      const matchesSearch = card.aiSystem.system_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || card.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
        case 'oldest':
          return new Date(a.last_updated).getTime() - new Date(b.last_updated).getTime();
        case 'name-asc':
          return a.aiSystem.system_name.localeCompare(b.aiSystem.system_name);
        case 'name-desc':
          return b.aiSystem.system_name.localeCompare(a.aiSystem.system_name);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading model cards...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Failed to load data. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Model Card Library</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive documentation hub for AI systems
            </p>
          </div>
          <Link href="/">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Model Card
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Model Cards
              </CardTitle>
              <FileText className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {data.stats.totalCards}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {data.stats.publishedCards} published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Documentation Coverage
              </CardTitle>
              <FileCheck className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {data.stats.totalSystems > 0
                  ? Math.round((data.stats.systemsWithCards / data.stats.totalSystems) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {data.stats.systemsWithCards} of {data.stats.totalSystems} systems
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Under Review
              </CardTitle>
              <Clock className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {data.stats.underReviewCards}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Undocumented Systems
              </CardTitle>
              <AlertCircle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {data.stats.undocumentedSystems}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Need documentation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Systems Needing Documentation */}
        {data.systemsNeedingDocumentation.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-lg text-red-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Systems Needing Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.systemsNeedingDocumentation.map(system => (
                  <Link
                    key={system.system_id}
                    href={`/ai-systems/${system.system_id}`}
                    className="block p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {system.system_name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Owner: {system.business_owner}
                        </p>
                      </div>
                      <Badge className="bg-red-100 text-red-800">
                        {system.risk_classification}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Model Cards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by system name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Model Cards Grid */}
            {filteredCards && filteredCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {filteredCards.map(card => (
                  <Card key={card.card_id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {card.aiSystem.system_name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Version {card.card_version}
                          </p>
                        </div>
                        {getStatusBadge(card.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                          <p className="line-clamp-2">
                            {card.model_details_summary || 'No description provided'}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Updated {formatDate(card.last_updated)}</span>
                        </div>
                        
                        <div className="text-xs text-gray-600">
                          <p>By: {card.updated_by}</p>
                          {card.approved_by && (
                            <p className="flex items-center gap-1 text-green-700 mt-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Approved by {card.approved_by}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Link href={`/model-cards/${card.card_id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/ai-systems/${card.system_id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery || statusFilter !== 'all'
                    ? 'No model cards match your filters'
                    : 'No model cards yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first model card to document an AI system'}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Link href="/">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Model Card
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
