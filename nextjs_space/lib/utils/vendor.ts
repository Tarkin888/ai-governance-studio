import type {
  Vendor,
  VendorAssessment,
  VendorContract,
  VendorDocument,
  VendorComplianceCheck,
  VendorRiskTier,
} from '@prisma/client'
import type {
  SerializedVendor,
  SerializedVendorAssessment,
  SerializedVendorContract,
  SerializedVendorDocument,
  SerializedVendorComplianceCheck,
} from '@/lib/types/vendor'

// Serialize date fields for vendor
export function serializeVendorDates(vendor: Vendor): SerializedVendor {
  return {
    ...vendor,
    date_added: vendor.date_added.toISOString(),
    last_modified: vendor.last_modified.toISOString(),
    last_assessment_date: vendor.last_assessment_date?.toISOString() ?? null,
    next_assessment_due: vendor.next_assessment_due?.toISOString() ?? null,
  }
}

// Serialize date fields for assessment
export function serializeAssessmentDates(
  assessment: VendorAssessment
): SerializedVendorAssessment {
  return {
    ...assessment,
    assessment_date: assessment.assessment_date.toISOString(),
  }
}

// Serialize date fields for contract
export function serializeContractDates(
  contract: VendorContract
): SerializedVendorContract {
  return {
    ...contract,
    contract_start_date: contract.contract_start_date.toISOString(),
    contract_end_date: contract.contract_end_date.toISOString(),
    date_added: contract.date_added.toISOString(),
    last_modified: contract.last_modified.toISOString(),
  }
}

// Serialize date fields for document
export function serializeDocumentDates(
  document: VendorDocument
): SerializedVendorDocument {
  return {
    ...document,
    issue_date: document.issue_date?.toISOString() ?? null,
    expiry_date: document.expiry_date?.toISOString() ?? null,
    uploaded_date: document.uploaded_date.toISOString(),
  }
}

// Serialize date fields for compliance check
export function serializeComplianceCheckDates(
  check: VendorComplianceCheck
): SerializedVendorComplianceCheck {
  return {
    ...check,
    check_date: check.check_date.toISOString(),
    next_check_date: check.next_check_date?.toISOString() ?? null,
  }
}

// Calculate overall risk score from assessment scores
export function calculateOverallRiskScore(assessment: VendorAssessment): number {
  const scores = [
    assessment.security_score,
    assessment.privacy_score,
    assessment.ai_ethics_score,
    assessment.reliability_score,
    assessment.compliance_score,
    assessment.transparency_score,
  ]
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
}

// Determine risk tier based on overall score
export function determineRiskTier(score: number): VendorRiskTier {
  if (score < 40) return 'CRITICAL'
  if (score < 60) return 'HIGH'
  if (score < 80) return 'MEDIUM'
  return 'LOW'
}

// Calculate next assessment due date based on risk tier
export function calculateNextAssessmentDate(riskTier: VendorRiskTier): Date {
  const now = new Date()
  switch (riskTier) {
    case 'CRITICAL':
      now.setMonth(now.getMonth() + 3) // 3 months
      break
    case 'HIGH':
      now.setMonth(now.getMonth() + 6) // 6 months
      break
    case 'MEDIUM':
      now.setFullYear(now.getFullYear() + 1) // 1 year
      break
    case 'LOW':
      now.setFullYear(now.getFullYear() + 2) // 2 years
      break
  }
  return now
}

// Check if contract is expiring soon (within 60 days)
export function isContractExpiringSoon(contract: VendorContract): boolean {
  const now = new Date()
  const expiryDate = new Date(contract.contract_end_date)
  const daysUntilExpiry = Math.floor(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )
  return daysUntilExpiry <= 60 && daysUntilExpiry > 0
}

// Check if document is expiring soon (within 30 days)
export function isDocumentExpiringSoon(document: VendorDocument): boolean {
  if (!document.expiry_date) return false
  const now = new Date()
  const expiryDate = new Date(document.expiry_date)
  const daysUntilExpiry = Math.floor(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )
  return daysUntilExpiry <= 30 && daysUntilExpiry > 0
}

// Format risk tier for display
export function formatRiskTier(tier: VendorRiskTier): string {
  return tier.replace('_', ' ')
}

// Get color class for risk tier
export function getRiskTierColor(tier: VendorRiskTier): string {
  switch (tier) {
    case 'CRITICAL':
      return 'text-red-600 bg-red-50'
    case 'HIGH':
      return 'text-orange-600 bg-orange-50'
    case 'MEDIUM':
      return 'text-yellow-600 bg-yellow-50'
    case 'LOW':
      return 'text-green-600 bg-green-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

// Calculate compliance percentage
export function calculateCompliancePercentage(
  check: VendorComplianceCheck
): number {
  const total =
    check.compliant_items_count +
    check.non_compliant_items_count +
    check.not_applicable_items_count
  if (total === 0) return 0
  return Math.round((check.compliant_items_count / total) * 100)
}
