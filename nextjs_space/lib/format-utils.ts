import { format } from 'date-fns'

// Format enum values for display
export const formatEnumValue = (value: string): string => {
  return value
    ?.split('_')
    ?.map(word => word?.charAt(0)?.toUpperCase() + word?.slice(1)?.toLowerCase())
    ?.join(' ') ?? 'N/A'
}

// Format AI Model Type
export const formatAIModelType = (value: string): string => {
  const mapping: Record<string, string> = {
    'LARGE_LANGUAGE_MODEL': 'Large Language Model',
    'COMPUTER_VISION': 'Computer Vision',
    'PREDICTIVE_ANALYTICS': 'Predictive Analytics',
    'NATURAL_LANGUAGE_PROCESSING': 'Natural Language Processing',
    'RECOMMENDER_SYSTEM': 'Recommender System',
    'ROBOTICS_AUTONOMOUS': 'Robotics/Autonomous',
    'OTHER': 'Other',
  }
  return mapping?.[value] ?? value ?? 'N/A'
}

// Format Processing Volume
export const formatProcessingVolume = (value: string): string => {
  const mapping: Record<string, string> = {
    'LESS_THAN_1000': 'Less than 1,000 requests/day',
    'FROM_1000_TO_10000': '1,000-10,000 requests/day',
    'FROM_10000_TO_100000': '10,000-100,000 requests/day',
    'OVER_100000': 'Over 100,000 requests/day',
  }
  return mapping?.[value] ?? value ?? 'N/A'
}

// Format Risk Classification
export const formatRiskClassification = (value: string): string => {
  const mapping: Record<string, string> = {
    'NOT_YET_ASSESSED': 'Not Yet Assessed',
    'MINIMAL_RISK': 'Minimal Risk',
    'LIMITED_RISK': 'Limited Risk',
    'HIGH_RISK': 'High Risk',
    'PROHIBITED': 'Prohibited',
  }
  return mapping?.[value] ?? value ?? 'N/A'
}

// Get risk classification color
export const getRiskColor = (risk: string): string => {
  const colors: Record<string, string> = {
    'NOT_YET_ASSESSED': 'bg-gray-100 text-gray-700 border-gray-300',
    'MINIMAL_RISK': 'bg-green-100 text-green-700 border-green-300',
    'LIMITED_RISK': 'bg-amber-100 text-amber-700 border-amber-300',
    'HIGH_RISK': 'bg-red-100 text-red-700 border-red-300',
    'PROHIBITED': 'bg-red-200 text-red-900 border-red-400',
  }
  return colors?.[risk] ?? colors['NOT_YET_ASSESSED'] ?? 'bg-gray-100 text-gray-700'
}

// Format date
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A'
  try {
    return format(new Date(date), 'MMM dd, yyyy')
  } catch {
    return 'Invalid date'
  }
}

// Format timestamp
export const formatTimestamp = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A'
  try {
    return format(new Date(date), 'MMM dd, yyyy HH:mm')
  } catch {
    return 'Invalid date'
  }
}

// Truncate text
export const truncateText = (text: string | null | undefined, maxLength: number): string => {
  if (!text) return 'N/A'
  if (text?.length <= maxLength) return text
  return text?.substring(0, maxLength) + '...' ?? 'N/A'
}
