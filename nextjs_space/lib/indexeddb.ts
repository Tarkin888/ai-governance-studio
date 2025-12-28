// IndexedDB utility for QA Demo Mode
// Provides browser-based storage without authentication

const DB_NAME = 'AIGovernanceQADemo';
const DB_VERSION = 1;
const STORE_NAME = 'aiSystems';

export interface QADemoSystem {
  system_id: string;
  system_name: string;
  purpose: string;
  business_owner: string;
  technical_owner: string;
  ai_model_type: string;
  deployment_status: string;
  deployment_date: string;
  data_sources: string;
  vendor: string;
  integration_points: string;
  processing_volume: string;
  risk_classification: string;
  date_added: string;
  last_modified: string;
  modified_by: string;
}

// Initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'system_id' });
      }
    };
  });
}

// Get all systems
export async function getAllSystems(): Promise<QADemoSystem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Add a system
export async function addSystem(system: QADemoSystem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(system);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Update a system
export async function updateSystem(system: QADemoSystem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(system);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Delete a system
export async function deleteSystem(systemId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(systemId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Initialize with sample data
export async function initializeSampleData(): Promise<void> {
  const existingSystems = await getAllSystems();
  if (existingSystems.length > 0) {
    return; // Already initialized
  }

  const sampleSystems: QADemoSystem[] = [
    {
      system_id: 'CHAT-001',
      system_name: 'Chatbot v1.0',
      purpose: 'Customer support automation',
      business_owner: 'John Doe',
      technical_owner: 'Jane Smith',
      ai_model_type: 'LLM',
      deployment_status: 'Live',
      deployment_date: '2025-12-01',
      data_sources: 'CRM data, Support tickets',
      vendor: 'OpenAI',
      integration_points: 'Zendesk API, Salesforce',
      processing_volume: '10k queries/day',
      risk_classification: 'High (EU AI Act)',
      date_added: '2025-12-28',
      last_modified: '2025-12-28',
      modified_by: 'QA Bot'
    },
    {
      system_id: 'IMG-001',
      system_name: 'Image Classifier',
      purpose: 'Content moderation',
      business_owner: 'Sarah Johnson',
      technical_owner: 'Mike Chen',
      ai_model_type: 'CNN',
      deployment_status: 'Testing',
      deployment_date: '2025-12-15',
      data_sources: 'User uploads, Public datasets',
      vendor: 'Google Cloud Vision',
      integration_points: 'Content API',
      processing_volume: '50k images/day',
      risk_classification: 'Medium (Limited Risk)',
      date_added: '2025-12-20',
      last_modified: '2025-12-27',
      modified_by: 'QA Bot'
    },
    {
      system_id: 'FRD-001',
      system_name: 'Fraud Detection',
      purpose: 'Transaction monitoring',
      business_owner: 'Robert Lee',
      technical_owner: 'Emma Davis',
      ai_model_type: 'Ensemble',
      deployment_status: 'Live',
      deployment_date: '2025-11-10',
      data_sources: 'Transaction logs, User profiles',
      vendor: 'Internal',
      integration_points: 'Payment Gateway, Risk Engine',
      processing_volume: '1M transactions/day',
      risk_classification: 'High (EU AI Act)',
      date_added: '2025-11-01',
      last_modified: '2025-12-28',
      modified_by: 'QA Bot'
    },
    {
      system_id: 'REC-001',
      system_name: 'Recommendation Engine',
      purpose: 'Product suggestions',
      business_owner: 'Lisa Brown',
      technical_owner: 'David Wilson',
      ai_model_type: 'Collaborative Filtering',
      deployment_status: 'Staging',
      deployment_date: '2025-12-20',
      data_sources: 'User behavior, Product catalog',
      vendor: 'Internal',
      integration_points: 'E-commerce Platform',
      processing_volume: '5M recommendations/day',
      risk_classification: 'Low (Minimal Risk)',
      date_added: '2025-12-10',
      last_modified: '2025-12-26',
      modified_by: 'QA Bot'
    },
    {
      system_id: 'NLP-001',
      system_name: 'Sentiment Analysis',
      purpose: 'Social media monitoring',
      business_owner: 'Kevin Martinez',
      technical_owner: 'Anna Taylor',
      ai_model_type: 'Transformer',
      deployment_status: 'Live',
      deployment_date: '2025-11-25',
      data_sources: 'Twitter API, Facebook posts',
      vendor: 'Hugging Face',
      integration_points: 'Social Media Dashboard',
      processing_volume: '100k posts/day',
      risk_classification: 'Medium (Limited Risk)',
      date_added: '2025-11-15',
      last_modified: '2025-12-27',
      modified_by: 'QA Bot'
    }
  ];

  for (const system of sampleSystems) {
    await addSystem(system);
  }
}
