'use client'

import { useState, useEffect } from 'react'
import { SearchFilterBar } from './search-filter-bar'
import { InventoryTable } from './inventory-table'
import { AddEditSystemModal } from './add-edit-system-modal'
import { Loader2 } from 'lucide-react'

interface AISystem {
  system_id: string
  system_name: string
  system_purpose: string
  business_owner: string
  technical_owner: string
  ai_model_type: string
  deployment_status: string
  deployment_date: string | Date | null
  data_sources: string[]
  vendor_provider: string | null
  integration_points: string | null
  processing_volume: string
  risk_classification: string
  date_added: string | Date
  last_modified: string | Date
  modified_by: string
}

export function InventoryPageClient() {
  const [systems, setSystems] = useState<AISystem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState('')
  const [riskFilter, setRiskFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSystem, setEditingSystem] = useState<AISystem | null>(null)

  const fetchSystems = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchValue) params?.append('search', searchValue)
      if (riskFilter) params?.append('risk', riskFilter)
      if (statusFilter) params?.append('status', statusFilter)

      const response = await fetch(`/api/ai-systems?${params?.toString()}`)
      const data = await response?.json()

      if (data?.success) {
        setSystems(data?.data ?? [])
      }
    } catch (error) {
      console.error('Error fetching systems:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSystems()
  }, [searchValue, riskFilter, statusFilter])

  const handleAddNew = () => {
    setEditingSystem(null)
    setIsModalOpen(true)
  }

  const handleEdit = (system: AISystem) => {
    setEditingSystem(system)
    setIsModalOpen(true)
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (searchValue) params?.append('search', searchValue)
      if (riskFilter) params?.append('risk', riskFilter)
      if (statusFilter) params?.append('status', statusFilter)

      const response = await fetch(`/api/ai-systems/export?${params?.toString()}`)
      const blob = await response?.blob()
      const url = window?.URL?.createObjectURL(blob)
      const a = document?.createElement('a')
      a.href = url
      a.download = `ai-systems-export-${new Date()?.toISOString()?.split('T')?.[0]}.csv`
      document?.body?.appendChild(a)
      a?.click()
      window?.URL?.revokeObjectURL(url)
      document?.body?.removeChild(a)
    } catch (error) {
      console.error('Error exporting:', error)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingSystem(null)
  }

  const handleSuccess = () => {
    fetchSystems()
  }

  // True empty state: no filters applied AND no systems exist
  const isTrueEmptyState = !searchValue && !riskFilter && !statusFilter && systems.length === 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI System Inventory</h1>
        <p className="text-gray-600">
          Manage and track all AI systems across your organization for ISO 42001 compliance.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6">
        <SearchFilterBar
          onSearch={setSearchValue}
          onRiskFilter={setRiskFilter}
          onStatusFilter={setStatusFilter}
          onAddNew={handleAddNew}
          onExport={handleExport}
          resultsCount={systems?.length ?? 0}
          searchValue={searchValue}
          riskValue={riskFilter}
          statusValue={statusFilter}
          isTrueEmptyState={isTrueEmptyState}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <InventoryTable 
          systems={systems ?? []} 
          onEdit={handleEdit} 
          onAddNew={handleAddNew}
        />
      )}

      {/* Add/Edit Modal */}
      <AddEditSystemModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        system={editingSystem}
      />
    </div>
  )
}
