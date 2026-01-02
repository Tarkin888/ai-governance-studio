// Placeholder component for KBFeedbackButtons
export function KBFeedbackButtons({ articleId }: { articleId?: string }) {
  return (
    <div className="flex gap-2">
      <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
        Helpful
      </button>
      <button className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700">
        Not Helpful
      </button>
    </div>
  );
}
