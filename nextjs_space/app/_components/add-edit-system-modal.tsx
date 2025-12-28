'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'

interface AISystem {
  system_id?: string
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
  modified_by: string
}

interface AddEditSystemModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  system?: AISystem | null
}

const DATA_SOURCE_OPTIONS = [
  'Customer Data',
  'Public Data',
  'Synthetic Data',
  'Third-Party API',
  'Internal Systems',
  'Sensor Data',
]

export function AddEditSystemModal({
  isOpen,
  onClose,
  onSuccess,
  system,
}: AddEditSystemModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Omit<AISystem, 'deployment_date'> & { deployment_date: string | null }>({
    system_name: '',
    system_purpose: '',
    business_owner: '',
    technical_owner: '',
    ai_model_type: 'LARGE_LANGUAGE_MODEL',
    deployment_status: 'DEVELOPMENT',
    deployment_date: null,
    data_sources: [],
    vendor_provider: null,
    integration_points: null,
    processing_volume: 'LESS_THAN_1000',
    risk_classification: 'NOT_YET_ASSESSED',
    modified_by: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  useEffect(() => {
    if (system) {
      const dateStr = system?.deployment_date 
        ? (typeof system.deployment_date === 'string' 
            ? new Date(system.deployment_date)?.toISOString()?.split('T')?.[0] 
            : system.deployment_date?.toISOString()?.split('T')?.[0])
        : null
      
      setFormData({
        ...system,
        deployment_date: dateStr ?? null,
      })
    } else {
      setFormData({
        system_name: '',
        system_purpose: '',
        business_owner: '',
        technical_owner: '',
        ai_model_type: 'LARGE_LANGUAGE_MODEL',
        deployment_status: 'DEVELOPMENT',
        deployment_date: null,
        data_sources: [],
        vendor_provider: null,
        integration_points: null,
        processing_volume: 'LESS_THAN_1000',
        risk_classification: 'NOT_YET_ASSESSED',
        modified_by: '',
      })
    }
    setErrors({})
    setTouched({})
    setAttemptedSubmit(false)
  }, [system, isOpen])

  // Field-level validation
  const validateField = (fieldName: string, value: any): string => {
    switch (fieldName) {
      case 'system_name':
        if (!value?.trim()) return 'System name is required'
        if (value?.length > 200) return 'Maximum 200 characters'
        return ''
      case 'system_purpose':
        if (!value?.trim()) return 'System purpose is required'
        if (value?.trim().length < 20) return 'Minimum 20 characters required'
        if (value?.length > 1000) return 'Maximum 1000 characters'
        return ''
      case 'business_owner':
        if (!value?.trim()) return 'Business owner is required'
        return ''
      case 'technical_owner':
        if (!value?.trim()) return 'Technical owner is required'
        return ''
      case 'modified_by':
        if (!value?.trim()) return 'Modified by is required'
        return ''
      default:
        return ''
    }
  }

  // Validate all fields
  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {}
    const requiredFields = ['system_name', 'system_purpose', 'business_owner', 'technical_owner', 'modified_by']
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData])
      if (error) newErrors[field] = error
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Real-time validation as user types
  useEffect(() => {
    if (attemptedSubmit) {
      const newErrors: Record<string, string> = {}
      const requiredFields = ['system_name', 'system_purpose', 'business_owner', 'technical_owner', 'modified_by']
      
      requiredFields.forEach(field => {
        const error = validateField(field, formData[field as keyof typeof formData])
        if (error) newErrors[field] = error
      })
      
      setErrors(newErrors)
    }
  }, [formData, attemptedSubmit])

  // Calculate validation state
  const requiredFields = ['system_name', 'system_purpose', 'business_owner', 'technical_owner', 'modified_by']
  const validFields = useMemo(() => {
    return requiredFields.filter(field => !validateField(field, formData[field as keyof typeof formData]))
  }, [formData])
  
  const invalidFieldCount = requiredFields.length - validFields.length
  const isFormValid = invalidFieldCount === 0

  // Field state helper
  const getFieldState = (fieldName: string) => {
    const hasError = errors[fieldName]
    const isTouched = touched[fieldName] || attemptedSubmit
    const value = formData[fieldName as keyof typeof formData]
    const isValid = !validateField(fieldName, value)
    
    return {
      showError: hasError && isTouched,
      showSuccess: isValid && isTouched && value,
      borderClass: hasError && isTouched ? 'border-red-500' : isValid && isTouched && value ? 'border-green-500' : ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault()
    setAttemptedSubmit(true)

    if (!validateAll()) {
      // Mark all fields as touched
      const allTouched: Record<string, boolean> = {}
      requiredFields.forEach(field => allTouched[field] = true)
      setTouched(allTouched)
      
      toast?.({
        title: 'Validation Error',
        description: `Please fix ${invalidFieldCount} error${invalidFieldCount > 1 ? 's' : ''} before submitting`,
        variant: 'destructive',
      })
      
      // Scroll to first error
      const firstErrorField = document.querySelector('.border-red-500') as HTMLElement
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setLoading(true)

    try {
      const url = system?.system_id
        ? `/api/ai-systems/${system?.system_id}`
        : '/api/ai-systems'
      const method = system?.system_id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response?.json()

      if (!response?.ok || !data?.success) {
        throw new Error(data?.error ?? 'Failed to save system')
      }

      toast?.({
        title: 'Success',
        description: system?.system_id
          ? 'AI system updated successfully'
          : 'AI system created successfully',
      })

      onSuccess?.()
      onClose?.()
    } catch (error: any) {
      toast?.({
        title: 'Error',
        description: error?.message ?? 'Failed to save AI system',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDataSourceToggle = (source: string) => {
    const current = formData?.data_sources ?? []
    const updated = current?.includes(source)
      ? current?.filter((s) => s !== source)
      : [...current, source]
    setFormData({ ...formData, data_sources: updated })
  }

  const handleBlur = (fieldName: string) => {
    setTouched({ ...touched, [fieldName]: true })
    const error = validateField(fieldName, formData[fieldName as keyof typeof formData])
    if (error) {
      setErrors({ ...errors, [fieldName]: error })
    } else {
      const newErrors = { ...errors }
      delete newErrors[fieldName]
      setErrors(newErrors)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {system?.system_id ? 'Edit AI System' : 'Add New AI System'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Validation Summary */}
        {attemptedSubmit && (
          <div className={`mx-6 mt-6 p-4 rounded-lg ${isFormValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2">
              {isFormValid ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">All required fields completed ✓</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    Please complete {invalidFieldCount} required field{invalidFieldCount > 1 ? 's' : ''}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>

            <div>
              <Label htmlFor="system_name">
                System Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="system_name"
                  value={formData?.system_name ?? ''}
                  onChange={(e) => setFormData({ ...formData, system_name: e?.target?.value ?? '' })}
                  onBlur={() => handleBlur('system_name')}
                  className={`pr-10 ${getFieldState('system_name').borderClass}`}
                  maxLength={200}
                />
                {getFieldState('system_name').showSuccess && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                )}
                {getFieldState('system_name').showError && (
                  <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-red-500">{getFieldState('system_name').showError ? errors?.system_name : ''}</span>
                <span className="text-xs text-gray-500">{formData?.system_name?.length ?? 0}/200</span>
              </div>
            </div>

            <div>
              <Label htmlFor="system_purpose">
                System Purpose <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Textarea
                  id="system_purpose"
                  value={formData?.system_purpose ?? ''}
                  onChange={(e) => setFormData({ ...formData, system_purpose: e?.target?.value ?? '' })}
                  onBlur={() => handleBlur('system_purpose')}
                  className={`pr-10 ${getFieldState('system_purpose').borderClass}`}
                  rows={4}
                  maxLength={1000}
                />
                {getFieldState('system_purpose').showSuccess && (
                  <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-green-600" />
                )}
                {getFieldState('system_purpose').showError && (
                  <XCircle className="absolute right-3 top-3 h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1 mb-1">
                Describe what this AI system does and its business value (minimum 20 characters)
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-red-500">{getFieldState('system_purpose').showError ? errors?.system_purpose : ''}</span>
                <span className="text-xs text-gray-500">{formData?.system_purpose?.length ?? 0}/1000</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business_owner">
                  Business Owner <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="business_owner"
                    value={formData?.business_owner ?? ''}
                    onChange={(e) => setFormData({ ...formData, business_owner: e?.target?.value ?? '' })}
                    onBlur={() => handleBlur('business_owner')}
                    className={`pr-10 ${getFieldState('business_owner').borderClass}`}
                  />
                  {getFieldState('business_owner').showSuccess && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                  )}
                  {getFieldState('business_owner').showError && (
                    <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                  )}
                </div>
                {getFieldState('business_owner').showError && (
                  <span className="text-xs text-red-500 mt-1 block">{errors?.business_owner}</span>
                )}
              </div>

              <div>
                <Label htmlFor="technical_owner">
                  Technical Owner <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="technical_owner"
                    value={formData?.technical_owner ?? ''}
                    onChange={(e) => setFormData({ ...formData, technical_owner: e?.target?.value ?? '' })}
                    onBlur={() => handleBlur('technical_owner')}
                    className={`pr-10 ${getFieldState('technical_owner').borderClass}`}
                  />
                  {getFieldState('technical_owner').showSuccess && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                  )}
                  {getFieldState('technical_owner').showError && (
                    <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                  )}
                </div>
                {getFieldState('technical_owner').showError && (
                  <span className="text-xs text-red-500 mt-1 block">{errors?.technical_owner}</span>
                )}
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Technical Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ai_model_type">
                  AI Model Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData?.ai_model_type ?? ''}
                  onValueChange={(value) => setFormData({ ...formData, ai_model_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LARGE_LANGUAGE_MODEL">Large Language Model</SelectItem>
                    <SelectItem value="COMPUTER_VISION">Computer Vision</SelectItem>
                    <SelectItem value="PREDICTIVE_ANALYTICS">Predictive Analytics</SelectItem>
                    <SelectItem value="NATURAL_LANGUAGE_PROCESSING">Natural Language Processing</SelectItem>
                    <SelectItem value="RECOMMENDER_SYSTEM">Recommender System</SelectItem>
                    <SelectItem value="ROBOTICS_AUTONOMOUS">Robotics/Autonomous</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="deployment_status">
                  Deployment Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData?.deployment_status ?? ''}
                  onValueChange={(value) => setFormData({ ...formData, deployment_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEVELOPMENT">Development</SelectItem>
                    <SelectItem value="TESTING">Testing</SelectItem>
                    <SelectItem value="PRODUCTION">Production</SelectItem>
                    <SelectItem value="RETIRED">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deployment_date">Deployment Date</Label>
                <Input
                  id="deployment_date"
                  type="date"
                  value={formData?.deployment_date ?? ''}
                  onChange={(e) => setFormData({ ...formData, deployment_date: e?.target?.value || null })}
                />
              </div>

              <div>
                <Label htmlFor="processing_volume">
                  Processing Volume <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData?.processing_volume ?? ''}
                  onValueChange={(value) => setFormData({ ...formData, processing_volume: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LESS_THAN_1000">Less than 1,000 requests/day</SelectItem>
                    <SelectItem value="FROM_1000_TO_10000">1,000-10,000 requests/day</SelectItem>
                    <SelectItem value="FROM_10000_TO_100000">10,000-100,000 requests/day</SelectItem>
                    <SelectItem value="OVER_100000">Over 100,000 requests/day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="risk_classification">
                Risk Classification <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData?.risk_classification ?? ''}
                onValueChange={(value) => setFormData({ ...formData, risk_classification: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOT_YET_ASSESSED">Not Yet Assessed</SelectItem>
                  <SelectItem value="MINIMAL_RISK">Minimal Risk</SelectItem>
                  <SelectItem value="LIMITED_RISK">Limited Risk</SelectItem>
                  <SelectItem value="HIGH_RISK">High Risk</SelectItem>
                  <SelectItem value="PROHIBITED">Prohibited</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vendor_provider">Vendor/Provider</Label>
                <Input
                  id="vendor_provider"
                  value={formData?.vendor_provider ?? ''}
                  onChange={(e) => setFormData({ ...formData, vendor_provider: e?.target?.value || null })}
                />
              </div>

              <div>
                <Label htmlFor="integration_points">Integration Points</Label>
                <Input
                  id="integration_points"
                  value={formData?.integration_points ?? ''}
                  onChange={(e) => setFormData({ ...formData, integration_points: e?.target?.value || null })}
                />
              </div>
            </div>
          </div>

          {/* Data & Processing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Data & Processing</h3>

            <div>
              <Label>Data Sources</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {DATA_SOURCE_OPTIONS?.map((source) => (
                  <div key={source} className="flex items-center space-x-2">
                    <Checkbox
                      id={source}
                      checked={formData?.data_sources?.includes(source) ?? false}
                      onCheckedChange={() => handleDataSourceToggle(source)}
                    />
                    <label
                      htmlFor={source}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {source}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="modified_by">
                Modified By <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="modified_by"
                  value={formData?.modified_by ?? ''}
                  onChange={(e) => setFormData({ ...formData, modified_by: e?.target?.value ?? '' })}
                  onBlur={() => handleBlur('modified_by')}
                  placeholder="Enter your name"
                  className={`pr-10 ${getFieldState('modified_by').borderClass}`}
                />
                {getFieldState('modified_by').showSuccess && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                )}
                {getFieldState('modified_by').showError && (
                  <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                )}
              </div>
              {getFieldState('modified_by').showError && (
                <span className="text-xs text-red-500 mt-1 block">{errors?.modified_by}</span>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={loading || (!isFormValid && attemptedSubmit)}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {system?.system_id ? 'Update System' : 'Create System'}
                  </Button>
                </span>
              </TooltipTrigger>
              {!isFormValid && attemptedSubmit && (
                <TooltipContent side="top">
                  <p>Please complete all required fields</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
