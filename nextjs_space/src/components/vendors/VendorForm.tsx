'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { VendorProfileFormData } from '@/types/vendor';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Building2, Mail, Phone, Globe, MapPin, Users, Calendar, X } from 'lucide-react';
import { toast } from 'sonner';

const vendorFormSchema = z.object({
  vendorName: z.string().min(2, 'Vendor name must be at least 2 characters'),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  contactEmail: z.string().email('Must be a valid email address'),
  contactPhone: z.string().optional(),
  industry: z.string().min(2, 'Industry is required'),
  headquarters: z.string().min(2, 'Headquarters location is required'),
  employeeCount: z.string().optional(),
  yearFounded: z.coerce.number().int().min(1800).max(new Date().getFullYear()).optional(),
  description: z.string().optional(),
  vendorType: z.enum(['AI Provider', 'Data Provider', 'Infrastructure', 'Consultancy']),
  productsServices: z.array(z.string()).min(1, 'At least one product/service is required'),
  aiCapabilities: z.array(z.string()).min(1, 'At least one AI capability is required'),
  certifications: z.array(z.string()),
  gdprCompliant: z.boolean().default(false),
  iso42001Certified: z.boolean().default(false),
  dataProcessingAgreement: z.boolean().default(false),
  approvalStatus: z.enum(['Pending', 'Approved', 'Conditional', 'Rejected']).default('Pending'),
  onboardingStatus: z.enum(['New', 'In Progress', 'Active', 'Suspended', 'Terminated']).default('New'),
});

interface VendorFormProps {
  initialData?: Partial<VendorProfileFormData> & { id?: string };
  onSuccess?: () => void;
}

export function VendorForm({ initialData, onSuccess }: VendorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [productInput, setProductInput] = useState('');
  const [capabilityInput, setCapabilityInput] = useState('');
  const [certificationInput, setCertificationInput] = useState('');

  const form = useForm<z.infer<typeof vendorFormSchema>>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      vendorName: initialData?.vendorName || '',
      website: initialData?.website || '',
      contactEmail: initialData?.contactEmail || '',
      contactPhone: initialData?.contactPhone || '',
      industry: initialData?.industry || '',
      headquarters: initialData?.headquarters || '',
      employeeCount: initialData?.employeeCount || '',
      yearFounded: initialData?.yearFounded || undefined,
      description: initialData?.description || '',
      vendorType: initialData?.vendorType || 'AI Provider',
      productsServices: initialData?.productsServices || [],
      aiCapabilities: initialData?.aiCapabilities || [],
      certifications: initialData?.certifications || [],
      gdprCompliant: initialData?.gdprCompliant || false,
      iso42001Certified: initialData?.iso42001Certified || false,
      dataProcessingAgreement: initialData?.dataProcessingAgreement || false,
      approvalStatus: initialData?.approvalStatus || 'Pending',
      onboardingStatus: initialData?.onboardingStatus || 'New',
    },
  });

  const onSubmit = async (data: z.infer<typeof vendorFormSchema>) => {
    try {
      setLoading(true);
      
      const url = initialData?.id ? `/api/vendors/${initialData.id}` : '/api/vendors';
      const method = initialData?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save vendor');
      }

      const vendor = await response.json();
      
      toast.success(initialData?.id ? 'Vendor updated successfully' : 'Vendor created successfully');
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/vendors/${vendor.id}`);
      }
    } catch (error: any) {
      console.error('Error saving vendor:', error);
      toast.error(error?.message || 'Failed to save vendor');
    } finally {
      setLoading(false);
    }
  };

  const addItem = (field: any, value: string, setter: (val: string) => void) => {
    if (value.trim()) {
      const currentValues = form.getValues(field);
      form.setValue(field, [...currentValues, value.trim()]);
      setter('');
    }
  };

  const removeItem = (field: any, index: number) => {
    const currentValues = form.getValues(field);
    form.setValue(field, currentValues.filter((_: any, i: number) => i !== index));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white border rounded-lg p-6 space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b">
            <Building2 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Basic Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="vendorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme AI Solutions Ltd" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vendorType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vendor type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AI Provider">AI Provider</SelectItem>
                      <SelectItem value="Data Provider">Data Provider</SelectItem>
                      <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="Consultancy">Consultancy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry *</FormLabel>
                  <FormControl>
                    <Input placeholder="Healthcare, FinTech, Retail, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="headquarters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headquarters *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input placeholder="London, UK" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Count</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1-50">1-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-1000">201-1,000</SelectItem>
                      <SelectItem value="1000+">1,000+</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="yearFounded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year Founded</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="2020"
                        className="pl-10"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        value={field.value || ''}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief overview of the vendor's business and offerings..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide a concise overview of the vendor's capabilities and focus areas.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contact Information */}
        <div className="bg-white border rounded-lg p-6 space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b">
            <Mail className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Contact Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="contact@vendor.com"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="tel"
                        placeholder="+44 20 1234 5678"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="url"
                        placeholder="https://www.vendor.com"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Products & Services */}
        <div className="bg-white border rounded-lg p-6 space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Products & Capabilities</h3>
          </div>

          <FormField
            control={form.control}
            name="productsServices"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Products/Services *</FormLabel>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="e.g., ChatGPT API, Image Recognition Service"
                      value={productInput}
                      onChange={(e) => setProductInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addItem('productsServices', productInput, setProductInput);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addItem('productsServices', productInput, setProductInput)}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((item, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {item}
                        <button
                          type="button"
                          onClick={() => removeItem('productsServices', index)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="aiCapabilities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AI Capabilities *</FormLabel>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="e.g., NLP, Computer Vision, Predictive Analytics"
                      value={capabilityInput}
                      onChange={(e) => setCapabilityInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addItem('aiCapabilities', capabilityInput, setCapabilityInput);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addItem('aiCapabilities', capabilityInput, setCapabilityInput)}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((item, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {item}
                        <button
                          type="button"
                          onClick={() => removeItem('aiCapabilities', index)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Compliance & Certifications */}
        <div className="bg-white border rounded-lg p-6 space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b">
            <Building2 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Compliance & Certifications</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="gdprCompliant"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>GDPR Compliant</FormLabel>
                    <FormDescription>
                      Vendor complies with GDPR
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="iso42001Certified"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>ISO 42001 Certified</FormLabel>
                    <FormDescription>
                      Certified AI management system
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataProcessingAgreement"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>DPA in Place</FormLabel>
                    <FormDescription>
                      Data processing agreement signed
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="certifications"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Certifications</FormLabel>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="e.g., ISO 27001, SOC 2 Type II"
                      value={certificationInput}
                      onChange={(e) => setCertificationInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addItem('certifications', certificationInput, setCertificationInput);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addItem('certifications', certificationInput, setCertificationInput)}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((item, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {item}
                        <button
                          type="button"
                          onClick={() => removeItem('certifications', index)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <FormDescription>
                  Add any additional security or compliance certifications
                </FormDescription>
              </FormItem>
            )}
          />
        </div>

        {/* Status */}
        {initialData?.id && (
          <div className="bg-white border rounded-lg p-6 space-y-6">
            <div className="flex items-center space-x-2 pb-4 border-b">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Status</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="approvalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approval Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Conditional">Conditional</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="onboardingStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Onboarding Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                        <SelectItem value="Terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? 'Saving...' : initialData?.id ? 'Update Vendor' : 'Create Vendor'}
          </Button>
        </div>
      </form>
    </Form>
  );
}




