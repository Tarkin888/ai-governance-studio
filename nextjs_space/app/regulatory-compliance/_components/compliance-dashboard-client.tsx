'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Shield,
  TrendingUp,
  FileCheck,
  Search,
} from 'lucide-react';
import { RiskClassification } from '@prisma/client';
import { formatDate } from '@/lib/format-utils';

interface DashboardData {
  stats: {
    totalSystems: number;
    totalAssessments: number;
    prohibited: number;
    highRisk: number;
    limitedRisk: number;
    minimalRisk: number;
    notAssessed: number;
  };
  systems: Array<{
    system_id: string;
    system_name: string;
    business_owner: string;
    deployment_status: string;
    risk_classification: RiskClassification;
    last_modified: string;
    euAIActAssessments: Array<{
      assessment_id: string;
      assessment_date: string;
      assessed_by: string;
    }>;
  }>;
}

export function ComplianceDashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [assessmentFilter, setAssessmentFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/eu-ai-act/dashboard');
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

  // Filter systems
  const filteredSystems = data.systems.filter((system) => {
    const matchesSearch = 
      system.system_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      system.business_owner.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRisk = 
      riskFilter === 'all' || system.risk_classification === riskFilter;
    
    const hasAssessment = system.euAIActAssessments.length > 0;
    const matchesAssessment = 
      assessmentFilter === 'all' ||
      (assessmentFilter === 'assessed' && hasAssessment) ||
      (assessmentFilter === 'not_assessed' && !hasAssessment);

    return matchesSearch && matchesRisk && matchesAssessment;
  });

  const getRiskColor = (risk: RiskClassification) => {
    switch (risk) {
      case RiskClassification.PROHIBITED:
        return 'bg-red-100 text-red-800 border-red-300';
      case RiskClassification.HIGH_RISK:
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case RiskClassification.LIMITED_RISK:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case RiskClassification.MINIMAL_RISK:
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRiskIcon = (risk: RiskClassification) => {
    switch (risk) {
      case RiskClassification.PROHIBITED:
        return <AlertCircle className="h-5 w-5" />;
      case RiskClassification.HIGH_RISK:
        return <AlertTriangle className="h-5 w-5" />;
      case RiskClassification.LIMITED_RISK:
        return <Info className="h-5 w-5" />;
      case RiskClassification.MINIMAL_RISK:
        return <CheckCircle2 className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const assessmentRate = data.stats.totalSystems > 0 
    ? Math.round(((data.stats.totalSystems - data.stats.notAssessed) / data.stats.totalSystems) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">EU AI Act Compliance Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of AI systems classified under the EU AI Act risk framework
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Systems */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Systems Assessed</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {data.stats.totalSystems - data.stats.notAssessed}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {data.stats.totalAssessments} total assessments
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileCheck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Prohibited */}
        <Card className={`p-5 border-2 ${data.stats.prohibited > 0 ? 'border-red-300 bg-red-50' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prohibited Systems</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{data.stats.prohibited}</p>
              {data.stats.prohibited > 0 && (
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

        {/* High Risk */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High-Risk Systems</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">{data.stats.highRisk}</p>
              <p className="text-xs text-gray-500 mt-1">
                Compliance required
              </p>
            </div>
            <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>

        {/* Assessment Rate */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assessment Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{assessmentRate}%</p>
              <p className="text-xs text-gray-500 mt-1">
                {data.stats.notAssessed} systems pending
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Info className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Limited Risk</p>
              <p className="text-xl font-bold text-gray-900">{data.stats.limitedRisk}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Minimal Risk</p>
              <p className="text-xl font-bold text-gray-900">{data.stats.minimalRisk}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Not Yet Assessed</p>
              <p className="text-xl font-bold text-gray-900">{data.stats.notAssessed}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search systems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value={RiskClassification.PROHIBITED}>Prohibited</SelectItem>
              <SelectItem value={RiskClassification.HIGH_RISK}>High Risk</SelectItem>
              <SelectItem value={RiskClassification.LIMITED_RISK}>Limited Risk</SelectItem>
              <SelectItem value={RiskClassification.MINIMAL_RISK}>Minimal Risk</SelectItem>
              <SelectItem value={RiskClassification.NOT_YET_ASSESSED}>Not Yet Assessed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={assessmentFilter} onValueChange={setAssessmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Assessment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Systems</SelectItem>
              <SelectItem value="assessed">Assessed</SelectItem>
              <SelectItem value="not_assessed">Not Assessed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredSystems.length} of {data.systems.length} systems
        </div>
      </Card>

      {/* Systems Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  System Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Classification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assessment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSystems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No systems found matching your filters
                  </td>
                </tr>
              ) : (
                filteredSystems.map((system) => {
                  const latestAssessment = system.euAIActAssessments[0];
                  return (
                    <tr key={system.system_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/ai-systems/${system.system_id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {system.system_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {system.business_owner}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskColor(system.risk_classification)}`}>
                          {getRiskIcon(system.risk_classification)}
                          {system.risk_classification.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {latestAssessment ? (
                          <div>
                            <p className="font-medium text-green-600">Assessed</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(latestAssessment.assessment_date)} by {latestAssessment.assessed_by}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-500">Not assessed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(system.last_modified)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link href={`/ai-systems/${system.system_id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
