import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Layers, CheckCircle, AlertCircle } from 'lucide-react';
import * as api from '../services/codingApi';
import { useWorkspace } from '../context/WorkspaceContext';
import '../styles/coding.css';
import './ProblemSidebar.css';

const ProblemSidebar = () => {
  const { problems, selectedProblemId, handleSelectProblem: onSelectProblem, userSubmissions = [] } = useWorkspace();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [categories, setCategories] = useState([]);
  const [visibleCount, setVisibleCount] = useState(30);

  useEffect(() => {
    setVisibleCount(30);
  }, [searchQuery, selectedDifficulty, selectedCategory, selectedStatus]);

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
          const id = typeof sub.problemId === 'object' && sub.problemId != null ? sub.problemId._id : sub.problemId;
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
          const id = typeof sub.problemId === 'object' && sub.problemId != null ? sub.problemId._id : sub.problemId;
          if (id) attempted.add(id.toString());
        }
      });
    }
    return attempted;
  }, [userSubmissions]);

  const filteredProblems = useMemo(() => {
    if (!Array.isArray(problems)) return [];
    return problems.filter((prob) => {
      const matchesSearch = prob?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
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

  const visibleProblems = useMemo(() => {
    return filteredProblems.slice(0, visibleCount);
  }, [filteredProblems, visibleCount]);

  const groupedProblems = useMemo(() => {
    const groups = {};
    visibleProblems.forEach((prob) => {
      const category = prob.category || 'General';
      if (!groups[category]) groups[category] = [];
      groups[category].push(prob);
    });
    return groups;
  }, [visibleProblems]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 50) {
      if (visibleCount < filteredProblems.length) {
        setVisibleCount((prev) => Math.min(prev + 30, filteredProblems.length));
      }
    }
  };

  return (
    <div className="problem-sidebar-container">
      <div className="problem-sidebar-header">
        <h3 className="problem-sidebar-title problem-sidebar-text-primary">
          <Layers className="workspace-icon-md problem-sidebar-text-accent" /> Problem List
        </h3>
        
        <div className="coding-search-box problem-sidebar-search">
          <Search className="workspace-icon-sm" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="problem-sidebar-search-input"
          />
        </div>

        <div className="problem-sidebar-filters">
          <div className="problem-sidebar-filter-row">
            <span className="problem-sidebar-filter-label problem-sidebar-text-muted"><Filter className="workspace-icon-xs"/> Difficulty</span>
            <select value={selectedDifficulty} onChange={e => setSelectedDifficulty(e.target.value)} className="problem-sidebar-select">
              <option value="All">All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div className="problem-sidebar-filter-row">
            <span className="problem-sidebar-filter-label problem-sidebar-text-muted"><CheckCircle className="workspace-icon-xs"/> Status</span>
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="problem-sidebar-select">
              <option value="All">All</option>
              <option value="Solved">Solved</option>
              <option value="Unsolved">Unsolved</option>
            </select>
          </div>
          <div className="problem-sidebar-filter-row">
            <span className="problem-sidebar-filter-label problem-sidebar-text-muted"><Layers className="workspace-icon-xs"/> Category</span>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="problem-sidebar-select cat-select">
              <option value="All">All</option>
              {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div onScroll={handleScroll} className="problem-sidebar-list">
        {Object.keys(groupedProblems).length === 0 ? (
          <div className="problem-sidebar-empty problem-sidebar-text-muted">No problems found</div>
        ) : (
          Object.entries(groupedProblems).map(([category, list]) => (
            <div key={category}>
              <h4 className="problem-sidebar-category-title problem-sidebar-text-accent">{category}</h4>
              <div className="problem-sidebar-items-wrapper">
                {list.map(prob => {
                  const isSolved = solvedProblemIds.has(prob._id);
                  const isAttempted = attemptedProblemIds.has(prob._id);
                  const isSelected = selectedProblemId === prob._id;
                  return (
                    <button
                      key={prob._id}
                      onClick={() => onSelectProblem(prob.slug || prob._id)}
                      className={`problem-sidebar-item-btn ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="problem-sidebar-item-info">
                        {isSolved ? <CheckCircle className="workspace-icon-xs problem-sidebar-text-success"/> : isAttempted ? <AlertCircle className="workspace-icon-xs problem-sidebar-text-medium"/> : <div className="problem-sidebar-unsolved-icon" />}
                        <span className="problem-sidebar-item-name">{prob.problemNumber ? `${prob.problemNumber}. ` : ''}{prob.name}</span>
                      </div>
                      <span className={`coding-badge problem-sidebar-badge ${prob.difficulty.toLowerCase()}`}>{prob.difficulty}</span>
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
