"use client";

import usePlatformState from "./hooks/usePlatformState";
import ConditionalRender from "./components/ConditionalRender";
import DocumentViewerModal from "./components/DocumentViewerModal";
import AssetDetailModal from "./components/AssetDetailModal";
import { ModalPortal } from '@/app/components/Context/ModalPortal';
import { Loader2 } from "lucide-react";

export default function PlatformPage() {
  const platformState = usePlatformState();
  const { session } = platformState;

  if (!session) return null;

  // Loading state while platform state initializes
  if (platformState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#0a1f2f] via-[#071526] to-[#0a1f2f]">
        <div className="text-center space-y-3 md:space-y-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping"></div>
            <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-cyan-400 mx-auto relative" />
          </div>
          <p className="text-slate-300 text-sm md:text-base">
            Loading your executive dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f2f] via-[#071526] to-[#0a1f2f]">
      {/* Main Platform Content */}
      <ConditionalRender platform={platformState} />

      {/* Document Viewer Modal */}
      {platformState.showDocumentModal && platformState.selectedDocument && (
        <ModalPortal isOpen={platformState.showDocumentModal} onClose={() => platformState.setShowDocumentModal(false)}>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl">
            <DocumentViewerModal
              isOpen={platformState.showDocumentModal}
              onClose={() => platformState.setShowDocumentModal(false)}
              documentType={platformState.selectedDocument.type}
              documentTitle={platformState.selectedDocument.title}
              userId={platformState.userId ?? ''}
              userEmail={platformState.session?.user?.email ?? ''}
              userName={platformState.session?.user?.user_metadata?.full_name ?? 'User'}
            />
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Asset Detail Modal */}
      {platformState.showAssetDetail && platformState.selectedAssetDetail && (
        <ModalPortal 
          isOpen={platformState.showAssetDetail} 
          onClose={() => platformState.setShowAssetDetail(false)}
        >
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4">
            <div className="relative w-full max-w-2xl">
            <AssetDetailModal
              isOpen={platformState.showAssetDetail}
              onClose={() => platformState.setShowAssetDetail(false)}
              asset={platformState.selectedAsset}
              onInvestNow={platformState.handleInvestFromDetails}
              onShowQuestionnaire={() => platformState.setShowQuestionnaire(true)}
              userQuestionnaireCompleted={platformState.questionnaireCompleted}
              session={platformState.session}
             />
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
