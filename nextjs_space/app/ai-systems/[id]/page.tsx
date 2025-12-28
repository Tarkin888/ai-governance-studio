import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { SystemDetailClient } from './_components/system-detail-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

export default async function SystemDetailPage({ params }: PageProps) {
  const { id } = params

  const system = await prisma?.aISystem?.findUnique({
    where: { system_id: id },
  })

  if (!system) {
    notFound()
  }

  // Serialize dates for client component
  const serializedSystem = {
    ...system,
    deployment_date: system?.deployment_date?.toISOString() ?? null,
    date_added: system?.date_added?.toISOString(),
    last_modified: system?.last_modified?.toISOString(),
  }

  return <SystemDetailClient system={serializedSystem} />
}
