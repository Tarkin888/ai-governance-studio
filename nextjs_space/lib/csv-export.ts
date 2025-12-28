import { formatDate, formatTimestamp, formatAIModelType, formatProcessingVolume, formatRiskClassification, formatEnumValue } from './format-utils'

export interface AISystemExport {
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

export const generateCSV = (systems: AISystemExport[]): string => {
  const headers = [
    'System ID',
    'System Name',
    'System Purpose',
    'Business Owner',
    'Technical Owner',
    'AI Model Type',
    'Deployment Status',
    'Deployment Date',
    'Data Sources',
    'Vendor/Provider',
    'Integration Points',
    'Processing Volume',
    'Risk Classification',
    'Date Added',
    'Last Modified',
    'Modified By'
  ]

  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (str?.includes(',') || str?.includes('"') || str?.includes('\n')) {
      return '"' + str?.replace(/"/g, '""') + '"'
    }
    return str
  }

  const rows = systems?.map(system => [
    escapeCSV(system?.system_id),
    escapeCSV(system?.system_name),
    escapeCSV(system?.system_purpose),
    escapeCSV(system?.business_owner),
    escapeCSV(system?.technical_owner),
    escapeCSV(formatAIModelType(system?.ai_model_type)),
    escapeCSV(formatEnumValue(system?.deployment_status)),
    escapeCSV(formatDate(system?.deployment_date)),
    escapeCSV(system?.data_sources?.join('; ')),
    escapeCSV(system?.vendor_provider),
    escapeCSV(system?.integration_points),
    escapeCSV(formatProcessingVolume(system?.processing_volume)),
    escapeCSV(formatRiskClassification(system?.risk_classification)),
    escapeCSV(formatTimestamp(system?.date_added)),
    escapeCSV(formatTimestamp(system?.last_modified)),
    escapeCSV(system?.modified_by)
  ]?.join(',')) ?? []

  return [headers?.join(','), ...rows]?.join('\n') ?? ''
}
