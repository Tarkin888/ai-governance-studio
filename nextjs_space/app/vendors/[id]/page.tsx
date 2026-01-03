'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VendorProfile, getRiskColor, getStatusColor } from '@/types/vendor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  FileText,
  AlertCircle,
  TrendingUp,
  Shield,
  Edit,
  Trash2,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface VendorDetailProps {
  params: {
    id: string;
  };
}

export default function VendorDetailPage({ params }: VendorDetailProps) {
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchVendor();
  }, [params.id]);

  const fetchVendor = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vendors/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch vendor');
      }
      
      const data = await response.json();
      setVendor(data);
    } catch (error) {
      console.error('Error fetching vendor:', error);
      toast.error('Failed to load vendor details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/vendors/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete vendor');

      toast.success('Vendor deleted successfully');
      router.push('/vendors');
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error('Failed to delete vendor');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Vendor not found</p>
          <Button onClick={() => router.push('/vendors')} className="mt-4">
            Back to Vendors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{vendor.vendorName}</h1>
            <div className="flex items-center space-x-3 mt-2">
              <Badge className={getStatusColor(vendor.approvalStatus)}>
                {vendor.approvalStatus}
              </Badge>
              <Badge className={getStatusColor(vendor.onboardingStatus)}>
                {vendor.onboardingStatus}
              </Badge>
              {vendor.riskTier && (
                <Badge className={getRiskColor(vendor.riskTier)}>
                  {vendor.riskTier} Risk
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/vendors/${params.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            {vendor.overallRiskScore ? (
              <>
                <div className="text-2xl font-bold text-blue-600">
                  {vendor.overallRiskScore.toFixed(1)}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(vendor.overallRiskScore, 100)}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">Not assessed</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {vendor._count?.assessments || vendor.assessments?.length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Total completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {vendor.contracts?.filter((c: any) => c.status === 'Active').length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Current agreements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {vendor.incidents?.filter((i: any) => i.status === 'Open' || i.status === 'Investigating').length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Open issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessments">
            Risk Assessments ({vendor._count?.assessments || vendor.assessments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="contracts">
            Contracts ({vendor._count?.contracts || vendor.contracts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="performance">Performance Reviews</TabsTrigger>
          <TabsTrigger value="incidents">
            Incidents ({vendor._count?.incidents || vendor.incidents?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="systems">
            AI Systems ({vendor._count?.aiSystems || vendor.aiSystems?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Vendor Type</label>
                  <p className="text-gray-900 mt-1">{vendor.vendorType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Industry</label>
                  <p className="text-gray-900 mt-1">{vendor.industry}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Headquarters</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{vendor.headquarters}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Employee Count</label>
                  <p className="text-gray-900 mt-1">{vendor.employeeCount || 'Not specified'}</p>
                </div>
                {vendor.yearFounded && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Year Founded</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{vendor.yearFounded}</p>
                    </div>
                  </div>
                )}
              </div>

              {vendor.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900 mt-1">{vendor.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-blue-600" />
                <a
                  href={`mailto:${vendor.contactEmail}`}
                  className="text-blue-600 hover:underline"
                >
                  {vendor.contactEmail}
                </a>
              </div>
              {vendor.contactPhone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <a
                    href={`tel:${vendor.contactPhone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {vendor.contactPhone}
                  </a>
                </div>
              )}
              {vendor.website && (
                <div className="flex items-center space-x-3">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <a
                    href={vendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center space-x-1"
                  >
                    <span>{vendor.website}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products & Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle>Products & Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Products/Services</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {vendor.productsServices?.map((product: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {product}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">AI Capabilities</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {vendor.aiCapabilities?.map((capability: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance & Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance & Certifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  {vendor.gdprCompliant ? (
                    <Shield className="h-5 w-5 text-green-600" />
                  ) : (
                    <Shield className="h-5 w-5 text-gray-300" />
                  )}
                  <span className={vendor.gdprCompliant ? 'text-green-600' : 'text-gray-400'}>
                    GDPR Compliant
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {vendor.iso42001Certified ? (
                    <Shield className="h-5 w-5 text-green-600" />
                  ) : (
                    <Shield className="h-5 w-5 text-gray-300" />
                  )}
                  <span className={vendor.iso42001Certified ? 'text-green-600' : 'text-gray-400'}>
                    ISO 42001 Certified
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {vendor.dataProcessingAgreement ? (
                    <FileText className="h-5 w-5 text-green-600" />
                  ) : (
                    <FileText className="h-5 w-5 text-gray-300" />
                  )}
                  <span className={vendor.dataProcessingAgreement ? 'text-green-600' : 'text-gray-400'}>
                    DPA in Place
                  </span>
                </div>
              </div>

              {vendor.certifications && vendor.certifications.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Other Certifications</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {vendor.certifications.map((cert: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Assessments Tab */}
        <TabsContent value="assessments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Risk Assessments</h2>
            <Button
              onClick={() => {
                toast.info('Risk assessment form will be implemented');
                // setShowAssessmentForm(!showAssessmentForm);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </div>

          {/* Assessment History */}
          <div className="space-y-4">
            {vendor.assessments && vendor.assessments.length > 0 ? (
              vendor.assessments.map((assessment: any) => (
                <Card key={assessment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <Badge>{assessment.assessmentType}</Badge>
                          <Badge className={getRiskColor(assessment.riskLevel)}>
                            {assessment.riskLevel} Risk
                          </Badge>
                          <Badge className={getStatusColor(assessment.status)}>
                            {assessment.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                          <div>
                            <div className="text-sm text-gray-600">Security</div>
                            <div className="text-lg font-semibold text-blue-600">
                              {assessment.securityScore?.toFixed(1)}/5
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Compliance</div>
                            <div className="text-lg font-semibold text-blue-600">
                              {assessment.complianceScore?.toFixed(1)}/5
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Operational</div>
                            <div className="text-lg font-semibold text-blue-600">
                              {assessment.operationalScore?.toFixed(1)}/5
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Financial</div>
                            <div className="text-lg font-semibold text-blue-600">
                              {assessment.financialScore?.toFixed(1)}/5
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Overall</div>
                            <div className="text-lg font-semibold text-blue-600">
                              {assessment.overallScore?.toFixed(1)}/100
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-4">
                          <span className="font-medium">Assessor:</span> {assessment.assessor}
                          <span className="mx-2">•</span>
                          <span className="font-medium">Date:</span>{' '}
                          {new Date(assessment.assessmentDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No risk assessments completed yet</p>
                <Button
                  onClick={() => {
                    toast.info('Risk assessment form will be implemented');
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Assessment
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Contracts</h2>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Contract
            </Button>
          </div>

          <div className="space-y-4">
            {vendor.contracts && vendor.contracts.length > 0 ? (
              vendor.contracts.map((contract: any) => (
                <Card key={contract.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold">{contract.contractTitle}</h3>
                          <Badge className={getStatusColor(contract.status)}>
                            {contract.status}
                          </Badge>
                          <Badge variant="outline">{contract.contractType}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Contract #:</span>
                            <div className="font-medium">{contract.contractNumber}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Effective Date:</span>
                            <div className="font-medium">
                              {new Date(contract.effectiveDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Expiry Date:</span>
                            <div className="font-medium">
                              {new Date(contract.expiryDate).toLocaleDateString()}
                            </div>
                          </div>
                          {contract.contractValue && (
                            <div>
                              <span className="text-gray-600">Value:</span>
                              <div className="font-medium">
                                {contract.currency} {contract.contractValue.toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm mt-2">
                          {contract.gdprClauses && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              GDPR Clauses
                            </Badge>
                          )}
                          {contract.rightToAudit && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Right to Audit
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No contracts on file</p>
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Contract
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Other tabs placeholder */}
        <TabsContent value="performance">
          <div className="text-center py-12 border rounded-lg">
            <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Performance reviews coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="incidents">
          <div className="space-y-4">
            {vendor.incidents && vendor.incidents.length > 0 ? (
              vendor.incidents.map((incident: any) => (
                <Card key={incident.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">{incident.incidentType}</Badge>
                          <Badge
                            className={
                              incident.severity === 'Critical'
                                ? 'bg-red-100 text-red-700'
                                : incident.severity === 'High'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }
                          >
                            {incident.severity}
                          </Badge>
                          <Badge className={getStatusColor(incident.status)}>
                            {incident.status}
                          </Badge>
                        </div>
                        <p className="text-gray-900">{incident.description}</p>
                        <div className="text-sm text-gray-600">
                          {new Date(incident.incidentDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No incidents reported</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="systems">
          <div className="space-y-4">
            {vendor.aiSystems && vendor.aiSystems.length > 0 ? (
              vendor.aiSystems.map((system: any) => (
                <Card key={system.system_id || system.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{system.system_name || system.systemName}</h3>
                        <p className="text-gray-600 text-sm mt-1">{system.system_purpose || system.purpose}</p>
                        <Badge variant="outline" className="mt-2">
                          {system.deployment_status || system.deploymentStatus}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/ai-systems/${system.system_id || system.id}`)}
                      >
                        View System
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No AI systems linked to this vendor</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
