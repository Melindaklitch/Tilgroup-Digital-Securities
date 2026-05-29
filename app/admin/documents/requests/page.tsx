'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/app/components/Lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, FileText, Mail, RefreshCw, Search, Filter, Download } from 'lucide-react';

// ============================================
// TYPES & INTERFACES
// ============================================

interface User {
  email: string;
  full_name: string;
}

interface DocumentRequest {
  id: string;
  user_id: string;
  document_type: string;
  document_title: string;
  requested_language: string;
  reason: string | null;
  requested_at: string;
  processed_at: string | null;
  status: 'pending' | 'completed' | 'rejected';
  users?: User;
}

type StatusFilter = 'all' | 'pending' | 'completed' | 'rejected';

// ============================================
// CONSTANTS
// ============================================

const STATUS_CONFIG: Record<string, { class: string; label: string; bgClass: string; textClass: string }> = {
  pending: { 
    class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', 
    label: 'documentRequests.status.pending',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    textClass: 'text-yellow-800 dark:text-yellow-400'
  },
  completed: { 
    class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', 
    label: 'documentRequests.status.completed',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-800 dark:text-green-400'
  },
  rejected: { 
    class: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400', 
    label: 'documentRequests.status.rejected',
    bgClass: 'bg-gray-100 dark:bg-gray-800/50',
    textClass: 'text-gray-800 dark:text-gray-400'
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  
  return date.toLocaleDateString();
}

/**
 * Get status badge component
 */
function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const { t } = useTranslation();
  
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <Check className="h-3 w-3 mr-1" />;
      case 'rejected':
        return <X className="h-3 w-3 mr-1" />;
      default:
        return <Clock className="h-3 w-3 mr-1" />;
    }
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${config.class}`}>
      {getStatusIcon()}
      {t(config.label)}
    </span>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function DocumentRequestsPage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // FETCH REQUESTS
  // ============================================
  
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('document_requests')
        .select(`
          *,
          users:user_id (
            email,
            full_name
          )
        `)
        .order('requested_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      setRequests(data || []);
    } catch (err: any) {
      console.error('Failed to fetch requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ============================================
  // FILTERING
  // ============================================
  
  useEffect(() => {
    let filtered = [...requests];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(req => 
        req.document_title?.toLowerCase().includes(term) ||
        req.requested_language?.toLowerCase().includes(term) ||
        req.users?.full_name?.toLowerCase().includes(term) ||
        req.users?.email?.toLowerCase().includes(term) ||
        req.reason?.toLowerCase().includes(term)
      );
    }
    
    setFilteredRequests(filtered);
  }, [requests, statusFilter, searchTerm]);

  // ============================================
  // UPDATE REQUEST STATUS
  // ============================================
  
  const updateRequestStatus = async (requestId: string, status: 'completed' | 'rejected') => {
    setProcessingId(requestId);
    setError(null);
    
    try {
      const { error: updateError } = await supabase
        .from('document_requests')
        .update({ 
          status, 
          processed_at: new Date().toISOString() 
        })
        .eq('id', requestId);
      
      if (updateError) throw updateError;
      
      // Refresh requests
      await fetchRequests();
      
    } catch (err: any) {
      console.error('Failed to update request:', err);
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // ============================================
  // SEND EMAIL
  // ============================================
  
  const sendEmail = (request: DocumentRequest) => {
    const subject = encodeURIComponent(
      t("documentRequests.email.subject", { 
        doc: request.document_title,
        lang: request.requested_language 
      })
    );
    const body = encodeURIComponent(
      t("documentRequests.email.body", { 
        doc: request.document_title, 
        lang: request.requested_language,
        user: request.users?.full_name || 'Investor'
      })
    );
    
    window.location.href = `mailto:${request.users?.email}?subject=${subject}&body=${body}`;
  };

  // ============================================
  // EXPORT TO CSV
  // ============================================
  
  const exportToCSV = () => {
    const headers = ['Date', 'User', 'Email', 'Document', 'Language', 'Reason', 'Status'];
    const rows = filteredRequests.map(req => [
      new Date(req.requested_at).toLocaleDateString(),
      req.users?.full_name || 'N/A',
      req.users?.email || 'N/A',
      req.document_title,
      req.requested_language,
      req.reason || '-',
      req.status
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============================================
  // STATISTICS
  // ============================================
  
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    completed: requests.filter(r => r.status === 'completed').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  // ============================================
  // LOADING STATE
  // ============================================
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1f2f] via-[#071526] to-[#0a1f2f] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto relative"></div>
          </div>
          <p className="text-slate-300">{t("documentRequests.loading") || "Loading requests..."}</p>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f2f] via-[#071526] to-[#0a1f2f] p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{t("documentRequests.title")}</h1>
            <p className="text-slate-400 text-sm mt-1">{t("documentRequests.subtitle") || "Manage document access requests from investors"}</p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="border-slate-600 text-slate-300 hover:bg-slate-800/50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={fetchRequests}
              className="border-slate-600 text-slate-300 hover:bg-slate-800/50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("documentRequests.refresh") || "Refresh"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-slate-900 to-[#062b32] rounded-xl p-4 border border-slate-700/50">
            <div className="text-2xl md:text-3xl font-bold text-white">{stats.total}</div>
            <div className="text-xs md:text-sm text-slate-400">{t("documentRequests.stats.total") || "Total Requests"}</div>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-[#062b32] rounded-xl p-4 border border-yellow-500/20">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-xs md:text-sm text-slate-400">{t("documentRequests.stats.pending") || "Pending"}</div>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-[#062b32] rounded-xl p-4 border border-green-500/20">
            <div className="text-2xl md:text-3xl font-bold text-green-400">{stats.completed}</div>
            <div className="text-xs md:text-sm text-slate-400">{t("documentRequests.stats.completed") || "Completed"}</div>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-[#062b32] rounded-xl p-4 border border-red-500/20">
            <div className="text-2xl md:text-3xl font-bold text-red-400">{stats.rejected}</div>
            <div className="text-xs md:text-sm text-slate-400">{t("documentRequests.stats.rejected") || "Rejected"}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder={t("documentRequests.search") || "Search by user, document, or language..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-sm"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            {(['all', 'pending', 'completed', 'rejected'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === filter
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                }`}
              >
                {filter === 'all' ? (t("documentRequests.filter.all") || "All") : 
                 filter === 'pending' ? (t("documentRequests.filter.pending") || "Pending") :
                 filter === 'completed' ? (t("documentRequests.filter.completed") || "Completed") :
                 (t("documentRequests.filter.rejected") || "Rejected")}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Requests Table */}
        <div className="bg-gradient-to-br from-slate-900 to-[#062b32] rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">{t("documentRequests.table.date")}</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">{t("documentRequests.table.user")}</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">{t("documentRequests.table.document")}</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase hidden md:table-cell">{t("documentRequests.table.language")}</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase hidden lg:table-cell">{t("documentRequests.table.reason")}</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">{t("documentRequests.table.status")}</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">{t("documentRequests.table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>{t("documentRequests.noRequests") || "No document requests found"}</p>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 md:px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                        {formatDate(request.requested_at)}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="text-sm font-medium text-white">{request.users?.full_name || 'N/A'}</div>
                        <div className="text-xs text-slate-400">{request.users?.email}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="text-sm text-white">{request.document_title}</div>
                        <div className="text-xs text-slate-400 md:hidden mt-1">
                          {request.requested_language}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-slate-300 hidden md:table-cell">
                        {request.requested_language}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-slate-400 hidden lg:table-cell max-w-xs truncate">
                        {request.reason || '-'}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendEmail(request)}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                            title={t("documentRequests.email") || "Send email"}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          {request.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateRequestStatus(request.id, 'completed')}
                                disabled={processingId === request.id}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                title={t("documentRequests.approve") || "Approve"}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateRequestStatus(request.id, 'rejected')}
                                disabled={processingId === request.id}
                                title={t("documentRequests.reject") || "Reject"}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="text-center text-xs text-slate-500">
          {t("documentRequests.footer") || "Showing"} {filteredRequests.length} {t("documentRequests.of")} {requests.length} {t("documentRequests.requests")}
        </div>
      </div>
    </div>
  );
}

