import { ComplianceDashboardClient } from './_components/compliance-dashboard-client';

export const metadata = {
  title: 'EU AI Act Compliance Dashboard | AI Governance Studio',
  description: 'Overview of AI systems classified under the EU AI Act risk framework',
};

export default function RegulatoryCompliancePage() {
  return <ComplianceDashboardClient />;
}
