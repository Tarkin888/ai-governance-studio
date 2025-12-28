'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sidebar } from '@/app/_components/sidebar';
import { UKAIRegulationAssessment } from '@/app/_components/uk-ai-regulation-assessment';
import { NISTAIRMFAssessment } from '@/app/_components/nist-ai-rmf-assessment';
import { ArrowLeft, Shield, Flag, Target, GitCompare } from 'lucide-react';

interface SystemData {
  system_id: string;
  system_name: string;
  [key: string]: any;
}

interface MultiFrameworkAssessmentClientProps {
  system: SystemData;
}

export function MultiFrameworkAssessmentClient({ system }: MultiFrameworkAssessmentClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('eu');
  const [euAssessment, setEuAssessment] = useState<any>(null);
  const [ukAssessment, setUkAssessment] = useState<any>(null);
  const [nistAssessment, setNistAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, [system.system_id]);

  const fetchAssessments = async () => {
    try {
      const [euRes, ukRes, nistRes] = await Promise.all([
        fetch(`/api/eu-ai-act/assessments/latest/${system.system_id}`).catch(() => null),
        fetch(`/api/uk-ai-regulation/assessments/latest/${system.system_id}`).catch(() => null),
        fetch(`/api/nist-ai-rmf/assessments/latest/${system.system_id}`).catch(() => null),
      ]);

      if (euRes?.ok) setEuAssessment(await euRes.json());
      if (ukRes?.ok) setUkAssessment(await ukRes.json());
      if (nistRes?.ok) setNistAssessment(await nistRes.json());
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentComplete = () => {
    fetchAssessments();
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1">
        <div className="p-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/ai-systems/${system.system_id}`)}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to System Details
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Multi-Framework Regulatory Assessment</h1>
            <p className="text-gray-600">System: {system.system_name}</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-2/3">
              <TabsTrigger value="eu" className="gap-2">
                <Flag className="h-4 w-4" />
                EU AI Act
              </TabsTrigger>
              <TabsTrigger value="uk" className="gap-2">
                <Shield className="h-4 w-4" />
                UK AI Reg
              </TabsTrigger>
              <TabsTrigger value="nist" className="gap-2">
                <Target className="h-4 w-4" />
                NIST AI RMF
              </TabsTrigger>
              <TabsTrigger value="cross" className="gap-2">
                <GitCompare className="h-4 w-4" />
                Cross-Framework
              </TabsTrigger>
            </TabsList>

            <TabsContent value="eu">
              <Card className="p-6">
                {euAssessment ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">EU AI Act Assessment Completed</h3>
                    <p className="text-gray-600 mb-4">
                      Risk Tier: <strong>{euAssessment.risk_tier}</strong>
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Last assessed: {new Date(euAssessment.assessment_date).toLocaleDateString()}
                    </p>
                    <Button onClick={() => router.push(`/ai-systems/${system.system_id}`)}>
                      View Full Assessment
                    </Button>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">No EU AI Act Assessment Found</h3>
                    <p className="text-gray-600 mb-4">
                      Please complete the EU AI Act assessment from the system detail page.
                    </p>
                    <Button onClick={() => router.push(`/ai-systems/${system.system_id}`)}>
                      Go to System Details
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="uk">
              {ukAssessment ? (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">UK AI Regulation Assessment Completed</h3>
                  <p className="text-gray-600 mb-4">
                    Overall Compliance Score: <strong>{ukAssessment.overall_compliance_score.toFixed(1)}%</strong>
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Last assessed: {new Date(ukAssessment.assessment_date).toLocaleDateString()}
                  </p>
                  <Button onClick={() => fetchAssessments()}>Refresh Assessment</Button>
                </Card>
              ) : (
                <UKAIRegulationAssessment
                  systemId={system.system_id}
                  systemName={system.system_name}
                  onComplete={handleAssessmentComplete}
                />
              )}
            </TabsContent>

            <TabsContent value="nist">
              {nistAssessment ? (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">NIST AI RMF Assessment Completed</h3>
                  <p className="text-gray-600 mb-4">
                    Maturity Level: <strong>{nistAssessment.overall_maturity_level}</strong>
                  </p>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Govern</p>
                      <p className="text-xl font-bold">{nistAssessment.govern_score.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Map</p>
                      <p className="text-xl font-bold">{nistAssessment.map_score.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Measure</p>
                      <p className="text-xl font-bold">{nistAssessment.measure_score.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Manage</p>
                      <p className="text-xl font-bold">{nistAssessment.manage_score.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Last assessed: {new Date(nistAssessment.assessment_date).toLocaleDateString()}
                  </p>
                  <Button onClick={() => fetchAssessments()}>Refresh Assessment</Button>
                </Card>
              ) : (
                <NISTAIRMFAssessment
                  systemId={system.system_id}
                  systemName={system.system_name}
                  onComplete={handleAssessmentComplete}
                />
              )}
            </TabsContent>

            <TabsContent value="cross">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Cross-Framework Analysis</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Framework Coverage</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">EU AI Act</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {euAssessment ? '✓' : '✗'}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-900">UK AI Regulation</p>
                        <p className="text-2xl font-bold text-green-600">
                          {ukAssessment ? '✓' : '✗'}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm font-medium text-purple-900">NIST AI RMF</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {nistAssessment ? '✓' : '✗'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {(euAssessment || ukAssessment || nistAssessment) && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Assessment Summary</h4>
                      <div className="space-y-2">
                        {euAssessment && (
                          <p className="text-sm text-gray-700">
                            • EU AI Act: <strong>{euAssessment.risk_tier}</strong>
                          </p>
                        )}
                        {ukAssessment && (
                          <p className="text-sm text-gray-700">
                            • UK AI Regulation: <strong>{ukAssessment.overall_compliance_score.toFixed(1)}% compliance</strong>
                          </p>
                        )}
                        {nistAssessment && (
                          <p className="text-sm text-gray-700">
                            • NIST AI RMF: <strong>{nistAssessment.overall_maturity_level} maturity</strong>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {!euAssessment && !ukAssessment && !nistAssessment && (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">
                        Complete assessments in at least two frameworks to see cross-framework analysis.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
