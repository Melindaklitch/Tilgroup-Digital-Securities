// Actual legal documents for $5.5B port infrastructure investment
import { FileText, ShieldCheck, Globe, Clock, BarChart3, TrendingUp, Cpu, Users } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface LegalDocument {
  id: string;
  name: string;
  description: string;
  category: 'Regulatory' | 'Legal' | 'Financial' | 'Compliance' | 'Technical' | 'Governance' | 'Analysis' | 'Project Management';
  icon: LucideIcon;
  requiredFor: Array<'executive' | 'accredited' | 'priority'>;
  previewUrl: string;
  fullUrl: string;
  version: string;
  effectiveDate: string;
  pages: {
    preview: number;
    full: number;
  };
  assetReferences: string[];
  isNew?: boolean;
  isUpdated?: boolean;
}

export interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

// ============================================
// EXPORTED ICONS
// ============================================

export const Icons = {
  FileText,
  ShieldCheck,
  Globe,
  Clock,
  BarChart3,
  TrendingUp,
  Cpu,
  Users
} as const;

// ============================================
// CATEGORY DEFINITIONS
// ============================================

export const documentCategories: DocumentCategory[] = [
  {
    id: 'regulatory',
    name: 'Regulatory Compliance',
    description: 'Legal and regulatory framework documents',
    icon: ShieldCheck,
    color: 'cyan'
  },
  {
    id: 'legal',
    name: 'Legal Agreements',
    description: 'Contracts and legal binding documents',
    icon: FileText,
    color: 'blue'
  },
  {
    id: 'financial',
    name: 'Financial Reports',
    description: 'Audits, projections, and financial analysis',
    icon: BarChart3,
    color: 'emerald'
  },
  {
    id: 'compliance',
    name: 'Compliance & Impact',
    description: 'Environmental and social compliance',
    icon: Globe,
    color: 'green'
  },
  {
    id: 'technical',
    name: 'Technical Architecture',
    description: 'Engineering and technical specifications',
    icon: Cpu,
    color: 'purple'
  },
  {
    id: 'governance',
    name: 'Governance',
    description: 'Management and organizational structure',
    icon: Users,
    color: 'orange'
  },
  {
    id: 'analysis',
    name: 'Market Analysis',
    description: 'Market research and competitive landscape',
    icon: TrendingUp,
    color: 'yellow'
  },
  {
    id: 'project-management',
    name: 'Project Management',
    description: 'Timelines and project milestones',
    icon: Clock,
    color: 'indigo'
  }
];

// ============================================
// DOCUMENT DEFINITIONS (Hardcoded English)
// ============================================

export const legalDocuments: LegalDocument[] = [
  {
    id: 'financial_audits_historical',
    name: 'Financial Audits & Historical Performance Analysis',
    description: 'Audited financial statements and performance metrics of TILGroup port operations',
    category: 'Financial',
    icon: BarChart3,
    requiredFor: ['executive', 'accredited', 'priority'],
    previewUrl: '/legal/previews/financial-audits-preview.html',
    fullUrl: '/legal/documents/financial-audits-full.html',
    version: '2.3',
    effectiveDate: '2024-02-15',
    pages: { preview: 8, full: 42 },
    assetReferences: ['dockingFees', 'containerHandling']
  },
  {
    id: 'vietnamese_regulatory_compliance',
    name: 'Vietnamese Regulatory Compliance Documentation',
    description: 'Official approvals from Ministry of Transport, Maritime Administration, and Investment authorities',
    category: 'Regulatory',
    icon: ShieldCheck,
    requiredFor: ['executive', 'accredited', 'priority'],
    previewUrl: '/legal/previews/regulatory-compliance-preview.pdf',
    fullUrl: '/legal/documents/regulatory-compliance-full.html',
    version: '1.5',
    effectiveDate: '2024-01-20',
    pages: { preview: 6, full: 38 },
    assetReferences: ['portConcessions', 'straitPassageRights']
  },
  {
    id: 'port_concession_agreement',
    name: 'Port Concession Agreement (English/Vietnamese)',
    description: '30-year Build-Operate-Transfer agreement with Vietnamese Ministry of Transport',
    category: 'Legal',
    icon: FileText,
    requiredFor: ['executive', 'accredited'],
    previewUrl: '/legal/previews/concession-agreement-preview.pdf',
    fullUrl: '/legal/documents/concession-agreement-full.html',
    version: '2.1',
    effectiveDate: '2024-03-01',
    pages: { preview: 12, full: 64 },
    assetReferences: ['portConcessions']
  },
  {
    id: 'revenue-projections-modeling',
    name: 'Revenue Projections & Financial Modeling',
    description: 'Detailed 20-year financial projections by asset class with sensitivity analysis',
    category: 'Financial',
    icon: TrendingUp,
    requiredFor: ['executive', 'accredited'],
    previewUrl: '/legal/previews/revenue-projections-preview.html',
    fullUrl: '/legal/documents/revenue-projections-full.html',
    version: '1.8',
    effectiveDate: '2024-02-28',
    pages: { preview: 10, full: 56 },
    assetReferences: [
      'portConcessions', 
      'dockingFees', 
      'containerHandling', 
      'logisticsInfrastructure', 
      'straitPassageRights', 
      'tilTerminalx'
    ]
  },
  {
    id: 'environmental-social-impact',
    name: 'Environmental & Social Impact Assessments',
    description: 'Comprehensive EIA approved by Vietnamese environmental authorities',
    category: 'Compliance',
    icon: Globe,
    requiredFor: ['executive', 'accredited', 'priority'],
    previewUrl: '/legal/previews/environmental-assessment-preview.html',
    fullUrl: '/legal/documents/environmental-assessment-full.html',
    version: '1.4',
    effectiveDate: '2024-01-10',
    pages: { preview: 14, full: 88 },
    assetReferences: ['portConcessions', 'logisticsInfrastructure']
  },
  {
    id: 'technical-architecture-engineering',
    name: 'Technical Architecture & Engineering Reports',
    description: 'Port design specifications, dredging requirements, and construction methodology',
    category: 'Technical',
    icon: Cpu,
    requiredFor: ['executive', 'accredited'],
    previewUrl: '/legal/previews/technical-architecture-preview.html',
    fullUrl: '/legal/documents/technical-architecture-full.html',
    version: '2.0',
    effectiveDate: '2024-02-10',
    pages: { preview: 16, full: 94 },
    assetReferences: ['containerHandling', 'tilTerminalx']
  },
  {
    id: 'management-team-background',
    name: 'Management Team Background & Experience',
    description: 'Biographies and track records of TILGroup executive leadership',
    category: 'Governance',
    icon: Users,
    requiredFor: ['executive', 'accredited', 'priority'],
    previewUrl: '/legal/previews/management-team-preview.html',
    fullUrl: '/legal/documents/management-team-full.html',
    version: '1.2',
    effectiveDate: '2024-01-05',
    pages: { preview: 6, full: 28 },
    assetReferences: ['all']
  },
  {
    id: 'market-analysis-competitive-landscape',
    name: 'Market Analysis & Competitive Landscape',
    description: 'Vietnam port market analysis, competitor positioning, and Can Gio market share projections',
    category: 'Analysis',
    icon: Globe,
    requiredFor: ['executive', 'accredited'],
    previewUrl: '/legal/previews/market-analysis-preview.html',
    fullUrl: '/legal/documents/market-analysis-full.html',
    version: '1.0',
    effectiveDate: '2024-03-09',
    pages: { preview: 8, full: 32 },
    assetReferences: ['all']
  },
  {
    id: 'legal-opinion-ownership-structure',
    name: 'Legal Opinion on Ownership Structure',
    description: 'Legal validation of tokenized ownership structure under Vietnamese law',
    category: 'Legal',
    icon: ShieldCheck,
    requiredFor: ['executive', 'accredited'],
    previewUrl: '/legal/previews/legal-opinion-preview.html',
    fullUrl: '/legal/documents/legal-opinion-full.html',
    version: '1.1',
    effectiveDate: '2024-02-20',
    pages: { preview: 5, full: 24 },
    assetReferences: ['all']
  },
  {
    id: 'construction-development-timelines',
    name: 'Construction & Development Timelines',
    description: 'Phased development schedule with milestone completion dates',
    category: 'Project Management',
    icon: Clock,
    requiredFor: ['executive', 'accredited', 'priority'],
    previewUrl: '/legal/previews/construction-timelines-preview.html',
    fullUrl: '/legal/documents/construction-timelines-full.html',
    version: '1.3',
    effectiveDate: '2024-01-25',
    pages: { preview: 6, full: 18 },
    assetReferences: ['portConcessions', 'logisticsInfrastructure']
  },
  {
      id: 'exhibit-g-consortium-agreement',
      name: 'Exhibit G - Consortium Agreement',
      description: 'Consortium agreement terms and conditions between TILGroup and partners',
      category: 'Legal',
      icon: FileText,
      requiredFor: ['executive', 'accredited'],
      previewUrl: '/legal/previews/exhibit-g-preview.html',
      fullUrl: '/legal/documents/exhibitG-consortium-agreement-full.html',
      version: '1.0',
      effectiveDate: '2024-02-01',
      pages: { preview: 10, full: 45 },
      assetReferences: ['all']
    },
    {
      id: 'exhibit-h-legal-opinion',
      name: 'Exhibit H - Legal Opinion on Vietnamese Law',
      description: 'Legal opinion on project validity under Vietnamese law',
      category: 'Legal',
      icon: ShieldCheck,
      requiredFor: ['executive', 'accredited'],
      previewUrl: '/legal/previews/exhibit-h-preview.html',
      fullUrl: '/legal/documents/exhibitH-legal-opinion-vietnamese-law-full.html',
      version: '1.0',
      effectiveDate: '2024-02-10',
      pages: { preview: 8, full: 35 },
      assetReferences: ['all']
    },
    {
      id: 'investment-registration-certificate',
      name: 'Investment Registration Certificate',
      description: 'Official investment registration for Can Gio Port project',
      category: 'Regulatory',
      icon: ShieldCheck,
      requiredFor: ['executive', 'accredited', 'priority'],
      previewUrl: '/legal/previews/investment-registration-preview.html',
      fullUrl: '/legal/documents/investment-registration-certificate-full.html',
      version: '1.0',
      effectiveDate: '2024-01-15',
      pages: { preview: 5, full: 20 },
      assetReferences: ['portConcessions']
    },
    {
      id: 'schedule-1-land-use',
      name: 'Schedule 1 - Land Use Rights & Construction Permit',
      description: 'Land use rights documentation and construction permits',
      category: 'Legal',
      icon: FileText,
      requiredFor: ['executive', 'accredited'],
      previewUrl: '/legal/previews/schedule-1-preview.html',
      fullUrl: '/legal/documents/schedule1-land-use-construction-permit-full.html',
      version: '1.0',
      effectiveDate: '2024-02-20',
      pages: { preview: 12, full: 55 },
      assetReferences: ['portConcessions']
    },
    {
      id: 'schedule-4-epc-contract',
      name: 'Schedule 4 - EPC Contract',
      description: 'Engineering, Procurement, and Construction contract details',
      category: 'Technical',
      icon: Cpu,
      requiredFor: ['executive', 'accredited'],
      previewUrl: '/legal/previews/schedule-4-preview.html',
      fullUrl: '/legal/documents/schedule4-epc-contract-full.html',
      version: '1.0',
      effectiveDate: '2024-02-25',
      pages: { preview: 15, full: 70 },
      assetReferences: ['tilTerminalx', 'containerHandling']
    },
    {
      id: 'schedule-6-operation-maintenance',
      name: 'Schedule 6 - Operation & Maintenance',
      description: 'Operation and maintenance agreement terms',
      category: 'Project Management',
      icon: Clock,
      requiredFor: ['executive', 'accredited'],
      previewUrl: '/legal/previews/schedule-6-preview.html',
      fullUrl: '/legal/documents/schedule6-operation-maintenance-full.html',
      version: '1.0',
      effectiveDate: '2024-03-01',
      pages: { preview: 10, full: 48 },
      assetReferences: ['portConcessions', 'logisticsInfrastructure']
    },
    {
      id: 'schedule-8-financing-agreements',
      name: 'Schedule 8 - Financing Agreements & Intercreditor',
      description: 'Financing facility agreements and intercreditor arrangements',
      category: 'Financial',
      icon: BarChart3,
      requiredFor: ['executive', 'accredited'],
      previewUrl: '/legal/previews/schedule-8-preview.html',
      fullUrl: '/legal/documents/schedule8-financing-agreements-full.html',
      version: '1.0',
      effectiveDate: '2024-02-28',
      pages: { preview: 18, full: 85 },
      assetReferences: ['all']
    },
    {
      id: 'schedule-9-sub-concession',
      name: 'Schedule 9 - Sub-Concession Lease Agreements',
      description: 'Sub-concession and lease agreements with operators',
      category: 'Legal',
      icon: FileText,
      requiredFor: ['executive', 'accredited'],
      previewUrl: '/legal/previews/schedule-9-preview.html',
      fullUrl: '/legal/documents/schedule9-sub-concession-lease-full.html',
      version: '1.0',
      effectiveDate: '2024-02-15',
      pages: { preview: 14, full: 62 },
      assetReferences: ['portConcessions', 'dockingFees']
    },
    {
      id: 'schedule-10-insurance',
      name: 'Schedule 10 - Insurance Program',
      description: 'Comprehensive insurance coverage program',
      category: 'Compliance',
      icon: ShieldCheck,
      requiredFor: ['executive', 'accredited'],
      previewUrl: '/legal/previews/schedule-10-preview.html',
      fullUrl: '/legal/documents/schedule10-insurance-program-full.html',
      version: '1.0',
      effectiveDate: '2024-02-10',
      pages: { preview: 8, full: 38 },
      assetReferences: ['all']
    }
  ];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get documents by user tier
 */
export const getDocumentsByTier = (tier: 'executive' | 'accredited' | 'priority'): LegalDocument[] => {
  return legalDocuments.filter(doc => doc.requiredFor.includes(tier));
};

/**
 * Get documents by category
 */
export const getDocumentsByCategory = (category: LegalDocument['category']): LegalDocument[] => {
  return legalDocuments.filter(doc => doc.category === category);
};

/**
 * Get documents by asset reference
 */
export const getDocumentsByAsset = (assetKey: string): LegalDocument[] => {
  return legalDocuments.filter(doc => 
    doc.assetReferences.includes(assetKey) || doc.assetReferences.includes('all')
  );
};

/**
 * Get document by ID
 */
export const getDocumentById = (id: string): LegalDocument | undefined => {
  return legalDocuments.find(doc => doc.id === id);
};

/**
 * Get document count by category
 */
export const getDocumentCountByCategory = (): Record<string, number> => {
  const counts: Record<string, number> = {};
  legalDocuments.forEach(doc => {
    counts[doc.category] = (counts[doc.category] || 0) + 1;
  });
  return counts;
};

/**
 * Get total pages across all documents (preview and full)
 */
export const getTotalPages = (includeFull: boolean = false): number => {
  return legalDocuments.reduce((total, doc) => {
    return total + (includeFull ? doc.pages.full : doc.pages.preview);
  }, 0);
};

/**
 * Get latest document version
 */
export const getLatestDocument = (): LegalDocument | undefined => {
  return [...legalDocuments].sort((a, b) => {
    const versionA = parseFloat(a.version);
    const versionB = parseFloat(b.version);
    return versionB - versionA;
  })[0];
};

/**
 * Check if user has access to document preview/full
 */
export const getDocumentAccessUrl = (doc: LegalDocument, hasInvested: boolean): string => {
  return hasInvested ? doc.fullUrl : doc.previewUrl;
};

/**
 * Get category display color mapping
 */
export const getCategoryColor = (category: LegalDocument['category']): string => {
  const colorMap: Record<LegalDocument['category'], string> = {
    'Regulatory': 'cyan',
    'Legal': 'blue',
    'Financial': 'emerald',
    'Compliance': 'green',
    'Technical': 'purple',
    'Governance': 'orange',
    'Analysis': 'yellow',
    'Project Management': 'indigo'
  };
  return colorMap[category] || 'slate';
};

// ============================================
// STATISTICS
// ============================================

export const legalDocumentsStats = {
  totalDocuments: legalDocuments.length,
  totalPreviewPages: getTotalPages(false),
  totalFullPages: getTotalPages(true),
  categories: Object.keys(getDocumentCountByCategory()).length,
  lastUpdated: '2024-03-10',
  version: '1.0.0'
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default legalDocuments;
