'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/use-toast';
import { Shield, Target, BarChart3, Settings, FileText } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';
import { NISTMaturityLevel } from '@prisma/client';

interface NISTFunction {
  id: string;
  title: string;
  description: string;
  icon: any;
  questions: Array<{
    id: string;
    text: string;
    tooltip: string;
  }>;
}

const NIST_FUNCTIONS: NISTFunction[] = [
  {
    id: 'govern',
    title: 'Govern',
    description: 'Establish AI governance structure and policies',
    icon: Shield,
    questions: [
      { id: 'q1', text: 'Organisational AI strategy and policies', tooltip: '0=none, 5=comprehensive' },
      { id: 'q2', text: 'Risk management culture and leadership', tooltip: '0=none, 5=embedded' },
      { id: 'q3', text: 'Resource allocation for AI governance', tooltip: '0=none, 5=dedicated budget' },
      { id: 'q4', text: 'Third-party AI risk management', tooltip: '0=none, 5=robust oversight' },
    ],
  },
  {
    id: 'map',
    title: 'Map',
    description: 'Understand AI system context and risks',
    icon: Target,
    questions: [
      { id: 'q1', text: 'AI system context and impact documentation', tooltip: '0=none, 5=thorough' },
      { id: 'q2', text: 'Stakeholder identification and engagement', tooltip: '0=none, 5=systematic' },
      { id: 'q3', text: 'Risk categorisation and prioritisation', tooltip: '0=none, 5=mature process' },
      { id: 'q4', text: 'Legal/regulatory requirement mapping', tooltip: '0=none, 5=comprehensive' },
    ],
  },
  {
    id: 'measure',
    title: 'Measure',
    description: 'Assess and monitor AI system performance',
    icon: BarChart3,
    questions: [
      { id: 'q1', text: 'Metrics for AI system performance', tooltip: '0=none, 5=extensive' },
      { id: 'q2', text: 'Testing and validation procedures', tooltip: '0=none, 5=rigorous' },
      { id: 'q3', text: 'Monitoring and continuous evaluation', tooltip: '0=none, 5=automated' },
      { id: 'q4', text: 'Impact assessment methodologies', tooltip: '0=none, 5=advanced' },
    ],
  },
  {
    id: 'manage',
    title: 'Manage',
    description: 'Respond to and mitigate AI risks',
    icon: Settings,
    questions: [
      { id: 'q1', text: 'Incident response capabilities', tooltip: '0=none, 5=well-rehearsed' },
      { id: 'q2', text: 'Risk treatment and mitigation', tooltip: '0=none, 5=systematic' },
      { id: 'q3', text: 'Change management for AI systems', tooltip: '0=none, 5=controlled' },
      { id: 'q4', text: 'Documentation and reporting', tooltip: '0=none, 5=comprehensive' },
    ],
  },
];

interface NISTAIRMFAssessmentProps {
  systemId: string;
  systemName: string;
  onComplete: () => void;
}

export function NISTAIRMFAssessment({ systemId, systemName, onComplete }: NISTAIRMFAssessmentProps) {
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});
  const [assessedBy, setAssessedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateFunctionScore = (functionId: string): number => {
    const functionScores = scores[functionId] || {};
    const values = Object.values(functionScores);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  };

  const calculateOverallMaturity = (): { score: number; level: NISTMaturityLevel } => {
    const functionScores = NIST_FUNCTIONS.map(f => calculateFunctionScore(f.id));
    const avgScore = functionScores.length > 0 ? functionScores.reduce((a, b) => a + b, 0) / functionScores.length : 0;

    let level: NISTMaturityLevel;
    if (avgScore <= 1.5) level = NISTMaturityLevel.INITIAL;
    else if (avgScore <= 2.5) level = NISTMaturityLevel.DEVELOPING;
    else if (avgScore <= 3.5) level = NISTMaturityLevel.DEFINED;
    else if (avgScore <= 4.5) level = NISTMaturityLevel.MANAGED;
    else level = NISTMaturityLevel.OPTIMISING;

    return { score: avgScore, level };
  };

  const handleScoreChange = (functionId: string, questionId: string, value: number) => {
    setScores(prev => ({
      ...prev,
      [functionId]: {
        ...(prev[functionId] || {}),
        [questionId]: value,
      },
    }));
  };

  const getRadarData = () => {
    return NIST_FUNCTIONS.map(func => ({
      function: func.title,
      score: calculateFunctionScore(func.id),
    }));
  };

  const generateRecommendations = (): string[] => {
    const recommendations: string[] = [];
    NIST_FUNCTIONS.forEach(func => {
      const score = calculateFunctionScore(func.id);
      if (score < 2) {
        recommendations.push(`${func.title}: Significant improvement needed - establish basic ${func.title.toLowerCase()} processes`);
      } else if (score < 3.5) {
        recommendations.push(`${func.title}: Strengthen existing processes with more systematic approach`);
      }
    });
    return recommendations;
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
      const maturity = calculateOverallMaturity();
      const recommendations = generateRecommendations();

      const response = await fetch('/api/nist-ai-rmf/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_id: systemId,
          govern_score: calculateFunctionScore('govern'),
          map_score: calculateFunctionScore('map'),
          measure_score: calculateFunctionScore('measure'),
          manage_score: calculateFunctionScore('manage'),
          trustworthy_characteristics: {},
          overall_maturity_level: maturity.level,
          recommendations,
          assessed_by: assessedBy,
          notes: notes || null,
          questionnaire_responses: scores,
        }),
      });

      if (!response.ok) throw new Error('Failed to save assessment');

      toast({
        title: 'Assessment Saved',
        description: `NIST AI RMF assessment for "${systemName}" has been saved successfully.`,
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

  const maturity = calculateOverallMaturity();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">NIST AI RMF Assessment</h3>
          <p className="text-sm text-gray-600 mt-1">System: {systemName}</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{maturity.score.toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">Avg Score</div>
          <div className="text-sm font-medium text-gray-700 mt-1">{maturity.level.replace(/_/g, ' ')}</div>
        </div>
      </div>

      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Function Scores Visualization</h4>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={getRadarData()}>
            <PolarGrid />
            <PolarAngleAxis dataKey="function" />
            <PolarRadiusAxis domain={[0, 5]} />
            <Radar dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      <div className="space-y-4">
        {NIST_FUNCTIONS.map(func => {
          const Icon = func.icon;
          const funcScore = calculateFunctionScore(func.id);

          return (
            <Card key={func.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{func.title}</h4>
                    <p className="text-sm text-gray-600">{func.description}</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{funcScore.toFixed(2)}</div>
              </div>

              <div className="space-y-4">
                {func.questions.map(question => {
                  const currentScore = scores[func.id]?.[question.id] ?? 0;
                  return (
                    <div key={question.id}>
                      <Label className="text-sm font-medium text-gray-900 mb-2 block">
                        {question.text}
                        <span className="text-xs text-gray-500 ml-2">({question.tooltip})</span>
                      </Label>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 w-8">0</span>
                        <Slider
                          value={[currentScore]}
                          onValueChange={(value) => handleScoreChange(func.id, question.id, value[0])}
                          max={5}
                          step={0.5}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-600 w-8">5</span>
                        <span className="text-lg font-bold text-blue-600 w-12 text-center">{currentScore.toFixed(1)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

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
              placeholder="Add any additional context..."
              rows={4}
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading || !assessedBy.trim()} size="lg">
          {loading ? 'Saving...' : 'Save Assessment'}
        </Button>
      </div>
    </div>
  );
}
