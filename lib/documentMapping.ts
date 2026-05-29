// lib/documentMapping.ts

// ============================================
// TYPES & INTERFACES
// ============================================

export type DocumentType = 
  | 'concession-agreement'
  | 'financial-audits'
  | 'technical-specs'
  | 'environmental-impact'
  | 'regulatory-compliance'
  | 'legal-opinion'
  | 'management-team'
  | 'construction-timelines'
  | 'revenue-projections'
  | 'market-analysis'
  | 'land-use-rights'
  | 'construction-permits'
  | 'insurance-policies'
  | 'operational-licenses';

export interface DocumentMapping {
  id: string;
  normalizedType: DocumentType;
  displayName: string;
  category: 'legal' | 'financial' | 'technical' | 'regulatory' | 'operational';
}

// ============================================
// DOCUMENT TYPE MAPPING
// ============================================

export const DOCUMENT_TYPE_MAP: Record<string, DocumentType> = {
  // Vietnamese documents
  'vietnamese_regulatory_compliance': 'regulatory-compliance',
  'vietnamese_financial_audits': 'financial-audits',
  'vietnamese_technical_specs': 'technical-specs',
  'vietnamese_environmental_impact': 'environmental-impact',
  'vietnamese_land_use_rights': 'land-use-rights',
  'vietnamese_construction_permits': 'construction-permits',
  'vietnamese_insurance_policies': 'insurance-policies',
  'vietnamese_operational_licenses': 'operational-licenses',
  'vietnamese_concession_agreement': 'concession-agreement',
  
  // English variants (underscore)
  'regulatory_compliance': 'regulatory-compliance',
  'financial_audits': 'financial-audits',
  'technical_specs': 'technical-specs',
  'environmental_impact': 'environmental-impact',
  'land_use_rights': 'land-use-rights',
  'construction_permits': 'construction-permits',
  'insurance_policies': 'insurance-policies',
  'operational_licenses': 'operational-licenses',
  'concession_agreement': 'concession-agreement',
  
  // Hyphenated versions
  'regulatory-compliance': 'regulatory-compliance',
  'financial-audits': 'financial-audits',
  'technical-specs': 'technical-specs',
  'environmental-impact': 'environmental-impact',
  'land-use-rights': 'land-use-rights',
  'construction-permits': 'construction-permits',
  'insurance-policies': 'insurance-policies',
  'operational-licenses': 'operational-licenses',
  'concession-agreement': 'concession-agreement',

  // Construction timelines
  'construction_development_timelines': 'construction-timelines',
  'construction-development-timelines': 'construction-timelines',

  // Market analysis variants
  'market_analysis_competitive_landscape': 'market-analysis',
  'market-analysis-competitive-landscape': 'market-analysis',
  'market_analysis': 'market-analysis',
  'market-analysis': 'market-analysis',

  // Financial audits historical
  'financial_audits_historical': 'financial-audits',
  'financial-audits-historical': 'financial-audits',

  // Port concession
  'port_concession_agreement': 'concession-agreement',
  'port-concession-agreement': 'concession-agreement',

  // Revenue projections
  'revenue_projections_modeling': 'revenue-projections',
  'revenue-projections-modeling': 'revenue-projections',

  // Management team
  'management_team_background': 'management-team',
  'management-team-background': 'management-team',

  // Legal opinion
  'legal_opinion_ownership_structure': 'legal-opinion',
  'legal-opinion-ownership-structure': 'legal-opinion',

  // Environmental impact
  'environmental_social_impact': 'environmental-impact',
  'environmental-social-impact': 'environmental-impact',

  // Technical architecture
  'technical_architecture_engineering': 'technical-specs',
  'technical-architecture-engineering': 'technical-specs',
};

// Document metadata
export const DOCUMENT_METADATA: Record<DocumentType, DocumentMapping> = {
  'concession-agreement': {
    id: 'concession-agreement',
    normalizedType: 'concession-agreement',
    displayName: 'Port Concession Agreement',
    category: 'legal',
  },
  'financial-audits': {
    id: 'financial-audits',
    normalizedType: 'financial-audits',
    displayName: 'Financial Audit Report',
    category: 'financial',
  },
  'technical-specs': {
    id: 'technical-specs',
    normalizedType: 'technical-specs',
    displayName: 'Technical Architecture Specifications',
    category: 'technical',
  },
  'environmental-impact': {
    id: 'environmental-impact',
    normalizedType: 'environmental-impact',
    displayName: 'Environmental Impact Assessment',
    category: 'regulatory',
  },
  'regulatory-compliance': {
    id: 'regulatory-compliance',
    normalizedType: 'regulatory-compliance',
    displayName: 'Regulatory Compliance Documentation',
    category: 'regulatory',
  },
  'legal-opinion': {
    id: 'legal-opinion',
    normalizedType: 'legal-opinion',
    displayName: 'Legal Opinion on Ownership Structure',
    category: 'legal',
  },
  'management-team': {
    id: 'management-team',
    normalizedType: 'management-team',
    displayName: 'Management Team Background',
    category: 'operational',
  },
  'construction-timelines': {
    id: 'construction-timelines',
    normalizedType: 'construction-timelines',
    displayName: 'Construction & Development Timelines',
    category: 'technical',
  },
  'revenue-projections': {
    id: 'revenue-projections',
    normalizedType: 'revenue-projections',
    displayName: 'Revenue Projections & Modeling',
    category: 'financial',
  },
  'market-analysis': {
    id: 'market-analysis',
    normalizedType: 'market-analysis',
    displayName: 'Market Analysis & Competitive Landscape',
    category: 'financial',
  },
  'land-use-rights': {
    id: 'land-use-rights',
    normalizedType: 'land-use-rights',
    displayName: 'Land Use Rights Certificate',
    category: 'legal',
  },
  'construction-permits': {
    id: 'construction-permits',
    normalizedType: 'construction-permits',
    displayName: 'Construction Permits',
    category: 'regulatory',
  },
  'insurance-policies': {
    id: 'insurance-policies',
    normalizedType: 'insurance-policies',
    displayName: 'Insurance Policies',
    category: 'financial',
  },
  'operational-licenses': {
    id: 'operational-licenses',
    normalizedType: 'operational-licenses',
    displayName: 'Operational Licenses',
    category: 'regulatory',
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Normalize document type to standard format
 * @param type - Raw document type string
 * @returns Normalized document type
 */
export function normalizeDocumentType(type: string): DocumentType {
  if (!type || typeof type !== 'string') {
    console.warn(`[DocumentMapping] Invalid type provided: ${type}`);
    return 'concession-agreement' as DocumentType;
  }

  const cleanType = type.toLowerCase().trim();

  // Direct mapping
  if (DOCUMENT_TYPE_MAP[cleanType]) {
    return DOCUMENT_TYPE_MAP[cleanType];
  }

  // Remove language prefixes
  const prefixes = ['vietnamese_', 'english_', 'vietnamese-', 'english-'];

  for (const prefix of prefixes) {
    if (cleanType.startsWith(prefix)) {
      const coreType = cleanType.replace(prefix, '');

      if (DOCUMENT_TYPE_MAP[coreType]) {
        return DOCUMENT_TYPE_MAP[coreType];
      }
    }
  }

  // Convert underscores to hyphens
  const hyphenated = cleanType.replace(/_/g, '-');

  if (DOCUMENT_TYPE_MAP[hyphenated]) {
    return DOCUMENT_TYPE_MAP[hyphenated];
  }

  // Final fallback:
  // allow already-normalized values like revenue-projections
  if (DOCUMENT_METADATA[hyphenated as DocumentType]) {
    return hyphenated as DocumentType;
  }

  console.error(`[DocumentMapping] Unknown document type: ${type}`);

  throw new Error(`Unknown document type: ${type}`);
}

/**
 * Get document metadata by type
 * @param type - Document type
 * @returns Document metadata or null
 */
export function getDocumentMetadata(type: string): DocumentMapping | null {
  try {
    const normalized = normalizeDocumentType(type);
    return DOCUMENT_METADATA[normalized] || null;
  } catch (error) {
    console.error('[DocumentMapping] Metadata lookup failed:', error);
    return null;
  }
}

/**
 * Check if document type is valid
 * @param type - Document type to check
 * @returns Boolean indicating validity
 */
export function isValidDocumentType(type: string): boolean {
  try {
    const normalized = normalizeDocumentType(type);
    return !!DOCUMENT_METADATA[normalized];
  } catch {
    return false;
  }
}

/**
 * Get all available document types
 * @returns Array of document types
 */
export function getAllDocumentTypes(): DocumentType[] {
  return Object.keys(DOCUMENT_METADATA) as DocumentType[];
}

/**
 * Get documents by category
 * @param category - Document category
 * @returns Array of document types in category
 */
export function getDocumentsByCategory(category: DocumentMapping['category']): DocumentType[] {
  return Object.entries(DOCUMENT_METADATA)
    .filter(([_, meta]) => meta.category === category)
    .map(([type]) => type as DocumentType);
}

/**
 * Get display name for document type
 * @param type - Document type
 * @returns Display name or fallback
 */
export function getDocumentDisplayName(type: string): string {
  const metadata = getDocumentMetadata(type);
  return metadata?.displayName || type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
