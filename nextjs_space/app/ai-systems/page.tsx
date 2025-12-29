'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AISystem, AISystemStatus, RiskLevel } from '@/lib/types'

export default function AISystemsPage() {
  const router = useRouter()
  const [aiSystems, setAiSystems] = useState<AISystem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<{ status?: AISystemStatus; riskLevel?: RiskLevel }>({})

  useEffect(() => {
    fetchAISystems()
  }, [filter])

  const fetchAISystems = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.status) params.append('status', filter.status)
      if (filter.riskLevel) params.append('riskLevel', filter.riskLevel)
      
      const response = await fetch(`/api/ai-systems?${params}`)
      const data = await response.json()
      setAiSystems(data)
    } catch (error) {
      console.error('Error fetching AI systems:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8">Loading AI systems...</div>

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">AI Systems Inventory</h1>
        <button
          onClick={() => router.push('/ai-systems/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Register New System
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <select
          value={filter.status || ''}
          onChange={(e) => setFilter({ ...filter, status: e.target.value as AISystemStatus })}
          className="border rounded px-3 py-2"
        >
          <option value="">All Statuses</option>
          <option value="PLANNING">Planning</option>
          <option value="DEVELOPMENT">Development</option>
          <option value="TESTING">Testing</option>
          <option value="DEPLOYED">Deployed</option>
          <option value="RETIRED">Retired</option>
        </select>

        <select
          value={filter.riskLevel || ''}
          onChange={(e) => setFilter({ ...filter, riskLevel: e.target.value as RiskLevel })}
          className="border rounded px-3 py-2"
        >
          <option value="">All Risk Levels</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      <div className="grid gap-4">
        {aiSystems.map((system) => (
          <div
            key={system.id}
            onClick={() => router.push(`/ai-systems/${system.id}`)}
            className="border rounded-lg p-6 hover:shadow-lg cursor-pointer transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{system.name}</h2>
                <p className="text-gray-600 mt-1">{system.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <span>Type: {system.system_type}</span>
                  {system.use_case && <span className="ml-4">Use Case: {system.use_case}</span>}
                </div>
                <div className="mt-2 flex gap-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    system.status === 'DEPLOYED' ? 'bg-green-100 text-green-800' :
                    system.status === 'DEVELOPMENT' ? 'bg-blue-100 text-blue-800' :
                    system.status === 'TESTING' ? 'bg-yellow-100 text-yellow-800' :
                    system.status === 'RETIRED' ? 'bg-gray-100 text-gray-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {system.status}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    system.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                    system.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    system.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {system.risk_level} Risk
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Deployment Date</div>
                <div className="font-medium">
                  {system.deployment_date 
                    ? new Date(system.deployment_date).toLocaleDateString()
                    : 'Not deployed'
                  }
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {aiSystems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No AI systems found. Click "Register New System" to get started.
        </div>
      )}
    </div>
  )
}
