export type Expense = {
  id: string
  amount: number
  category: string
  description: string
  date: Date
}

export type ExpenseFormData = Omit<Expense, 'id' | 'date'> & {
  date: string
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Other'
] as const

export type DateRange = {
  from: Date | undefined
  to: Date | undefined

  // Module 6: Vendor Risk Assessment & AI System Types
  }

export type VendorStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_REVIEW' | 'TERMINATED'
export type RiskTier = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type ApprovalDecision = 'APPROVED' | 'REJECTED' | 'CONDITIONAL' | 'PENDING'

export type Vendor = {
  id: string
  name: string
  description?: string
  website?: string
  contact_email?: string
  status: VendorStatus
  current_risk_tier: RiskTier
  last_assessment_date?: Date
  next_assessment_due?: Date
  created_at: Date
  updated_at: Date
}

export type VendorAssessment = {
  id: string
  vendor_id: string
  assessment_date: Date
  next_assessment_due: Date
  current_risk_tier: RiskTier
  recommendations?: any
  approval_decision?: ApprovalDecision
  approval_conditions?: any
  questionnaire_responses?: any
  created_at: Date
  updated_at: Date
}

export type AISystemStatus = 'PLANNING' | 'DEVELOPMENT' | 'TESTING' | 'DEPLOYED' | 'RETIRED'
export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export type AISystem = {
  id: string
  name: string
  description?: string
  vendor_id: string
  system_type: string
  deployment_date?: Date
  status: AISystemStatus
  risk_level: RiskLevel
  use_case?: string
  data_processed?: string
  regulatory_classification?: string
  created_at: Date
  updated_at: Date
}
