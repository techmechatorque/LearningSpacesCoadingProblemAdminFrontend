import React, { useState } from 'react';
import { MessageSquare, Edit, Trash2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import * as api from '../services/codingApi';

const DiscussionsPanel = () => {
  const {
    discussions, setDiscussions,
    discussionsLoading,
    selectedProblemId,
    contestId,
    user
  } = useWorkspace();

  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [isSubmittingDiscussion, setIsSubmittingDiscussion] = useState(false);
  const [editingDiscussionId, setEditingDiscussionId] = useState(null);
  const [editDiscussionContent, setEditDiscussionContent] = useState('');

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleAddDiscussion = async (e) => {
    e.preventDefault();
    if (!newDiscussionContent.trim() || !selectedProblemId) return;
    setIsSubmittingDiscussion(true);
    try {
      const newComment = await api.createDiscussion(selectedProblemId, newDiscussionContent);
      setDiscussions((prev) => [...prev, newComment]);
      setNewDiscussionContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingDiscussion(false);
    }
  };

  const handleStartEditDiscussion = (discussion) => {
    setEditingDiscussionId(discussion._id);
    setEditDiscussionContent(discussion.content);
  };

  const handleUpdateDiscussion = async (e) => {
    e.preventDefault();
    if (!editDiscussionContent.trim()) return;
    try {
      const updated = await api.updateDiscussion(editingDiscussionId, editDiscussionContent);
      setDiscussions(prev => prev.map(d => d._id === editingDiscussionId ? updated : d));
      setEditingDiscussionId(null);
      setEditDiscussionContent('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDiscussion = async (id) => {
    try {
      await api.deleteDiscussion(id);
      setDiscussions((prev) => prev.filter(d => d._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="workspace-discussions-container">
      <h3 className="workspace-section-title">Discussion Thread</h3>
      <div className="workspace-discussions-list">
        {discussionsLoading ? (
          <div className="workspace-loading-text">Loading...</div>
        ) : discussions.length === 0 ? (
          <div className="workspace-empty-state">No discussions yet. Start the conversation!</div>
        ) : (
          <div className="workspace-discussions-wrapper">
            {discussions.map(d => (
              <div key={d._id} className="workspace-discussion-item">
                <div className="workspace-discussion-header">
                  <strong className="workspace-discussion-user">{d.userId?.name || 'User'} {d.userId?.role === 'admin' && <span className="workspace-admin-badge">(Admin)</span>}</strong>
                  <span className="workspace-discussion-time">{formatDate(d.createdAt)}</span>
                </div>
                {editingDiscussionId === d._id ? (
                  <form onSubmit={handleUpdateDiscussion} className="workspace-discussion-form">
                    <textarea className="workspace-discussion-textarea" value={editDiscussionContent} onChange={e => setEditDiscussionContent(e.target.value)} rows="3" required />
                    <div className="workspace-discussion-actions">
                      <button type="button" className="workspace-discussion-cancel" onClick={() => setEditingDiscussionId(null)}>Cancel</button>
                      <button type="submit" className="workspace-discussion-save">Save</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="workspace-discussion-content">{d.content}</p>
                    {(((user?._id || user?.id) && (d.userId?._id === (user?._id || user?.id) || d.userId === (user?._id || user?.id))) || user?.role === 'admin') && (
                      <div className="workspace-discussion-manage">
                        <button onClick={() => handleStartEditDiscussion(d)} className="workspace-discussion-btn edit-btn"><Edit className="workspace-icon-xs"/> Edit</button>
                        <button onClick={() => handleDeleteDiscussion(d._id)} className="workspace-discussion-btn delete-btn"><Trash2 className="workspace-icon-xs"/> Delete</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {(!contestId || user?.role === 'admin') ? (
        <form onSubmit={handleAddDiscussion} className="workspace-new-discussion-form">
          <textarea value={newDiscussionContent} onChange={e => setNewDiscussionContent(e.target.value)} placeholder="Ask a question or share hints..." rows="3" className="workspace-new-discussion-textarea" required />
          <button type="submit" disabled={isSubmittingDiscussion || !newDiscussionContent.trim()} className="workspace-new-discussion-btn">
            <MessageSquare className="workspace-icon-xs"/> Post Comment
          </button>
        </form>
      ) : (
        <div className="workspace-discussions-disabled">Discussions are disabled during contests.</div>
      )}
    </div>
  );
};

export default DiscussionsPanel;
