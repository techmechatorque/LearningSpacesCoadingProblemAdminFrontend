import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { Eye, Edit3, Trash2, Calendar, BookOpen, AlertTriangle, Search, Filter, Layers, CheckCircle, Send, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AllProblems = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.updateProblem(id, { status: newStatus });
      fetchProblems(); // Reload table
    } catch (err) {
      setError(err.message || 'Failed to update problem status');
    }
  };

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [categories, setCategories] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  
  const navigate = useNavigate();

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const data = await api.getProblems();
      setProblems(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve problems list');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const data = await api.getSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to load submissions', err);
    }
  };

  useEffect(() => {
    fetchProblems();
    fetchCategories();
    fetchSubmissions();
  }, []);

  const solvedProblemIds = useMemo(() => {
    const solved = new Set();
    if (Array.isArray(submissions)) {
      submissions.forEach((sub) => {
        if (sub.verdict === 'Accepted' && sub.problemId) {
          const id = typeof sub.problemId === 'object' ? sub.problemId._id : sub.problemId;
          if (id) solved.add(id.toString());
        }
      });
    }
    return solved;
  }, [submissions]);

  // Compute filtered problems list
  const filteredProblems = useMemo(() => {
    if (!Array.isArray(problems)) return [];
    return problems.filter((prob) => {
      const matchesSearch =
        prob?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prob?.problemNumber && String(prob.problemNumber).includes(searchQuery)) ||
        false;
      const matchesDifficulty = selectedDifficulty === 'All' || prob?.difficulty === selectedDifficulty;
      const matchesCategory = selectedCategory === 'All' || prob?.category === selectedCategory;
      
      const isSolved = solvedProblemIds.has(prob?._id);
      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Solved' && isSolved) ||
        (selectedStatus === 'Unsolved' && !isSolved);

      return matchesSearch && matchesDifficulty && matchesCategory && matchesStatus;
    });
  }, [problems, searchQuery, selectedDifficulty, selectedCategory, selectedStatus, solvedProblemIds]);

  const handleDelete = async (id) => {
    try {
      await api.deleteProblem(id);
      setDeleteConfirmId(null);
      fetchProblems(); // Reload table
    } catch (err) {
      setError(err.message || 'Failed to delete problem');
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy':
        return 'text-brand-secondary bg-brand-secondary/10 border-brand-secondary/20';
      case 'Medium':
        return 'text-brand-primary bg-brand-primary/10 border-brand-primary/20';
      case 'Hard':
        return 'text-brand-danger bg-brand-danger/10 border-brand-danger/20';
      default:
        return 'text-dark-muted bg-dark-hover border-dark-border';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <div className="animate-fade-in max-w-7xl mx-auto p-8 space-y-6 min-w-0">
        <div className="flex items-center justify-between border-b border-dark-border/40 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-brand-primary" />
              <span>DSA Question Bank</span>
            </h1>
            <p className="text-sm text-dark-muted mt-1">Manage, update, and deploy algorithmic questions</p>
          </div>
          <Link
            to="/admin/add-problem"
            className="rounded-xl bg-brand-primary text-black px-5 py-2.5 text-sm font-bold hover:bg-brand-primary/95 transition-all shadow-md active:scale-95"
          >
            Create Question
          </Link>
        </div>

        {error && (
          <div className="flex items-center space-x-2 bg-brand-danger/10 border border-brand-danger/25 text-brand-danger p-4 rounded-xl text-sm font-semibold">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filters Bar */}
        <div className="bg-dark-card border border-dark-border/60 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-dark-muted" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-dark-text placeholder-dark-muted focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4 items-center">
            {/* Category Filter */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Layers className="h-4 w-4 text-dark-muted shrink-0" />
              <span className="text-xs font-semibold text-dark-muted shrink-0">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 sm:flex-initial bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary min-w-[150px]"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-dark-muted shrink-0" />
              <span className="text-xs font-semibold text-dark-muted shrink-0">Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="flex-1 sm:flex-initial bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary min-w-[120px]"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <CheckCircle className="h-4 w-4 text-dark-muted shrink-0" />
              <span className="text-xs font-semibold text-dark-muted shrink-0">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 sm:flex-initial bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary min-w-[120px]"
              >
                <option value="All">All Statuses</option>
                <option value="Solved">Solved</option>
                <option value="Unsolved">Unsolved</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-dark-muted text-sm flex flex-col items-center justify-center space-y-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-primary border-t-transparent"></div>
            <span>Fetching question bank...</span>
          </div>
        ) : problems.length === 0 ? (
          <div className="text-center py-20 text-dark-muted text-sm bg-dark-card border border-dark-border/40 rounded-2xl">
            No questions exist in the repository yet. Click "Create Question" to add one!
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="text-center py-20 text-dark-muted text-sm bg-dark-card border border-dark-border/40 rounded-2xl">
            No questions match your filter criteria. Try resetting the filters.
          </div>
        ) : (
          <div className="overflow-hidden border border-dark-border rounded-2xl bg-dark-card shadow-md">
            <table className="min-w-full divide-y divide-dark-border text-left text-xs sm:text-sm">
              <thead className="bg-dark-hover/40 text-dark-muted font-bold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Problem Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Approval Status</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/60 text-dark-text font-medium">
                {filteredProblems.map((prob) => (
                  <tr key={prob._id} className="hover:bg-dark-hover/15 transition-colors">
                    <td className="px-6 py-4 text-white font-semibold">
                      {prob.problemNumber ? `${prob.problemNumber}. ` : ''}{prob.name}
                    </td>
                    <td className="px-6 py-4 text-dark-muted">
                      {prob.category || 'General'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${getDifficultyColor(prob.difficulty)}`}>
                        {prob.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {prob.status === 'approved' ? (
                        <span className="text-xs px-2.5 py-1.5 rounded-full font-bold border text-brand-secondary bg-brand-secondary/10 border-brand-secondary/20 flex items-center space-x-1 w-fit">
                          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>Approved</span>
                        </span>
                      ) : prob.status === 'pending_approval' ? (
                        <span className="text-xs px-2.5 py-1.5 rounded-full font-bold border text-amber-500 bg-amber-500/10 border-amber-500/20 flex items-center space-x-1 w-fit">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span>Pending Admin</span>
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-1.5 rounded-full font-bold border text-dark-muted bg-dark-hover border-dark-border flex items-center space-x-1 w-fit">
                          <div className="h-1.5 w-1.5 rounded-full bg-dark-muted shrink-0" />
                          <span>Draft</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-dark-muted flex items-center space-x-1.5 mt-1 border-0">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(prob.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3.5">
                      {prob.status === 'draft' && (user?.role === 'admin' || !prob.createdBy || prob.createdBy === user?._id || (prob.createdBy?._id && prob.createdBy?._id === user?._id)) && (
                        <button
                          onClick={() => handleUpdateStatus(prob._id, 'pending_approval')}
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-primary hover:underline bg-transparent border-0 hover:cursor-pointer transition-colors"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Send to Admin</span>
                        </button>
                      )}
                      {prob.status === 'pending_approval' && user?.role === 'admin' && (
                        <button
                          onClick={() => handleUpdateStatus(prob._id, 'approved')}
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-secondary hover:underline bg-transparent border-0 hover:cursor-pointer transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Approve</span>
                        </button>
                      )}
                      <Link
                        to={`/workspace?problemId=${prob._id}`}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-secondary hover:underline"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Solve</span>
                      </Link>
                      <Link
                        to={`/admin/edit-problem/${prob._id}`}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-primary hover:underline"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </Link>
                      <button
                        onClick={() => setDeleteConfirmId(prob._id)}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-danger hover:underline bg-transparent border-0 hover:cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-dark-card border border-dark-border p-6 rounded-2xl animate-fade-in shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2">Delete Question?</h3>
            <p className="text-xs text-dark-muted leading-relaxed mb-6">
              Are you sure you want to delete this question? This operation is permanent and will wipe all metadata, starter templates, and test logs.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="bg-dark-bg hover:bg-dark-hover border border-dark-border text-dark-text px-4 py-2 rounded-xl text-xs font-semibold hover:text-white transition-all hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="bg-brand-danger hover:bg-brand-danger/90 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:cursor-pointer shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllProblems;
