import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/codingApi';
import '../styles/coding.css';
import './ProblemsDashboard.css';
import { Target, Search, CheckCircle, Award } from 'lucide-react';

const ProblemsDashboard = () => {
  const [problems, setProblems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState('');

  // Pagination & Stats
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProblemsCount, setTotalProblemsCount] = useState(0);
  const [solvedProblemIds, setSolvedProblemIds] = useState(new Set());
  const [stats, setStats] = useState({
    total: 0, solved: 0, pct: 0,
    Easy: { total: 0, solved: 0, pct: 0 },
    Medium: { total: 0, solved: 0, pct: 0 },
    Hard: { total: 0, solved: 0, pct: 0 }
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await api.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedDifficulty, selectedCategory, selectedStatus]);

  useEffect(() => {
    const fetchPaginatedProblems = async () => {
      setTableLoading(true);
      try {
        const data = await api.getProblems({
          page: currentPage,
          limit: 30,
          search: debouncedSearch,
          difficulty: selectedDifficulty,
          category: selectedCategory,
          status: selectedStatus
        });
        setProblems(data.problems || []);
        setTotalPages(data.totalPages || 1);
        setTotalProblemsCount(data.totalProblems || 0);
        setSolvedProblemIds(new Set(data.solvedProblemIds || []));
        if (data.stats) {
          setStats(data.stats);
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve problems');
      } finally {
        setTableLoading(false);
        setLoading(false);
      }
    };
    fetchPaginatedProblems();
  }, [currentPage, debouncedSearch, selectedDifficulty, selectedCategory, selectedStatus]);

  if (loading) {
    return (
      <div className="coding-app coding-loader-wrapper">
        <div className="coding-spinner"></div>
        <span>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="coding-app">
      <div className="coding-dashboard-container">
        
        <div className="coding-header">
          <h1><Target /> Dashboard</h1>
          <p>Track your progress and solve DSA problems</p>
        </div>

        {error && <div className="problems-error">{error}</div>}

        {/* Stats Grid */}
        <div className="coding-stats-grid">
          <div className="coding-stat-card glow">
            <div className="coding-stat-title">Overall Progress</div>
            <div className="coding-stat-value">
              {stats.solved} <span>/ {stats.total} Solved</span>
            </div>
            <div className="problems-stats-percentage">
              <Award className="problems-icon-award" /> {stats.pct}% Solved
            </div>
          </div>
          {['Easy', 'Medium', 'Hard'].map((diff) => {
            const diffStat = stats[diff] || { solved: 0, total: 0, pct: 0 };
            return (
              <div key={diff} className="coding-stat-card">
                <div className="coding-stat-title problems-stat-title">
                  <span>{diff} Problems</span>
                  <span className={`coding-badge ${diff.toLowerCase()}`}>{diffStat.pct}%</span>
                </div>
                <div className="coding-stat-value">
                  {diffStat.solved} <span>/ {diffStat.total} solved</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="coding-filters">
          <div className="coding-search-box">
            <Search className="problems-icon-search" />
            <input 
              type="text" 
              placeholder="Search problems..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="coding-filter-selects">
            <div className="coding-select-wrapper">
              <span className="problems-filter-label">Category:</span>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="coding-select-wrapper">
              <span className="problems-filter-label">Difficulty:</span>
              <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="coding-select-wrapper">
              <span className="problems-filter-label">Status:</span>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Solved">Solved</option>
                <option value="Unsolved">Unsolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="coding-table-container">
          <table className="coding-table">
            <thead>
              <tr>
                <th>Problem Name</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th className="problems-action-th">Action</th>
              </tr>
            </thead>
            <tbody className={`problems-tbody ${tableLoading ? 'table-loading' : ''}`}>
              {problems.map(prob => {
                const isSolved = solvedProblemIds.has(prob._id);
                return (
                  <tr key={prob._id} onClick={() => navigate(`/coding/workspace/${prob.slug || prob._id}`)}>
                    <td className="problems-prob-name">{prob.problemNumber ? `${prob.problemNumber}. ` : ''}{prob.name}</td>
                    <td className="problems-category-td">{prob.category || 'General'}</td>
                    <td>
                      <span className={`coding-badge ${prob.difficulty.toLowerCase()}`}>
                        {prob.difficulty}
                      </span>
                    </td>
                    <td>
                      {isSolved ? (
                        <span className="coding-badge solved"><CheckCircle className="problems-icon-check"/> Solved</span>
                      ) : (
                        <span className="coding-badge unsolved">Unsolved</span>
                      )}
                    </td>
                    <td className="problems-action-td">
                      <button className="coding-btn coding-btn-primary" onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/coding/workspace/${prob.slug || prob._id}`);
                      }}>Solve</button>
                    </td>
                  </tr>
                );
              })}
              {problems.length === 0 && !tableLoading && (
                <tr>
                  <td colSpan={5} className="problems-empty-td">
                    No problems match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalProblemsCount > 0 && (
          <div className="coding-pagination">
            <span className="problems-pagination-text">
              Showing {(currentPage - 1) * 30 + 1} to {Math.min(currentPage * 30, totalProblemsCount)} of {totalProblemsCount}
            </span>
            {totalPages > 1 && (
              <div className="coding-page-numbers">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>&lt;</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                  if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                    return (
                      <button 
                        key={pageNum} 
                        className={currentPage === pageNum ? 'active' : ''}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="problems-ellipsis">...</span>;
                  }
                  return null;
                })}
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>&gt;</button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ProblemsDashboard;
