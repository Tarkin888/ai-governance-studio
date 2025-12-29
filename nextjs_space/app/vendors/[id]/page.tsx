'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Vendor, VendorAssessment } from '@/lib/types'

export default function VendorDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [assessments, setAssessments] = useState<VendorAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewAssessment, setShowNewAssessment] = useState(false)

  useEffect(() => {
    fetchVendorData()
  }, [params.id])

  const fetchVendorData = async () => {
    try {
      const [vendorRes, assessmentsRes] = await Promise.all([
        fetch(`/api/vendors/${params.id}`),
        fetch(`/api/vendors/${params.id}/assessments`)
      ])
      
      const vendorData = await vendorRes.json()
      const assessmentsData = await assessmentsRes.json()
      
      setVendor(vendorData)
      setAssessments(assessmentsData)
    } catch (error) {
      console.error('Error fetching vendor data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewAssessment = async () => {
    try {
      const response = await fetch(`/api/vendors/${params.id}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: params.id,
          assessment_date: new Date(),
          next_assessment_due: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          current_risk_tier: vendor?.current_risk_tier
        })
      })
      
      if (response.ok) {
        fetchVendorData()
        setShowNewAssessment(false)
      }
    } catch (error) {
      console.error('Error creating assessment:', error)
    }
  }

  if (loading) return <div className="p-8">Loading vendor details...</div>
  if (!vendor) return <div className="p-8">Vendor not found</div>

  return (
    <div className="container mx-auto p-8">
      <button
        onClick={() => router.back()}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← Back to Vendors
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{vendor.name}</h1>
            <p className="text-gray-600">{vendor.description}</p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded text-sm ${
              vendor.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
              vendor.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
              vendor.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {vendor.status}
            </span>
            <span className={`px-3 py-1 rounded text-sm ${
              vendor.current_risk_tier === 'CRITICAL' ? 'bg-red-100 text-red-800' :
              vendor.current_risk_tier === 'HIGH' ? 'bg-orange-100 text-orange-800' :
              vendor.current_risk_tier === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {vendor.current_risk_tier} Risk
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <div className="text-sm text-gray-500">Website</div>
            <a href={vendor.website || '#'} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              {vendor.website || 'N/A'}
            </a>
          </div>
          <div>
            <div className="text-sm text-gray-500">Contact Email</div>
            <div>{vendor.contact_email || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Last Assessment</div>
            <div>
              {vendor.last_assessment_date
                ? new Date(vendor.last_assessment_date).toLocaleDateString()
                : 'Never'
              }
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Next Assessment Due</div>
            <div>
              {vendor.next_assessment_due
                ? new Date(vendor.next_assessment_due).toLocaleDateString()
                : 'Not scheduled'
              }
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Assessment History</h2>
          <button
            onClick={() => setShowNewAssessment(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            New Assessment
          </button>
        </div>

        {showNewAssessment && (
          <div className="bg-gray-50 p-4 rounded mb-4">
            <h3 className="font-semibold mb-2">Create New Assessment</h3>
            <button
              onClick={handleNewAssessment}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2"
            >
              Create
            </button>
            <button
              onClick={() => setShowNewAssessment(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="space-y-4">
          {assessments.map((assessment) => (
            <div key={assessment.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">
                    Assessment Date: {new Date(assessment.assessment_date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Risk Tier: {assessment.current_risk_tier}
                  </div>
                  <div className="text-sm text-gray-600">
                    Next Due: {new Date(assessment.next_assessment_due).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  assessment.approval_decision === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  assessment.approval_decision === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  assessment.approval_decision === 'CONDITIONAL' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {assessment.approval_decision || 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {assessments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No assessments yet. Click "New Assessment" to create one.
          </div>
        )}
      </div>
    </div>
  )
}
