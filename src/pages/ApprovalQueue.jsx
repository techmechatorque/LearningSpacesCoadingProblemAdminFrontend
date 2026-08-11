import React, { useState, useEffect } from 'react';
import { getPendingRequests, getRequestHistory, getAutoApprovedLogs, approveRequest, rejectRequest } from '../services/api';
import { Check, X, Clock, FileText, User, LayoutList, ShieldCheck, Code, Trophy, Users, Eye } from 'lucide-react';
import ProblemRequestViewer from '../components/ProblemRequestViewer';

const ApprovalQueue = () => {
  const [activeTab, setActiveTab] = useState('accounts'); // 'accounts', 'problems', 'contests', 'autoLogs'
  const [viewMode, setViewMode] = useState('pending'); // 'pending', 'history'
  
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [autoLogs, setAutoLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pending = await getPendingRequests();
      const hist = await getRequestHistory();
      const logs = await getAutoApprovedLogs();
      setRequests(pending);
      setHistory(hist);
      setAutoLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    const note = prompt('Admin Note (Optional):');
    try {
      if (action === 'approve') {
        await approveRequest(id, note);
      } else {
        await rejectRequest(id, note);
      }
      fetchData();
    } catch (err) {
      alert('Action failed');
    }
  };

  const renderAutoLogsTable = () => {
    if (autoLogs.length === 0) {
      return (
        <div className="p-12 text-center text-dark-muted">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No auto-approved problems found from certified setters.</p>
        </div>
      );
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-dark-hover/50 text-dark-muted text-xs uppercase tracking-wider">
              <th className="p-4 pl-6">Problem Name</th>
              <th className="p-4">Difficulty</th>
              <th className="p-4">Category</th>
              <th className="p-4">Created By</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {autoLogs.map((prob) => (
              <tr key={prob._id} className="hover:bg-dark-hover/30 transition-colors">
                <td className="p-4 pl-6 font-semibold text-white text-sm">{prob.name}</td>
                <td className="p-4 text-sm text-gray-300">{prob.difficulty}</td>
                <td className="p-4 text-sm text-gray-300">{prob.category}</td>
                <td className="p-4 text-sm text-brand-primary">
                  {prob.createdBy?.name || 'Unknown'} <span className="text-xs text-dark-muted">({prob.createdBy?.badge})</span>
                </td>
                <td className="p-4 text-sm text-dark-muted">
                  {new Date(prob.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTable = (data, isHistory = false) => {
    if (data.length === 0) {
      return (
        <div className="p-12 text-center text-dark-muted">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No {isHistory ? 'history' : 'pending'} requests found in this category.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-dark-hover/50 text-dark-muted text-xs uppercase tracking-wider">
              <th className="p-4 pl-6">Type</th>
              <th className="p-4">Target</th>
              <th className="p-4">Requested By</th>
              <th className="p-4">Date</th>
              {isHistory && <th className="p-4">Status</th>}
              {!isHistory && <th className="p-4 text-right pr-6">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {data.map((req) => (
              <tr key={req._id} className="hover:bg-dark-hover/30 transition-colors">
                <td className="p-4 pl-6 font-medium capitalize text-sm text-white">{req.requestType.replace(/_/g, ' ')}</td>
                <td className="p-4 text-sm capitalize text-gray-300">{req.targetType}</td>
                <td className="p-4 text-sm text-gray-400">
                  <div className="flex flex-col">
                    <span className="text-white">{req.requestedBy?.name || 'Unknown'}</span>
                    <span className="text-xs">{req.requestedBy?.email || 'N/A'}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-dark-muted">
                  {new Date(req.createdAt).toLocaleDateString()}
                </td>
                {isHistory ? (
                  <td className="p-4 text-sm font-semibold capitalize text-brand-primary">
                    {req.status}
                  </td>
                ) : (
                  <td className="p-4 pr-6 flex items-center justify-end space-x-2">
                    {req.targetType === 'problem' && (
                      <button onClick={() => setSelectedRequest(req)} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors hover:cursor-pointer" title="View Details">
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => handleAction(req._id, 'approve')} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors hover:cursor-pointer" title="Approve">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleAction(req._id, 'reject')} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors hover:cursor-pointer" title="Reject">
                      <X className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const getFilteredData = () => {
    if (activeTab === 'autoLogs') return []; // Handled separately
    
    // Map tab to targetType
    let targetType = 'account';
    if (activeTab === 'problems') targetType = 'problem';
    if (activeTab === 'contests') targetType = 'contest';

    return viewMode === 'pending' 
      ? requests.filter(r => r.targetType === targetType)
      : history.filter(r => r.targetType === targetType);
  };

  if (selectedRequest) {
    return (
      <ProblemRequestViewer
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onAction={handleAction}
      />
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in min-w-0 bg-dark-bg">
        {/* Top Header Tabs & Actions */}
        <div className="w-full border-b border-dark-border bg-dark-bg/30 p-4 px-6 flex flex-row items-center justify-between overflow-x-auto hide-scrollbar gap-4 shrink-0">
          <div className="flex flex-row items-center space-x-2">
            <button
              onClick={() => setActiveTab('accounts')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all text-sm font-bold tracking-wide hover:cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'accounts' ? 'bg-brand-primary/10 text-brand-primary' : 'text-dark-muted hover:text-white hover:bg-dark-hover/50'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Setters</span>
            </button>
            
            <button
              onClick={() => setActiveTab('problems')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all text-sm font-bold tracking-wide hover:cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'problems' ? 'bg-brand-primary/10 text-brand-primary' : 'text-dark-muted hover:text-white hover:bg-dark-hover/50'
              }`}
            >
              <Code className="h-4 w-4" />
              <span>Problems</span>
            </button>
            
            <button
              onClick={() => setActiveTab('contests')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all text-sm font-bold tracking-wide hover:cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'contests' ? 'bg-brand-primary/10 text-brand-primary' : 'text-dark-muted hover:text-white hover:bg-dark-hover/50'
              }`}
            >
              <Trophy className="h-4 w-4" />
              <span>Contests</span>
            </button>

            <div className="w-px bg-dark-border mx-2 h-6"></div>

            <button
              onClick={() => setActiveTab('autoLogs')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all text-sm font-bold tracking-wide hover:cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'autoLogs' ? 'bg-brand-secondary/10 text-brand-secondary' : 'text-dark-muted hover:text-white hover:bg-dark-hover/50'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Auto-Logs</span>
            </button>
          </div>

          {/* Right Side Actions */}
          {activeTab !== 'autoLogs' && (
            <div className="flex flex-row items-center space-x-2 bg-dark-bg/50 p-1 rounded-xl border border-dark-border shrink-0">
              <button
                onClick={() => setViewMode('pending')}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 rounded-lg transition-all hover:cursor-pointer ${
                  viewMode === 'pending' ? 'bg-dark-hover text-brand-primary shadow-sm' : 'text-dark-muted hover:text-white'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Pending</span>
              </button>
              <button
                onClick={() => setViewMode('history')}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 rounded-lg transition-all hover:cursor-pointer ${
                  viewMode === 'history' ? 'bg-dark-hover text-brand-primary shadow-sm' : 'text-dark-muted hover:text-white'
                }`}
              >
                <LayoutList className="h-3.5 w-3.5" />
                <span>History</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col">

          {activeTab === 'autoLogs' && (
            <div className="border-b border-dark-border bg-dark-bg/10 p-4">
              <h3 className="text-sm font-bold text-brand-secondary flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4" />
                <span>Certified & Trusted Setter Logs</span>
              </h3>
              <p className="text-xs text-dark-muted mt-1">These problems bypassed the queue due to the setter's trust badge.</p>
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center text-dark-muted flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto max-h-[600px]">
              {activeTab === 'autoLogs' ? renderAutoLogsTable() : renderTable(getFilteredData(), viewMode === 'history')}
            </div>
          )}
        </div>
    </div>
  );
};

export default ApprovalQueue;
