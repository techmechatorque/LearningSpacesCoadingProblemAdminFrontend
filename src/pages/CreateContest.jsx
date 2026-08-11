import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import {
  Save, Plus, Trash2, ArrowLeft, Calendar, FileCode,
  CheckCircle, Award, AlertCircle, Eye, EyeOff, ChevronDown, ChevronUp,
} from 'lucide-react';

/* ── helpers ─────────────────────────────────────────── */
const emptyExample  = () => ({ input: '', output: '', explanation: '' });
const emptyTestCase = () => ({ input: '', expectedOutput: '', isHidden: false });

const STARTER_CPP    = `#include <iostream>
using namespace std;

int main() {
    // Write code here
    return 0;
}`;

const STARTER_C      = `#include <stdio.h>

int main() {
    // Write code here
    return 0;
}`;

const STARTER_PYTHON = `import sys
input = sys.stdin.readline

def main():
    # Write code here
    pass

if __name__ == '__main__':
    main()`;

const STARTER_JAVA   = `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // Write code here
    }
}`;

/* ── component ───────────────────────────────────────── */
const CreateContest = () => {
  const navigate = useNavigate();
  const [loading,         setLoading]         = useState(false);
  const [fetchingProblems,setFetchingProblems] = useState(true);
  const [error,           setError]           = useState('');

  /* Contest form */
  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [startTime,   setStartTime]   = useState('');
  const [endTime,     setEndTime]     = useState('');
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [problemsList,     setProblemsList]     = useState([]);
  const [customProblems,   setCustomProblems]   = useState([]);

  /* Modal state */
  const [showModal, setShowModal] = useState(false);
  const [modalTab,  setModalTab]  = useState('general'); // general | tests | starter

  /* Custom problem fields */
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
  // Track which starter language tab is visible in the modal
  const [starterLang, setStarterLang] = useState('cpp');

  /* Fetch existing problems on mount */
  useEffect(() => {
    api.getProblems()
      .then(data => setProblemsList(data))
      .catch(err => setError('Failed to fetch problems list: ' + err.message))
      .finally(() => setFetchingProblems(false));
  }, []);

  /* ── helpers: examples ───────────────────────────────── */
  const updateExample = (idx, field, value) => {
    const updated = cpExamples.map((ex, i) => i === idx ? { ...ex, [field]: value } : ex);
    setCpExamples(updated);
  };
  const addExample    = () => setCpExamples([...cpExamples, emptyExample()]);
  const removeExample = (idx) => {
    if (cpExamples.length === 1) return;
    setCpExamples(cpExamples.filter((_, i) => i !== idx));
  };

  /* ── helpers: test cases ─────────────────────────────── */
  const updateTestCase = (idx, field, value) => {
    const updated = cpTestCases.map((tc, i) => i === idx ? { ...tc, [field]: value } : tc);
    setCpTestCases(updated);
  };
  const addTestCase    = () => setCpTestCases([...cpTestCases, emptyTestCase()]);
  const removeTestCase = (idx) => {
    if (cpTestCases.length === 1) return;
    setCpTestCases(cpTestCases.filter((_, i) => i !== idx));
  };
  const toggleHidden = (idx) => {
    updateTestCase(idx, 'isHidden', !cpTestCases[idx].isHidden);
  };

  /* ── helpers: hints ─────────────────────────────────── */
  const updateHint = (idx, value) =>
    setCpHints(cpHints.map((h, i) => i === idx ? value : h));
  const addHint    = () => setCpHints([...cpHints, '']);
  const removeHint = (idx) => {
    if (cpHints.length === 1) return;
    setCpHints(cpHints.filter((_, i) => i !== idx));
  };

  /* ── existing problem selector ───────────────────────── */
  const handleSelectProblem = (id) => {
    setSelectedProblems(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  /* ── custom problem save ─────────────────────────────── */
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

    const payload = {
      name:        cpName.trim(),
      difficulty:  cpDifficulty,
      category:    cpCategory.trim(),
      statement:   cpStatement.trim(),
      constraints: cpConstraints.trim(),
      examples:    cpExamples.filter(ex => ex.input.trim() !== ''),
      testCases:   validTestCases,
      hints:       cpHints.filter(h => h.trim() !== ''),
      solution:    { explanation: cpSolutionExplanation, code: cpSolutionCode },
      starterCode: {
        cpp:        cpStarterCpp,
        c:          cpStarterC,
        python:     cpStarterPython,
        java:       cpStarterJava,
      },
    };

    setCustomProblems([...customProblems, payload]);
    resetModalForm();
    setShowModal(false);
  };

  const resetModalForm = () => {
    setCpName(''); setCpDifficulty('Easy'); setCpCategory('Arrays');
    setCpStatement(''); setCpConstraints('');
    setCpExamples([emptyExample()]);
    setCpTestCases([emptyTestCase(), emptyTestCase(), emptyTestCase()]);
    setCpHints(['']);
    setCpSolutionExplanation(''); setCpSolutionCode('');
    setCpStarterCpp(STARTER_CPP); setCpStarterC(STARTER_C);
    setCpStarterPython(STARTER_PYTHON); setCpStarterJava(STARTER_JAVA);
    setModalTab('general'); setStarterLang('cpp');
  };

  const handleRemoveCustomProblem = (idx) =>
    setCustomProblems(customProblems.filter((_, i) => i !== idx));

  /* ── contest submit ──────────────────────────────────── */
  const handleCreateContestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !startTime || !endTime)
      return setError('Name, Start Time, and End Time are required.');
    if (new Date(startTime) >= new Date(endTime))
      return setError('Start Time must be strictly before End Time.');

    setLoading(true);
    try {
      const created = await api.createContest({ name, description, startTime, endTime, problems: selectedProblems });
      for (const cp of customProblems) await api.createContestProblem(created._id, cp);
      navigate('/admin/contests');
    } catch (err) {
      setError(err.message || 'Failed to create contest');
      setLoading(false);
    }
  };

  /* ── shared input styles ─────────────────────────────── */
  const inputCls  = 'w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-white placeholder-dark-muted focus:outline-none focus:border-brand-primary transition-colors';
  const inputSm   = 'w-full bg-dark-bg border border-dark-border rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-primary text-xs transition-colors';
  const textareaCls = 'w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-white placeholder-dark-muted focus:outline-none focus:border-brand-primary resize-none font-mono transition-colors';
  const textareaSm  = 'w-full bg-dark-card border border-dark-border/70 rounded-lg p-2.5 font-mono text-white focus:outline-none focus:border-brand-primary resize-none text-xs transition-colors';
  const labelCls  = 'text-[10px] text-dark-muted uppercase font-bold tracking-wider block mb-1';

  /* ─────────────────────────────────────────────────────── */
  return (
    <>
      <div className="animate-fade-in max-w-7xl mx-auto p-8 space-y-6 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-border/40 pb-5">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/admin/contests')}
              className="bg-dark-card hover:bg-dark-hover border border-dark-border p-2 rounded-xl text-dark-muted hover:text-white transition-all hover:cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-white">Create Contest</h1>
              <p className="text-sm text-dark-muted mt-1">Configure timed competitions and assign practice problems</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-2 bg-brand-danger/10 border border-brand-danger/25 text-brand-danger p-4 rounded-xl text-sm font-semibold">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCreateContestSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Contest info + custom problems */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contest Metadata */}
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-dark-border/40 pb-3 flex items-center space-x-2">
                  <Calendar className="h-4.5 w-4.5 text-brand-primary" />
                  <span>Contest Metadata</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs text-dark-muted font-bold uppercase tracking-wider block">Contest Title</label>
                  <input type="text" required placeholder="e.g. Algorithmic Sprint #1"
                    value={name} onChange={e => setName(e.target.value)} className={inputCls} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-dark-muted font-bold uppercase tracking-wider block">Description</label>
                  <textarea placeholder="Write contest details, rules, and scoring profiles..."
                    value={description} onChange={e => setDescription(e.target.value)}
                    rows={4} className={textareaCls.replace('font-mono','')} />
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

              {/* Custom contest-only problems */}
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-dark-border/40 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Custom Contest-Only Problems ({customProblems.length})
                  </h3>
                  <button type="button" onClick={() => setShowModal(true)}
                    className="flex items-center space-x-1 text-xs font-semibold text-brand-secondary hover:underline bg-transparent border-0 hover:cursor-pointer">
                    <Plus className="h-4 w-4" /><span>Create Custom Problem</span>
                  </button>
                </div>

                {customProblems.length === 0 ? (
                  <p className="text-xs text-dark-muted py-2 italic">No custom problems created for this contest yet.</p>
                ) : (
                  <div className="space-y-2">
                    {customProblems.map((cp, idx) => (
                      <div key={idx}
                        className="flex items-center justify-between bg-dark-bg border border-dark-border p-3 rounded-xl text-xs">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white block">{cp.name}</span>
                          <span className="text-[10px] text-dark-muted">
                            {cp.category} · {cp.difficulty} · {cp.testCases.length} test case{cp.testCases.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <button type="button" onClick={() => handleRemoveCustomProblem(idx)}
                          className="text-brand-danger hover:text-brand-danger/80 bg-transparent border-0 hover:cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Select existing problems */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 flex flex-col h-[520px]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-dark-border/40 pb-3 flex items-center space-x-2 shrink-0">
                <FileCode className="h-4.5 w-4.5 text-brand-primary" />
                <span>Select Existing Problems ({selectedProblems.length})</span>
              </h3>

              {fetchingProblems ? (
                <div className="flex-1 flex items-center justify-center text-brand-primary">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-1">
                  {problemsList.map(prob => {
                    const isSelected = selectedProblems.includes(prob._id);
                    return (
                      <div key={prob._id} onClick={() => handleSelectProblem(prob._id)}
                        className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer text-xs transition-all select-none ${
                          isSelected
                            ? 'bg-brand-primary/10 border-brand-primary text-white font-semibold'
                            : 'bg-dark-bg border-dark-border/70 text-dark-text hover:bg-dark-hover'
                        }`}>
                        <div className="space-y-0.5 max-w-[170px] truncate">
                          <span className="block font-bold">{prob.name}</span>
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
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end space-x-4 border-t border-dark-border/40 pt-6">
            <button type="button" onClick={() => navigate('/admin/contests')}
              className="bg-dark-bg hover:bg-dark-hover border border-dark-border text-dark-text px-6 py-3 rounded-xl text-sm font-semibold hover:text-white transition-all hover:cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="bg-brand-primary hover:bg-brand-primary/95 text-black px-8 py-3 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all hover:cursor-pointer shadow-md shadow-brand-primary/10 active:scale-95">
              {loading
                ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                : <><Save className="h-4 w-4" /><span>Save Contest</span></>}
            </button>
          </div>
        </form>
      </div>

      {/* ═══════════════════════════════════════════════════════
          CUSTOM PROBLEM MODAL
          ═══════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-3xl flex flex-col h-[640px] shadow-2xl relative animate-fade-in text-xs text-dark-text">

            {/* Modal Header */}
            <div className="p-4 border-b border-dark-border flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white">Create Custom Problem</h3>
                <p className="text-[10px] text-dark-muted mt-0.5">This problem will be exclusive to the contest</p>
              </div>
              <button type="button" onClick={() => { resetModalForm(); setShowModal(false); }}
                className="text-dark-muted hover:text-white text-base bg-transparent border-0 hover:cursor-pointer leading-none">
                &times;
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-4 py-2 bg-dark-bg/40 border-b border-dark-border shrink-0 flex space-x-4">
              {[
                { key: 'general', label: 'General' },
                { key: 'tests',   label: 'Examples & Test Cases' },
                { key: 'hints',   label: 'Hints & Solution' },
                { key: 'starter', label: 'Starter Codes' },
              ].map(t => (
                <button key={t.key} type="button" onClick={() => setModalTab(t.key)}
                  className={`pb-1.5 font-bold border-b-2 border-0 hover:cursor-pointer transition-all ${
                    modalTab === t.key ? 'border-brand-primary text-brand-primary' : 'border-transparent text-dark-muted hover:text-white'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* ── TAB: General ──────────────────────────────── */}
              {modalTab === 'general' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Problem Name *</label>
                      <input type="text" placeholder="e.g. Unique Path Sum"
                        value={cpName} onChange={e => setCpName(e.target.value)} className={inputSm} />
                    </div>
                    <div>
                      <label className={labelCls}>Category *</label>
                      <input type="text" placeholder="e.g. Dynamic Programming"
                        value={cpCategory} onChange={e => setCpCategory(e.target.value)} className={inputSm} />
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
                    <textarea rows={6} placeholder="Describe the problem, input/output format, edge cases..."
                      value={cpStatement} onChange={e => setCpStatement(e.target.value)}
                      className={textareaSm} />
                  </div>

                  <div>
                    <label className={labelCls}>Constraints</label>
                    <textarea rows={3} placeholder="e.g. 1 ≤ nums.length ≤ 10^5, -10^4 ≤ nums[i] ≤ 10^4"
                      value={cpConstraints} onChange={e => setCpConstraints(e.target.value)}
                      className={textareaSm} />
                  </div>
                </div>
              )}

              {/* ── TAB: Examples & Test Cases ────────────────── */}
              {modalTab === 'tests' && (
                <div className="space-y-6 animate-fade-in">

                  {/* Examples section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px] uppercase tracking-wider">
                        Sample Examples ({cpExamples.length})
                      </span>
                      <button type="button" onClick={addExample}
                        className="flex items-center space-x-1 text-[10px] font-semibold text-brand-secondary hover:underline bg-transparent border-0 hover:cursor-pointer">
                        <Plus className="h-3.5 w-3.5" /><span>Add Example</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-dark-muted -mt-1">Shown to users as visible examples in the problem statement.</p>

                    {cpExamples.map((ex, idx) => (
                      <div key={idx} className="bg-dark-bg/60 border border-dark-border p-4 rounded-xl space-y-3 relative">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-[11px]">Example {idx + 1}</span>
                          {cpExamples.length > 1 && (
                            <button type="button" onClick={() => removeExample(idx)}
                              className="text-brand-danger bg-transparent border-0 hover:cursor-pointer">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}>Input</label>
                            <textarea placeholder="e.g. nums = [2,7,11,15], target = 9" rows={3}
                              value={ex.input} onChange={e => updateExample(idx, 'input', e.target.value)}
                              className={textareaSm} />
                          </div>
                          <div>
                            <label className={labelCls}>Output</label>
                            <textarea placeholder="e.g. [0, 1]" rows={3}
                              value={ex.output} onChange={e => updateExample(idx, 'output', e.target.value)}
                              className={textareaSm} />
                          </div>
                        </div>
                        <div>
                          <label className={labelCls}>Explanation (optional)</label>
                          <textarea placeholder="Brief explanation of why the output is correct..." rows={2}
                            value={ex.explanation} onChange={e => updateExample(idx, 'explanation', e.target.value)}
                            className={textareaSm} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-dark-border/40" />

                  {/* Test Cases section */}
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
                    <p className="text-[10px] text-dark-muted -mt-1">Used for automated grading. Hidden cases are not shown to users.</p>

                    {cpTestCases.map((tc, idx) => (
                      <div key={idx}
                        className={`border p-4 rounded-xl space-y-3 relative transition-colors ${
                          tc.isHidden ? 'bg-brand-danger/5 border-brand-danger/25' : 'bg-dark-bg/60 border-dark-border'
                        }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-[11px]">Test Case {idx + 1}</span>
                            <button type="button" onClick={() => toggleHidden(idx)}
                              title={tc.isHidden ? 'Mark as visible' : 'Mark as hidden'}
                              className={`flex items-center space-x-1 text-[9px] font-bold px-2 py-0.5 rounded border transition-all hover:cursor-pointer ${
                                tc.isHidden
                                  ? 'bg-brand-danger/10 border-brand-danger/30 text-brand-danger'
                                  : 'bg-dark-hover border-dark-border text-dark-muted hover:text-white'
                              }`}>
                              {tc.isHidden
                                ? <><EyeOff className="h-3 w-3" /><span>Hidden</span></>
                                : <><Eye className="h-3 w-3" /><span>Visible</span></>}
                            </button>
                          </div>
                          {cpTestCases.length > 1 && (
                            <button type="button" onClick={() => removeTestCase(idx)}
                              className="text-brand-danger bg-transparent border-0 hover:cursor-pointer">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}>Stdin Input *</label>
                            <textarea placeholder={'e.g.\n4 9\n2 7 11 15'} rows={4}
                              value={tc.input} onChange={e => updateTestCase(idx, 'input', e.target.value)}
                              className={textareaSm} />
                          </div>
                          <div>
                            <label className={labelCls}>Expected Output *</label>
                            <textarea placeholder={'e.g.\n0 1'} rows={4}
                              value={tc.expectedOutput} onChange={e => updateTestCase(idx, 'expectedOutput', e.target.value)}
                              className={textareaSm} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TAB: Hints & Solution ─────────────────────── */}
              {modalTab === 'hints' && (
                <div className="space-y-5 animate-fade-in">
                  {/* Hints */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px] uppercase tracking-wider">Hints ({cpHints.length})</span>
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
                            value={hint} onChange={e => updateHint(idx, e.target.value)}
                            className={textareaSm} />
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

                  {/* Solution */}
                  <div className="space-y-3 border-t border-dark-border/40 pt-4">
                    <span className="font-bold text-white text-[11px] uppercase tracking-wider block">Editorial / Solution</span>
                    <div>
                      <label className={labelCls}>Solution Explanation</label>
                      <textarea rows={4} placeholder="Explain the approach, time & space complexity..."
                        value={cpSolutionExplanation} onChange={e => setCpSolutionExplanation(e.target.value)}
                        className={textareaSm} />
                    </div>
                    <div>
                      <label className={labelCls}>Solution Code (optional)</label>
                      <textarea rows={6} placeholder="Paste reference/editorial solution code..."
                        value={cpSolutionCode} onChange={e => setCpSolutionCode(e.target.value)}
                        className={textareaSm} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB: Starter Codes ────────────────────────── */}
              {modalTab === 'starter' && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-[10px] text-dark-muted">
                    Provide starter templates for each language. Users will see these pre-filled in the editor.
                  </p>

                  {/* Language sub-tabs */}
                  <div className="flex space-x-1 bg-dark-bg rounded-xl p-1 border border-dark-border">
                    {[
                      { key: 'cpp',        label: 'C++',        color: 'text-blue-400' },
                      { key: 'c',          label: 'C',          color: 'text-amber-400' },
                      { key: 'python',     label: 'Python',     color: 'text-green-400' },
                      { key: 'java',       label: 'Java',       color: 'text-orange-400' },
                    ].map(lang => (
                      <button key={lang.key} type="button" onClick={() => setStarterLang(lang.key)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all hover:cursor-pointer ${
                          starterLang === lang.key
                            ? `bg-dark-card border border-dark-border shadow ${lang.color}`
                            : 'text-dark-muted hover:text-white'
                        }`}>
                        {lang.label}
                      </button>
                    ))}
                  </div>

                  {/* C++ */}
                  {starterLang === 'cpp' && (
                    <div className="animate-fade-in">
                      <label className={`${labelCls} text-blue-400`}>C++ Starter Template</label>
                      <textarea rows={14} value={cpStarterCpp}
                        onChange={e => setCpStarterCpp(e.target.value)}
                        className={textareaSm + ' font-mono'} />
                    </div>
                  )}
                  {/* C */}
                  {starterLang === 'c' && (
                    <div className="animate-fade-in">
                      <label className={`${labelCls} text-amber-400`}>C Starter Template</label>
                      <textarea rows={14} value={cpStarterC}
                        onChange={e => setCpStarterC(e.target.value)}
                        className={textareaSm + ' font-mono'} />
                    </div>
                  )}
                  {/* Python */}
                  {starterLang === 'python' && (
                    <div className="animate-fade-in">
                      <label className={`${labelCls} text-green-400`}>Python Starter Template</label>
                      <textarea rows={14} value={cpStarterPython}
                        onChange={e => setCpStarterPython(e.target.value)}
                        className={textareaSm + ' font-mono'} />
                    </div>
                  )}
                  {/* Java */}
                  {starterLang === 'java' && (
                    <div className="animate-fade-in">
                      <label className={`${labelCls} text-orange-400`}>Java Starter Template</label>
                      <textarea rows={14} value={cpStarterJava}
                        onChange={e => setCpStarterJava(e.target.value)}
                        className={textareaSm + ' font-mono'} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-dark-border flex items-center justify-between shrink-0">
              <span className="text-[10px] text-dark-muted">
                {cpTestCases.filter(tc => tc.input.trim()).length} / {cpTestCases.length} test cases filled
                &nbsp;·&nbsp;
                {cpTestCases.filter(tc => tc.isHidden).length} hidden
              </span>
              <div className="flex items-center space-x-3">
                <button type="button" onClick={() => { resetModalForm(); setShowModal(false); }}
                  className="bg-dark-bg hover:bg-dark-hover border border-dark-border text-dark-text px-4 py-2 rounded-xl text-xs font-semibold hover:text-white transition-all hover:cursor-pointer">
                  Discard
                </button>
                <button type="button" onClick={handleAddCustomProblem}
                  className="bg-brand-primary text-black px-6 py-2 rounded-xl text-xs font-bold hover:bg-brand-primary/95 transition-all shadow-md active:scale-95 hover:cursor-pointer flex items-center space-x-1.5">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Add to Contest</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateContest;
