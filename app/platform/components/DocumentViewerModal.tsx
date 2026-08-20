import React, { useState, useEffect } from 'react';
import { X, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Z_INDEX } from '@/lib/zIndex';
import { ModalPortal } from '@/app/components/Context/ModalPortal';
import { normalizeDocumentType } from '@/lib/documentMapping';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: string;
  documentTitle: string;
  userId: string;
  userEmail: string;
  userName: string;
  onRequestDocument?: () => void;
  directDocumentUrl?: string;
}

export default function DocumentViewerModal({
  isOpen,
  onClose,
  documentType,
  documentTitle,
  userId,
  userEmail,
  userName,
  onRequestDocument = () => {},
  directDocumentUrl
}: DocumentViewerModalProps) {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [documentUrl]);

  // Load document when modal opens
  useEffect(() => {
   if (isOpen && documentType) {
     if (directDocumentUrl) {
      setDocumentUrl(directDocumentUrl);
      setLoading(false);
      setError(null);
    } else {
      loadDocument();
    }
  }
}, [isOpen, documentType, directDocumentUrl]);

  // ✅ Listen for "Invest Now" message from document iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'invest-now') {
        onClose();
        if (onRequestDocument) onRequestDocument();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose, onRequestDocument]);

  const loadDocument = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!userId || userId === 'undefined') {
      throw new Error('Missing authenticated user');
     }

    const normalizedType = normalizeDocumentType(documentType);
       const url =
      `/api/documents/view` +
      `?type=${encodeURIComponent(normalizedType)}` +
      `&lang=en` +
      `&userId=${encodeURIComponent(userId)}`;
       const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404 || errorData.notAvailable) {
          throw new Error("Document not available");
        }
        throw new Error("Failed to load document");
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setDocumentUrl(blobUrl);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load document";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-4"
        style={{ zIndex: Z_INDEX.MODAL + 1 }}
      >
        <div className="bg-gradient-to-b from-[#0f2a3f] to-[#0a1f2f] rounded-xl w-full max-w-6xl h-[95vh] md:h-[90vh] flex flex-col border border-cyan-500/30 shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between p-3 md:p-4 border-b border-slate-700/50">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-r from-cyan-900 to-emerald-900 border border-cyan-500/30">
                <FileText className="h-5 w-5 md:h-6 md:w-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-base md:text-xl font-bold text-white line-clamp-1">{documentTitle}</h2>
                <p className="text-[10px] md:text-xs text-slate-400">Confidential Investor Document • View Only</p>
              </div>
            </div>

            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="p-1.5 md:p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 md:h-6 md:w-6 text-slate-400 hover:text-white transition-colors" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-slate-900 rounded-b-xl overflow-hidden">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center p-6 md:p-8">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping"></div>
                  <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-cyan-400 relative" />
                </div>
                <p className="text-slate-400 text-sm md:text-base mt-4">Loading document...</p>
                <p className="text-slate-500 text-xs md:text-sm mt-2">Preparing secure document...</p>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center p-6 md:p-8">
                <div className="p-3 md:p-4 rounded-full bg-red-900/30 border border-red-500/30">
                  <AlertCircle className="h-10 w-10 md:h-12 md:w-12 text-red-400" />
                </div>
                <p className="text-red-400 text-sm md:text-base mt-4 mb-6 text-center">{error}</p>
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white"
                >
                  Close
                </Button>
              </div>
            ) : (
              <iframe
                src={documentUrl || undefined}
                className="w-full h-full border-none bg-white"
                title={documentTitle}
                sandbox="allow-scripts allow-popups allow-forms"
              />
            )}
          </div>

          {/* Footer */}
          {!loading && !error && documentUrl && (
            <div className="p-2 md:p-3 border-t border-slate-700/50 bg-slate-900/50">
              <div className="flex items-center justify-center gap-4 text-[10px] md:text-xs text-slate-500">
                <span>🔒 Secure Document</span>
                <span>•</span>
                <span>Confidential</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}
