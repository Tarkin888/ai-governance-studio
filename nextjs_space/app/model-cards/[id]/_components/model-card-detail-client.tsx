'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Download,
  Share2,
  Archive,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Database,
  BarChart3,
  Shield,
  Settings,
  GitBranch,
} from 'lucide-react';
import { formatDate } from '@/lib/format-utils';
import { ModelCardStatus } from '@prisma/client';
import { toast } from '@/components/ui/use-toast';

interface ModelCardDetailClientProps {
  modelCard: any;
}

export function ModelCardDetailClient({ modelCard }: ModelCardDetailClientProps) {
  const router = useRouter();
  const [versions, setVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(true);

  useEffect(() => {
    fetchVersions();
  }, [modelCard.system_id]);

  const fetchVersions = async () => {
    try {
      const response = await fetch(`/api/model-cards/versions/${modelCard.system_id}`);
      if (response.ok) {
        const data = await response.json();
        setVersions(data);
      }
    } catch (error) {
      console.error('Error fetching versions:', error);
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleExport = async (format: string) => {
    try {
      const response = await fetch(`/api/model-cards/export/${modelCard.card_id}?format=${format}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `model-card-${modelCard.aiSystem.system_name.replace(/\s+/g, '-')}.${format === 'json' ? 'json' : format === 'markdown' ? 'md' : 'html'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Success',
        description: `Model card exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Error',
        description: 'Failed to export model card',
        variant: 'destructive',
      });
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
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/model-cards">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Library
              </Button>
            </Link>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('json')}>
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            <Button variant="outline" onClick={() => handleExport('markdown')}>
              <Download className="h-4 w-4 mr-2" />
              Export Markdown
            </Button>
            <Button variant="outline" onClick={() => handleExport('html')}>
              <Download className="h-4 w-4 mr-2" />
              Export HTML
            </Button>
            <Link href={`/ai-systems/${modelCard.system_id}`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Card
              </Button>
            </Link>
          </div>
        </div>

        {/* Title Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {modelCard.aiSystem.system_name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  {getStatusBadge(modelCard.status)}
                  <span className="text-sm text-gray-600">Version {modelCard.card_version}</span>
                  <span className="text-sm text-gray-600">•</span>
                  <span className="text-sm text-gray-600">
                    Last updated {formatDate(modelCard.last_updated)}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-gray-600">Updated By</p>
                <p className="font-semibold text-gray-900">{modelCard.updated_by}</p>
              </div>
              {modelCard.approved_by && (
                <div>
                  <p className="text-gray-600">Approved By</p>
                  <p className="font-semibold text-green-700 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    {modelCard.approved_by}
                  </p>
                </div>
              )}
              {modelCard.reviewer_assigned && (
                <div>
                  <p className="text-gray-600">Reviewer Assigned</p>
                  <p className="font-semibold text-gray-900">{modelCard.reviewer_assigned}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content">Model Card Content</TabsTrigger>
            <TabsTrigger value="versions">Version History</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            {/* Section 1: Model Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Model Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Model Type</h4>
                  <p className="text-gray-900">{modelCard.aiSystem.ai_model_type}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Description</h4>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {modelCard.model_details_summary || 'Not provided'}
                  </p>
                </div>
                {modelCard.model_architecture && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Architecture</h4>
                    <p className="text-gray-900">{modelCard.model_architecture}</p>
                  </div>
                )}
                {modelCard.licence && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Licence</h4>
                    <p className="text-gray-900">{modelCard.licence}</p>
                  </div>
                )}
                {modelCard.citation && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Citation</h4>
                    <p className="text-gray-900 whitespace-pre-wrap">{modelCard.citation}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 2: Intended Use & Limitations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Intended Use & Limitations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {modelCard.intended_use && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Intended Use</h4>
                    <p className="text-gray-900 whitespace-pre-wrap">{modelCard.intended_use}</p>
                  </div>
                )}
                {modelCard.intended_users && modelCard.intended_users.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Intended Users</h4>
                    <div className="flex flex-wrap gap-2">
                      {modelCard.intended_users.map((user: string) => (
                        <Badge key={user} variant="secondary">{user}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {modelCard.out_of_scope_uses && modelCard.out_of_scope_uses.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Out-of-Scope Uses</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {modelCard.out_of_scope_uses.map((use: string, index: number) => (
                        <li key={index} className="text-gray-900">{use}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {modelCard.limitations_known && modelCard.limitations_known.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Known Limitations</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {modelCard.limitations_known.map((limitation: string, index: number) => (
                        <li key={index} className="text-gray-900">{limitation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 3: Training Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-600" />
                  Training Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {modelCard.training_data_description && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Data Description</h4>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {modelCard.training_data_description}
                    </p>
                  </div>
                )}
                {(modelCard.training_data_size || modelCard.training_data_source) && (
                  <div className="grid grid-cols-2 gap-4">
                    {modelCard.training_data_size && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Dataset Size</h4>
                        <p className="text-gray-900">
                          {modelCard.training_data_size.toLocaleString()} samples
                        </p>
                      </div>
                    )}
                    {modelCard.training_data_source && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Data Source</h4>
                        <p className="text-gray-900">{modelCard.training_data_source}</p>
                      </div>
                    )}
                  </div>
                )}
                {modelCard.preprocessing_steps && modelCard.preprocessing_steps.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Preprocessing Steps</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {modelCard.preprocessing_steps.map((step: string, index: number) => (
                        <li key={index} className="text-gray-900">{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 4: Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {modelCard.evaluation_metrics && Object.keys(modelCard.evaluation_metrics).length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Evaluation Metrics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(modelCard.evaluation_metrics).map(([name, value]) => (
                        <div key={name} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">{name}</p>
                          <p className="text-xl font-semibold text-gray-900">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {modelCard.benchmark_comparisons && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Benchmark Comparisons</h4>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {modelCard.benchmark_comparisons}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 5: Ethical Considerations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Ethical Considerations & Fairness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {modelCard.fairness_assessment_summary && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Fairness Assessment</h4>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {modelCard.fairness_assessment_summary}
                    </p>
                  </div>
                )}
                {modelCard.potential_risks_harms && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Potential Risks & Harms</h4>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {modelCard.potential_risks_harms}
                    </p>
                  </div>
                )}
                {modelCard.human_oversight_requirements && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Human Oversight Requirements</h4>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {modelCard.human_oversight_requirements}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 6: Deployment & Monitoring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-indigo-600" />
                  Deployment & Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {modelCard.monitoring_plan && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Monitoring Plan</h4>
                    <p className="text-gray-900 whitespace-pre-wrap">{modelCard.monitoring_plan}</p>
                  </div>
                )}
                {modelCard.update_frequency && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Update Frequency</h4>
                    <p className="text-gray-900">{modelCard.update_frequency.replace('_', ' ')}</p>
                  </div>
                )}
                {modelCard.decommissioning_criteria && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Decommissioning Criteria</h4>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {modelCard.decommissioning_criteria}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 7: Regulatory Compliance */}
            {modelCard.regulatory_compliance_summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-teal-600" />
                    Regulatory Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {modelCard.regulatory_compliance_summary}
                  </p>
                  <Link
                    href={`/ai-systems/${modelCard.system_id}/regulatory`}
                    className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                  >
                    View full regulatory assessments →
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="versions">
            <Card>
              <CardHeader>
                <CardTitle>Version History</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingVersions ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                    <p className="mt-2 text-sm text-gray-600">Loading versions...</p>
                  </div>
                ) : versions.length > 0 ? (
                  <div className="space-y-4">
                    {versions.map((version, index) => (
                      <div
                        key={version.card_id}
                        className={`p-4 rounded-lg border ${
                          version.card_id === modelCard.card_id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">Version {version.card_version}</span>
                              {getStatusBadge(version.status)}
                              {version.card_id === modelCard.card_id && (
                                <Badge className="bg-blue-600 text-white">Current</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Updated {formatDate(version.last_updated)} by {version.updated_by}
                            </p>
                            {version.approved_by && (
                              <p className="text-sm text-green-700 flex items-center gap-1 mt-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Approved by {version.approved_by} on {formatDate(version.approval_date)}
                              </p>
                            )}
                          </div>
                          {version.card_id !== modelCard.card_id && (
                            <Link href={`/model-cards/${version.card_id}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600">
                    <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No version history available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
