'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Shield,
  FileCheck,
  Eye,
  FileText,
  Award
} from 'lucide-react';
import { RiskClassification, HighRiskCategory } from '@prisma/client';

interface ProhibitedQuestion {
  id: string;
  text: string;
  explanation: string;
}

interface HighRiskCategoryInfo {
  id: HighRiskCategory;
  title: string;
  description: string;
  examples: string[];
}

interface LimitedRiskQuestion {
  id: string;
  text: string;
}

const PROHIBITED_QUESTIONS: ProhibitedQuestion[] = [
  {
    id: 'subliminal',
    text: 'Does the system deploy subliminal techniques to materially distort behaviour in a manner that causes significant harm?',
    explanation: 'Systems that manipulate people below their conscious awareness'
  },
  {
    id: 'vulnerability',
    text: 'Does the system exploit vulnerabilities of specific groups (age, disability) causing significant harm?',
    explanation: 'Systems targeting vulnerable populations like children or persons with disabilities'
  },
  {
    id: 'social_scoring',
    text: 'Does the system perform social scoring by public authorities leading to detrimental treatment?',
    explanation: 'Government systems that score citizens based on behaviour or personal characteristics'
  },
  {
    id: 'predictive_policing',
    text: 'Does the system assess risk of natural persons committing criminal offences based solely on profiling?',
    explanation: 'Systems predicting criminal behaviour without considering actual actions'
  },
  {
    id: 'facial_scraping',
    text: 'Does the system create/expand facial recognition databases through untargeted scraping?',
    explanation: 'Scraping facial images from internet or CCTV footage without consent'
  },
  {
    id: 'emotion_inference',
    text: 'Does the system infer emotions in workplace or education settings (except medical/safety reasons)?',
    explanation: 'Emotion recognition AI in schools or at work (medical/safety exceptions apply)'
  },
  {
    id: 'biometric_categorisation',
    text: 'Does the system perform biometric categorisation using sensitive attributes (race, political opinions, etc.)?',
    explanation: 'Categorizing people by race, religion, political views, sexual orientation, etc.'
  },
  {
    id: 'realtime_biometric',
    text: 'Does the system perform real-time remote biometric identification in public spaces for law enforcement (except specific exceptions)?',
    explanation: 'Live facial recognition in public areas by police (narrow exceptions exist)'
  },
];

const HIGH_RISK_CATEGORIES: HighRiskCategoryInfo[] = [
  {
    id: HighRiskCategory.BIOMETRIC_IDENTIFICATION,
    title: 'Biometric Identification & Categorisation',
    description: 'Systems used for biometric identification, categorisation, or emotion recognition',
    examples: [
      'Biometric identification systems',
      'Biometric categorisation systems', 
      'Emotion recognition systems (limited contexts)'
    ]
  },
  {
    id: HighRiskCategory.CRITICAL_INFRASTRUCTURE,
    title: 'Critical Infrastructure Management',
    description: 'AI systems managing or controlling critical infrastructure',
    examples: [
      'Transport network management',
      'Water supply management',
      'Gas and electricity distribution',
      'Road traffic management'
    ]
  },
  {
    id: HighRiskCategory.EDUCATION_EMPLOYMENT,
    title: 'Education & Employment',
    description: 'Systems affecting educational or vocational training access and employment',
    examples: [
      'Admission decisions to educational institutions',
      'Student assessment and examination',
      'Recruitment and hiring decisions',
      'Promotion and termination decisions',
      'Task allocation to workers'
    ]
  },
  {
    id: HighRiskCategory.ESSENTIAL_SERVICES,
    title: 'Essential Private & Public Services',
    description: 'Systems determining access to essential services and benefits',
    examples: [
      'Creditworthiness evaluation',
      'Credit scoring',
      'Emergency first response services',
      'Public benefit eligibility assessment'
    ]
  },
  {
    id: HighRiskCategory.LAW_ENFORCEMENT,
    title: 'Law Enforcement',
    description: 'AI used by law enforcement authorities',
    examples: [
      'Individual risk assessment for criminal offences',
      'Polygraph and similar tools',
      'Evidence evaluation and reliability',
      'Crime analytics predicting occurrence/reoccurrence'
    ]
  },
  {
    id: HighRiskCategory.MIGRATION_ASYLUM,
    title: 'Migration, Asylum & Border Control',
    description: 'Systems used for migration management',
    examples: [
      'Asylum application examination',
      'Visa application assessment',
      'Border control verification',
      'Risk assessment for illegal immigration'
    ]
  },
  {
    id: HighRiskCategory.JUSTICE_DEMOCRACY,
    title: 'Justice & Democratic Processes',
    description: 'Systems used in administration of justice and democratic processes',
    examples: [
      'Legal research and interpretation',
      'Applying law to concrete facts',
      'Influencing election outcomes',
      'Influencing voting behaviour'
    ]
  },
  {
    id: HighRiskCategory.OTHER,
    title: 'Other High-Risk Use',
    description: 'Other contexts presenting similar risks to those listed above',
    examples: [
      'Systems with equivalent risk levels',
      'Contexts added by future regulatory updates'
    ]
  },
];

const LIMITED_RISK_QUESTIONS: LimitedRiskQuestion[] = [
  {
    id: 'human_interaction',
    text: 'Does the system interact directly with people (e.g., chatbots, virtual assistants)?'
  },
  {
    id: 'content_generation',
    text: 'Does the system generate or manipulate content (e.g., deepfakes, synthetic media)?'
  },
  {
    id: 'biometric_emotion',
    text: 'Does the system perform biometric categorisation or emotion recognition (not in prohibited/high-risk contexts)?'
  },
];

interface EUAIActWizardProps {
  systemId: string;
  systemName: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function EUAIActWizard({ systemId, systemName, onComplete, onCancel }: EUAIActWizardProps) {
  const [step, setStep] = useState(1);
  const [prohibitedAnswers, setProhibitedAnswers] = useState<Record<string, boolean>>({});
  const [highRiskSelected, setHighRiskSelected] = useState<HighRiskCategory[]>([]);
  const [limitedRiskAnswers, setLimitedRiskAnswers] = useState<Record<string, boolean>>({});
  const [assessedBy, setAssessedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    riskTier: RiskClassification;
    prohibitedTrigger?: string;
    complianceRequirements: string[];
    transparencyObligations: string[];
    conformityAssessmentNeeded: boolean;
    ceMarkingRequired: boolean;
    humanOversightRequired: boolean;
  } | null>(null);

  const allProhibitedAnswered = PROHIBITED_QUESTIONS.every(q => prohibitedAnswers[q.id] !== undefined);
  const hasProhibitedTrigger = Object.entries(prohibitedAnswers).some(([_, value]) => value === true);
  const allLimitedRiskAnswered = LIMITED_RISK_QUESTIONS.every(q => limitedRiskAnswers[q.id] !== undefined);
  const hasLimitedRiskTrigger = Object.entries(limitedRiskAnswers).some(([_, value]) => value === true);

  const calculateRiskTier = () => {
    // Check for prohibited
    if (hasProhibitedTrigger) {
      const triggers = PROHIBITED_QUESTIONS
        .filter(q => prohibitedAnswers[q.id] === true)
        .map(q => q.text)
        .join('; ');
      
      return {
        riskTier: RiskClassification.PROHIBITED,
        prohibitedTrigger: triggers,
        complianceRequirements: [],
        transparencyObligations: ['This AI system is prohibited under the EU AI Act and cannot be deployed'],
        conformityAssessmentNeeded: false,
        ceMarkingRequired: false,
        humanOversightRequired: false,
      };
    }

    // Check for high risk
    if (highRiskSelected.length > 0) {
      return {
        riskTier: RiskClassification.HIGH_RISK,
        complianceRequirements: [
          'Risk management system required',
          'Data governance measures required',
          'Technical documentation required',
          'Record-keeping obligations',
          'Transparency requirements',
          'Human oversight required',
          'Accuracy, robustness, and cybersecurity measures required',
          'Conformity assessment required before deployment',
          'CE marking required',
        ],
        transparencyObligations: [
          'Users must be informed they are interacting with an AI system',
          'Capabilities and limitations must be disclosed',
          'Instructions for use must be provided',
        ],
        conformityAssessmentNeeded: true,
        ceMarkingRequired: true,
        humanOversightRequired: true,
      };
    }

    // Check for limited risk
    if (hasLimitedRiskTrigger) {
      return {
        riskTier: RiskClassification.LIMITED_RISK,
        complianceRequirements: [],
        transparencyObligations: [
          'Users must be informed they are interacting with an AI system',
          'Generated or manipulated content must be disclosed',
          'Content must be marked in a machine-readable format',
        ],
        conformityAssessmentNeeded: false,
        ceMarkingRequired: false,
        humanOversightRequired: false,
      };
    }

    // Minimal risk
    return {
      riskTier: RiskClassification.MINIMAL_RISK,
      complianceRequirements: [],
      transparencyObligations: ['No specific EU AI Act obligations beyond general legal compliance'],
      conformityAssessmentNeeded: false,
      ceMarkingRequired: false,
      humanOversightRequired: false,
    };
  };

  const handleNext = () => {
    if (step === 1 && hasProhibitedTrigger) {
      // Skip to results if prohibited
      const calculatedResult = calculateRiskTier();
      setResult(calculatedResult);
      setStep(4);
    } else if (step === 2 && highRiskSelected.length > 0) {
      // Skip to results if high risk
      const calculatedResult = calculateRiskTier();
      setResult(calculatedResult);
      setStep(4);
    } else if (step === 3) {
      // Calculate final result
      const calculatedResult = calculateRiskTier();
      setResult(calculatedResult);
      setStep(4);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSaveAssessment = async () => {
    if (!assessedBy.trim()) {
      toast({
        title: 'Assessed By Required',
        description: 'Please enter your name before saving the assessment.',
        variant: 'destructive',
      });
      return;
    }

    if (!result) return;

    setLoading(true);
    try {
      const response = await fetch('/api/eu-ai-act/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_id: systemId,
          risk_tier: result.riskTier,
          prohibited_trigger: result.prohibitedTrigger || null,
          high_risk_categories: highRiskSelected,
          compliance_requirements: result.complianceRequirements,
          conformity_assessment_needed: result.conformityAssessmentNeeded,
          ce_marking_required: result.ceMarkingRequired,
          human_oversight_required: result.humanOversightRequired,
          transparency_obligations: result.transparencyObligations,
          assessed_by: assessedBy,
          notes: notes || null,
          prohibited_responses: prohibitedAnswers,
          high_risk_responses: highRiskSelected,
          limited_risk_responses: limitedRiskAnswers,
        }),
      });

      if (!response.ok) throw new Error('Failed to save assessment');

      toast({
        title: 'Assessment Saved',
        description: `EU AI Act assessment for "${systemName}" has been saved successfully.`,
      });

      onComplete();
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: 'Error',
        description: 'Failed to save assessment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReassess = () => {
    setStep(1);
    setProhibitedAnswers({});
    setHighRiskSelected([]);
    setLimitedRiskAnswers({});
    setResult(null);
    setNotes('');
  };

  const getRiskBadgeColor = (tier: RiskClassification) => {
    switch (tier) {
      case RiskClassification.PROHIBITED:
        return 'bg-red-100 text-red-800 border-red-300';
      case RiskClassification.HIGH_RISK:
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case RiskClassification.LIMITED_RISK:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case RiskClassification.MINIMAL_RISK:
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRiskIcon = (tier: RiskClassification) => {
    switch (tier) {
      case RiskClassification.PROHIBITED:
        return <AlertCircle className="h-12 w-12 text-red-600" />;
      case RiskClassification.HIGH_RISK:
        return <AlertTriangle className="h-12 w-12 text-amber-600" />;
      case RiskClassification.LIMITED_RISK:
        return <Info className="h-12 w-12 text-yellow-600" />;
      case RiskClassification.MINIMAL_RISK:
        return <CheckCircle2 className="h-12 w-12 text-green-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">EU AI Act Compliance Assessment</h2>
              <p className="text-sm text-gray-600 mt-1">System: {systemName}</p>
            </div>
            <Button variant="ghost" onClick={onCancel}>
              ✕
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>Step {step} of 4</span>
              <span>{Math.round((step / 4) * 100)}% Complete</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {/* Step 1: Prohibited Practices */}
          {step === 1 && (
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Prohibited Practices Assessment</h3>
                </div>
                <p className="text-sm text-gray-600">
                  The EU AI Act prohibits certain AI practices. Answer these questions about <strong>{systemName}</strong>. 
                  If any answer is "Yes", the system will be classified as <strong className="text-red-600">Prohibited</strong>.
                </p>
              </div>

              <div className="space-y-6">
                {PROHIBITED_QUESTIONS.map((question) => (
                  <Card key={question.id} className="p-4">
                    <div className="space-y-3">
                      <p className="font-medium text-gray-900">{question.text}</p>
                      <p className="text-sm text-gray-600 italic">{question.explanation}</p>
                      <div className="flex gap-4">
                        <Button
                          variant={prohibitedAnswers[question.id] === true ? 'default' : 'outline'}
                          onClick={() => setProhibitedAnswers({ ...prohibitedAnswers, [question.id]: true })}
                          className="flex-1"
                        >
                          Yes
                        </Button>
                        <Button
                          variant={prohibitedAnswers[question.id] === false ? 'default' : 'outline'}
                          onClick={() => setProhibitedAnswers({ ...prohibitedAnswers, [question.id]: false })}
                          className="flex-1"
                        >
                          No
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: High-Risk Categories */}
          {step === 2 && (
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                  <h3 className="text-lg font-semibold text-gray-900">High-Risk Category Assessment</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Does <strong>{systemName}</strong> operate in any of these high-risk categories? 
                  Select all that apply. If any category is selected, the system will be classified as <strong className="text-amber-600">High Risk</strong>.
                </p>
              </div>

              <div className="space-y-4">
                {HIGH_RISK_CATEGORIES.map((category) => (
                  <Card key={category.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={category.id}
                        checked={highRiskSelected.includes(category.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setHighRiskSelected([...highRiskSelected, category.id]);
                          } else {
                            setHighRiskSelected(highRiskSelected.filter(id => id !== category.id));
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor={category.id} className="text-base font-semibold text-gray-900 cursor-pointer">
                          {category.title}
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        <ul className="mt-2 space-y-1">
                          {category.examples.map((example, idx) => (
                            <li key={idx} className="text-xs text-gray-500 flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-gray-400" />
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Limited Risk */}
          {step === 3 && (
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Info className="h-6 w-6 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Limited Risk Assessment</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Does <strong>{systemName}</strong> meet any of these limited risk criteria? 
                  If any answer is "Yes", the system will be classified as <strong className="text-yellow-600">Limited Risk</strong>.
                </p>
              </div>

              <div className="space-y-6">
                {LIMITED_RISK_QUESTIONS.map((question) => (
                  <Card key={question.id} className="p-4">
                    <div className="space-y-3">
                      <p className="font-medium text-gray-900">{question.text}</p>
                      <div className="flex gap-4">
                        <Button
                          variant={limitedRiskAnswers[question.id] === true ? 'default' : 'outline'}
                          onClick={() => setLimitedRiskAnswers({ ...limitedRiskAnswers, [question.id]: true })}
                          className="flex-1"
                        >
                          Yes
                        </Button>
                        <Button
                          variant={limitedRiskAnswers[question.id] === false ? 'default' : 'outline'}
                          onClick={() => setLimitedRiskAnswers({ ...limitedRiskAnswers, [question.id]: false })}
                          className="flex-1"
                        >
                          No
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {step === 4 && result && (
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Assessment Results</h3>
                </div>
              </div>

              {/* Risk Tier Badge */}
              <div className="mb-6">
                <Card className={`p-6 border-2 ${getRiskBadgeColor(result.riskTier)}`}>
                  <div className="flex items-center gap-4">
                    {getRiskIcon(result.riskTier)}
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold mb-1">
                        {result.riskTier.replace(/_/g, ' ')}
                      </h4>
                      {result.prohibitedTrigger && (
                        <p className="text-sm font-medium">
                          ⚠️ This AI system is prohibited under the EU AI Act and cannot be deployed
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Prohibited Trigger */}
              {result.prohibitedTrigger && (
                <Card className="p-4 mb-6 bg-red-50 border-red-200">
                  <h5 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Prohibited Practice Detected
                  </h5>
                  <p className="text-sm text-red-800">{result.prohibitedTrigger}</p>
                </Card>
              )}

              {/* High-Risk Categories */}
              {highRiskSelected.length > 0 && (
                <Card className="p-4 mb-6">
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    High-Risk Categories
                  </h5>
                  <ul className="space-y-2">
                    {highRiskSelected.map((categoryId) => {
                      const category = HIGH_RISK_CATEGORIES.find(c => c.id === categoryId);
                      return (
                        <li key={categoryId} className="text-sm text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          {category?.title}
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              )}

              {/* Compliance Requirements */}
              {result.complianceRequirements.length > 0 && (
                <Card className="p-4 mb-6">
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-blue-600" />
                    Compliance Requirements
                  </h5>
                  <ul className="space-y-2">
                    {result.complianceRequirements.map((req, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Transparency Obligations */}
              <Card className="p-4 mb-6">
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Transparency Obligations
                </h5>
                <ul className="space-y-2">
                  {result.transparencyObligations.map((obligation, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                      {obligation}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Key Requirements Summary */}
              {result.riskTier === RiskClassification.HIGH_RISK && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card className="p-4 text-center">
                    <Award className={`h-8 w-8 mx-auto mb-2 ${result.ceMarkingRequired ? 'text-blue-600' : 'text-gray-400'}`} />
                    <p className="text-xs font-medium text-gray-900">CE Marking</p>
                    <p className="text-xs text-gray-600 mt-1">{result.ceMarkingRequired ? 'Required' : 'Not Required'}</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <FileText className={`h-8 w-8 mx-auto mb-2 ${result.conformityAssessmentNeeded ? 'text-blue-600' : 'text-gray-400'}`} />
                    <p className="text-xs font-medium text-gray-900">Conformity Assessment</p>
                    <p className="text-xs text-gray-600 mt-1">{result.conformityAssessmentNeeded ? 'Required' : 'Not Required'}</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <Eye className={`h-8 w-8 mx-auto mb-2 ${result.humanOversightRequired ? 'text-blue-600' : 'text-gray-400'}`} />
                    <p className="text-xs font-medium text-gray-900">Human Oversight</p>
                    <p className="text-xs text-gray-600 mt-1">{result.humanOversightRequired ? 'Required' : 'Not Required'}</p>
                  </Card>
                </div>
              )}

              {/* Assessment Details Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="assessedBy">Assessed By *</Label>
                  <Input
                    id="assessedBy"
                    value={assessedBy}
                    onChange={(e) => setAssessedBy(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes or context about this assessment..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex gap-2">
            {step > 1 && step < 4 && (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            {step === 4 && (
              <Button variant="outline" onClick={handleReassess}>
                Reassess
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            {step < 4 && (
              <Button
                onClick={handleNext}
                disabled={
                  (step === 1 && !allProhibitedAnswered) ||
                  (step === 3 && !allLimitedRiskAnswered)
                }
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === 4 && (
              <Button onClick={handleSaveAssessment} disabled={loading || !assessedBy.trim()}>
                {loading ? 'Saving...' : 'Save Assessment'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
