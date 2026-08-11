import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Calendar, Mail, FileText, AlertTriangle, ExternalLink, X, HelpCircle, Loader2, Trash2, CheckCircle2 } from 'lucide-react';

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [viewingImage, setViewingImage] = useState(null); // stores image url to view in fullscreen
  const [activeTab, setActiveTab] = useState('unresolved'); // 'unresolved' | 'resolved' | 'all'

  const fetchIssues = async () => {
    try {
      const data = await api.getIssues();
      setIssues(data);
    } catch (err) {
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleToggleResolved = async (id, currentStatus) => {
    try {
      const updated = await api.updateIssueStatus(id, !currentStatus);
      // Update issues list in state
      setIssues(prevIssues =>
        prevIssues.map(issue => (issue._id === id ? { ...issue, resolved: updated.resolved } : issue))
      );
      // Update selected issue inspector in state
      if (selectedIssue && selectedIssue._id === id) {
        setSelectedIssue(prev => ({ ...prev, resolved: updated.resolved }));
      }
    } catch (err) {
      console.error('Failed to update issue status:', err);
    }
  };

  const handleDeleteIssue = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this issue log? This cannot be undone.')) {
      return;
    }
    try {
      await api.deleteIssue(id);
      // Remove from issues state
      setIssues(prevIssues => prevIssues.filter(issue => issue._id !== id));
      // Clear selection if the deleted one was selected
      if (selectedIssue && selectedIssue._id === id) {
        setSelectedIssue(null);
      }
    } catch (err) {
      console.error('Failed to delete issue:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter issues based on active Tab
  const filteredIssues = issues.filter((issue) => {
    if (activeTab === 'unresolved') return !issue.resolved;
    if (activeTab === 'resolved') return issue.resolved;
    return true; // 'all'
  });

  return (
    <>
      <div className="animate-fade-in max-w-7xl mx-auto flex-1 flex flex-col min-h-0 overflow-y-auto p-8 space-y-6">
      {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-dark-border/40 pb-4 gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-brand-danger" />
              <span>Reported Issues Portal</span>
            </h1>
            <p className="text-xs text-dark-muted font-medium">
              View user feedback, error screenshots and code execution bugs.
            </p>
          </div>

          {/* Tab Filters */}
          <div className="flex bg-dark-card border border-dark-border p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('unresolved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold hover:cursor-pointer transition-all ${
                activeTab === 'unresolved' ? 'bg-brand-primary/10 text-brand-primary' : 'text-dark-muted hover:text-white'
              }`}
            >
              Unresolved ({issues.filter(i => !i.resolved).length})
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold hover:cursor-pointer transition-all ${
                activeTab === 'resolved' ? 'bg-brand-primary/10 text-brand-primary' : 'text-dark-muted hover:text-white'
              }`}
            >
              Resolved ({issues.filter(i => i.resolved).length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold hover:cursor-pointer transition-all ${
                activeTab === 'all' ? 'bg-brand-primary/10 text-brand-primary' : 'text-dark-muted hover:text-white'
              }`}
            >
              All ({issues.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-dark-muted">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary mr-2" />
            <span className="text-sm font-semibold">Fetching reported issues...</span>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4 bg-dark-card/10 border border-dark-border/40 rounded-2xl border-dashed">
            <div className="h-14 w-14 rounded-full bg-dark-hover/40 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-dark-muted" />
            </div>
            <div className="space-y-1">
              <h3 className="text-white font-bold text-base">
                {activeTab === 'unresolved' ? 'All Clean! No Unresolved Issues' : 'No Issues Found'}
              </h3>
              <p className="text-dark-muted text-xs max-w-sm">
                {activeTab === 'unresolved' 
                  ? 'All user issues have been marked as resolved.' 
                  : 'No reported bugs or user complaints match this filter.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0">
            {/* List Table Pane */}
            <div className="xl:col-span-2 flex flex-col min-h-0 bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-dark-border text-left text-xs">
                  <thead className="bg-dark-hover/40 text-dark-muted font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5 w-12 text-center">Status</th>
                      <th className="px-5 py-3.5">Reporter (Email)</th>
                      <th className="px-5 py-3.5">Question Context</th>
                      <th className="px-5 py-3.5">Submitted Date</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border/40 text-dark-text font-medium">
                    {filteredIssues.map((issue) => (
                      <tr 
                        key={issue._id} 
                        onClick={() => setSelectedIssue(issue)}
                        className={`hover:bg-dark-hover/20 transition-colors cursor-pointer ${
                          selectedIssue?._id === issue._id ? 'bg-brand-primary/5 border-l-2 border-brand-primary' : ''
                        }`}
                      >
                        <td className="px-5 py-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={issue.resolved} 
                            onChange={() => handleToggleResolved(issue._id, issue.resolved)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 rounded border-dark-border bg-dark-bg text-brand-primary focus:ring-brand-primary cursor-pointer transition-all"
                            title={issue.resolved ? "Mark Unresolved" : "Mark Resolved"}
                          />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-3.5 w-3.5 text-dark-muted" />
                            <span className="font-semibold text-white">{issue.userEmail}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center space-x-2">
                            <HelpCircle className="h-3.5 w-3.5 text-dark-muted" />
                            <span className="font-semibold text-white">{issue.problemTitle}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-dark-muted">
                          <div className="flex items-center space-x-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(issue.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIssue(issue);
                              }}
                              className="bg-dark-bg hover:bg-dark-hover text-brand-primary hover:text-white border border-dark-border hover:border-brand-primary px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:cursor-pointer"
                            >
                              View details
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteIssue(issue._id);
                              }}
                              className="bg-dark-bg hover:bg-brand-danger/10 text-dark-muted hover:text-brand-danger border border-dark-border hover:border-brand-danger/30 p-2 rounded-lg transition-all hover:cursor-pointer flex items-center justify-center shrink-0"
                              title="Delete Report"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Details Inspector Pane */}
            <div className="flex flex-col min-h-0 bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-lg p-6 space-y-5">
              {selectedIssue ? (
                <>
                  <div className="flex items-center justify-between border-b border-dark-border/40 pb-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Issue Inspector</h3>
                      <p className="text-[10px] text-dark-muted font-medium mt-1">
                        Viewing logs for report ID: <strong className="text-white font-mono">{selectedIssue._id.substring(selectedIssue._id.length - 8)}</strong>
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedIssue.resolved 
                        ? 'text-brand-secondary bg-brand-secondary/10 border-brand-secondary/30' 
                        : 'text-brand-danger bg-brand-danger/10 border-brand-danger/30'
                    }`}>
                      {selectedIssue.resolved ? 'Resolved' : 'Unresolved'}
                    </span>
                  </div>

                  <div className="space-y-4 flex-1 overflow-y-auto min-h-0">
                    {/* Reporter Info */}
                    <div className="bg-dark-bg p-3.5 rounded-xl border border-dark-border/40 space-y-1">
                      <span className="text-[9px] text-brand-primary font-bold uppercase tracking-wider block">Reporter</span>
                      <div className="flex items-center space-x-2 text-xs font-semibold text-white">
                        <Mail className="h-4 w-4 text-dark-muted" />
                        <span>{selectedIssue.userEmail}</span>
                      </div>
                    </div>

                    {/* Question Info */}
                    <div className="bg-dark-bg p-3.5 rounded-xl border border-dark-border/40 space-y-1">
                      <span className="text-[9px] text-brand-primary font-bold uppercase tracking-wider block">Question</span>
                      <div className="flex items-center space-x-2 text-xs font-semibold text-white">
                        <HelpCircle className="h-4 w-4 text-dark-muted" />
                        <span>{selectedIssue.problemTitle}</span>
                      </div>
                    </div>

                    {/* Bug Description */}
                    <div className="bg-dark-bg p-3.5 rounded-xl border border-dark-border/40 space-y-1.5">
                      <span className="text-[9px] text-brand-primary font-bold uppercase tracking-wider block">Error Details</span>
                      <p className="text-xs text-dark-text whitespace-pre-wrap leading-relaxed">
                        {selectedIssue.description}
                      </p>
                    </div>

                    {/* Screenshot Viewer */}
                    {selectedIssue.screenshot ? (
                      <div className="space-y-2">
                        <span className="text-[9px] text-dark-muted font-bold uppercase tracking-wider block">Attached Screenshot</span>
                        <div 
                          onClick={() => setViewingImage(selectedIssue.screenshot)}
                          className="relative group border border-dark-border rounded-xl overflow-hidden cursor-zoom-in bg-dark-bg p-2 hover:border-brand-primary transition-all"
                        >
                          <img 
                            src={selectedIssue.screenshot} 
                            alt="Screenshot" 
                            className="max-h-48 w-full object-contain rounded-lg border border-dark-border/30 bg-dark-card group-hover:scale-[1.01] transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                            <span className="bg-black/80 text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg flex items-center space-x-1">
                              <ExternalLink className="h-3 w-3" />
                              <span>View Fullscreen</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dark-border rounded-xl p-4 text-center bg-dark-bg/20 text-xs text-dark-muted font-medium">
                        No screenshot attachment provided for this issue.
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-dark-border/40 flex flex-col space-y-2 shrink-0">
                    <button
                      onClick={() => handleToggleResolved(selectedIssue._id, selectedIssue.resolved)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all hover:cursor-pointer flex items-center justify-center space-x-2 border ${
                        selectedIssue.resolved
                          ? 'bg-dark-hover text-white border-dark-border hover:bg-dark-hover/60'
                          : 'bg-brand-secondary/15 text-brand-secondary border-brand-secondary/30 hover:bg-brand-secondary/25'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{selectedIssue.resolved ? 'Mark Unresolved' : 'Mark Resolved'}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteIssue(selectedIssue._id)}
                      className="w-full py-2 rounded-xl text-xs font-bold bg-brand-danger/10 text-brand-danger border border-brand-danger/20 hover:bg-brand-danger/20 transition-all hover:cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Report</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 text-dark-muted">
                  <FileText className="h-10 w-10 text-dark-muted/60" />
                  <div className="space-y-1">
                    <h4 className="text-white font-bold text-sm">Select an Issue</h4>
                    <p className="text-xs text-dark-muted max-w-[200px] leading-relaxed">
                      Choose a reported issue from the list to inspect reporter details, question name and screenshot image.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Screenshot Overlay Modal */}
      {viewingImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6 cursor-zoom-out"
          onClick={() => setViewingImage(null)}
        >
          <button
            onClick={() => setViewingImage(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-dark-card hover:bg-dark-hover border border-dark-border text-white transition-colors cursor-pointer z-55"
          >
            <X className="h-5 w-5" />
          </button>
          <img 
            src={viewingImage} 
            alt="Fullscreen Screenshot" 
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-dark-border/40 select-none animate-fade-in"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on image
          />
        </div>
      )}
    </>
  );
};

export default Issues;
