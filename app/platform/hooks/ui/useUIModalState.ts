import { useState, useEffect, useCallback, useMemo } from 'react';
import { normalizeDocumentType } from '@/lib/documentMapping';
import type { Asset } from '@/platform/types/asset';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface Document {
  id: string;
  type: string;
  title: string;
  name?: string;
  url?: string;
  documentType?: string;
  documentTitle?: string;
  [key: string]: any;
}

export interface NormalizedDocument {
  type: string;
  title: string;
  id?: string;
  originalDoc?: any;
}

export interface UIModalState {
  // Asset Detail Modal
  showAssetDetail: boolean;
  selectedAssetDetail: Asset | null;
  
  // Payment Modal
  showPaymentModal: boolean;
  
  // Investment Modal
  showModal: boolean;
  selectedAsset: Asset | null;
  
  // Document Modal
  showDocumentModal: boolean;
  selectedDocument: NormalizedDocument | null;
  
  // Other state
  selectedToken: string;
}

export interface UIModalStateReturn extends UIModalState {
  // Setters
  setShowAssetDetail: (show: boolean) => void;
  setSelectedAssetDetail: (asset: Asset | null) => void;
  setShowPaymentModal: (show: boolean) => void;
  setShowModal: (show: boolean) => void;
  setSelectedAsset: (asset: Asset | null) => void;
  setShowDocumentModal: (show: boolean) => void;
  setSelectedDocument: (doc: NormalizedDocument | null) => void;
  setSelectedToken: (token: string) => void;
  
  // Handlers
  handleShowAssetDetails: (asset: Asset, assetKey: string) => void;
  handleInvestFromDetails: () => void;
  handleViewDocument: (doc: Document) => void;
  handleCloseAllModals: () => void;
  handleOpenInvestmentModal: (asset: Asset) => void;
  
  // Computed
  isAnyModalOpen: boolean;
  activeModalsCount: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Normalize document for consistent handling
 */
export function normalizeDocument(doc: Document): NormalizedDocument {
  const normalizedType = normalizeDocumentType(doc.id || doc.type);
  
  return {
    type: normalizedType,
    title: doc.title || doc.name || doc.documentTitle || 'Document',
    id: doc.id,
    originalDoc: doc,
  };
}

/**
 * Get modal z-index based on priority
 */
export function getModalZIndex(modalType: string, isOpen: boolean): number {
  const baseZIndex = 1000;
  const priorities: Record<string, number> = {
    document: 4,
    asset: 3,
    investment: 2,
    payment: 1,
  };
  
  return isOpen ? baseZIndex + (priorities[modalType] || 0) : -1;
}

// ============================================
// MAIN HOOK
// ============================================

export function useUIModalState(): UIModalStateReturn {
  // Asset Detail Modal
  const [showAssetDetail, setShowAssetDetail] = useState(false);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<Asset | null>(null);

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Investment Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Document Modal
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<NormalizedDocument | null>(null);

  // Other state
  const [selectedToken, setSelectedToken] = useState("USDC");

  // ============================================
  // DEBUG LOGGING
  // ============================================
  
  useEffect(() => {
    if (selectedDocument) {
      console.log('📄 Selected document:', selectedDocument);
    }
  }, [selectedDocument]);

  useEffect(() => {
    if (showAssetDetail) {
      console.log('🔍 Asset detail modal opened:', selectedAssetDetail?.key);
    }
  }, [showAssetDetail, selectedAssetDetail]);

  useEffect(() => {
    if (showModal) {
      console.log('💰 Investment modal opened for asset:', selectedAsset?.nameKey);
    }
  }, [showModal, selectedAsset]);

  // ============================================
  // HANDLERS
  // ============================================
  
  /**
   * Open asset details modal
   */
  const handleShowAssetDetails = useCallback((asset: Asset, assetKey: string) => {
    console.log('🔍 Opening asset details for:', assetKey);
    setSelectedAssetDetail({ ...asset, key: assetKey });
    setShowAssetDetail(true);
  }, []);

  /**
   * Handle invest from details (disabled - should come from usePlatformState)
   */
  const handleInvestFromDetails = useCallback(() => {
    console.warn("❌ handleInvestFromDetails should come from usePlatformState");
  }, []);

  /**
   * Open document modal with normalized document
   */
  const handleViewDocument = useCallback((doc: Document) => {
    console.log("📄 Opening document modal:", doc);
    
    const normalizedDoc = normalizeDocument(doc);
    console.log("📄 Normalized document:", normalizedDoc);
    
    setSelectedDocument(normalizedDoc);
    setShowDocumentModal(true);
  }, []);

  /**
   * Close all modals
   */
  const handleCloseAllModals = useCallback(() => {
    console.log('🔒 Closing all modals');
    setShowAssetDetail(false);
    setShowPaymentModal(false);
    setShowModal(false);
    setShowDocumentModal(false);
    setSelectedAssetDetail(null);
    setSelectedAsset(null);
    setSelectedDocument(null);
  }, []);

  /**
   * Open investment modal for a specific asset
   */
  const handleOpenInvestmentModal = useCallback((asset: Asset) => {
    console.log('💰 Opening investment modal for:', asset.nameKey);
    setSelectedAsset(asset);
    setShowModal(true);
  }, []);

  // ============================================
  // COMPUTED VALUES
  // ============================================
  
  const isAnyModalOpen = useMemo(() => {
    return showAssetDetail || showPaymentModal || showModal || showDocumentModal;
  }, [showAssetDetail, showPaymentModal, showModal, showDocumentModal]);

  const activeModalsCount = useMemo(() => {
    let count = 0;
    if (showAssetDetail) count++;
    if (showPaymentModal) count++;
    if (showModal) count++;
    if (showDocumentModal) count++;
    return count;
  }, [showAssetDetail, showPaymentModal, showModal, showDocumentModal]);

  // ============================================
  // RETURN
  // ============================================
  
  return {
    // Asset detail
    showAssetDetail,
    setShowAssetDetail,
    selectedAssetDetail,
    setSelectedAssetDetail,

    // Payment Modal
    showPaymentModal,
    setShowPaymentModal,

    // Investment Modal
    showModal,
    setShowModal,
    selectedAsset,
    setSelectedAsset,

    // Document
    showDocumentModal,
    setShowDocumentModal,
    selectedDocument,
    setSelectedDocument,

    // Other
    selectedToken,
    setSelectedToken,

    // Handlers
    handleShowAssetDetails,
    handleInvestFromDetails,
    handleViewDocument,
    handleCloseAllModals,
    handleOpenInvestmentModal,
    
    // Computed
    isAnyModalOpen,
    activeModalsCount,
  };
}

// ============================================
// ADDITIONAL HOOKS
// ============================================

/**
 * Hook for managing modal focus and body scroll
 */
export function useModalFocus(isOpen: boolean, onClose?: () => void) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onClose) {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);
}

/**
 * Hook for modal animation states
 */
export function useModalAnimation(isOpen: boolean, duration = 200) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration]);
  
  return { shouldRender, isAnimating };
}

/**
 * Hook for modal history (tracking which modals were opened)
 */
export function useModalHistory() {
  const [history, setHistory] = useState<string[]>([]);
  
  const pushModal = useCallback((modalName: string) => {
    setHistory(prev => [...prev, modalName]);
    console.log(`[ModalHistory] Opened: ${modalName}, Stack: ${[...history, modalName].join(' → ')}`);
  }, [history]);
  
  const popModal = useCallback(() => {
    setHistory(prev => {
      const newHistory = prev.slice(0, -1);
      console.log(`[ModalHistory] Closed, Stack: ${newHistory.join(' → ') || 'empty'}`);
      return newHistory;
    });
  }, []);
  
  const clearHistory = useCallback(() => {
    setHistory([]);
    console.log('[ModalHistory] Cleared');
  }, []);
  
  const lastModal = history[history.length - 1];
  const modalCount = history.length;
  
  return {
    history,
    lastModal,
    modalCount,
    pushModal,
    popModal,
    clearHistory,
  };
}
