'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { toast } from '@/components/ui/use-toast';
import { BiasTestType, BiasSeverityLevel, BiasTestStatus } from '@prisma/client';

interface CreateBiasTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  systemId?: string;
}

export function CreateBiasTestDialog({ isOpen, onClose, onSuccess, systemId }: CreateBiasTestDialogProps) {
  const [formData, setFormData] = useState({
    system_id: systemId || '',
    test_name: '',
    test_type: 'DEMOGRAPHIC_PARITY' as BiasTestType,
    dataset_description: '',
    sample_size: '',
    test_methodology: '',
    tested_by: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.system_id || !formData.test_name || !formData.tested_by) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/bias-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sample_size: parseInt(formData.sample_size) || 0,
          overall_fairness_score: 0,
          issues_detected: false,
          severity_level: BiasSeverityLevel.NO_ISSUES,
          status: BiasTestStatus.PLANNED,
          protected_attributes_tested: [],
        }),
      });

      if (!response.ok) throw new Error('Failed to create test');

      toast({
        title: 'Test Created',
        description: 'Bias test has been created successfully',
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating test:', error);
      toast({
        title: 'Error',
        description: 'Failed to create bias test',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Bias Test</DialogTitle>
          <DialogDescription>
            Configure a new bias and fairness test for an AI system
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="test_name">Test Name *</Label>
            <Input
              id="test_name"
              value={formData.test_name}
              onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
              placeholder="e.g., Gender Fairness Assessment Q4 2025"
              required
            />
          </div>

          <div>
            <Label htmlFor="system_id">AI System ID *</Label>
            <Input
              id="system_id"
              value={formData.system_id}
              onChange={(e) => setFormData({ ...formData, system_id: e.target.value })}
              placeholder="System ID"
              required
            />
          </div>

          <div>
            <Label htmlFor="test_type">Test Type *</Label>
            <Select
              value={formData.test_type}
              onValueChange={(value) => setFormData({ ...formData, test_type: value as BiasTestType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={BiasTestType.DEMOGRAPHIC_PARITY}>Demographic Parity</SelectItem>
                <SelectItem value={BiasTestType.EQUAL_OPPORTUNITY}>Equal Opportunity</SelectItem>
                <SelectItem value={BiasTestType.EQUALISED_ODDS}>Equalised Odds</SelectItem>
                <SelectItem value={BiasTestType.PREDICTIVE_PARITY}>Predictive Parity</SelectItem>
                <SelectItem value={BiasTestType.CALIBRATION}>Calibration</SelectItem>
                <SelectItem value={BiasTestType.INDIVIDUAL_FAIRNESS}>Individual Fairness</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dataset_description">Dataset Description *</Label>
            <Textarea
              id="dataset_description"
              value={formData.dataset_description}
              onChange={(e) => setFormData({ ...formData, dataset_description: e.target.value })}
              placeholder="Describe the test dataset..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="sample_size">Sample Size</Label>
            <Input
              id="sample_size"
              type="number"
              value={formData.sample_size}
              onChange={(e) => setFormData({ ...formData, sample_size: e.target.value })}
              placeholder="e.g., 10000"
            />
          </div>

          <div>
            <Label htmlFor="test_methodology">Test Methodology *</Label>
            <Textarea
              id="test_methodology"
              value={formData.test_methodology}
              onChange={(e) => setFormData({ ...formData, test_methodology: e.target.value })}
              placeholder="Explain your testing approach..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="tested_by">Tested By *</Label>
            <Input
              id="tested_by"
              value={formData.tested_by}
              onChange={(e) => setFormData({ ...formData, tested_by: e.target.value })}
              placeholder="Your name"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Test'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
