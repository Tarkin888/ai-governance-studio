'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  TrendingUp,
  Users,
  FileCheck,
} from 'lucide-react';
import { formatDate } from '@/lib/format-utils';
import { CreateBiasTestDialog } from '@/app/_components/create-bias-test-dialog';

interface DashboardData {
  stats: {
    totalTests: number;
    activeTests: number;
    completedTests: number;
    remediationNeeded: number;
    criticalIssues: number;
    highIssues: number;
    openRemediations: number;
  };
  systemsWithIssues: Array<{
    system_id: string;
    aiSystem: {
      system_name: string;
    };
  }>;
  recentTests: Array<{
    test_id: string;
    test_name: string;
    test_type: string;
    status: string;
    severity_level: string;
    overall_fairness_score: number;
    test_date: string;
    aiSystem: {
      system_name: string;
    };
  }>;
}

export function BiasFairnessDashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/bias-tests/dashboard');
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load dashboard data</p>
      </div>
    );
  }

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      CRITICAL: 'bg-red-100 text-red-800 border-red-300',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      LOW: 'bg-blue-100 text-blue-800 border-blue-300',
      NO_ISSUES: 'bg-green-100 text-green-800 border-green-300',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PLANNED: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      REMEDIATION_NEEDED: 'bg-orange-100 text-orange-800',
      REMEDIATION_COMPLETE: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bias & Fairness Testing</h1>
          <p className="text-gray-600 mt-1">
            Monitor and assess AI systems for discriminatory outcomes
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New Bias Test
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tests</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data.stats.totalTests}</p>
              <p className="text-xs text-gray-500 mt-1">
                {data.stats.completedTests} completed
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileCheck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tests</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{data.stats.activeTests}</p>
              <p className="text-xs text-gray-500 mt-1">In progress</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className={`p-5 ${data.stats.criticalIssues > 0 ? 'border-2 border-red-300 bg-red-50' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Issues</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{data.stats.criticalIssues}</p>
              {data.stats.criticalIssues > 0 && (
                <p className="text-xs text-red-600 font-medium mt-1">
                  ⚠️ Immediate action required
                </p>
              )}
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Remediations</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data.stats.openRemediations}</p>
              <p className="text-xs text-gray-500 mt-1">
                {data.stats.remediationNeeded} tests need review
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">High Priority Issues</p>
              <p className="text-xl font-bold text-gray-900">{data.stats.highIssues}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Systems with Issues</p>
              <p className="text-xl font-bold text-gray-900">{data.systemsWithIssues.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Systems with Fairness Issues */}
      {data.systemsWithIssues.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Systems with Fairness Issues
          </h3>
          <div className="space-y-2">
            {data.systemsWithIssues.map((system) => (
              <Link
                key={system.system_id}
                href={`/ai-systems/${system.system_id}`}
                className="block p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <p className="font-medium text-gray-900">{system.aiSystem.system_name}</p>
                <p className="text-sm text-gray-600">Click to view system details</p>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Tests */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Test Results</h3>
        {data.recentTests.length === 0 ? (
          <div className="text-center py-8">
            <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No bias tests have been conducted yet</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Test
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    System
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fairness Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.recentTests.map((test) => (
                  <tr key={test.test_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/bias-fairness/${test.test_id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {test.test_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {test.aiSystem.system_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {test.test_type.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold">
                          {test.overall_fairness_score.toFixed(1)}%
                        </div>
                        {test.overall_fairness_score >= 80 ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : test.overall_fairness_score >= 60 ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getSeverityBadge(test.severity_level)}>
                        {test.severity_level.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusBadge(test.status)}>
                        {test.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(test.test_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CreateBiasTestDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          fetchData();
        }}
      />
    </div>
  );
}
