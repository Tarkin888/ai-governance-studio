import type {
  Vendor,
  VendorAssessment,
  VendorContract,
  VendorDocument,
  VendorComplianceCheck,
  VendorRiskTier,
  VendorAssessmentStatus,
  VendorStatus,
  ContractStatus,
  DocumentType,
  DocumentStatus,
  VendorComplianceStatus,
} from '@prisma/client'

// Serialized types for client components
export type SerializedVendor = Omit<
  Vendor,
  'date_added' | 'last_modified' | 'last_assessment_date' | 'next_assessment_due'
> & {
  date_added: string
  last_modified: string
  last_assessment_date: string | null
  next_assessment_due: string | null
}

export type SerializedVendorAssessment = Omit<
  VendorAssessment,
  'assessment_date'
> & {
  assessment_date: string
}

export type SerializedVendorContract = Omit<
  VendorContract,
  'contract_start_date' | 'contract_end_date' | 'date_added' | 'last_modified'
> & {
  contract_start_date: string
  contract_end_date: string
  date_added: string
  last_modified: string
}

export type SerializedVendorDocument = Omit<
  VendorDocument,
  'issue_date' | 'expiry_date' | 'uploaded_date'
> & {
  issue_date: string | null
  expiry_date: string | null
  uploaded_date: string
}

export type SerializedVendorComplianceCheck = Omit<
  VendorComplianceCheck,
  'check_date' | 'next_check_date'
> & {
  check_date: string
  next_check_date: string | null
}

// Input types for create operations
export interface CreateVendorInput {
  vendor_name: string
  legal_entity_name?: string | null
  website?: string | null
  headquarters_location?: string | null
  primary_contact_name?: string | null
  primary_contact_email?: string | null
  primary_contact_phone?: string | null
  vendor_status?: VendorStatus
  services_provided?: string[]
  industries_served?: string[]
  company_size?: string | null
  years_in_business?: number | null
  notes?: string | null
}

export interface UpdateVendorInput extends Partial<CreateVendorInput> {
  vendor_id: string
}

export interface CreateAssessmentInput {
  vendor_id: string
  assessed_by: string
  assessment_status?: VendorAssessmentStatus
  security_score: number
  privacy_score: number
  ai_ethics_score: number
  reliability_score: number
  compliance_score: number
  transparency_score: number
  strengths?: string[]
  weaknesses?: string[]
  red_flags?: string[]
  recommendations?: string[]
  risk_tier?: VendorRiskTier
  approval_decision?: string | null
  approval_conditions?: string | null
  questionnaire_responses?: any
}

export interface UpdateAssessmentInput extends Partial<CreateAssessmentInput> {
  assessment_id: string
}

export interface CreateContractInput {
  vendor_id: string
  contract_title: string
  contract_start_date: Date | string
  contract_end_date: Date | string
  contract_value?: number | null
  currency?: string | null
  auto_renewal?: boolean
  renewal_notice_days?: number | null
  contract_status?: ContractStatus
  payment_terms?: string | null
  sla_uptime_guarantee?: number | null
  data_processing_agreement?: boolean
  termination_clause?: string | null
  liability_cap?: number | null
  notes?: string | null
}

export interface UpdateContractInput extends Partial<CreateContractInput> {
  contract_id: string
}

export interface CreateDocumentInput {
  vendor_id: string
  document_title: string
  document_type: DocumentType
  file_url: string
  file_size_bytes?: number | null
  issue_date?: Date | string | null
  expiry_date?: Date | string | null
  uploaded_by: string
  document_status?: DocumentStatus
  notes?: string | null
}

export interface UpdateDocumentInput extends Partial<CreateDocumentInput> {
  document_id: string
}

export interface CreateComplianceCheckInput {
  vendor_id: string
  framework_name: string
  checked_by: string
  compliance_status?: VendorComplianceStatus
  compliant_items_count?: number
  non_compliant_items_count?: number
  not_applicable_items_count?: number
  critical_findings?: string[]
  major_findings?: string[]
  minor_findings?: string[]
  observations?: string[]
  next_check_date?: Date | string | null
  notes?: string | null
}

export interface UpdateComplianceCheckInput extends Partial<CreateComplianceCheckInput> {
  compliance_check_id: string
}
