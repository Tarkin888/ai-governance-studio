import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { MultiFrameworkAssessmentClient } from './_components/multi-framework-assessment-client';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default async function RegulatoryAssessmentPage({ params }: PageProps) {
  const { id } = params;

  const system = await prisma?.aISystem?.findUnique({
    where: { system_id: id },
  });

  if (!system) {
    notFound();
  }

  const serializedSystem = {
    ...system,
    deployment_date: system?.deployment_date?.toISOString() ?? null,
    date_added: system?.date_added?.toISOString(),
    last_modified: system?.last_modified?.toISOString(),
  };

  return <MultiFrameworkAssessmentClient system={serializedSystem} />;
}
