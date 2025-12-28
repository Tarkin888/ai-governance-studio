import { Metadata } from 'next';
import QADemoClient from './_components/qa-demo-client';

export const metadata: Metadata = {
  title: 'QA Demo Mode - AI Governance Studio',
  description: 'Public demonstration mode for COMET testing with sample AI systems',
};

export default function QADemoPage() {
  return <QADemoClient />;
}
