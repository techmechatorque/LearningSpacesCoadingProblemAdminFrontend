import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

import AdminRoute from './components/AdminRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';

import AdminDashboard from './pages/AdminDashboard';
import AllProblems from './pages/AllProblems';
import AddProblem from './pages/AddProblem';
import Issues from './pages/Issues';
import ApprovalQueue from './pages/ApprovalQueue';
import ManageSetters from './pages/ManageSetters';
import ContestsList from './pages/ContestsList';
import CreateContest from './pages/CreateContest';
import ContestLeaderboard from './pages/ContestLeaderboard';
import EditContest from './pages/EditContest';
import Workspace from './coding/pages/Workspace';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="h-screen overflow-hidden bg-dark-bg text-dark-text flex flex-col font-sans select-none">
          <Navbar />
          <div className="flex-1 flex flex-col min-h-0">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
  

              {/* Admin Panel Routes (Admin-Only Protected) */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/problems"
                element={
                  <AdminRoute>
                    <AllProblems />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/add-problem"
                element={
                  <AdminRoute>
                    <AddProblem />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/edit-problem/:id"
                element={
                  <AdminRoute>
                    <AddProblem />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/approvals"
                element={
                  <AdminRoute>
                    <ApprovalQueue />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/setters"
                element={
                  <AdminRoute>
                    <ManageSetters />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/issues"
                element={
                  <AdminRoute>
                    <Issues />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/contests"
                element={
                  <AdminRoute>
                    <ContestsList />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/contests/create"
                element={
                  <AdminRoute>
                    <CreateContest />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/contests/:id/leaderboard"
                element={
                  <AdminRoute>
                    <ContestLeaderboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/contests/:id/edit"
                element={
                  <AdminRoute>
                    <EditContest />
                  </AdminRoute>
                }
              />
              
              <Route
                path="/workspace"
                element={
                  <AdminRoute noSidebar={true}>
                    <Workspace />
                  </AdminRoute>
                }
              />

              {/* Fallback Catch-All */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
