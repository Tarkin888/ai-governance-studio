'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SearchFilterBarProps {
  onSearch: (value: string) => void
  onRiskFilter: (value: string) => void
  onStatusFilter: (value: string) => void
  onAddNew: () => void
  onExport: () => void
  resultsCount: number
  searchValue: string
  riskValue: string
  statusValue: string
  isTrueEmptyState?: boolean
}

export function SearchFilterBar({
  onSearch,
  onRiskFilter,
  onStatusFilter,
  onAddNew,
  onExport,
  resultsCount,
  searchValue,
  riskValue,
  statusValue,
  isTrueEmptyState = false,
}: SearchFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue ?? '')

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(localSearch ?? '')
    }, 300)

    return () => clearTimeout(timer)
  }, [localSearch, onSearch])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, purpose, or owner..."
            value={localSearch ?? ''}
            onChange={(e) => setLocalSearch(e?.target?.value ?? '')}
            className="pl-10"
          />
        </div>

        {/* Risk Filter */}
        <div className="w-full lg:w-48">
          <Select 
            value={riskValue ?? 'all'} 
            onValueChange={(val) => onRiskFilter?.(val === 'all' ? '' : val)}
            disabled={isTrueEmptyState}
          >
            <SelectTrigger 
              className="disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <SelectValue placeholder="All Risks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="NOT_YET_ASSESSED">Not Yet Assessed</SelectItem>
              <SelectItem value="MINIMAL_RISK">Minimal Risk</SelectItem>
              <SelectItem value="LIMITED_RISK">Limited Risk</SelectItem>
              <SelectItem value="HIGH_RISK">High Risk</SelectItem>
              <SelectItem value="PROHIBITED">Prohibited</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-48">
          <Select 
            value={statusValue ?? 'all'} 
            onValueChange={(val) => onStatusFilter?.(val === 'all' ? '' : val)}
            disabled={isTrueEmptyState}
          >
            <SelectTrigger 
              className="disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="DEVELOPMENT">Development</SelectItem>
              <SelectItem value="TESTING">Testing</SelectItem>
              <SelectItem value="PRODUCTION">Production</SelectItem>
              <SelectItem value="RETIRED">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{resultsCount ?? 0}</span> system{resultsCount !== 1 ? 's' : ''} found
        </div>

        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onExport}
                    disabled={resultsCount === 0}
                    className="gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </span>
              </TooltipTrigger>
              {resultsCount === 0 && (
                <TooltipContent side="bottom">
                  <p>No systems available to export. Add an AI system first.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <Button
            size="sm"
            onClick={onAddNew}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add New AI System
          </Button>
        </div>
      </div>
    </div>
  )
}
