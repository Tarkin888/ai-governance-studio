'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VendorProfile, getRiskColor, getStatusColor } from '@/types/vendor';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Search,
  Plus,
  AlertCircle,
  FileText,
  Calendar,
} from 'lucide-react';

interface VendorListProps {
  onSelectVendor?: (vendor: VendorProfile) => void;
}

export function VendorList({ onSelectVendor }: VendorListProps) {
  const router = useRouter();
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchVendors();
  }, [search, riskFilter, statusFilter, typeFilter]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (search) params.append('search', search);
      if (riskFilter !== 'all') params.append('riskTier', riskFilter);
      if (statusFilter !== 'all') params.append('approvalStatus', statusFilter);
      if (typeFilter !== 'all') params.append('vendorType', typeFilter);

      const response = await fetch(`/api/vendors?${params}`);
      const data = await response.json();
      setVendors(data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorClick = (vendor: VendorProfile) => {
    if (onSelectVendor) {
      onSelectVendor(vendor);
    } else {
      router.push(`/vendors/${vendor.id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Vendor Management</h2>
        </div>
        <Button
          onClick={() => router.push('/vendors/new')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Risk Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk Tiers</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Approval Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Conditional">Conditional</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Vendor Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="AI Provider">AI Provider</SelectItem>
            <SelectItem value="Data Provider">Data Provider</SelectItem>
            <SelectItem value="Infrastructure">Infrastructure</SelectItem>
            <SelectItem value="Consultancy">Consultancy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vendor Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No vendors found</p>
          <Button
            onClick={() => router.push('/vendors/new')}
            variant="outline"
            className="mt-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Vendor
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Risk Tier</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Assessment</TableHead>
                <TableHead>Certifications</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor: any) => (
                <TableRow
                  key={vendor.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleVendorClick(vendor)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span>{vendor.vendorName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{vendor.vendorType}</TableCell>
                  <TableCell>{vendor.industry}</TableCell>
                  <TableCell>
                    {vendor.riskTier ? (
                      <Badge className={getRiskColor(vendor.riskTier)}>
                        {vendor.riskTier}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">Not assessed</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {vendor.overallRiskScore ? (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {vendor.overallRiskScore.toFixed(1)}
                        </span>
                        <span className="text-gray-400">/100</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(vendor.approvalStatus)}>
                      {vendor.approvalStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {vendor.lastAssessmentDate ? (
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(vendor.lastAssessmentDate).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {vendor.iso42001Certified && (
                        <Badge variant="outline" className="text-xs">
                          ISO 42001
                        </Badge>
                      )}
                      {vendor.gdprCompliant && (
                        <Badge variant="outline" className="text-xs">
                          GDPR
                        </Badge>
                      )}
                      {vendor.certifications && vendor.certifications.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{vendor.certifications.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {vendor._count && vendor._count.incidents > 0 && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      {vendor._count && vendor._count.contracts === 0 && (
                        <FileText className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-900">Total Vendors</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {vendors.length}
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm font-medium text-green-900">Approved</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {vendors.filter(v => v.approvalStatus === 'Approved').length}
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm font-medium text-red-900">High Risk</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {vendors.filter(v => v.riskTier === 'High' || v.riskTier === 'Critical').length}
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm font-medium text-yellow-900">Pending Review</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {vendors.filter(v => v.approvalStatus === 'Pending').length}
          </div>
        </div>
      </div>
    </div>
  );
}


