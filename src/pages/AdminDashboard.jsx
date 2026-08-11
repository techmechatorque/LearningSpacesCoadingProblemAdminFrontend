import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { BookOpen, Users, Code, Activity, ShieldAlert, Award } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.message || 'Error loading dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-bg text-brand-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
        <span className="ml-3 font-semibold">Loading Admin Dashboard...</span>
      </div>
    );
  }

  const passRate = stats?.totalSubmissions > 0
    ? ((stats.submissionsSummary.Accepted / stats.totalSubmissions) * 100).toFixed(1)
    : '0';

  return (
    <div className="animate-fade-in max-w-7xl mx-auto p-8 space-y-8 min-w-0">
        <div className="flex items-center justify-between border-b border-dark-border/40 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-white">System Metrics</h1>
            <p className="text-sm text-dark-muted mt-1">Platform overview and performance metrics</p>
          </div>
          <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-xl px-4 py-2 flex items-center space-x-2 text-brand-primary">
            <ShieldAlert className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Admin Mode</span>
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-2 bg-brand-danger/10 border border-brand-danger/25 text-brand-danger p-4 rounded-xl text-sm font-semibold">
            <span>{error}</span>
          </div>
        )}

        {/* Count Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-card border border-dark-border p-6 rounded-2xl flex items-center justify-between shadow-md">
            <div className="space-y-2">
              <span className="text-xs font-bold text-dark-muted uppercase tracking-wider">Total Problems</span>
              <h2 className="text-4xl font-extrabold text-white">{stats?.totalProblems || 0}</h2>
            </div>
            <div className="h-12 w-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border p-6 rounded-2xl flex items-center justify-between shadow-md">
            <div className="space-y-2">
              <span className="text-xs font-bold text-dark-muted uppercase tracking-wider">Active Users</span>
              <h2 className="text-4xl font-extrabold text-white">{stats?.totalUsers || 0}</h2>
            </div>
            <div className="h-12 w-12 rounded-xl bg-brand-secondary/10 border border-brand-secondary/20 flex items-center justify-center text-brand-secondary">
              <Users className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border p-6 rounded-2xl flex items-center justify-between shadow-md">
            <div className="space-y-2">
              <span className="text-xs font-bold text-dark-muted uppercase tracking-wider">Total Submissions</span>
              <h2 className="text-4xl font-extrabold text-white">{stats?.totalSubmissions || 0}</h2>
            </div>
            <div className="h-12 w-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Code className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Analytics Distribution section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          {/* Difficulty Distribution */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-6 shadow-md">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Award className="h-5 w-5 text-brand-primary" />
              <span>Problem Difficulty Profile</span>
            </h3>

            <div className="space-y-4">
              {/* Easy */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-brand-secondary">Easy problems</span>
                  <span className="text-white">{stats?.distribution?.Easy || 0}</span>
                </div>
                <div className="w-full bg-dark-bg h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-secondary h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats?.totalProblems > 0 ? (stats.distribution.Easy / stats.totalProblems) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Medium */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-brand-primary">Medium problems</span>
                  <span className="text-white">{stats?.distribution?.Medium || 0}</span>
                </div>
                <div className="w-full bg-dark-bg h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats?.totalProblems > 0 ? (stats.distribution.Medium / stats.totalProblems) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Hard */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-brand-danger">Hard problems</span>
                  <span className="text-white">{stats?.distribution?.Hard || 0}</span>
                </div>
                <div className="w-full bg-dark-bg h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-danger h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats?.totalProblems > 0 ? (stats.distribution.Hard / stats.totalProblems) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Verdict Profiles */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-6 shadow-md">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Activity className="h-5 w-5 text-brand-secondary" />
              <span>Compilation & Pass Profile</span>
            </h3>

            <div className="flex items-center justify-center gap-10 py-4">
              <div className="text-center relative">
                <div className="text-4xl sm:text-5xl font-extrabold text-brand-secondary tracking-tight">
                  {passRate}%
                </div>
                <span className="text-xs text-dark-muted font-bold uppercase tracking-wider block mt-1">Acceptance Rate</span>
              </div>
              <div className="h-16 w-px bg-dark-border"></div>
              <div className="space-y-3 font-semibold text-sm">
                <div className="flex items-center space-x-2">
                  <span className="h-3 w-3 rounded-full bg-brand-secondary"></span>
                  <span className="text-dark-muted">Accepted:</span>
                  <span className="text-white">{stats?.submissionsSummary?.Accepted || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="h-3 w-3 rounded-full bg-brand-danger"></span>
                  <span className="text-dark-muted">Failed / Errors:</span>
                  <span className="text-white">{stats?.submissionsSummary?.Failed || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AdminDashboard;
