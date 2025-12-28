'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  systemId: string
  systemName: string
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onSuccess,
  systemId,
  systemName,
}: DeleteConfirmationDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/ai-systems/${systemId}`, {
        method: 'DELETE',
      })

      const data = await response?.json()

      if (!response?.ok || !data?.success) {
        throw new Error(data?.error ?? 'Failed to delete system')
      }

      toast?.({
        title: 'Success',
        description: 'AI system deleted successfully',
      })

      onSuccess?.()
      onClose?.()
    } catch (error: any) {
      toast?.({
        title: 'Error',
        description: error?.message ?? 'Failed to delete AI system',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Delete AI System</h2>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>

          <p className="text-sm text-gray-700">
            Are you sure you want to delete <span className="font-semibold">{systemName}</span>?
            All associated data will be permanently removed.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete System
          </Button>
        </div>
      </div>
    </div>
  )
}
