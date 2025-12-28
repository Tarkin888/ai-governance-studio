import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ModelCardDetailClient } from './_components/model-card-detail-client';

export default async function ModelCardDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const modelCard = await prisma.modelCard.findUnique({
    where: { card_id: params.id },
    include: {
      aiSystem: true,
    },
  });

  if (!modelCard) {
    notFound();
  }

  // Serialize dates
  const serializedCard = {
    ...modelCard,
    last_updated: modelCard.last_updated.toISOString(),
    approval_date: modelCard.approval_date?.toISOString() || null,
    aiSystem: {
      ...modelCard.aiSystem,
      deployment_date: modelCard.aiSystem.deployment_date?.toISOString() || null,
      last_modified: modelCard.aiSystem.last_modified.toISOString(),
    },
  };

  return <ModelCardDetailClient modelCard={serializedCard} />;
}
