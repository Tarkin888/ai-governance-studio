// ============================================================================
// KNOWLEDGE BASE: FEEDBACK BUTTONS
// ============================================================================

'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface KBFeedbackButtonsProps {
  articleId: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function KBFeedbackButtons({ articleId }: KBFeedbackButtonsProps) {
  const [feedback, setFeedback] = useState<'helpful' | 'not_helpful' | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================================
  // HANDLE FEEDBACK
  // ============================================================================

  const handleFeedback = async (value: 'helpful' | 'not_helpful') => {
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/incidents/knowledge-base/${articleId}/feedback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback: value })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setFeedback(value);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Show thank you message after feedback submitted
  if (feedback) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <Check className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-sm text-green-800">
            Thank you for your feedback! This helps us improve our knowledge
            base.
          </p>
        </div>
      </div>
    );
  }

  // Show feedback buttons
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => handleFeedback('helpful')}
        disabled={isSubmitting}
        className={cn(
          'inline-flex items-center px-6 py-3 border rounded-md text-sm font-medium transition-all',
          'focus:outline-none focus:ring-2 focus:ring-green-500',
          isSubmitting
            ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'border-green-600 text-green-700 bg-white hover:bg-green-50'
        )}
      >
        <ThumbsUp className="h-5 w-5 mr-2" />
        Yes, this helped
      </button>

      <button
        type="button"
        onClick={() => handleFeedback('not_helpful')}
        disabled={isSubmitting}
        className={cn(
          'inline-flex items-center px-6 py-3 border rounded-md text-sm font-medium transition-all',
          'focus:outline-none focus:ring-2 focus:ring-red-500',
          isSubmitting
            ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'border-red-600 text-red-700 bg-white hover:bg-red-50'
        )}
      >
        <ThumbsDown className="h-5 w-5 mr-2" />
        No, needs improvement
      </button>

      {isSubmitting && (
        <span className="text-sm text-gray-500">Submitting...</span>
      )}
    </div>
  );
}
