import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as api from '../services/api';
import {
  Save, Plus, Trash2, ArrowLeft, Calendar, FileCode,
  CheckCircle, AlertCircle, Eye, EyeOff, Lock, Pencil,
} from 'lucide-react';

/* ── helpers ─────────────────────────────────────────── */
const emptyExample  = () => ({ input: '', output: '', explanation: '' });
const emptyTestCase = () => ({ input: '', expectedOutput: '', isHidden: false });

const STARTER_CPP    = `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write code here\n    return 0;\n}`;
const STARTER_C      = `#include <stdio.h>\n\nint main() {\n    // Write code here\n    return 0;\n}`;
const STARTER_PYTHON = `import sys\ninput = sys.stdin.readline\n\ndef main():\n    # Write code here\n    pass\n\nif __name__ == '__main__':\n    main()`;
const STARTER_JAVA   = `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // Write code here\n    }\n}`;

/** Convert ISO date string → datetime-local input value */
const toDateTimeLocal = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/* ── shared styles ───────────────────────────────────── */
const inputCls    = 'w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-white placeholder-dark-muted focus:outline-none focus:border-brand-primary transition-colors';
const inputSm     = 'w-full bg-dark-bg border border-dark-border rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-primary text-xs transition-colors';
const textareaCls = 'w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-white placeholder-dark-muted focus:outline-none focus:border-brand-primary resize-none transition-colors';
const textareaSm  = 'w-full bg-dark-card border border-dark-border/70 rounded-lg p-2.5 font-mono text-white focus:outline-none focus:border-brand-primary resize-none text-xs transition-colors';
const labelCls    = 'text-[10px] text-dark-muted uppercase font-bold tracking-wider block mb-1';

/* ═══════════════════════════════════════════════════════ */
const EditContest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pageLoading, setPageLoading] = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [contestStatus, setContestStatus] = useState('Upcoming');

  /* Contest form fields */
  const [name,             setName]             = useState('');
  const [description,      setDescription]      = useState('');
  const [startTime,        setStartTime]        = useState('');
  const [endTime,          setEndTime]          = useState('');
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [problemsList,     setProblemsList]     = useState([]);

  /* Custom problems already saved in DB for this contest */
  const [existingCustomProblems, setExistingCustomProblems] = useState([]);

  /* New custom problems to be created on save */
  const [newCustomProblems, setNewCustomProblems] = useState([]);

  /* ── modal state ─────────────────────────────────────── */
  const [showModal, setShowModal] = useState(false);
  const [modalTab,  setModalTab]  = useState('general');
  const [starterLang, setStarterLang] = useState('cpp');

  /* Custom problem form */
  const [cpName,                setCpName]                = useState('');
  const [cpDifficulty,          setCpDifficulty]          = useState('Easy');
  const [cpCategory,            setCpCategory]            = useState('Arrays');
  const [cpStatement,           setCpStatement]           = useState('');
  const [cpConstraints,         setCpConstraints]         = useState('');
  const [cpExamples,            setCpExamples]            = useState([emptyExample()]);
  const [cpTestCases,           setCpTestCases]           = useState([emptyTestCase(), emptyTestCase(), emptyTestCase()]);
  const [cpHints,               setCpHints]               = useState(['']);
  const [cpSolutionExplanation, setCpSolutionExplanation] = useState('');
  const [cpSolutionCode,        setCpSolutionCode]        = useState('');
  const [cpStarterCpp,          setCpStarterCpp]          = useState(STARTER_CPP);
  const [cpStarterC,            setCpStarterC]            = useState(STARTER_C);
  const [cpStarterPython,       setCpStarterPython]       = useState(STARTER_PYTHON);
  const [cpStarterJava,         setCpStarterJava]         = useState(STARTER_JAVA);

  /* ── on mount: fetch contest + all problems ──────────── */
  useEffect(() => {
    const init = async () => {
      try {
        const [contestData, allProblems] = await Promise.all([
          api.getContestById(id),
          api.getProblems(),
        ]);

        setContestStatus(contestData.status);
        setName(contestData.name || '');
        setDescription(contestData.description || '');
        setStartTime(toDateTimeLocal(contestData.startTime));
        setEndTime(toDateTimeLocal(contestData.endTime));

        // Separate existing problems into: regular (selectable) vs custom-only
        const existingCustom = (contestData.problems || []).filter(p => p.isContestOnly);
        const selectedRegularIds = (contestData.problems || [])
          .filter(p => !p.isContestOnly)
          .map(p => p._id);

        setExistingCustomProblems(existingCustom);
        setSelectedProblems(selectedRegularIds);
        setProblemsList(allProblems.filter(p => !p.isContestOnly));
      } catch (err) {
        setError('Failed to load contest: ' + (err.message || 'Unknown error'));
      } finally {
        setPageLoading(false);
      }
    };
    init();
  }, [id]);

  /* ── problem selector ───────────────────────────────── */
  const handleToggleProblem = (pid) => {
    setSelectedProblems(prev =>
      prev.includes(pid) ? prev.filter(p => p !== pid) : [...prev, pid]
    );
  };

  /* ── examples helpers ───────────────────────────────── */
  const updateExample = (idx, field, val) =>
    setCpExamples(cpExamples.map((ex, i) => i === idx ? { ...ex, [field]: val } : ex));
  const addExample    = () => setCpExamples([...cpExamples, emptyExample()]);
  const removeExample = (idx) => {
    if (cpExamples.length === 1) return;
    setCpExamples(cpExamples.filter((_, i) => i !== idx));
  };

  /* ── test case helpers ───────────────────────────────── */
  const updateTestCase = (idx, field, val) =>
    setCpTestCases(cpTestCases.map((tc, i) => i === idx ? { ...tc, [field]: val } : tc));
  const addTestCase    = () => setCpTestCases([...cpTestCases, emptyTestCase()]);
  const removeTestCase = (idx) => {
    if (cpTestCases.length === 1) return;
    setCpTestCases(cpTestCases.filter((_, i) => i !== idx));
  };
  const toggleHidden   = (idx) => updateTestCase(idx, 'isHidden', !cpTestCases[idx].isHidden);

  /* ── hint helpers ───────────────────────────────────── */
  const updateHint = (idx, val) => setCpHints(cpHints.map((h, i) => i === idx ? val : h));
  const addHint    = () => setCpHints([...cpHints, '']);
  const removeHint = (idx) => {
    if (cpHints.length === 1) return;
    setCpHints(cpHints.filter((_, i) => i !== idx));
  };

  /* ── add custom problem to "pending" list ────────────── */
  const handleAddCustomProblem = (e) => {
    e.preventDefault();
    if (!cpName.trim() || !cpStatement.trim() || !cpCategory.trim()) {
      alert('Please fill Name, Category, and Problem Statement in the General tab.');
      return;
    }
    const validTestCases = cpTestCases.filter(tc => tc.input.trim() !== '' && tc.expectedOutput.trim() !== '');
    if (validTestCases.length === 0) {
      alert('At least one test case with Input and Expected Output is required.');
      setModalTab('tests');
      return;
    }

    setNewCustomProblems([...newCustomProblems, {
      name: cpName.trim(), difficulty: cpDifficulty, category: cpCategory.trim(),
      statement: cpStatement.trim(), constraints: cpConstraints.trim(),
      examples: cpExamples.filter(ex => ex.input.trim() !== ''),
      testCases: validTestCases,
      hints: cpHints.filter(h => h.trim() !== ''),
      solution: { explanation: cpSolutionExplanation, code: cpSolutionCode },
      starterCode: { cpp: cpStarterCpp, c: cpStarterC, python: cpStarterPython, java: cpStarterJava },
    }]);
    resetModal();
    setShowModal(false);
  };

  const resetModal = () => {
    setCpName(''); setCpDifficulty('Easy'); setCpCategory('Arrays');
    setCpStatement(''); setCpConstraints('');
    setCpExamples([emptyExample()]);
    setCpTestCases([emptyTestCase(), emptyTestCase(), emptyTestCase()]);
    setCpHints(['']); setCpSolutionExplanation(''); setCpSolutionCode('');
    setCpStarterCpp(STARTER_CPP); setCpStarterC(STARTER_C);
    setCpStarterPython(STARTER_PYTHON); setCpStarterJava(STARTER_JAVA);
    setModalTab('general'); setStarterLang('cpp');
  };

  /* ── save contest ────────────────────────────────────── */
  const handleSave = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!name || !startTime || !endTime)
      return setError('Name, Start Time, and End Time are required.');
    if (new Date(startTime) >= new Date(endTime))
      return setError('Start Time must be before End Time.');

    setSaving(true);
    try {
      // Collect all problem IDs: selected regular + existing custom
      const allProblemIds = [
        ...selectedProblems,
        ...existingCustomProblems.map(p => p._id),
      ];

      // 1. Update contest metadata + problems list
      await api.updateContest(id, {
        name, description, startTime, endTime,
        problems: allProblemIds,
      });

      // 2. Create any new custom problems and add them
      for (const cp of newCustomProblems) {
        await api.createContestProblem(id, cp);
      }

      setSuccess('Contest updated successfully!');
      setNewCustomProblems([]);

      // Refresh contest data
      const refreshed = await api.getContestById(id);
      const existingCustom = (refreshed.problems || []).filter(p => p.isContestOnly);
      setExistingCustomProblems(existingCustom);
      setSelectedProblems(
        (refreshed.problems || []).filter(p => !p.isContestOnly).map(p => p._id)
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update contest');
    } finally {
      setSaving(false);
    }
  };

  /* ── page loading ────────────────────────────────────── */
  if (pageLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-bg text-brand-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
        <span className="ml-3 font-semibold">Loading Contest...</span>
      </div>
    );
  }

  const isOngoing = contestStatus === 'Ongoing';

  return (
    <>
      <div className="animate-fade-in max-w-7xl mx-auto p-8 space-y-6 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-border/40 pb-5">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('/admin/contests')}
              className="bg-dark-card hover:bg-dark-hover border border-dark-border p-2 rounded-xl text-dark-muted hover:text-white transition-all hover:cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-3xl font-extrabold text-white">Edit Contest</h1>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${
                  isOngoing ? 'text-brand-secondary bg-brand-secondary/10 border-brand-secondary/20' :
                  contestStatus === 'Upcoming' ? 'text-brand-primary bg-brand-primary/10 border-brand-primary/20' :
                  'text-dark-muted bg-dark-hover border-dark-border'
                }`}>{contestStatus}</span>
              </div>
              <p className="text-sm text-dark-muted mt-1">
                {isOngoing
                  ? 'Contest is live — editing is disabled during an ongoing contest.'
                  : 'Modify contest details and problem set below.'}
              </p>
            </div>
          </div>
        </div>

        {/* Ongoing warning */}
        {isOngoing && (
          <div className="flex items-center space-x-3 bg-brand-danger/10 border border-brand-danger/30 text-brand-danger p-4 rounded-xl text-sm font-semibold">
            <Lock className="h-5 w-5 shrink-0" />
            <span>This contest is currently ongoing. You cannot edit it until it finishes.</span>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 bg-brand-danger/10 border border-brand-danger/25 text-brand-danger p-4 rounded-xl text-sm font-semibold">
            <AlertCircle className="h-5 w-5 shrink-0" /><span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center space-x-2 bg-brand-secondary/10 border border-brand-secondary/25 text-brand-secondary p-4 rounded-xl text-sm font-semibold">
            <CheckCircle className="h-5 w-5 shrink-0" /><span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <fieldset disabled={isOngoing} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Contest info + custom problems */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contest Metadata */}
                <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-dark-border/40 pb-3 flex items-center space-x-2">
                    <Calendar className="h-4.5 w-4.5 text-brand-primary" />
                    <span>Contest Details</span>
                  </h3>

                  <div className="space-y-1.5">
                    <label className="text-xs text-dark-muted font-bold uppercase tracking-wider block">Contest Title</label>
                    <input type="text" required placeholder="Contest title"
                      value={name} onChange={e => setName(e.target.value)} className={inputCls} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-dark-muted font-bold uppercase tracking-wider block">Description</label>
                    <textarea placeholder="Contest description, rules, scoring..."
                      value={description} onChange={e => setDescription(e.target.value)}
                      rows={4} className={textareaCls} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs text-dark-muted font-bold uppercase tracking-wider block">Start Date &amp; Time</label>
                      <input type="datetime-local" required value={startTime}
                        onChange={e => setStartTime(e.target.value)} className={inputCls} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-dark-muted font-bold uppercase tracking-wider block">End Date &amp; Time</label>
                      <input type="datetime-local" required value={endTime}
                        onChange={e => setEndTime(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* Existing custom-only problems (read-only display) */}
                {existingCustomProblems.length > 0 && (
                  <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-dark-border/40 pb-3">
                      Saved Custom Problems ({existingCustomProblems.length})
                    </h3>
                    <p className="text-[10px] text-dark-muted -mt-2">These are already stored in the database for this contest.</p>
                    <div className="space-y-2">
                      {existingCustomProblems.map((p) => (
                        <div key={p._id}
                          className="flex items-center justify-between bg-dark-bg/60 border border-dark-border p-3 rounded-xl text-xs">
                          <div className="space-y-0.5">
                            <span className="font-bold text-white block">{p.name}</span>
                            <span className="text-[10px] text-dark-muted">
                              {p.category} · {p.difficulty} · {(p.testCases || []).length} test case(s)
                            </span>
                          </div>
                          <span className="text-[9px] font-bold text-brand-secondary bg-brand-secondary/10 px-2 py-0.5 rounded border border-brand-secondary/25">
                            Contest-Only
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New custom problems (to be created on save) */}
                <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-dark-border/40 pb-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      Add New Custom Problems ({newCustomProblems.length})
                    </h3>
                    <button type="button" onClick={() => setShowModal(true)}
                      className="flex items-center space-x-1 text-xs font-semibold text-brand-secondary hover:underline bg-transparent border-0 hover:cursor-pointer">
                      <Plus className="h-4 w-4" /><span>Create Custom Problem</span>
                    </button>
                  </div>
                  {newCustomProblems.length === 0
                    ? <p className="text-xs text-dark-muted italic">No new custom problems added yet.</p>
                    : (
                      <div className="space-y-2">
                        {newCustomProblems.map((cp, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-dark-bg border border-dark-border p-3 rounded-xl text-xs">
                            <div className="space-y-0.5">
                              <span className="font-bold text-white block">{cp.name}</span>
                              <span className="text-[10px] text-dark-muted">
                                {cp.category} · {cp.difficulty} · {cp.testCases.length} test case(s)
                              </span>
                            </div>
                            <button type="button" onClick={() => setNewCustomProblems(newCustomProblems.filter((_, i) => i !== idx))}
                              className="text-brand-danger bg-transparent border-0 hover:cursor-pointer">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>

              {/* Right: Select existing problems */}
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6 flex flex-col h-[560px]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-dark-border/40 pb-3 flex items-center space-x-2 shrink-0">
                  <FileCode className="h-4.5 w-4.5 text-brand-primary" />
                  <span>Problems ({selectedProblems.length} selected)</span>
                </h3>
                <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-1">
                  {problemsList.map(prob => {
                    const isSelected = selectedProblems.includes(prob._id);
                    return (
                      <div key={prob._id} onClick={() => handleToggleProblem(prob._id)}
                        className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer text-xs transition-all select-none ${
                          isSelected
                            ? 'bg-brand-primary/10 border-brand-primary text-white font-semibold'
                            : 'bg-dark-bg border-dark-border/70 text-dark-text hover:bg-dark-hover'
                        }`}>
                        <div className="space-y-0.5 max-w-[170px]">
                          <span className="block font-bold truncate">{prob.name}</span>
                          <span className="text-[10px] text-dark-muted">{prob.category}</span>
                        </div>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                          prob.difficulty === 'Easy'   ? 'border-brand-secondary/35 text-brand-secondary bg-brand-secondary/5' :
                          prob.difficulty === 'Medium' ? 'border-brand-primary/35 text-brand-primary bg-brand-primary/5' :
                                                         'border-brand-danger/35 text-brand-danger bg-brand-danger/5'
                        }`}>{prob.difficulty}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-end space-x-4 border-t border-dark-border/40 pt-6">
              <button type="button" onClick={() => navigate('/admin/contests')}
                className="bg-dark-bg hover:bg-dark-hover border border-dark-border text-dark-text px-6 py-3 rounded-xl text-sm font-semibold hover:text-white transition-all hover:cursor-pointer">
                Cancel
              </button>
              {!isOngoing && (
                <button type="submit" disabled={saving}
                  className="bg-brand-primary hover:bg-brand-primary/95 text-black px-8 py-3 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all hover:cursor-pointer shadow-md shadow-brand-primary/10 active:scale-95">
                  {saving
                    ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    : <><Save className="h-4 w-4" /><span>Save Changes</span></>}
                </button>
              )}
            </div>
          </fieldset>
        </form>
      </div>

      {/* ═══════════════════════════════════════════════════════
          CUSTOM PROBLEM MODAL
          ═══════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-3xl flex flex-col h-[640px] shadow-2xl animate-fade-in text-xs text-dark-text">

            {/* Modal Header */}
            <div className="p-4 border-b border-dark-border flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white">Add Custom Problem</h3>
                <p className="text-[10px] text-dark-muted mt-0.5">Will be saved as a contest-only problem on Save Changes</p>
              </div>
              <button type="button" onClick={() => { resetModal(); setShowModal(false); }}
                className="text-dark-muted hover:text-white bg-transparent border-0 hover:cursor-pointer leading-none text-base">&times;</button>
            </div>

            {/* Modal Tabs */}
            <div className="px-4 py-2 bg-dark-bg/40 border-b border-dark-border shrink-0 flex space-x-4">
              {[
                { key: 'general', label: 'General' },
                { key: 'tests',   label: 'Examples & Tests' },
                { key: 'hints',   label: 'Hints & Solution' },
                { key: 'starter', label: 'Starter Codes' },
              ].map(t => (
                <button key={t.key} type="button" onClick={() => setModalTab(t.key)}
                  className={`pb-1.5 font-bold border-b-2 border-0 hover:cursor-pointer transition-all ${
                    modalTab === t.key ? 'border-brand-primary text-brand-primary' : 'border-transparent text-dark-muted hover:text-white'
                  }`}>{t.label}</button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* GENERAL */}
              {modalTab === 'general' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Problem Name *</label>
                      <input type="text" placeholder="e.g. Matrix Sum" value={cpName} onChange={e => setCpName(e.target.value)} className={inputSm} />
                    </div>
                    <div>
                      <label className={labelCls}>Category *</label>
                      <input type="text" placeholder="e.g. Graphs" value={cpCategory} onChange={e => setCpCategory(e.target.value)} className={inputSm} />
                    </div>
                    <div>
                      <label className={labelCls}>Difficulty</label>
                      <select value={cpDifficulty} onChange={e => setCpDifficulty(e.target.value)} className={inputSm}>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Problem Statement *</label>
                    <textarea rows={6} placeholder="Describe the problem..."
                      value={cpStatement} onChange={e => setCpStatement(e.target.value)} className={textareaSm} />
                  </div>
                  <div>
                    <label className={labelCls}>Constraints</label>
                    <textarea rows={3} placeholder="1 ≤ n ≤ 10^5"
                      value={cpConstraints} onChange={e => setCpConstraints(e.target.value)} className={textareaSm} />
                  </div>
                </div>
              )}

              {/* EXAMPLES & TESTS */}
              {modalTab === 'tests' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Examples */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px] uppercase tracking-wider">Sample Examples ({cpExamples.length})</span>
                      <button type="button" onClick={addExample}
                        className="flex items-center space-x-1 text-[10px] font-semibold text-brand-secondary hover:underline bg-transparent border-0 hover:cursor-pointer">
                        <Plus className="h-3.5 w-3.5" /><span>Add</span>
                      </button>
                    </div>
                    {cpExamples.map((ex, idx) => (
                      <div key={idx} className="bg-dark-bg/60 border border-dark-border p-4 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-[11px]">Example {idx + 1}</span>
                          {cpExamples.length > 1 && (
                            <button type="button" onClick={() => removeExample(idx)}
                              className="text-brand-danger bg-transparent border-0 hover:cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}>Input</label>
                            <textarea rows={3} placeholder="Example input" value={ex.input}
                              onChange={e => updateExample(idx, 'input', e.target.value)} className={textareaSm} />
                          </div>
                          <div>
                            <label className={labelCls}>Output</label>
                            <textarea rows={3} placeholder="Expected output" value={ex.output}
                              onChange={e => updateExample(idx, 'output', e.target.value)} className={textareaSm} />
                          </div>
                        </div>
                        <div>
                          <label className={labelCls}>Explanation (optional)</label>
                          <textarea rows={2} placeholder="Brief explanation..." value={ex.explanation}
                            onChange={e => updateExample(idx, 'explanation', e.target.value)} className={textareaSm} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-dark-border/40" />

                  {/* Test Cases */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px] uppercase tracking-wider">
                        Automated Test Cases ({cpTestCases.length})
                      </span>
                      <button type="button" onClick={addTestCase}
                        className="flex items-center space-x-1 text-[10px] font-semibold text-brand-secondary hover:underline bg-transparent border-0 hover:cursor-pointer">
                        <Plus className="h-3.5 w-3.5" /><span>Add Test Case</span>
                      </button>
                    </div>
                    {cpTestCases.map((tc, idx) => (
                      <div key={idx} className={`border p-4 rounded-xl space-y-3 transition-colors ${
                        tc.isHidden ? 'bg-brand-danger/5 border-brand-danger/25' : 'bg-dark-bg/60 border-dark-border'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-[11px]">TC {idx + 1}</span>
                            <button type="button" onClick={() => toggleHidden(idx)}
                              className={`flex items-center space-x-1 text-[9px] font-bold px-2 py-0.5 rounded border transition-all hover:cursor-pointer ${
                                tc.isHidden ? 'bg-brand-danger/10 border-brand-danger/30 text-brand-danger'
                                            : 'bg-dark-hover border-dark-border text-dark-muted hover:text-white'
                              }`}>
                              {tc.isHidden ? <><EyeOff className="h-3 w-3" /><span>Hidden</span></> : <><Eye className="h-3 w-3" /><span>Visible</span></>}
                            </button>
                          </div>
                          {cpTestCases.length > 1 && (
                            <button type="button" onClick={() => removeTestCase(idx)}
                              className="text-brand-danger bg-transparent border-0 hover:cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}>Stdin Input *</label>
                            <textarea rows={4} placeholder="Stdin input..." value={tc.input}
                              onChange={e => updateTestCase(idx, 'input', e.target.value)} className={textareaSm} />
                          </div>
                          <div>
                            <label className={labelCls}>Expected Output *</label>
                            <textarea rows={4} placeholder="Expected stdout..." value={tc.expectedOutput}
                              onChange={e => updateTestCase(idx, 'expectedOutput', e.target.value)} className={textareaSm} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HINTS & SOLUTION */}
              {modalTab === 'hints' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px] uppercase tracking-wider">Hints</span>
                      <button type="button" onClick={addHint}
                        className="flex items-center space-x-1 text-[10px] font-semibold text-brand-secondary hover:underline bg-transparent border-0 hover:cursor-pointer">
                        <Plus className="h-3.5 w-3.5" /><span>Add Hint</span>
                      </button>
                    </div>
                    {cpHints.map((hint, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <div className="flex-1">
                          <label className={labelCls}>Hint {idx + 1}</label>
                          <textarea rows={2} placeholder={`Hint ${idx + 1}...`}
                            value={hint} onChange={e => updateHint(idx, e.target.value)} className={textareaSm} />
                        </div>
                        {cpHints.length > 1 && (
                          <button type="button" onClick={() => removeHint(idx)}
                            className="text-brand-danger bg-transparent border-0 hover:cursor-pointer mt-5">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3 border-t border-dark-border/40 pt-4">
                    <span className="font-bold text-white text-[11px] uppercase tracking-wider block">Editorial / Solution</span>
                    <div>
                      <label className={labelCls}>Solution Explanation</label>
                      <textarea rows={4} placeholder="Approach, complexity..."
                        value={cpSolutionExplanation} onChange={e => setCpSolutionExplanation(e.target.value)} className={textareaSm} />
                    </div>
                    <div>
                      <label className={labelCls}>Solution Code</label>
                      <textarea rows={6} placeholder="Reference solution..."
                        value={cpSolutionCode} onChange={e => setCpSolutionCode(e.target.value)} className={textareaSm} />
                    </div>
                  </div>
                </div>
              )}

              {/* STARTER CODES */}
              {modalTab === 'starter' && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-[10px] text-dark-muted">Starter templates shown to users in the editor for each language.</p>
                  <div className="flex space-x-1 bg-dark-bg rounded-xl p-1 border border-dark-border">
                    {[
                      { key: 'cpp',        label: 'C++',        color: 'text-blue-400' },
                      { key: 'c',          label: 'C',          color: 'text-amber-400' },
                      { key: 'python',     label: 'Python',     color: 'text-green-400' },
                      { key: 'java',       label: 'Java',       color: 'text-orange-400' },
                    ].map(lang => (
                      <button key={lang.key} type="button" onClick={() => setStarterLang(lang.key)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all hover:cursor-pointer ${
                          starterLang === lang.key ? `bg-dark-card border border-dark-border shadow ${lang.color}` : 'text-dark-muted hover:text-white'
                        }`}>{lang.label}</button>
                    ))}
                  </div>
                  {starterLang === 'cpp' && (
                    <div>
                      <label className={`${labelCls} text-blue-400`}>C++ Template</label>
                      <textarea rows={14} value={cpStarterCpp} onChange={e => setCpStarterCpp(e.target.value)} className={textareaSm} />
                    </div>
                  )}
                  {starterLang === 'c' && (
                    <div>
                      <label className={`${labelCls} text-amber-400`}>C Template</label>
                      <textarea rows={14} value={cpStarterC} onChange={e => setCpStarterC(e.target.value)} className={textareaSm} />
                    </div>
                  )}
                  {starterLang === 'python' && (
                    <div>
                      <label className={`${labelCls} text-green-400`}>Python Template</label>
                      <textarea rows={14} value={cpStarterPython} onChange={e => setCpStarterPython(e.target.value)} className={textareaSm} />
                    </div>
                  )}
                  {starterLang === 'java' && (
                    <div>
                      <label className={`${labelCls} text-orange-400`}>Java Template</label>
                      <textarea rows={14} value={cpStarterJava} onChange={e => setCpStarterJava(e.target.value)} className={textareaSm} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-dark-border flex items-center justify-between shrink-0">
              <span className="text-[10px] text-dark-muted">
                {cpTestCases.filter(tc => tc.input.trim()).length}/{cpTestCases.length} filled
                &nbsp;·&nbsp;{cpTestCases.filter(tc => tc.isHidden).length} hidden
              </span>
              <div className="flex items-center space-x-3">
                <button type="button" onClick={() => { resetModal(); setShowModal(false); }}
                  className="bg-dark-bg hover:bg-dark-hover border border-dark-border text-dark-text px-4 py-2 rounded-xl text-xs font-semibold hover:text-white transition-all hover:cursor-pointer">
                  Discard
                </button>
                <button type="button" onClick={handleAddCustomProblem}
                  className="bg-brand-primary text-black px-6 py-2 rounded-xl text-xs font-bold hover:bg-brand-primary/95 transition-all shadow-md active:scale-95 hover:cursor-pointer flex items-center space-x-1.5">
                  <CheckCircle className="h-3.5 w-3.5" /><span>Add to Contest</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditContest;
