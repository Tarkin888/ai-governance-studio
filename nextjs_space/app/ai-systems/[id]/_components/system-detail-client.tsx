'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil, Trash2, Calendar, Users, Database, AlertCircle, Shield, FileCheck, GitCompare, FileText, Plus, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/app/_components/sidebar'
import { AddEditSystemModal } from '@/app/_components/add-edit-system-modal'
import { DeleteConfirmationDialog } from '@/app/_components/delete-confirmation-dialog'
import { EUAIActWizard } from '@/app/_components/eu-ai-act-wizard'
import { ModelCardWizard } from '@/app/_components/model-card-wizard'
import {
  formatDate,
  formatTimestamp,
  formatAIModelType,
  formatProcessingVolume,
  formatRiskClassification,
  formatEnumValue,
  getRiskColor,
} from '@/lib/format-utils'
import { cn } from '@/lib/utils'
import { RiskClassification } from '@prisma/client'

interface SystemDetailClientProps {
  system: {
    system_id: string
    system_name: string
    system_purpose: string
    business_owner: string
    technical_owner: string
    ai_model_type: string
    deployment_status: string
    deployment_date: string | null
    data_sources: string[]
    vendor_provider: string | null
    integration_points: string | null
    processing_volume: string
    risk_classification: string
    date_added: string
    last_modified: string
    modified_by: string
  }
}

export function SystemDetailClient({ system }: SystemDetailClientProps) {
  const router = useRouter()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAssessmentWizardOpen, setIsAssessmentWizardOpen] = useState(false)
  const [isModelCardWizardOpen, setIsModelCardWizardOpen] = useState(false)
  const [latestAssessment, setLatestAssessment] = useState<any>(null)
  const [latestModelCard, setLatestModelCard] = useState<any>(null)
  const [loadingAssessment, setLoadingAssessment] = useState(true)

  useEffect(() => {
    fetchLatestAssessment()
    fetchLatestModelCard()
  }, [system.system_id])

  const fetchLatestAssessment = async () => {
    try {
      const response = await fetch(`/api/eu-ai-act/assessments/latest/${system.system_id}`)
      if (response.ok) {
        const data = await response.json()
        setLatestAssessment(data)
      }
    } catch (error) {
      // No assessment exists yet
    } finally {
      setLoadingAssessment(false)
    }
  }

  const fetchLatestModelCard = async () => {
    try {
      const response = await fetch(`/api/model-cards/latest/${system.system_id}`)
      if (response.ok) {
        const data = await response.json()
        setLatestModelCard(data)
      }
    } catch (error) {
      // No model card exists yet
    }
  }

  const handleBack = () => {
    router?.push('/')
  }

  const handleEditSuccess = () => {
    router?.refresh()
  }

  const handleDeleteSuccess = () => {
    router?.push('/')
  }

  const handleAssessmentComplete = () => {
    setIsAssessmentWizardOpen(false)
    fetchLatestAssessment()
    router?.refresh()
  }

  const handleModelCardComplete = () => {
    setIsModelCardWizardOpen(false)
    fetchLatestModelCard()
    router?.refresh()
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Inventory
            </Button>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{system?.system_name}</h1>
                <p className="text-gray-600">Detailed information about this AI system</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(true)}
                  className="gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit System
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete System
                </Button>
              </div>
            </div>
          </div>

          {/* Risk Classification Badge & Multi-Framework Assessment */}
          <div className="mb-6 flex items-center justify-between">
            <span
              className={cn(
                'inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border-2',
                getRiskColor(system?.risk_classification)
              )}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              {formatRiskClassification(system?.risk_classification)}
            </span>
            <Link href={`/ai-systems/${system?.system_id}/regulatory`}>
              <Button className="gap-2">
                <GitCompare className="h-4 w-4" />
                Multi-Framework Assessment
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Basic Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">System Purpose</label>
                    <p className="mt-1 text-gray-900">{system?.system_purpose}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Business Owner</label>
                      <p className="mt-1 text-gray-900">{system?.business_owner}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Technical Owner</label>
                      <p className="mt-1 text-gray-900">{system?.technical_owner}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Technical Details
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">AI Model Type</label>
                    <p className="mt-1 text-gray-900">{formatAIModelType(system?.ai_model_type)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Deployment Status</label>
                    <p className="mt-1 text-gray-900">{formatEnumValue(system?.deployment_status)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Deployment Date</label>
                    <p className="mt-1 text-gray-900">{formatDate(system?.deployment_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Processing Volume</label>
                    <p className="mt-1 text-gray-900">{formatProcessingVolume(system?.processing_volume)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Vendor/Provider</label>
                    <p className="mt-1 text-gray-900">{system?.vendor_provider ?? 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Integration Points</label>
                    <p className="mt-1 text-gray-900">{system?.integration_points ?? 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Data Sources */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Data Sources
                </h2>
                {system?.data_sources?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {system?.data_sources?.map((source) => (
                      <span
                        key={source}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 border border-blue-200"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No data sources specified</p>
                )}
              </div>

              {/* EU AI Act Regulatory Compliance */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4 pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">EU AI Act Compliance</h2>
                  </div>
                  <div className="flex gap-2">
                    {latestAssessment && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAssessmentWizardOpen(true)}
                      >
                        Reassess
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => setIsAssessmentWizardOpen(true)}
                    >
                      {latestAssessment ? 'View Assessment' : 'Assess Compliance'}
                    </Button>
                  </div>
                </div>

                {loadingAssessment ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                  </div>
                ) : latestAssessment ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Risk Classification</label>
                      <div className="mt-2">
                        <span
                          className={cn(
                            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
                            getRiskColor(latestAssessment.risk_tier)
                          )}
                        >
                          {formatRiskClassification(latestAssessment.risk_tier)}
                        </span>
                      </div>
                    </div>

                    {latestAssessment.prohibited_trigger && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-900 mb-1 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Prohibited Practice Detected
                        </p>
                        <p className="text-sm text-red-800">{latestAssessment.prohibited_trigger}</p>
                      </div>
                    )}

                    {latestAssessment.high_risk_categories && latestAssessment.high_risk_categories.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">High-Risk Categories</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {latestAssessment.high_risk_categories.map((category: string) => (
                            <span
                              key={category}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-amber-100 text-amber-800 border border-amber-200"
                            >
                              {category.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {latestAssessment.compliance_requirements && latestAssessment.compliance_requirements.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">Compliance Requirements</label>
                        <ul className="space-y-1">
                          {latestAssessment.compliance_requirements.slice(0, 3).map((req: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              {req}
                            </li>
                          ))}
                          {latestAssessment.compliance_requirements.length > 3 && (
                            <li className="text-sm text-gray-500 italic">
                              +{latestAssessment.compliance_requirements.length - 3} more requirements...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="text-xs font-medium text-gray-500">Assessment Date</label>
                          <p className="text-gray-900">{formatDate(latestAssessment.assessment_date)}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">Assessed By</label>
                          <p className="text-gray-900">{latestAssessment.assessed_by}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No EU AI Act assessment has been completed yet</p>
                    <Button onClick={() => setIsAssessmentWizardOpen(true)}>
                      Start Assessment
                    </Button>
                  </div>
                )}
              </div>

              {/* Model Card Documentation */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Model Card Documentation</h2>
                  </div>
                  <div className="flex gap-2">
                    {latestModelCard && (
                      <Link href={`/model-cards/${latestModelCard.card_id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Card
                        </Button>
                      </Link>
                    )}
                    <Button
                      size="sm"
                      onClick={() => setIsModelCardWizardOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {latestModelCard ? 'Update Card' : 'Create Model Card'}
                    </Button>
                  </div>
                </div>

                {latestModelCard ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        latestModelCard.status === 'PUBLISHED' ? 'bg-purple-100 text-purple-800' :
                        latestModelCard.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        latestModelCard.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {latestModelCard.status.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-600">Version {latestModelCard.card_version}</span>
                      <span className="text-sm text-gray-600">•</span>
                      <span className="text-sm text-gray-600">
                        Last updated {formatDate(latestModelCard.last_updated)}
                      </span>
                    </div>

                    {latestModelCard.model_details_summary && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-1 block">Description</label>
                        <p className="text-sm text-gray-900 line-clamp-2">
                          {latestModelCard.model_details_summary}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {latestModelCard.model_architecture && (
                        <div>
                          <label className="text-xs font-medium text-gray-500">Architecture</label>
                          <p className="text-sm text-gray-900">{latestModelCard.model_architecture}</p>
                        </div>
                      )}
                      {latestModelCard.update_frequency && (
                        <div>
                          <label className="text-xs font-medium text-gray-500">Update Frequency</label>
                          <p className="text-sm text-gray-900">
                            {latestModelCard.update_frequency.replace('_', ' ')}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm pt-3 border-t">
                      <div>
                        <label className="text-xs font-medium text-gray-500">Updated By</label>
                        <p className="text-gray-900">{latestModelCard.updated_by}</p>
                      </div>
                      {latestModelCard.approved_by && (
                        <div>
                          <label className="text-xs font-medium text-gray-500">Approved By</label>
                          <p className="text-green-700 flex items-center gap-1">
                            <FileCheck className="h-3 w-3" />
                            {latestModelCard.approved_by}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No model card has been created yet</p>
                    <Button onClick={() => setIsModelCardWizardOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Model Card
                    </Button>
                  </div>
                )}
              </div>

              <div className="bg-gray-100 rounded-lg border border-gray-300 p-6">
                <h2 className="text-lg font-semibold text-gray-500 mb-2">Bias Testing Results</h2>
                <p className="text-sm text-gray-500">Coming soon - View bias and fairness testing outcomes</p>
              </div>

              <div className="bg-gray-100 rounded-lg border border-gray-300 p-6">
                <h2 className="text-lg font-semibold text-gray-500 mb-2">Risk Assessments</h2>
                <p className="text-sm text-gray-500">Coming soon - Detailed risk assessment history</p>
              </div>

              <div className="bg-gray-100 rounded-lg border border-gray-300 p-6">
                <h2 className="text-lg font-semibold text-gray-500 mb-2">Incident History</h2>
                <p className="text-sm text-gray-500">Coming soon - Track incidents related to this system</p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Metadata */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                  System Metadata
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">System ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{system?.system_id}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Date Added</label>
                    <p className="mt-1 text-sm text-gray-900">{formatTimestamp(system?.date_added)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Last Modified</label>
                    <p className="mt-1 text-sm text-gray-900">{formatTimestamp(system?.last_modified)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Modified By</label>
                    <p className="mt-1 text-sm text-gray-900">{system?.modified_by}</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
                <h3 className="text-sm font-semibold text-blue-900 mb-4 uppercase tracking-wide">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                      <Database className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-700">Data Sources</p>
                      <p className="text-lg font-bold text-blue-900">{system?.data_sources?.length ?? 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-700">Owners Assigned</p>
                      <p className="text-lg font-bold text-blue-900">2</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddEditSystemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        system={system}
      />
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={handleDeleteSuccess}
        systemId={system?.system_id}
        systemName={system?.system_name}
      />
      {isAssessmentWizardOpen && (
        <EUAIActWizard
          systemId={system.system_id}
          systemName={system.system_name}
          onComplete={handleAssessmentComplete}
          onCancel={() => setIsAssessmentWizardOpen(false)}
        />
      )}
      {isModelCardWizardOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
            <div className="p-6">
              <ModelCardWizard
                systemId={system.system_id}
                systemData={system}
                existingCard={latestModelCard}
                onSuccess={handleModelCardComplete}
                onCancel={() => setIsModelCardWizardOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
