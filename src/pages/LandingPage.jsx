import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, ArrowRight, ShieldCheck, Zap, Award, Layers } from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-65px)] bg-dark-bg text-dark-text relative flex flex-col justify-between overflow-hidden">
      {/* Background Neon Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-primary/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] rounded-full bg-brand-secondary/5 blur-[150px] pointer-events-none"></div>

      {/* Hero Section */}
      <div className="mx-auto max-w-5xl px-6 pt-16 pb-20 text-center relative z-10 flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center space-x-2 bg-dark-hover/80 border border-dark-border px-3.5 py-1.5 rounded-full text-xs font-semibold text-brand-primary mb-6 animate-fade-in">
          <Award className="h-4 w-4" />
          <span>Elevate Your Coding Skills</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Master DSA with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-amber-400 to-brand-secondary">
            CodeSpaces
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-dark-muted max-w-2xl mx-auto leading-relaxed">
          Prepare for technical interviews. Solve algorithmic problems, compile code in real-time, test against hidden cases, and log submission metrics.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={user ? "/admin" : "/login"}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-brand-primary text-black px-8 py-3.5 font-bold hover:bg-brand-primary/95 transition-all shadow-lg shadow-brand-primary/10 active:scale-95 group hover:cursor-pointer"
          >
            <span>{user ? "Go to Admin Panel" : "Sign In to Admin"}</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20">
          <div className="bg-dark-card border border-dark-border/60 p-6 rounded-2xl text-left space-y-3 relative group hover:border-dark-border transition-colors">
            <div className="h-10 w-10 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base">Real-Time Compiler</h3>
            <p className="text-sm text-dark-muted leading-relaxed">
              Compile and run code instantly across multiple programming languages using Monaco Editor and Judge0.
            </p>
          </div>

          <div className="bg-dark-card border border-dark-border/60 p-6 rounded-2xl text-left space-y-3 relative group hover:border-dark-border transition-colors">
            <div className="h-10 w-10 rounded-lg bg-brand-secondary/10 border border-brand-secondary/20 flex items-center justify-center text-brand-secondary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base">Automated Grading</h3>
            <p className="text-sm text-dark-muted leading-relaxed">
              Verify solution accuracy against hidden test cases. Check compile-time errors, running speeds, and final verdicts.
            </p>
          </div>

          <div className="bg-dark-card border border-dark-border/60 p-6 rounded-2xl text-left space-y-3 relative group hover:border-dark-border transition-colors">
            <div className="h-10 w-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base">Admin Controls</h3>
            <p className="text-sm text-dark-muted leading-relaxed">
              Add new coding challenges, create starter templates, customize test suites, and review platform statistics.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-dark-border bg-dark-bg/60 py-6 text-center text-xs text-dark-muted relative z-10 shrink-0">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} CodeSpaces DSA Platform. All rights reserved.</span>
          <div className="flex space-x-4">
            <Link to="/admin" className="hover:text-white transition-colors">Admin Panel</Link>
            <span className="text-dark-border">|</span>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
