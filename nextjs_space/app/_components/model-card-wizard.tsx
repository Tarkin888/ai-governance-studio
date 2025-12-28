'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  FileText, 
  AlertTriangle,
  Database,
  BarChart3,
  Shield,
  Settings,
  GitBranch,
  CheckCircle2,
} from 'lucide-react';
import { ModelCardStatus, UpdateFrequency } from '@prisma/client';

interface ModelCardWizardProps {
  systemId: string;
  systemData?: any;
  existingCard?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SECTIONS = [
  { id: 1, title: 'Model Details', icon: FileText },
  { id: 2, title: 'Intended Use & Limitations', icon: AlertTriangle },
  { id: 3, title: 'Training Data', icon: Database },
  { id: 4, title: 'Performance Metrics', icon: BarChart3 },
  { id: 5, title: 'Ethical Considerations', icon: Shield },
  { id: 6, title: 'Deployment & Monitoring', icon: Settings },
  { id: 7, title: 'Regulatory Compliance', icon: GitBranch },
  { id: 8, title: 'Review & Submit', icon: CheckCircle2 },
];

const INTENDED_USERS_OPTIONS = [
  'Data Scientists',
  'Business Analysts',
  'End Users',
  'Automated Systems',
  'Compliance Officers',
  'Auditors',
];

const MODEL_ARCHITECTURE_OPTIONS = [
  'Transformer (e.g., BERT, GPT)',
  'Convolutional Neural Network',
  'Random Forest',
  'Gradient Boosting',
  'Neural Network (Other)',
  'Linear/Logistic Regression',
  'Support Vector Machine',
  'Custom Architecture',
];

const LICENCE_OPTIONS = [
  'Proprietary',
  'Apache 2.0',
  'MIT',
  'GPL',
  'Creative Commons',
  'Other',
];

export function ModelCardWizard({
  systemId,
  systemData,
  existingCard,
  onSuccess,
  onCancel,
}: ModelCardWizardProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [biasTestData, setBiasTestData] = useState<any>(null);
  const [regulatoryData, setRegulatoryData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    // Section 1: Model Details
    model_details_summary: existingCard?.model_details_summary || '',
    model_architecture: existingCard?.model_architecture || '',
    licence: existingCard?.licence || '',
    citation: existingCard?.citation || '',
    
    // Section 2: Intended Use & Limitations
    intended_use: existingCard?.intended_use || '',
    intended_users: existingCard?.intended_users || [],
    intended_deployment_contexts: existingCard?.intended_deployment_contexts || '',
    out_of_scope_uses: existingCard?.out_of_scope_uses || [],
    limitations_known: existingCard?.limitations_known || [],
    trade_offs: existingCard?.trade_offs || '',
    
    // Section 3: Training Data
    training_data_description: existingCard?.training_data_description || '',
    training_data_size: existingCard?.training_data_size || 0,
    training_data_source: existingCard?.training_data_source || systemData?.data_sources?.join(', ') || '',
    data_collection_methodology: existingCard?.data_collection_methodology || '',
    preprocessing_steps: existingCard?.preprocessing_steps || [],
    data_labelling_approach: existingCard?.data_labelling_approach || '',
    sensitive_data_handling: existingCard?.sensitive_data_handling || '',
    
    // Section 4: Performance Metrics
    evaluation_metrics: existingCard?.evaluation_metrics || {},
    performance_results: existingCard?.performance_results || {},
    benchmark_comparisons: existingCard?.benchmark_comparisons || '',
    
    // Section 5: Ethical Considerations & Fairness
    fairness_assessment_summary: existingCard?.fairness_assessment_summary || '',
    potential_risks_harms: existingCard?.potential_risks_harms || '',
    human_oversight_requirements: existingCard?.human_oversight_requirements || '',
    contestability_mechanisms: existingCard?.contestability_mechanisms || '',
    ethical_considerations: existingCard?.ethical_considerations || '',
    
    // Section 6: Deployment & Monitoring
    deployment_recommendations: existingCard?.deployment_recommendations || '',
    monitoring_requirements: existingCard?.monitoring_requirements || '',
    monitoring_plan: existingCard?.monitoring_plan || '',
    update_frequency: existingCard?.update_frequency || 'AS_NEEDED' as UpdateFrequency,
    update_triggers: existingCard?.update_triggers || '',
    decommissioning_criteria: existingCard?.decommissioning_criteria || '',
    
    // Section 7: Regulatory Compliance
    regulatory_compliance_summary: existingCard?.regulatory_compliance_summary || '',
    
    // Section 8: Review & Approval
    updated_by: existingCard?.updated_by || '',
    reviewer_assigned: existingCard?.reviewer_assigned || '',
    review_comments: existingCard?.review_comments || '',
    card_version: existingCard?.card_version || '1.0',
    status: existingCard?.status || 'DRAFT' as ModelCardStatus,
  });
  
  // Temporary form fields for lists
  const [newOutOfScope, setNewOutOfScope] = useState('');
  const [newLimitation, setNewLimitation] = useState('');
  const [newPreprocessingStep, setNewPreprocessingStep] = useState('');
  const [newMetricName, setNewMetricName] = useState('');
  const [newMetricValue, setNewMetricValue] = useState('');

  // Fetch bias test and regulatory data on mount
  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        // Fetch latest bias test
        const biasRes = await fetch(`/api/bias-tests?systemId=${systemId}`);
        if (biasRes.ok) {
          const biasTests = await biasRes.json();
          if (biasTests.length > 0) {
            setBiasTestData(biasTests[0]);
            
            // Auto-populate fairness summary if not already set
            if (!formData.fairness_assessment_summary && biasTests[0]) {
              const summary = `This system has been tested for fairness using ${biasTests[0].test_type}. Overall fairness score: ${biasTests[0].overall_fairness_score}/100. ${biasTests[0].issues_detected ? `Issues detected with ${biasTests[0].severity_level} severity.` : 'No significant fairness issues detected.'}`;
              setFormData(prev => ({ ...prev, fairness_assessment_summary: summary }));
            }
          }
        }
        
        // Fetch regulatory assessments
        const euRes = await fetch(`/api/eu-ai-act/assessments/latest/${systemId}`);
        const ukRes = await fetch(`/api/uk-ai-regulation/assessments/latest/${systemId}`);
        const nistRes = await fetch(`/api/nist-ai-rmf/assessments/latest/${systemId}`);
        
        const regulatory: any = {};
        if (euRes.ok) regulatory.eu = await euRes.json();
        if (ukRes.ok) regulatory.uk = await ukRes.json();
        if (nistRes.ok) regulatory.nist = await nistRes.json();
        
        setRegulatoryData(regulatory);
        
        // Auto-populate regulatory summary if not already set
        if (!formData.regulatory_compliance_summary && Object.keys(regulatory).length > 0) {
          let summary = '';
          if (regulatory.eu) {
            summary += `EU AI Act: Classified as ${regulatory.eu.risk_tier}. `;
          }
          if (regulatory.uk) {
            summary += `UK AI Regulation: Overall compliance score ${regulatory.uk.overall_compliance_score}%. `;
          }
          if (regulatory.nist) {
            summary += `NIST AI RMF: ${regulatory.nist.overall_maturity_level} maturity level.`;
          }
          setFormData(prev => ({ ...prev, regulatory_compliance_summary: summary }));
        }
      } catch (error) {
        console.error('Error fetching additional data:', error);
      }
    };
    
    fetchAdditionalData();
  }, [systemId]);

  const handleNext = () => {
    if (currentSection < SECTIONS.length) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.updated_by) {
      toast({
        title: 'Validation Error',
        description: 'Please provide your name in the "Updated By" field.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        system_id: systemId,
        ...formData,
      };
      
      const url = existingCard
        ? `/api/model-cards/${existingCard.card_id}`
        : '/api/model-cards';
      const method = existingCard ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) throw new Error('Failed to save model card');
      
      toast({
        title: 'Success',
        description: `Model card ${existingCard ? 'updated' : 'created'} successfully.`,
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving model card:', error);
      toast({
        title: 'Error',
        description: 'Failed to save model card. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addToList = (field: string, value: string, setValue: (v: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof typeof prev] as string[]), value.trim()],
      }));
      setValue('');
    }
  };

  const removeFromList = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index),
    }));
  };

  const addMetric = () => {
    if (newMetricName.trim() && newMetricValue.trim()) {
      setFormData(prev => ({
        ...prev,
        evaluation_metrics: {
          ...(prev.evaluation_metrics as any),
          [newMetricName.trim()]: parseFloat(newMetricValue) || newMetricValue,
        },
      }));
      setNewMetricName('');
      setNewMetricValue('');
    }
  };

  const removeMetric = (metricName: string) => {
    setFormData(prev => {
      const metrics = { ...(prev.evaluation_metrics as any) };
      delete metrics[metricName];
      return { ...prev, evaluation_metrics: metrics };
    });
  };

  const toggleIntendedUser = (user: string) => {
    setFormData(prev => ({
      ...prev,
      intended_users: prev.intended_users.includes(user)
        ? prev.intended_users.filter((u: string) => u !== user)
        : [...prev.intended_users, user],
    }));
  };

  const renderSection = () => {
    switch (currentSection) {
      case 1:
        return renderSection1();
      case 2:
        return renderSection2();
      case 3:
        return renderSection3();
      case 4:
        return renderSection4();
      case 5:
        return renderSection5();
      case 6:
        return renderSection6();
      case 7:
        return renderSection7();
      case 8:
        return renderSection8();
      default:
        return null;
    }
  };

  const renderSection1 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Auto-populated from System Data:</h4>
        <div className="space-y-1 text-sm text-blue-800">
          <p><strong>Model Name:</strong> {systemData?.system_name}</p>
          <p><strong>Model Type:</strong> {systemData?.ai_model_type}</p>
          <p><strong>Developer/Owner:</strong> {systemData?.business_owner} (Business), {systemData?.technical_owner} (Technical)</p>
          <p><strong>Deployment Date:</strong> {systemData?.deployment_date ? new Date(systemData.deployment_date).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="model_details_summary">
          Model Description <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-600">
          Explain what this model does in plain language. Aim for 8th-10th grade reading level for accessibility.
        </p>
        <Textarea
          id="model_details_summary"
          value={formData.model_details_summary}
          onChange={(e) => setFormData({ ...formData, model_details_summary: e.target.value })}
          placeholder="Example: 'This model predicts customer churn by analysing transaction patterns and engagement metrics.'"
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 text-right">
          {formData.model_details_summary.length}/500 characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="model_architecture">Model Architecture</Label>
        <Select
          value={formData.model_architecture}
          onValueChange={(value) => setFormData({ ...formData, model_architecture: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select architecture" />
          </SelectTrigger>
          <SelectContent>
            {MODEL_ARCHITECTURE_OPTIONS.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="licence">Licence</Label>
        <Select
          value={formData.licence}
          onValueChange={(value) => setFormData({ ...formData, licence: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select licence" />
          </SelectTrigger>
          <SelectContent>
            {LICENCE_OPTIONS.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="citation">Citation</Label>
        <p className="text-sm text-gray-600">How should this model be cited? Include any relevant papers or documentation.</p>
        <Textarea
          id="citation"
          value={formData.citation}
          onChange={(e) => setFormData({ ...formData, citation: e.target.value })}
          placeholder="Example: Smith, J. et al. (2024). 'Advanced Customer Churn Prediction.' Journal of ML Research."
          rows={3}
        />
      </div>
    </div>
  );

  const renderSection2 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="intended_use">
          Primary Intended Use <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="intended_use"
          value={formData.intended_use}
          onChange={(e) => setFormData({ ...formData, intended_use: e.target.value })}
          placeholder="What is the primary intended use of this model?"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Intended Users</Label>
        <p className="text-sm text-gray-600 mb-3">Select all that apply:</p>
        <div className="space-y-2">
          {INTENDED_USERS_OPTIONS.map(user => (
            <div key={user} className="flex items-center space-x-2">
              <Checkbox
                id={`user-${user}`}
                checked={formData.intended_users.includes(user)}
                onCheckedChange={() => toggleIntendedUser(user)}
              />
              <Label htmlFor={`user-${user}`} className="font-normal cursor-pointer">
                {user}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="intended_deployment_contexts">Intended Deployment Contexts</Label>
        <p className="text-sm text-gray-600">Examples: Internal decision support, Customer-facing application, Research environment</p>
        <Textarea
          id="intended_deployment_contexts"
          value={formData.intended_deployment_contexts}
          onChange={(e) => setFormData({ ...formData, intended_deployment_contexts: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Out-of-Scope Uses</Label>
        <p className="text-sm text-gray-600 mb-2">
          List uses this model should NOT be used for.
          Template: "Do not use for [context] because [reason]"
        </p>
        <div className="flex gap-2">
          <Input
            value={newOutOfScope}
            onChange={(e) => setNewOutOfScope(e.target.value)}
            placeholder="E.g., Do not use for medical diagnosis as it is not trained on clinical data"
            onKeyPress={(e) => e.key === 'Enter' && addToList('out_of_scope_uses', newOutOfScope, setNewOutOfScope)}
          />
          <Button
            type="button"
            onClick={() => addToList('out_of_scope_uses', newOutOfScope, setNewOutOfScope)}
            size="sm"
          >
            Add
          </Button>
        </div>
        <div className="space-y-1 mt-2">
          {formData.out_of_scope_uses.map((use: string, index: number) => (
            <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
              <span className="text-sm">{use}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFromList('out_of_scope_uses', index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Known Limitations</Label>
        <p className="text-sm text-gray-600 mb-2">
          What are the model's known limitations? Consider data, performance, technical, and contextual limitations.
        </p>
        <div className="flex gap-2">
          <Input
            value={newLimitation}
            onChange={(e) => setNewLimitation(e.target.value)}
            placeholder="E.g., Performance degrades on data from regions not in training set"
            onKeyPress={(e) => e.key === 'Enter' && addToList('limitations_known', newLimitation, setNewLimitation)}
          />
          <Button
            type="button"
            onClick={() => addToList('limitations_known', newLimitation, setNewLimitation)}
            size="sm"
          >
            Add
          </Button>
        </div>
        <div className="space-y-1 mt-2">
          {formData.limitations_known.map((limitation: string, index: number) => (
            <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
              <span className="text-sm">{limitation}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFromList('limitations_known', index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="trade_offs">Trade-offs</Label>
        <p className="text-sm text-gray-600">
          Example: "We prioritised precision over recall to minimise false positives, accepting that some true cases may be missed."
        </p>
        <Textarea
          id="trade_offs"
          value={formData.trade_offs}
          onChange={(e) => setFormData({ ...formData, trade_offs: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );

  const renderSection3 = () => (
    <div className="space-y-6">
      {systemData?.data_sources && systemData.data_sources.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Auto-populated from System Data:</h4>
          <p className="text-sm text-blue-800">
            <strong>Data Sources:</strong> {systemData.data_sources.join(', ')}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="training_data_description">
          Data Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="training_data_description"
          value={formData.training_data_description}
          onChange={(e) => setFormData({ ...formData, training_data_description: e.target.value })}
          placeholder="Describe the training data, its characteristics, and what it represents..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="training_data_size">Dataset Size (number of samples)</Label>
          <Input
            id="training_data_size"
            type="number"
            value={formData.training_data_size || ''}
            onChange={(e) => setFormData({ ...formData, training_data_size: parseInt(e.target.value) || 0 })}
            placeholder="e.g., 1000000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="training_data_source">Data Source</Label>
          <Input
            id="training_data_source"
            value={formData.training_data_source}
            onChange={(e) => setFormData({ ...formData, training_data_source: e.target.value })}
            placeholder="e.g., Internal database, Public dataset"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="data_collection_methodology">Data Collection Methodology</Label>
        <p className="text-sm text-gray-600">How was the data collected and curated? What time period does it cover?</p>
        <Textarea
          id="data_collection_methodology"
          value={formData.data_collection_methodology}
          onChange={(e) => setFormData({ ...formData, data_collection_methodology: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Preprocessing Steps</Label>
        <p className="text-sm text-gray-600 mb-2">
          List the steps taken to preprocess the data. Examples: "Removed outliers beyond 3 standard deviations", "Normalised features to 0-1 range"
        </p>
        <div className="flex gap-2">
          <Input
            value={newPreprocessingStep}
            onChange={(e) => setNewPreprocessingStep(e.target.value)}
            placeholder="E.g., Handled missing values using mean imputation"
            onKeyPress={(e) => e.key === 'Enter' && addToList('preprocessing_steps', newPreprocessingStep, setNewPreprocessingStep)}
          />
          <Button
            type="button"
            onClick={() => addToList('preprocessing_steps', newPreprocessingStep, setNewPreprocessingStep)}
            size="sm"
          >
            Add
          </Button>
        </div>
        <div className="space-y-1 mt-2">
          {formData.preprocessing_steps.map((step: string, index: number) => (
            <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
              <span className="text-sm">{step}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFromList('preprocessing_steps', index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="data_labelling_approach">Data Labelling Approach (if supervised learning)</Label>
        <Textarea
          id="data_labelling_approach"
          value={formData.data_labelling_approach}
          onChange={(e) => setFormData({ ...formData, data_labelling_approach: e.target.value })}
          placeholder="How were labels created? Who labelled the data? Inter-annotator agreement if applicable..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sensitive_data_handling">Sensitive Data Handling</Label>
        <p className="text-sm text-gray-600">
          Does training data include personal data, special category data, or other sensitive information? How was this data protected?
        </p>
        <Textarea
          id="sensitive_data_handling"
          value={formData.sensitive_data_handling}
          onChange={(e) => setFormData({ ...formData, sensitive_data_handling: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );

  const renderSection4 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Evaluation Metrics</Label>
        <p className="text-sm text-gray-600 mb-2">
          Add metrics used to evaluate model performance (e.g., Accuracy, Precision, F1-Score, RMSE)
        </p>
        <div className="flex gap-2">
          <Input
            value={newMetricName}
            onChange={(e) => setNewMetricName(e.target.value)}
            placeholder="Metric name (e.g., Accuracy)"
            className="flex-1"
          />
          <Input
            value={newMetricValue}
            onChange={(e) => setNewMetricValue(e.target.value)}
            placeholder="Value (e.g., 0.95 or 95%)"
            className="flex-1"
          />
          <Button
            type="button"
            onClick={addMetric}
            size="sm"
          >
            Add
          </Button>
        </div>
        <div className="space-y-1 mt-2">
          {Object.entries(formData.evaluation_metrics as object || {}).map(([name, value]) => (
            <div key={name} className="flex items-center justify-between bg-gray-100 p-2 rounded">
              <span className="text-sm"><strong>{name}:</strong> {value}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeMetric(name)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      {biasTestData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">
            Performance Across Subgroups (from Bias Testing):
          </h4>
          <p className="text-sm text-green-800">
            Fairness Score: {biasTestData.overall_fairness_score}/100<br />
            Protected Attributes Tested: {biasTestData.protected_attributes_tested?.join(', ')}<br />
            <a href={`/bias-fairness`} className="text-blue-600 hover:underline">View full bias test results →</a>
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="benchmark_comparisons">Benchmark Comparisons</Label>
        <p className="text-sm text-gray-600">
          How does this model compare to baselines or alternative approaches?
          Template: "This model achieves [X% metric] compared to [Y% for baseline approach]"
        </p>
        <Textarea
          id="benchmark_comparisons"
          value={formData.benchmark_comparisons}
          onChange={(e) => setFormData({ ...formData, benchmark_comparisons: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );

  const renderSection5 = () => (
    <div className="space-y-6">
      {biasTestData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Auto-populated from Bias Testing:</h4>
          <p className="text-sm text-blue-800 whitespace-pre-wrap">
            {formData.fairness_assessment_summary}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fairness_assessment_summary">Fairness Assessment Summary</Label>
        <Textarea
          id="fairness_assessment_summary"
          value={formData.fairness_assessment_summary}
          onChange={(e) => setFormData({ ...formData, fairness_assessment_summary: e.target.value })}
          placeholder="Summarise fairness testing results..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="potential_risks_harms">
          Potential Risks or Harms <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-600">
          Consider: Could this model cause discrimination? Could it be misused? Could errors cause harm?
          Template: "Risk: [Description] | Mitigation: [What you've done to address it]"
        </p>
        <Textarea
          id="potential_risks_harms"
          value={formData.potential_risks_harms}
          onChange={(e) => setFormData({ ...formData, potential_risks_harms: e.target.value })}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="human_oversight_requirements">Human Oversight Requirements</Label>
        <p className="text-sm text-gray-600">
          What level of human involvement is needed when using this model?
          Examples: "All outputs must be reviewed by qualified personnel", "Human-in-the-loop for edge cases"
        </p>
        <Textarea
          id="human_oversight_requirements"
          value={formData.human_oversight_requirements}
          onChange={(e) => setFormData({ ...formData, human_oversight_requirements: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contestability_mechanisms">Contestability Mechanisms</Label>
        <p className="text-sm text-gray-600">How can users challenge or appeal model decisions?</p>
        <Textarea
          id="contestability_mechanisms"
          value={formData.contestability_mechanisms}
          onChange={(e) => setFormData({ ...formData, contestability_mechanisms: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ethical_considerations">Ethical Considerations</Label>
        <Textarea
          id="ethical_considerations"
          value={formData.ethical_considerations}
          onChange={(e) => setFormData({ ...formData, ethical_considerations: e.target.value })}
          placeholder="Any other ethical considerations not covered above..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderSection6 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="deployment_recommendations">Deployment Recommendations</Label>
        <p className="text-sm text-gray-600">Technical requirements, infrastructure needs, deployment best practices...</p>
        <Textarea
          id="deployment_recommendations"
          value={formData.deployment_recommendations}
          onChange={(e) => setFormData({ ...formData, deployment_recommendations: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="monitoring_plan">
          Monitoring Plan <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-600">
          What should be monitored in production? How often? What triggers retraining?
          Examples: "Monitor prediction distribution weekly for data drift", "Track accuracy on held-out test set monthly"
        </p>
        <Textarea
          id="monitoring_plan"
          value={formData.monitoring_plan}
          onChange={(e) => setFormData({ ...formData, monitoring_plan: e.target.value })}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="monitoring_requirements">Monitoring Requirements</Label>
        <Textarea
          id="monitoring_requirements"
          value={formData.monitoring_requirements}
          onChange={(e) => setFormData({ ...formData, monitoring_requirements: e.target.value })}
          placeholder="Specific monitoring tools, dashboards, alerts..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="update_frequency">Update/Retraining Schedule</Label>
        <Select
          value={formData.update_frequency}
          onValueChange={(value) => setFormData({ ...formData, update_frequency: value as UpdateFrequency })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CONTINUOUS">Continuous</SelectItem>
            <SelectItem value="MONTHLY">Monthly</SelectItem>
            <SelectItem value="QUARTERLY">Quarterly</SelectItem>
            <SelectItem value="ANNUALLY">Annually</SelectItem>
            <SelectItem value="AS_NEEDED">As Needed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="update_triggers">Update Triggers</Label>
        <p className="text-sm text-gray-600">Explain what triggers updates or retraining</p>
        <Textarea
          id="update_triggers"
          value={formData.update_triggers}
          onChange={(e) => setFormData({ ...formData, update_triggers: e.target.value })}
          placeholder="E.g., Performance degrades below 90%, Significant data drift detected, New regulations..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="decommissioning_criteria">Decommissioning Criteria</Label>
        <p className="text-sm text-gray-600">
          Under what conditions should this model be retired?
          Examples: "Performance degrades below X%", "Regulatory requirements change", "Better alternative available"
        </p>
        <Textarea
          id="decommissioning_criteria"
          value={formData.decommissioning_criteria}
          onChange={(e) => setFormData({ ...formData, decommissioning_criteria: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );

  const renderSection7 = () => (
    <div className="space-y-6">
      {regulatoryData && Object.keys(regulatoryData).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Auto-populated from Regulatory Assessments:</h4>
          <p className="text-sm text-blue-800 whitespace-pre-wrap">
            {formData.regulatory_compliance_summary}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="regulatory_compliance_summary">Regulatory Compliance Summary</Label>
        <p className="text-sm text-gray-600">
          Summarise the regulatory compliance status of this system (EU AI Act, UK AI Regulation, NIST AI RMF, etc.)
        </p>
        <Textarea
          id="regulatory_compliance_summary"
          value={formData.regulatory_compliance_summary}
          onChange={(e) => setFormData({ ...formData, regulatory_compliance_summary: e.target.value })}
          rows={5}
        />
      </div>

      {regulatoryData?.eu && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">EU AI Act Classification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Risk Tier:</strong> {regulatoryData.eu.risk_tier}</p>
              <p><strong>Assessment Date:</strong> {new Date(regulatoryData.eu.assessment_date).toLocaleDateString()}</p>
              <a href={`/ai-systems/${systemId}/regulatory`} className="text-blue-600 hover:underline">
                View full assessment →
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {regulatoryData?.uk && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">UK AI Regulation Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Overall Compliance Score:</strong> {regulatoryData.uk.overall_compliance_score}%</p>
              <p><strong>Assessment Date:</strong> {new Date(regulatoryData.uk.assessment_date).toLocaleDateString()}</p>
              <a href={`/ai-systems/${systemId}/regulatory`} className="text-blue-600 hover:underline">
                View full assessment →
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {regulatoryData?.nist && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">NIST AI RMF Maturity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Maturity Level:</strong> {regulatoryData.nist.overall_maturity_level}</p>
              <p><strong>Assessment Date:</strong> {new Date(regulatoryData.nist.assessment_date).toLocaleDateString()}</p>
              <a href={`/ai-systems/${systemId}/regulatory`} className="text-blue-600 hover:underline">
                View full assessment →
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderSection8 = () => (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-amber-900 mb-2">Review & Submit</h4>
        <p className="text-sm text-amber-800">
          Review all sections above before submitting. Once submitted, the model card will be saved with the status you select below.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="updated_by">
            Your Name (Updated By) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="updated_by"
            value={formData.updated_by}
            onChange={(e) => setFormData({ ...formData, updated_by: e.target.value })}
            placeholder="Enter your name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="card_version">Card Version</Label>
          <Input
            id="card_version"
            value={formData.card_version}
            onChange={(e) => setFormData({ ...formData, card_version: e.target.value })}
            placeholder="e.g., 1.0, 1.1, 2.0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value as ModelCardStatus })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reviewer_assigned">Reviewer Assigned (optional)</Label>
        <Input
          id="reviewer_assigned"
          value={formData.reviewer_assigned}
          onChange={(e) => setFormData({ ...formData, reviewer_assigned: e.target.value })}
          placeholder="Name of person assigned to review this card"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review_comments">Review Comments (optional)</Label>
        <Textarea
          id="review_comments"
          value={formData.review_comments}
          onChange={(e) => setFormData({ ...formData, review_comments: e.target.value })}
          placeholder="Any comments or notes about this model card..."
          rows={3}
        />
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Completeness Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {formData.model_details_summary ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              )}
              <span className="text-sm">Model Description</span>
            </div>
            <div className="flex items-center gap-2">
              {formData.intended_use ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              )}
              <span className="text-sm">Intended Use</span>
            </div>
            <div className="flex items-center gap-2">
              {formData.training_data_description ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              )}
              <span className="text-sm">Training Data Description</span>
            </div>
            <div className="flex items-center gap-2">
              {formData.potential_risks_harms ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              )}
              <span className="text-sm">Potential Risks & Harms</span>
            </div>
            <div className="flex items-center gap-2">
              {formData.monitoring_plan ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              )}
              <span className="text-sm">Monitoring Plan</span>
            </div>
            <div className="flex items-center gap-2">
              {formData.updated_by ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              )}
              <span className="text-sm">Updated By</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {SECTIONS.map((section, index) => {
            const Icon = section.icon;
            const isActive = currentSection === section.id;
            const isCompleted = currentSection > section.id;
            
            return (
              <div key={section.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : isCompleted
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                {index < SECTIONS.length - 1 && (
                  <div
                    className={`w-8 h-0.5 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section title */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900">
          {SECTIONS[currentSection - 1].title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Section {currentSection} of {SECTIONS.length}
        </p>
      </div>

      {/* Section content */}
      <div className="bg-white border rounded-lg p-6 min-h-[500px]">
        {renderSection()}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          {currentSection > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
          )}
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>

        <div>
          {currentSection < SECTIONS.length ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : existingCard ? 'Update Model Card' : 'Create Model Card'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
