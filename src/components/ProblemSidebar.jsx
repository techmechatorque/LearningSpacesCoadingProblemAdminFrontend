import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Layers, CheckCircle, AlertCircle } from 'lucide-react';
import * as api from '../services/api';

const ProblemSidebar = ({ problems, selectedProblemId, onSelectProblem, userSubmissions = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [categories, setCategories] = useState([]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  const solvedProblemIds = useMemo(() => {
    const solved = new Set();
    if (Array.isArray(userSubmissions)) {
      userSubmissions.forEach((sub) => {
        if (sub.verdict === 'Accepted' && sub.problemId) {
          const id = typeof sub.problemId === 'object' ? sub.problemId._id : sub.problemId;
          if (id) solved.add(id.toString());
        }
      });
    }
    return solved;
  }, [userSubmissions]);

  const attemptedProblemIds = useMemo(() => {
    const attempted = new Set();
    if (Array.isArray(userSubmissions)) {
      userSubmissions.forEach((sub) => {
        if (sub.problemId) {
          const id = typeof sub.problemId === 'object' ? sub.problemId._id : sub.problemId;
          if (id) attempted.add(id.toString());
        }
      });
    }
    return attempted;
  }, [userSubmissions]);

  // Filter problems based on search, difficulty, category, and status
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

  // Group filtered problems by category
  const groupedProblems = useMemo(() => {
    const groups = {};
    filteredProblems.forEach((prob) => {
      const category = prob.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(prob);
    });
    return groups;
  }, [filteredProblems]);

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy':
        return 'text-brand-secondary bg-brand-secondary/10';
      case 'Medium':
        return 'text-brand-primary bg-brand-primary/10';
      case 'Hard':
        return 'text-brand-danger bg-brand-danger/10';
      default:
        return 'text-dark-muted bg-dark-hover';
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-card border-r border-dark-border w-[300px] shrink-0 overflow-hidden">
      {/* Search and Filters Header */}
      <div className="p-4 border-b border-dark-border space-y-3 shrink-0">
        <h3 className="font-bold text-base flex items-center space-x-2 text-white">
          <Layers className="h-4 w-4 text-brand-primary" />
          <span>Problem List</span>
        </h3>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-dark-muted" />
          <input
            type="text"
            placeholder="Search problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-lg pl-9 pr-4 py-2 text-sm text-dark-text placeholder-dark-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          />
        </div>

        {/* Filters Group */}
        <div className="space-y-2 pt-2 border-t border-dark-border/40">
          {/* Difficulty Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Filter className="h-3.5 w-3.5 text-dark-muted" />
              <span className="text-xs text-dark-muted">Difficulty:</span>
            </div>
            <div className="flex space-x-1">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all border-0 hover:cursor-pointer ${
                    selectedDifficulty === diff
                      ? 'bg-brand-primary text-black'
                      : 'bg-dark-bg text-dark-muted hover:text-white border border-dark-border'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3.5 w-3.5 text-dark-muted" />
              <span className="text-xs text-dark-muted">Status:</span>
            </div>
            <div className="flex space-x-1">
              {['All', 'Solved', 'Unsolved'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all border-0 hover:cursor-pointer ${
                    selectedStatus === status
                      ? 'bg-brand-primary text-black'
                      : 'bg-dark-bg text-dark-muted hover:text-white border border-dark-border'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center justify-between pt-1 border-t border-dark-border/20">
            <div className="flex items-center space-x-1.5">
              <Layers className="h-3.5 w-3.5 text-dark-muted" />
              <span className="text-xs text-dark-muted">Category:</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-dark-bg border border-dark-border rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-brand-primary cursor-pointer w-[150px]"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Problems Grouped List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.keys(groupedProblems).length === 0 ? (
          <div className="text-center text-sm text-dark-muted py-8">
            No problems found
          </div>
        ) : (
          Object.entries(groupedProblems).map(([category, list]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary/80 border-b border-dark-border/40 pb-1">
                {category} Problems
              </h4>
              <div className="space-y-1">
                {list.map((prob) => {
                  const isSolved = solvedProblemIds.has(prob._id);
                  const isAttempted = attemptedProblemIds.has(prob._id);

                  return (
                    <button
                      key={prob._id}
                      onClick={() => onSelectProblem(prob._id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all border-0 hover:cursor-pointer flex items-center justify-between group ${
                        selectedProblemId === prob._id
                          ? 'bg-brand-primary/10 text-white border border-brand-primary/30 font-medium'
                          : 'text-dark-text hover:bg-dark-hover border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate min-w-0">
                        {isSolved ? (
                          <CheckCircle className="h-4 w-4 text-brand-secondary shrink-0" />
                        ) : isAttempted ? (
                          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded-full border border-dark-border shrink-0" />
                        )}
                        <span className="truncate group-hover:text-brand-primary transition-colors">
                          {prob.problemNumber ? `${prob.problemNumber}. ` : ''}{prob.name}
                        </span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${getDifficultyColor(prob.difficulty)}`}>
                        {prob.difficulty}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProblemSidebar;
