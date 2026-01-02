// Placeholder component for KB Article Card
export function KBArticleCard({ article }: { article?: any }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold mb-2">{article?.title || 'Article Title'}</h3>
      <p className="text-gray-600 text-sm">{article?.excerpt || 'Article excerpt...'}</p>
    </div>
  );
}
