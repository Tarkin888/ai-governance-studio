'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Download, Plus, Edit2, Trash2, AlertCircle, Search, TestTube2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  getAllSystems,
  addSystem,
  updateSystem,
  deleteSystem,
  initializeSampleData,
  QADemoSystem,
} from '@/lib/indexeddb';

export default function QADemoClient() {
  const [systems, setSystems] = useState<QADemoSystem[]>([]);
  const [filteredSystems, setFilteredSystems] = useState<QADemoSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState<QADemoSystem | null>(null);
  const [deletingSystemId, setDeletingSystemId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<QADemoSystem>>({});

  // Load systems from IndexedDB
  const loadSystems = async () => {
    try {
      setLoading(true);
      await initializeSampleData();
      const data = await getAllSystems();
      setSystems(data);
      setFilteredSystems(data);
    } catch (error) {
      console.error('Error loading systems:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AI systems',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystems();
  }, []);

  // Filter systems
  useEffect(() => {
    let filtered = [...systems];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (sys: QADemoSystem) =>
          sys.system_name.toLowerCase().includes(query) ||
          sys.system_id.toLowerCase().includes(query) ||
          sys.purpose.toLowerCase().includes(query)
      );
    }

    if (riskFilter !== 'all') {
      filtered = filtered.filter((sys: QADemoSystem) =>
        sys.risk_classification.toLowerCase().includes(riskFilter.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (sys: QADemoSystem) => sys.deployment_status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredSystems(filtered);
  }, [systems, searchQuery, riskFilter, statusFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'System ID',
      'System Name',
      'Purpose',
      'Business Owner',
      'Technical Owner',
      'AI Model Type',
      'Deployment Status',
      'Deployment Date',
      'Data Sources',
      'Vendor',
      'Integration Points',
      'Processing Volume',
      'Risk Classification',
      'Date Added',
      'Last Modified',
      'Modified By',
    ];

    const csvContent = [
      headers.join(','),
      ...filteredSystems.map((sys: QADemoSystem) =>
        [
          sys.system_id,
          `"${sys.system_name}"`,
          `"${sys.purpose}"`,
          sys.business_owner,
          sys.technical_owner,
          sys.ai_model_type,
          sys.deployment_status,
          sys.deployment_date,
          `"${sys.data_sources}"`,
          sys.vendor,
          `"${sys.integration_points}"`,
          sys.processing_volume,
          sys.risk_classification,
          sys.date_added,
          sys.last_modified,
          sys.modified_by,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-systems-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: `Exported ${filteredSystems.length} AI systems to CSV`,
    });
  };

  // Open add dialog
  const handleAddNew = () => {
    setEditingSystem(null);
    setFormData({
      system_id: '',
      system_name: '',
      purpose: '',
      business_owner: '',
      technical_owner: '',
      ai_model_type: 'LLM',
      deployment_status: 'Planning',
      deployment_date: new Date().toISOString().split('T')[0],
      data_sources: '',
      vendor: '',
      integration_points: '',
      processing_volume: '',
      risk_classification: 'Not Yet Assessed',
      date_added: new Date().toISOString().split('T')[0],
      last_modified: new Date().toISOString().split('T')[0],
      modified_by: 'QA User',
    });
    setIsAddEditOpen(true);
  };

  // Open edit dialog
  const handleEdit = (system: QADemoSystem) => {
    setEditingSystem(system);
    setFormData(system);
    setIsAddEditOpen(true);
  };

  // Save system (add or edit)
  const handleSave = async () => {
    try {
      if (!formData.system_id || !formData.system_name || !formData.purpose) {
        toast({
          title: 'Validation Error',
          description: 'System ID, Name, and Purpose are required',
          variant: 'destructive',
        });
        return;
      }

      const systemData: QADemoSystem = {
        ...formData,
        last_modified: new Date().toISOString().split('T')[0],
      } as QADemoSystem;

      if (editingSystem) {
        await updateSystem(systemData);
        toast({
          title: 'System Updated',
          description: `${systemData.system_name} has been updated successfully`,
        });
      } else {
        // Check for duplicate ID
        const existing = systems.find((s: QADemoSystem) => s.system_id === systemData.system_id);
        if (existing) {
          toast({
            title: 'Duplicate System ID',
            description: 'A system with this ID already exists',
            variant: 'destructive',
          });
          return;
        }
        await addSystem(systemData);
        toast({
          title: 'System Added',
          description: `${systemData.system_name} has been added successfully`,
        });
      }

      setIsAddEditOpen(false);
      await loadSystems();
    } catch (error) {
      console.error('Error saving system:', error);
      toast({
        title: 'Error',
        description: 'Failed to save system',
        variant: 'destructive',
      });
    }
  };

  // Open delete dialog
  const handleDeleteClick = (systemId: string) => {
    setDeletingSystemId(systemId);
    setIsDeleteOpen(true);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deletingSystemId) return;

    try {
      await deleteSystem(deletingSystemId);
      toast({
        title: 'System Deleted',
        description: 'The AI system has been removed',
      });
      setIsDeleteOpen(false);
      setDeletingSystemId(null);
      await loadSystems();
    } catch (error) {
      console.error('Error deleting system:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete system',
        variant: 'destructive',
      });
    }
  };

  const getRiskColor = (risk: string) => {
    if (risk.includes('High') || risk.includes('Prohibited')) return 'text-red-600 bg-red-50';
    if (risk.includes('Medium') || risk.includes('Limited')) return 'text-amber-600 bg-amber-50';
    if (risk.includes('Low') || risk.includes('Minimal')) return 'text-green-600 bg-green-50';
    return 'text-slate-600 bg-slate-50';
  };

  const getStatusColor = (status: string) => {
    if (status === 'Live') return 'bg-green-100 text-green-800';
    if (status === 'Testing' || status === 'Staging') return 'bg-blue-100 text-blue-800';
    if (status === 'Planning') return 'bg-slate-100 text-slate-800';
    if (status === 'Retired') return 'bg-red-100 text-red-800';
    return 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TestTube2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">QA Demo Mode</h1>
                <p className="text-sm text-slate-600">AI Governance Studio - Public Testing Environment</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
              Demo Mode
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Systems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{systems.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Live Systems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {systems.filter((s: QADemoSystem) => s.deployment_status === 'Live').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">High Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {systems.filter((s: QADemoSystem) => s.risk_classification.includes('High')).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Filtered Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{filteredSystems.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>AI System Registry</CardTitle>
                <CardDescription>Manage and monitor AI systems (demo data persists in browser)</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExportCSV} variant="outline" data-testid="export-csv">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={handleAddNew} data-testid="add-system">
                  <Plus className="w-4 h-4 mr-2" />
                  Add AI System
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="search-input" className="sr-only">
                  Search systems
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="search-input"
                    type="text"
                    placeholder="Search by name, ID, or purpose..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="search-input"
                    aria-label="Search AI systems by name, ID, or purpose"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="risk-filter" className="sr-only">
                  Filter by risk
                </Label>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger id="risk-filter" data-testid="risk-filter" aria-label="Filter by risk classification">
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risks</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="status-filter" className="sr-only">
                  Filter by status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter" data-testid="status-filter" aria-label="Filter by deployment status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-slate-600">Loading systems...</p>
              </div>
            ) : filteredSystems.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Systems Found</h3>
                <p className="text-slate-600 mb-4">Try adjusting your search or filters</p>
                <Button onClick={handleAddNew} data-testid="add-system-empty">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First System
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table
                  className="w-full border-collapse"
                  role="grid"
                  data-testid="ai-systems-table"
                  aria-label="AI Systems Inventory Table"
                >
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700" scope="col">
                        System ID
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700" scope="col">
                        System Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700" scope="col">
                        Purpose
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700" scope="col">
                        Risk
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700" scope="col">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700" scope="col">
                        Vendor
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700" scope="col">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSystems.map((system: QADemoSystem) => (
                      <tr
                        key={system.system_id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        data-testid={`system-row-${system.system_id}`}
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm text-slate-900">{system.system_id}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{system.system_name}</div>
                          <div className="text-xs text-slate-500">Owner: {system.business_owner}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-slate-700 max-w-xs truncate">{system.purpose}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getRiskColor(system.risk_classification)} variant="outline">
                            {system.risk_classification}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(system.deployment_status)}>{system.deployment_status}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-slate-700">{system.vendor}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(system)}
                              data-testid={`edit-${system.system_id}`}
                              aria-label={`Edit ${system.system_name}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(system.system_id)}
                              data-testid={`delete-${system.system_id}`}
                              aria-label={`Delete ${system.system_name}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Banner */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">QA Demo Mode Information</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>All data is stored locally in your browser using IndexedDB</li>
                  <li>Data persists across sessions but is isolated to this browser</li>
                  <li>No authentication required - this is a public testing environment</li>
                  <li>Changes do not affect production data</li>
                  <li>Performance optimized for 100+ systems</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="add-edit-dialog">
          <DialogHeader>
            <DialogTitle>{editingSystem ? 'Edit AI System' : 'Add New AI System'}</DialogTitle>
            <DialogDescription>
              {editingSystem ? 'Update the details of this AI system' : 'Enter the details for the new AI system'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* System ID */}
            <div>
              <Label htmlFor="system-id">System ID *</Label>
              <Input
                id="system-id"
                value={formData.system_id || ''}
                onChange={(e) => setFormData({ ...formData, system_id: e.target.value })}
                placeholder="e.g., CHAT-001"
                disabled={!!editingSystem}
                data-testid="input-system-id"
                aria-required="true"
              />
            </div>

            {/* System Name */}
            <div>
              <Label htmlFor="system-name">System Name *</Label>
              <Input
                id="system-name"
                value={formData.system_name || ''}
                onChange={(e) => setFormData({ ...formData, system_name: e.target.value })}
                placeholder="e.g., Customer Support Chatbot"
                data-testid="input-system-name"
                aria-required="true"
              />
            </div>

            {/* Purpose */}
            <div>
              <Label htmlFor="purpose">Purpose *</Label>
              <Textarea
                id="purpose"
                value={formData.purpose || ''}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Describe the system's purpose"
                rows={3}
                data-testid="input-purpose"
                aria-required="true"
              />
            </div>

            {/* Owners */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business-owner">Business Owner</Label>
                <Input
                  id="business-owner"
                  value={formData.business_owner || ''}
                  onChange={(e) => setFormData({ ...formData, business_owner: e.target.value })}
                  placeholder="Name"
                  data-testid="input-business-owner"
                />
              </div>
              <div>
                <Label htmlFor="technical-owner">Technical Owner</Label>
                <Input
                  id="technical-owner"
                  value={formData.technical_owner || ''}
                  onChange={(e) => setFormData({ ...formData, technical_owner: e.target.value })}
                  placeholder="Name"
                  data-testid="input-technical-owner"
                />
              </div>
            </div>

            {/* AI Model Type */}
            <div>
              <Label htmlFor="ai-model-type">AI Model Type</Label>
              <Select
                value={formData.ai_model_type || 'LLM'}
                onValueChange={(value) => setFormData({ ...formData, ai_model_type: value })}
              >
                <SelectTrigger id="ai-model-type" data-testid="select-ai-model-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LLM">LLM</SelectItem>
                  <SelectItem value="CNN">CNN</SelectItem>
                  <SelectItem value="Transformer">Transformer</SelectItem>
                  <SelectItem value="Ensemble">Ensemble</SelectItem>
                  <SelectItem value="Collaborative Filtering">Collaborative Filtering</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Deployment Status */}
            <div>
              <Label htmlFor="deployment-status">Deployment Status</Label>
              <Select
                value={formData.deployment_status || 'Planning'}
                onValueChange={(value) => setFormData({ ...formData, deployment_status: value })}
              >
                <SelectTrigger id="deployment-status" data-testid="select-deployment-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="Testing">Testing</SelectItem>
                  <SelectItem value="Staging">Staging</SelectItem>
                  <SelectItem value="Live">Live</SelectItem>
                  <SelectItem value="Retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vendor */}
            <div>
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                value={formData.vendor || ''}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="e.g., OpenAI, Internal"
                data-testid="input-vendor"
              />
            </div>

            {/* Risk Classification */}
            <div>
              <Label htmlFor="risk-classification">Risk Classification</Label>
              <Select
                value={formData.risk_classification || 'Not Yet Assessed'}
                onValueChange={(value) => setFormData({ ...formData, risk_classification: value })}
              >
                <SelectTrigger id="risk-classification" data-testid="select-risk-classification">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High (EU AI Act)">High (EU AI Act)</SelectItem>
                  <SelectItem value="Medium (Limited Risk)">Medium (Limited Risk)</SelectItem>
                  <SelectItem value="Low (Minimal Risk)">Low (Minimal Risk)</SelectItem>
                  <SelectItem value="Not Yet Assessed">Not Yet Assessed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddEditOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button onClick={handleSave} data-testid="button-save">
              {editingSystem ? 'Update System' : 'Add System'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent data-testid="delete-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete AI System</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this AI system? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} data-testid="button-confirm-delete" className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
