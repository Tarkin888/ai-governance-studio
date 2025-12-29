'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Vendor, VendorStatus, RiskTier } from '@/lib/types'

export default function VendorsPage() {
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<{ status?: VendorStatus; riskTier?: RiskTier }>({})

  useEffect(() => {
    fetchVendors()
  }, [filter])

  const fetchVendors = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.status) params.append('status', filter.status)
      if (filter.riskTier) params.append('riskTier', filter.riskTier)
      
      const response = await fetch(`/api/vendors?${params}`)
      const data = await response.json()
      setVendors(data)
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8">Loading vendors...</div>

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Third-Party Vendors</h1>
        <button
          onClick={() => router.push('/vendors/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Vendor
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <select
          value={filter.status || ''}
          onChange={(e) => setFilter({ ...filter, status: e.target.value as VendorStatus })}
          className="border rounded px-3 py-2"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="TERMINATED">Terminated</option>
        </select>

        <select
          value={filter.riskTier || ''}
          onChange={(e) => setFilter({ ...filter, riskTier: e.target.value as RiskTier })}
          className="border rounded px-3 py-2"
        >
          <option value="">All Risk Tiers</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      <div className="grid gap-4">
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            onClick={() => router.push(`/vendors/${vendor.id}`)}
            className="border rounded-lg p-6 hover:shadow-lg cursor-pointer transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{vendor.name}</h2>
                <p className="text-gray-600 mt-1">{vendor.description}</p>
                <div className="mt-2 flex gap-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    vendor.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    vendor.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                    vendor.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {vendor.status}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    vendor.current_risk_tier === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                    vendor.current_risk_tier === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    vendor.current_risk_tier === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {vendor.current_risk_tier} Risk
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Last Assessment</div>
                <div className="font-medium">
                  {vendor.last_assessment_date 
                    ? new Date(vendor.last_assessment_date).toLocaleDateString()
                    : 'Never'
                  }
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {vendors.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No vendors found. Click "Add Vendor" to get started.
        </div>
      )}
    </div>
  )
}
