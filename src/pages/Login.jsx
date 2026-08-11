import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, Mail, Lock, AlertTriangle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'problem_setter') {
        navigate('/admin/problems');
      } else {
        navigate('/workspace');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      return setError('Please fill in all fields');
    }

    setLoading(true);
    try {
      const loggedInUser = await loginUser(email, password);
      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else if (loggedInUser.role === 'problem_setter') {
        navigate('/admin/problems');
      } else {
        navigate('/workspace');
      }
    } catch (err) {
      setError(err || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-dark-bg px-6 py-12 relative">
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-primary/5 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-dark-card border border-dark-border p-8 rounded-2xl shadow-xl relative z-10 animate-fade-in">
        {/* Title / Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary mb-3">
            <Code2 className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-sm text-dark-muted mt-1">Sign in to start practicing algorithms</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 flex items-center space-x-2 bg-brand-danger/10 border border-brand-danger/25 text-brand-danger p-3.5 rounded-lg text-xs font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-dark-muted font-bold uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-dark-muted" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl pl-11 pr-4 py-3 text-sm text-dark-text placeholder-dark-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-dark-muted font-bold uppercase tracking-wider block">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-dark-muted" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl pl-11 pr-4 py-3 text-sm text-dark-text placeholder-dark-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center space-x-2 rounded-xl bg-brand-primary text-black py-3 font-bold hover:bg-brand-primary/95 transition-all shadow-md active:scale-95 disabled:opacity-50 hover:cursor-pointer mt-2"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Signup redirection */}
        <div className="text-center mt-6 text-xs text-dark-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-primary hover:underline font-semibold">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
