'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatEnumValue, formatTimestamp, getRiskColor, truncateText } from '@/lib/format-utils'
import { cn } from '@/lib/utils'

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

interface InventoryTableProps {
  systems: AISystem[]
  onEdit: (system: AISystem) => void
  onAddNew: () => void
}

export function InventoryTable({ systems, onEdit, onAddNew }: InventoryTableProps) {
  const router = useRouter()
  const [sortColumn, setSortColumn] = useState<string | null>('last_modified')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Three-state cycle: asc → desc → no sort (return to default)
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        // Remove sort, return to default
        setSortColumn('last_modified')
        setSortDirection('desc')
      }
    } else {
      // First click on a different column: sort ascending
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3 text-blue-600" /> 
      : <ArrowDown className="h-3 w-3 text-blue-600" />
  }

  const sortedSystems = [...(systems ?? [])]?.sort((a, b) => {
    if (!sortColumn) return 0
    
    const aVal = a?.[sortColumn as keyof AISystem]
    const bVal = b?.[sortColumn as keyof AISystem]
    
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  const handleRowClick = (systemId: string) => {
    router?.push(`/ai-systems/${systemId}`)
  }

  if (!systems || systems?.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[500px] py-12">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 max-w-[600px] text-center">
          {/* Large Icon */}
          <div className="mb-6">
            <Database className="h-24 w-24 text-blue-500 mx-auto" />
          </div>
          
          {/* Primary Messaging */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            No AI Systems Yet
          </h2>
          <p className="text-base text-gray-600 mb-6">
            Start building your ISO 42001 compliance inventory by documenting your first AI system.
          </p>
          
          {/* Helpful Context */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Track AI systems across your organization including:
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>System purpose and ownership</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Risk classifications (EU AI Act compliance)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Deployment status and data processing details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Bias testing and fairness assessments</span>
              </li>
            </ul>
          </div>
          
          {/* Prominent CTA Button */}
          <Button
            size="lg"
            onClick={onAddNew}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            Add Your First AI System
          </Button>
          
          {/* Secondary Help Link */}
          <div className="mt-6">
            <a
              href="https://www.iso.org/standard/81230.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-blue-600 hover:underline transition-colors"
            >
              Learn about ISO 42001 requirements
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('system_name')}
                  className={cn(
                    "flex items-center gap-2 text-xs uppercase tracking-wider transition-colors",
                    sortColumn === 'system_name'
                      ? "font-semibold text-blue-600 hover:text-blue-700"
                      : "font-medium text-gray-700 hover:text-gray-900"
                  )}
                >
                  System Name
                  {getSortIcon('system_name')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Purpose
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('business_owner')}
                  className={cn(
                    "flex items-center gap-2 text-xs uppercase tracking-wider transition-colors",
                    sortColumn === 'business_owner'
                      ? "font-semibold text-blue-600 hover:text-blue-700"
                      : "font-medium text-gray-700 hover:text-gray-900"
                  )}
                >
                  Business Owner
                  {getSortIcon('business_owner')}
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('risk_classification')}
                  className={cn(
                    "flex items-center gap-2 text-xs uppercase tracking-wider transition-colors",
                    sortColumn === 'risk_classification'
                      ? "font-semibold text-blue-600 hover:text-blue-700"
                      : "font-medium text-gray-700 hover:text-gray-900"
                  )}
                >
                  Risk Classification
                  {getSortIcon('risk_classification')}
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('deployment_status')}
                  className={cn(
                    "flex items-center gap-2 text-xs uppercase tracking-wider transition-colors",
                    sortColumn === 'deployment_status'
                      ? "font-semibold text-blue-600 hover:text-blue-700"
                      : "font-medium text-gray-700 hover:text-gray-900"
                  )}
                >
                  Status
                  {getSortIcon('deployment_status')}
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('last_modified')}
                  className={cn(
                    "flex items-center gap-2 text-xs uppercase tracking-wider transition-colors",
                    sortColumn === 'last_modified'
                      ? "font-semibold text-blue-600 hover:text-blue-700"
                      : "font-medium text-gray-700 hover:text-gray-900"
                  )}
                >
                  Last Modified
                  {getSortIcon('last_modified')}
                </button>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedSystems?.map((system) => (
              <tr
                key={system?.system_id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleRowClick(system?.system_id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    {system?.system_name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-md">
                    {truncateText(system?.system_purpose, 100)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{system?.business_owner}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border',
                      getRiskColor(system?.risk_classification)
                    )}
                  >
                    {formatEnumValue(system?.risk_classification)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatEnumValue(system?.deployment_status)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatTimestamp(system?.last_modified)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e?.stopPropagation()
                        handleRowClick(system?.system_id)
                      }}
                      className="gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e?.stopPropagation()
                        onEdit?.(system)
                      }}
                      className="gap-1"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Database({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  )
}
