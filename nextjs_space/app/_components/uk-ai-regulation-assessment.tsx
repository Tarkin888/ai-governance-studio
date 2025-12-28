'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Shield, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { ImplementationLevel } from '@prisma/client';

interface UKAIPrinciple {
  id: string;
  title: string;
  description: string;
  questions: Array<{
    id: string;
    text: string;
  }>;
}

const UK_AI_PRINCIPLES: UKAIPrinciple[] = [
  {
    id: 'safety_security_robustness',
    title: 'Safety, Security & Robustness',
    description: 'Ensures AI systems are safe, secure, and robust against failures and attacks',
    questions: [
      { id: 'q1', text: 'Have you conducted pre-deployment safety testing?' },
      { id: 'q2', text: 'Do you have ongoing monitoring for safety issues?' },
      { id: 'q3', text: 'Is there a cybersecurity assessment for this AI system?' },
      { id: 'q4', text: 'Do you have incident response procedures?' },
      { id: 'q5', text: 'Have you tested for adversarial robustness?' },
    ],
  },
  {
    id: 'transparency_explainability',
    title: 'Transparency & Explainability',
    description: 'Ensures AI decisions can be understood and explained to stakeholders',
    questions: [
      { id: 'q1', text: 'Can you explain how the AI system makes decisions?' },
      { id: 'q2', text: 'Is there documentation of the model\'s limitations?' },
      { id: 'q3', text: 'Are users informed they\'re interacting with AI?' },
      { id: 'q4', text: 'Can you provide explanations for individual decisions?' },
      { id: 'q5', text: 'Is the training data documented?' },
    ],
  },
  {
    id: 'fairness',
    title: 'Fairness',
    description: 'Ensures AI systems are fair and do not discriminate',
    questions: [
      { id: 'q1', text: 'Have you tested for bias across protected characteristics?' },
      { id: 'q2', text: 'Is there monitoring for discriminatory outcomes?' },
      { id: 'q3', text: 'Do you have processes to address fairness issues?' },
      { id: 'q4', text: 'Have you assessed impact on different demographic groups?' },
      { id: 'q5', text: 'Is there regular fairness auditing?' },
    ],
  },
  {
    id: 'accountability_governance',
    title: 'Accountability & Governance',
    description: 'Ensures clear responsibility and oversight for AI systems',
    questions: [
      { id: 'q1', text: 'Is there clear assignment of responsibility for the AI system?' },
      { id: 'q2', text: 'Do you have AI governance policies?' },
      { id: 'q3', text: 'Is there senior management oversight?' },
      { id: 'q4', text: 'Are there defined risk management procedures?' },
      { id: 'q5', text: 'Do you maintain audit trails?' },
    ],
  },
  {
    id: 'contestability_redress',
    title: 'Contestability & Redress',
    description: 'Ensures users can challenge AI decisions and seek redress',
    questions: [
      { id: 'q1', text: 'Can users challenge AI decisions?' },
      { id: 'q2', text: 'Is there a human review process for contested decisions?' },
      { id: 'q3', text: 'Do you have clear complaints procedures?' },
      { id: 'q4', text: 'Are there mechanisms for redress if harm occurs?' },
      { id: 'q5', text: 'Can users access their data used by the AI?' },
    ],
  },
];

interface UKAIRegulationAssessmentProps {
  systemId: string;
  systemName: string;
  onComplete: () => void;
}

export function UKAIRegulationAssessment({ systemId, systemName, onComplete }: UKAIRegulationAssessmentProps) {
  const [responses, setResponses] = useState<Record<string, Record<string, ImplementationLevel>>>({});
  const [sectorRequirements, setSectorRequirements] = useState<string[]>([]);
  const [assessedBy, setAssessedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const getImplementationScore = (level: ImplementationLevel): number => {
    switch (level) {
      case ImplementationLevel.FULLY_ADDRESSED:
        return 2;
      case ImplementationLevel.PARTIALLY_ADDRESSED:
        return 1;
      case ImplementationLevel.NOT_ADDRESSED:
      default:
        return 0;
    }
  };

  const calculatePrincipleScore = (principleId: string): number => {
    const principleResponses = responses[principleId] || {};
    const totalQuestions = UK_AI_PRINCIPLES.find(p => p.id === principleId)?.questions.length || 5;
    const maxScore = totalQuestions * 2; // 2 points per question
    
    let actualScore = 0;
    Object.values(principleResponses).forEach(level => {
      actualScore += getImplementationScore(level);
    });

    return maxScore > 0 ? (actualScore / maxScore) * 100 : 0;
  };

  const calculateOverallScore = (): number => {
    const scores = UK_AI_PRINCIPLES.map(p => calculatePrincipleScore(p.id));
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  };

  const identifyGaps = (): string[] => {
    const gaps: string[] = [];
    UK_AI_PRINCIPLES.forEach(principle => {
      const score = calculatePrincipleScore(principle.id);
      if (score < 50) {
        gaps.push(`${principle.title}: Low compliance (${score.toFixed(1)}%)`);
      }
      const principleResponses = responses[principle.id] || {};
      principle.questions.forEach((question, idx) => {
        const response = principleResponses[question.id];
        if (!response || response === ImplementationLevel.NOT_ADDRESSED) {
          gaps.push(`${principle.title} - Question ${idx + 1}: Not addressed`);
        }
      });
    });
    return gaps;
  };

  const handleResponseChange = (principleId: string, questionId: string, level: ImplementationLevel) => {
    setResponses(prev => ({
      ...prev,
      [principleId]: {
        ...(prev[principleId] || {}),
        [questionId]: level,
      },
    }));
  };

  const handleSave = async () => {
    if (!assessedBy.trim()) {
      toast({
        title: 'Assessed By Required',
        description: 'Please enter your name before saving.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const overallScore = calculateOverallScore();
      const gaps = identifyGaps();

      // Calculate principle-level implementation levels
      const safetyScore = calculatePrincipleScore('safety_security_robustness');
      const transparencyScore = calculatePrincipleScore('transparency_explainability');
      const fairnessScore = calculatePrincipleScore('fairness');
      const accountabilityScore = calculatePrincipleScore('accountability_governance');
      const contestabilityScore = calculatePrincipleScore('contestability_redress');

      const getImplementationLevelFromScore = (score: number): ImplementationLevel => {
        if (score >= 75) return ImplementationLevel.FULLY_ADDRESSED;
        if (score >= 40) return ImplementationLevel.PARTIALLY_ADDRESSED;
        return ImplementationLevel.NOT_ADDRESSED;
      };

      const response = await fetch('/api/uk-ai-regulation/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_id: systemId,
          safety_security_robustness: getImplementationLevelFromScore(safetyScore),
          transparency_explainability: getImplementationLevelFromScore(transparencyScore),
          fairness: getImplementationLevelFromScore(fairnessScore),
          accountability_governance: getImplementationLevelFromScore(accountabilityScore),
          contestability_redress: getImplementationLevelFromScore(contestabilityScore),
          sector_specific_requirements: sectorRequirements,
          overall_compliance_score: overallScore,
          gaps_identified: gaps,
          assessed_by: assessedBy,
          notes: notes || null,
          questionnaire_responses: responses,
        }),
      });

      if (!response.ok) throw new Error('Failed to save assessment');

      toast({
        title: 'Assessment Saved',
        description: `UK AI Regulation assessment for "${systemName}" has been saved successfully.`,
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

  const overallScore = calculateOverallScore();

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">UK AI Regulation Assessment</h3>
          <p className="text-sm text-gray-600 mt-1">System: {systemName}</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{overallScore.toFixed(1)}%</div>
          <div className="text-xs text-gray-500 mt-1">Overall Compliance</div>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">Completion Progress</span>
            <span className="text-gray-600">
              {Object.values(responses).reduce((acc, pr) => acc + Object.keys(pr).length, 0)} / {UK_AI_PRINCIPLES.reduce((acc, p) => acc + p.questions.length, 0)} questions answered
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${(Object.values(responses).reduce((acc, pr) => acc + Object.keys(pr).length, 0) / UK_AI_PRINCIPLES.reduce((acc, p) => acc + p.questions.length, 0)) * 100}%`,
              }}
            />
          </div>
        </div>
      </Card>

      {/* Principles Accordion */}
      <Accordion type="multiple" className="space-y-4">
        {UK_AI_PRINCIPLES.map((principle) => {
          const score = calculatePrincipleScore(principle.id);
          const principleResponses = responses[principle.id] || {};
          const answeredCount = Object.keys(principleResponses).length;

          return (
            <AccordionItem key={principle.id} value={principle.id} className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900">{principle.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{principle.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{score.toFixed(0)}%</div>
                      <div className="text-xs text-gray-500">{answeredCount}/{principle.questions.length}</div>
                    </div>
                    {score >= 75 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : score >= 40 ? (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 mt-4">
                  {principle.questions.map((question, idx) => (
                    <Card key={question.id} className="p-4">
                      <Label className="text-sm font-medium text-gray-900 mb-3 block">
                        {idx + 1}. {question.text}
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={
                            principleResponses[question.id] === ImplementationLevel.NOT_ADDRESSED
                              ? 'default'
                              : 'outline'
                          }
                          onClick={() =>
                            handleResponseChange(principle.id, question.id, ImplementationLevel.NOT_ADDRESSED)
                          }
                          className="text-sm"
                        >
                          Not Implemented
                        </Button>
                        <Button
                          variant={
                            principleResponses[question.id] === ImplementationLevel.PARTIALLY_ADDRESSED
                              ? 'default'
                              : 'outline'
                          }
                          onClick={() =>
                            handleResponseChange(principle.id, question.id, ImplementationLevel.PARTIALLY_ADDRESSED)
                          }
                          className="text-sm"
                        >
                          Partially
                        </Button>
                        <Button
                          variant={
                            principleResponses[question.id] === ImplementationLevel.FULLY_ADDRESSED
                              ? 'default'
                              : 'outline'
                          }
                          onClick={() =>
                            handleResponseChange(principle.id, question.id, ImplementationLevel.FULLY_ADDRESSED)
                          }
                          className="text-sm"
                        >
                          Fully Implemented
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Assessment Details */}
      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Assessment Details
        </h4>
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
              placeholder="Add any additional context or observations..."
              rows={4}
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button onClick={handleSave} disabled={loading || !assessedBy.trim()} size="lg">
          {loading ? 'Saving...' : 'Save Assessment'}
        </Button>
      </div>
    </div>
  );
}
