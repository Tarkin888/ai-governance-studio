export type VendorType = 'AI Provider' | 'Data Provider' | 'Infrastructure' | 'Consultancy';

export type RiskTier = 'Low' | 'Medium' | 'High' | 'Critical';

export type ApprovalStatus = 'Pending' | 'Approved' | 'Conditional' | 'Rejected';

export type OnboardingStatus = 'New' | 'In Progress' | 'Active' | 'Suspended' | 'Terminated';

export type AssessmentType = 'Initial' | 'Annual' | 'Triggered' | 'Ad-hoc';

export type ContractType = 'Master Agreement' | 'SOW' | 'DPA' | 'SLA';

export type ContractStatus = 'Draft' | 'Under Review' | 'Active' | 'Expired' | 'Terminated';

export type PerformanceStatus = 'Exceeds' | 'Meets' | 'Below' | 'Unsatisfactory';

export type VendorRecommendation = 'Continue' | 'Renegotiate' | 'Probation' | 'Terminate';

export type IncidentType = 
  | 'Security Breach' 
  | 'Service Outage' 
  | 'Data Loss' 
  | 'SLA Breach' 
  | 'Compliance Issue';

export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type IncidentStatus = 'Open' | 'Investigating' | 'Resolved' | 'Closed';

export interface VendorProfile {
  id: string;
  vendorName: string;
  website?: string;
  contactEmail: string;
  contactPhone?: string;
  industry: string;
  headquarters: string;
  employeeCount?: string;
  yearFounded?: number;
  description?: string;
  
  vendorType: VendorType;
  productsServices: string[];
  aiCapabilities: string[];
  
  certifications: string[];
  gdprCompliant: boolean;
  iso42001Certified: boolean;
  dataProcessingAgreement: boolean;
  
  overallRiskScore?: number;
  riskTier?: RiskTier;
  lastAssessmentDate?: Date;
  nextReviewDate?: Date;
  
  approvalStatus: ApprovalStatus;
  onboardingStatus: OnboardingStatus;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface VendorRiskAssessment {
  id: string;
  vendorId: string;
  
  assessmentDate: Date;
  assessmentType: AssessmentType;
  assessor: string;
  
  // Category Scores
  dataProtection: number;
  accessControls: number;
  incidentResponse: number;
  securityTesting: number;
  encryptionPractices: number;
  securityScore?: number;
  
  regulatoryCompliance: number;
  certificationStatus: number;
  auditHistory: number;
  dataPrivacy: number;
  complianceScore?: number;
  
  serviceReliability: number;
  supportQuality: number;
  changeManagement: number;
  documentationQuality: number;
  operationalScore?: number;
  
  financialStability: number;
  insuranceCoverage: number;
  contractTerms: number;
  financialScore?: number;
  
  modelTransparency: number;
  biasAssessment: number;
  explainability: number;
  humanOversight: number;
  aiSpecificScore?: number;
  
  overallScore?: number;
  riskLevel: RiskTier;
  
  keyFindings: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  remediationRequired: boolean;
  remediationDeadline?: Date;
  
  status: string;
  approvedBy?: string;
  approvalDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorContract {
  id: string;
  vendorId: string;
  
  contractNumber: string;
  contractTitle: string;
  contractType: ContractType;
  
  effectiveDate: Date;
  expiryDate: Date;
  noticePeriod: number;
  autoRenewal: boolean;
  
  contractValue?: number;
  currency: string;
  paymentTerms?: string;
  
  serviceLevel?: string;
  dataProcessingTerms?: string;
  liabilityClause?: string;
  terminationClause?: string;
  
  gdprClauses: boolean;
  iso42001Requirements: boolean;
  rightToAudit: boolean;
  
  contractDocument?: string;
  signedBy?: string;
  signedDate?: Date;
  
  status: ContractStatus;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorPerformanceReview {
  id: string;
  vendorId: string;
  
  reviewPeriod: string;
  reviewDate: Date;
  reviewer: string;
  
  serviceQuality: number;
  responsiveness: number;
  reliability: number;
  innovation: number;
  costEffectiveness: number;
  
  slaCompliance: number;
  incidentCount: number;
  resolutionTime?: number;
  
  overallScore?: number;
  performanceStatus: PerformanceStatus;
  
  positives: string[];
  concerns: string[];
  actionItems: string[];
  
  recommendation: VendorRecommendation;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorIncident {
  id: string;
  vendorId: string;
  
  incidentDate: Date;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  
  description: string;
  impact: string;
  affectedSystems: string[];
  
  vendorResponse?: string;
  resolutionDate?: Date;
  resolutionTime?: number;
  rootCause?: string;
  correctiveActions: string[];
  
  status: IncidentStatus;
  
  slaCredit?: number;
  financialImpact?: number;
  
  createdAt: Date;
  updatedAt: Date;
  reportedBy: string;
}

// Form data interfaces
export interface VendorProfileFormData extends Omit<VendorProfile, 'id' | 'createdAt' | 'updatedAt'> {}

export interface VendorAssessmentFormData extends Omit<VendorRiskAssessment, 'id' | 'createdAt' | 'updatedAt' | 'securityScore' | 'complianceScore' | 'operationalScore' | 'financialScore' | 'aiSpecificScore' | 'overallScore'> {}

export interface VendorContractFormData extends Omit<VendorContract, 'id' | 'createdAt' | 'updatedAt'> {}

// Dashboard statistics
export interface VendorDashboardStats {
  totalVendors: number;
  activeVendors: number;
  highRiskVendors: number;
  pendingAssessments: number;
  expiringContracts: number;
  recentIncidents: number;
  averageRiskScore: number;
  complianceRate: number;
}

// Risk calculation weights
export const RISK_WEIGHTS = {
  security: 0.30,
  compliance: 0.25,
  operational: 0.20,
  financial: 0.15,
  aiSpecific: 0.10,
} as const;

// Risk score thresholds
export const RISK_THRESHOLDS = {
  low: 25,
  medium: 50,
  high: 75,
  critical: 100,
} as const;

// Helper functions
export function calculateCategoryScore(scores: number[]): number {
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function calculateOverallRiskScore(assessment: Partial<VendorRiskAssessment>): number {
  const {
    securityScore = 0,
    complianceScore = 0,
    operationalScore = 0,
    financialScore = 0,
    aiSpecificScore = 0,
  } = assessment;

  return (
    securityScore * RISK_WEIGHTS.security +
    complianceScore * RISK_WEIGHTS.compliance +
    operationalScore * RISK_WEIGHTS.operational +
    financialScore * RISK_WEIGHTS.financial +
    aiSpecificScore * RISK_WEIGHTS.aiSpecific
  ) * 20; // Convert 1-5 scale to 0-100
}

export function getRiskTierFromScore(score: number): RiskTier {
  if (score >= RISK_THRESHOLDS.high) return 'Critical';
  if (score >= RISK_THRESHOLDS.medium) return 'High';
  if (score >= RISK_THRESHOLDS.low) return 'Medium';
  return 'Low';
}

export function getRiskColor(tier: RiskTier): string {
  const colors = {
    Low: 'text-green-600 bg-green-50',
    Medium: 'text-yellow-600 bg-yellow-50',
    High: 'text-orange-600 bg-orange-50',
    Critical: 'text-red-600 bg-red-50',
  };
  return colors[tier];
}

export function getStatusColor(status: ApprovalStatus | OnboardingStatus | ContractStatus | IncidentStatus): string {
  const colors: Record<string, string> = {
    Approved: 'text-green-600 bg-green-50',
    Active: 'text-green-600 bg-green-50',
    Resolved: 'text-green-600 bg-green-50',
    Closed: 'text-gray-600 bg-gray-50',
    
    Pending: 'text-yellow-600 bg-yellow-50',
    'In Progress': 'text-blue-600 bg-blue-50',
    'Under Review': 'text-blue-600 bg-blue-50',
    Investigating: 'text-blue-600 bg-blue-50',
    Open: 'text-orange-600 bg-orange-50',
    
    Conditional: 'text-orange-600 bg-orange-50',
    Suspended: 'text-orange-600 bg-orange-50',
    
    Rejected: 'text-red-600 bg-red-50',
    Terminated: 'text-red-600 bg-red-50',
    Expired: 'text-red-600 bg-red-50',
  };
  return colors[status] || 'text-gray-600 bg-gray-50';
}


