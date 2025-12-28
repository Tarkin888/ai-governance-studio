import { Sidebar } from './_components/sidebar'
import { InventoryPageClient } from './_components/inventory-page-client'

export default function InventoryPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1">
        <InventoryPageClient />
      </main>
    </div>
  )
}
