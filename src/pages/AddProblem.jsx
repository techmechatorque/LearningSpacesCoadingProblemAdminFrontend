import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { Save, Plus, Trash2, ShieldAlert, ArrowLeft, Layers, AlertCircle, FileCode } from 'lucide-react';

const AddProblem = () => {
  const { id } = useParams(); // present only in edit mode
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('general'); // general | testcases | solutions | startercode | extrainfo
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [category, setCategory] = useState('Arrays');
  const [statement, setStatement] = useState('');
  const [constraints, setConstraints] = useState('');

  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  // Dynamic Array States
  const [examples, setExamples] = useState([{ input: '', output: '', explanation: '' }]);
  const [testCases, setTestCases] = useState([{ input: '', expectedOutput: '', isHidden: false }]);
  const [hints, setHints] = useState(['']);

  // Solution State
  const [solutionExplanation, setSolutionExplanation] = useState('');
  const [solutionCode, setSolutionCode] = useState('');

  // Starter Code States
  const [starterCpp, setStarterCpp] = useState('');
  const [starterJava, setStarterJava] = useState('');
  const [starterPython, setStarterPython] = useState('');
  const [starterC, setStarterC] = useState('');

  // Extra Details State
  const [status, setStatus] = useState('approved');
  const [isContestOnly, setIsContestOnly] = useState(false);
  const [problemNumber, setProblemNumber] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategoriesList = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data);
        if (!isEditMode && data.length > 0) {
          setCategory(data[0].name);
        }
      } catch (err) {
        console.error('Failed to fetch categories list:', err);
      }
    };
    fetchCategoriesList();
  }, [isEditMode]);

  // Load details in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchProblemDetail = async () => {
        setFetching(true);
        try {
          const prob = await api.getProblemById(id);
          setName(prob.name || '');
          setDifficulty(prob.difficulty || 'Easy');
          setCategory(prob.category || 'Arrays');
          setStatement(prob.statement || '');
          setConstraints(prob.constraints || '');
          
          if (prob.examples && prob.examples.length > 0) setExamples(prob.examples);
          if (prob.testCases && prob.testCases.length > 0) setTestCases(prob.testCases);
          if (prob.hints && prob.hints.length > 0) setHints(prob.hints);
          
          setSolutionExplanation(prob.solution?.explanation || '');
          setSolutionCode(prob.solution?.code || '');

          setStarterCpp(prob.starterCode?.cpp || '');
          setStarterJava(prob.starterCode?.java || '');
          setStarterPython(prob.starterCode?.python || '');
          setStarterC(prob.starterCode?.c || '');
          
          setStatus(prob.status || 'draft');
          setIsContestOnly(prob.isContestOnly || false);
          setProblemNumber(prob.problemNumber || '');
        } catch (err) {
          setError('Failed to fetch problem data');
        } finally {
          setFetching(false);
        }
      };
      fetchProblemDetail();
    }
  }, [id, isEditMode]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCategoryError('');
    if (!newCategoryName.trim()) return;

    try {
      const created = await api.createCategory({ name: newCategoryName.trim() });
      setCategories([...categories, created]);
      setCategory(created.name);
      setNewCategoryName('');
      setShowNewCategoryInput(false);
    } catch (err) {
      setCategoryError(err.response?.data?.message || err.message || 'Failed to create category');
    }
  };

  // Example handlers
  const handleAddExample = () => {
    setExamples([...examples, { input: '', output: '', explanation: '' }]);
  };
  const handleRemoveExample = (index) => {
    setExamples(examples.filter((_, i) => i !== index));
  };
  const handleExampleChange = (index, field, value) => {
    const updated = [...examples];
    updated[index][field] = value;
    setExamples(updated);
  };

  // Test Case handlers
  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', isHidden: false }]);
  };
  const handleRemoveTestCase = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };
  const handleTestCaseChange = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  // Hint handlers
  const handleAddHint = () => {
    setHints([...hints, '']);
  };
  const handleRemoveHint = (index) => {
    setHints(hints.filter((_, i) => i !== index));
  };
  const handleHintChange = (index, value) => {
    const updated = [...hints];
    updated[index] = value;
    setHints(updated);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !statement || !category) {
      return setError('Please fill in Name, Statement, and Category fields.');
    }

    setLoading(true);

    const problemPayload = {
      name,
      difficulty,
      category,
      statement,
      constraints,
      examples,
      testCases,
      hints: hints.filter(h => h.trim() !== ''),
      solution: {
        explanation: solutionExplanation,
        code: solutionCode,
      },
      starterCode: {
        cpp: starterCpp,
        java: starterJava,
        python: starterPython,
        c: starterC,
      },
      status,
      isContestOnly,
      ...(problemNumber !== '' && { problemNumber: Number(problemNumber) }),
    };

    try {
      if (isEditMode) {
        await api.updateProblem(id, problemPayload);
        setSuccess('DSA Question updated successfully!');
      } else {
        await api.createProblem(problemPayload);
        setSuccess('DSA Question created successfully!');
        // Reset states
        setName('');
        setStatement('');
        setConstraints('');
        setExamples([{ input: '', output: '', explanation: '' }]);
        setTestCases([{ input: '', expectedOutput: '', isHidden: false }]);
        setHints(['']);
        setSolutionExplanation('');
        setSolutionCode('');
        setStarterCpp('');
        setStarterJava('');
        setStarterPython('');
        setStarterC('');
        setStatus('approved');
        setIsContestOnly(false);
        setProblemNumber('');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit problem details');
    } finally {
      setLoading(false);
      window.scrollTo(0, 0);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-bg text-brand-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
        <span className="ml-3 font-semibold">Fetching Question details...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto p-8 space-y-6 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-border/40 pb-5">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/admin/problems')}
              className="bg-dark-card hover:bg-dark-hover border border-dark-border p-2 rounded-xl text-dark-muted hover:text-white transition-all hover:cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-white">
                {isEditMode ? 'Modify Question' : 'Create Question'}
              </h1>
              <p className="text-sm text-dark-muted mt-1">Configure parameters, test cases, and solution profiles</p>
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="flex items-center space-x-2 bg-brand-danger/10 border border-brand-danger/25 text-brand-danger p-4 rounded-xl text-sm font-semibold">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center space-x-2 bg-brand-secondary/10 border border-brand-secondary/25 text-brand-secondary p-4 rounded-xl text-sm font-semibold animate-fade-in">
            <Layers className="h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex border-b border-dark-border/80 pb-px space-x-4">
          {[
            { key: 'general', name: 'General & Content' },
            { key: 'testcases', name: 'Examples & Tests' },
            { key: 'solutions', name: 'Hints & Solution' },
            { key: 'startercode', name: 'Starter Codes' },
            { key: 'extrainfo', name: 'Extra Details' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`text-sm font-bold pb-2.5 border-b-2 border-0 hover:cursor-pointer transition-all ${
                activeTab === tab.key
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-dark-muted hover:text-white'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs text-dark-muted font-bold uppercase tracking-wider block">Question Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Two Sum"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-dark-text placeholder-dark-muted focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-dark-muted font-bold uppercase tracking-wider block">Category</label>
                  {!showNewCategoryInput ? (
                    <div className="flex space-x-2">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="flex-1 bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-brand-primary"
                        required
                      >
                        <option value="" disabled>Select a Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowNewCategoryInput(true)}
                        className="bg-dark-hover border border-dark-border text-brand-primary px-4 rounded-xl hover:bg-dark-border/40 transition-colors text-xs font-bold hover:cursor-pointer"
                      >
                        + New
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-1.5">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="New category name..."
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="flex-1 bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-dark-text placeholder-dark-muted focus:outline-none focus:border-brand-primary"
                        />
                        <button
                          type="button"
                          onClick={handleCreateCategory}
                          className="bg-brand-primary text-black px-4 rounded-xl hover:bg-brand-primary/95 transition-colors text-xs font-bold hover:cursor-pointer"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewCategoryInput(false);
                            setCategoryError('');
                          }}
                          className="bg-dark-hover border border-dark-border text-dark-muted px-4 rounded-xl hover:bg-dark-border/40 transition-colors text-xs font-bold hover:cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                      {categoryError && (
                        <span className="text-[10px] text-brand-danger font-semibold">{categoryError}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-dark-muted font-bold uppercase tracking-wider block">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-brand-primary"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-dark-muted font-bold uppercase tracking-wider block">Problem Statement (Supports Markdown / HTML)</label>
                <textarea
                  placeholder="Describe the problem, inputs, outputs, and details..."
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  rows={8}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-dark-text placeholder-dark-muted font-mono focus:outline-none focus:border-brand-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-dark-muted font-bold uppercase tracking-wider block">Constraints (One constraint per line)</label>
                <textarea
                  placeholder="e.g. 1 <= nums.length <= 10^4&#10;-10^9 <= nums[i] <= 10^9"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  rows={4}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-dark-text placeholder-dark-muted font-mono focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>
          )}

          {/* Examples & Test Cases Tab */}
          {activeTab === 'testcases' && (
            <div className="space-y-6 animate-fade-in">
              {/* Examples */}
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-dark-border/40 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Examples</h3>
                  <button
                    type="button"
                    onClick={handleAddExample}
                    className="flex items-center space-x-1.5 text-xs font-semibold text-brand-primary hover:underline bg-transparent border-0 hover:cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Example</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {examples.map((ex, idx) => (
                    <div key={idx} className="bg-dark-bg border border-dark-border p-4 rounded-xl space-y-3 relative">
                      <div className="flex justify-between items-center text-xs font-bold text-dark-muted">
                        <span>Example {idx + 1}</span>
                        {examples.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveExample(idx)}
                            className="text-brand-danger hover:underline flex items-center space-x-1 bg-transparent border-0 hover:cursor-pointer font-bold"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] text-dark-muted uppercase font-bold">Input</label>
                          <textarea
                            placeholder="nums = [2,7,11,15], target = 9"
                            value={ex.input}
                            onChange={(e) => handleExampleChange(idx, 'input', e.target.value)}
                            rows={2}
                            className="w-full bg-dark-card border border-dark-border rounded-lg p-2.5 text-xs font-mono text-dark-text focus:outline-none focus:border-brand-primary"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-dark-muted uppercase font-bold">Output</label>
                          <textarea
                            placeholder="[0,1]"
                            value={ex.output}
                            onChange={(e) => handleExampleChange(idx, 'output', e.target.value)}
                            rows={2}
                            className="w-full bg-dark-card border border-dark-border rounded-lg p-2.5 text-xs font-mono text-dark-text focus:outline-none focus:border-brand-primary"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-dark-muted uppercase font-bold">Explanation (Optional)</label>
                        <input
                          type="text"
                          placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
                          value={ex.explanation}
                          onChange={(e) => handleExampleChange(idx, 'explanation', e.target.value)}
                          className="w-full bg-dark-card border border-dark-border rounded-lg p-2.5 text-xs text-dark-text focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Cases */}
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-dark-border/40 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Automated Grading Test Cases</h3>
                  <button
                    type="button"
                    onClick={handleAddTestCase}
                    className="flex items-center space-x-1.5 text-xs font-semibold text-brand-primary hover:underline bg-transparent border-0 hover:cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Test Case</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {testCases.map((tc, idx) => (
                    <div key={idx} className="bg-dark-bg border border-dark-border p-4 rounded-xl space-y-3 relative">
                      <div className="flex justify-between items-center text-xs font-bold text-dark-muted">
                        <span>Test Case {idx + 1}</span>
                        {testCases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTestCase(idx)}
                            className="text-brand-danger hover:underline flex items-center space-x-1 bg-transparent border-0 hover:cursor-pointer font-bold"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] text-dark-muted uppercase font-bold">Standard Stdin (Input)</label>
                          <textarea
                            placeholder="e.g.&#10;4 9&#10;2 7 11 15"
                            value={tc.input}
                            onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                            rows={3}
                            className="w-full bg-dark-card border border-dark-border rounded-lg p-2.5 text-xs font-mono text-dark-text focus:outline-none focus:border-brand-primary"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-dark-muted uppercase font-bold">Expected Stdout (Output)</label>
                          <textarea
                            placeholder="e.g.&#10;0 1"
                            value={tc.expectedOutput}
                            onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                            rows={3}
                            className="w-full bg-dark-card border border-dark-border rounded-lg p-2.5 text-xs font-mono text-dark-text focus:outline-none focus:border-brand-primary"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 bg-dark-card/45 p-2 rounded-lg border border-dark-border/40 inline-flex">
                        <input
                          type="checkbox"
                          id={`hidden-${idx}`}
                          checked={tc.isHidden}
                          onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)}
                          className="rounded text-brand-primary focus:ring-0 cursor-pointer"
                        />
                        <label htmlFor={`hidden-${idx}`} className="text-xs text-dark-text cursor-pointer select-none font-semibold">
                          Hidden Test Case (Used for final submissions grading)
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Hints & Solutions Tab */}
          {activeTab === 'solutions' && (
            <div className="space-y-6 animate-fade-in">
              {/* Hints */}
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-dark-border/40 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Problem Hints</h3>
                  <button
                    type="button"
                    onClick={handleAddHint}
                    className="flex items-center space-x-1.5 text-xs font-semibold text-brand-primary hover:underline bg-transparent border-0 hover:cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Hint</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {hints.map((hint, idx) => (
                    <div key={idx} className="flex items-center space-x-3 bg-dark-bg p-3 border border-dark-border rounded-xl">
                      <span className="text-xs font-bold text-dark-muted shrink-0">Hint {idx + 1}:</span>
                      <input
                        type="text"
                        placeholder="Can we use hash map to look up targets?"
                        value={hint}
                        onChange={(e) => handleHintChange(idx, e.target.value)}
                        className="flex-1 bg-dark-card border border-dark-border rounded-lg p-2 text-xs text-dark-text focus:outline-none focus:border-brand-primary"
                      />
                      {hints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveHint(idx)}
                          className="text-brand-danger hover:text-brand-danger/80 bg-transparent border-0 hover:cursor-pointer shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Solution */}
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-dark-border/40 pb-3">Solution Profile</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xs text-dark-muted font-bold uppercase tracking-wider block">Solution Explanation</label>
                  <textarea
                    placeholder="Provide detailed theoretical analysis, complexity proofs, and approaches..."
                    value={solutionExplanation}
                    onChange={(e) => setSolutionExplanation(e.target.value)}
                    rows={5}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-dark-text placeholder-dark-muted focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-dark-muted font-bold uppercase tracking-wider block">Solution Code (Reference Implementation)</label>
                  <textarea
                    placeholder="Paste reference code logic..."
                    value={solutionCode}
                    onChange={(e) => setSolutionCode(e.target.value)}
                    rows={6}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-dark-text placeholder-dark-muted font-mono focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Starter Code Tab */}
          {activeTab === 'startercode' && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-6 animate-fade-in">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-dark-border/40 pb-3 flex items-center space-x-2">
                <FileCode className="h-5 w-5 text-brand-primary" />
                <span>Starter Templates</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs text-brand-primary font-bold uppercase tracking-wider block">C++ Template</label>
                  <textarea
                    placeholder="#include <iostream>&#10;using namespace std;&#10;..."
                    value={starterCpp}
                    onChange={(e) => setStarterCpp(e.target.value)}
                    rows={6}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-xs text-dark-text font-mono focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-brand-secondary font-bold uppercase tracking-wider block">Java Template</label>
                  <textarea
                    placeholder="class Solution {&#10;    public int[] twoSum(int[] nums, int target) {&#10;..."
                    value={starterJava}
                    onChange={(e) => setStarterJava(e.target.value)}
                    rows={6}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-xs text-dark-text font-mono focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-blue-400 font-bold uppercase tracking-wider block">Python Template</label>
                  <textarea
                    placeholder="def twoSum(self, nums: List[int], target: int) -> List[int]:&#10;    pass"
                    value={starterPython}
                    onChange={(e) => setStarterPython(e.target.value)}
                    rows={6}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-xs text-dark-text font-mono focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-amber-500 font-bold uppercase tracking-wider block">C Template</label>
                  <textarea
                    placeholder="int* twoSum(int* nums, int numsSize, int target, int* returnSize) {&#10;    &#10;}"
                    value={starterC}
                    onChange={(e) => setStarterC(e.target.value)}
                    rows={6}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-xs text-dark-text font-mono focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Extra Info Tab */}
          {activeTab === 'extrainfo' && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-6 animate-fade-in">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-dark-border/40 pb-3 flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 text-brand-primary" />
                <span>Extra Details & Admin Controls</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs text-dark-muted font-bold uppercase tracking-wider block">Approval Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-brand-primary"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-dark-muted font-bold uppercase tracking-wider block">Problem Number (Optional, Auto-Generated)</label>
                  <input
                    type="number"
                    placeholder="e.g. 101"
                    value={problemNumber}
                    onChange={(e) => setProblemNumber(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-dark-text placeholder-dark-muted focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-dark-bg p-4 rounded-xl border border-dark-border">
                <input
                  type="checkbox"
                  id="contestOnly"
                  checked={isContestOnly}
                  onChange={(e) => setIsContestOnly(e.target.checked)}
                  className="h-5 w-5 rounded text-brand-primary focus:ring-0 cursor-pointer border-dark-border bg-dark-card"
                />
                <div>
                  <label htmlFor="contestOnly" className="text-sm font-bold text-white cursor-pointer select-none">
                    Contest Only Problem
                  </label>
                  <p className="text-xs text-dark-muted mt-0.5">If checked, this problem will only be visible within contests and not in the main question bank.</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions footer */}
          <div className="flex items-center justify-end space-x-4 border-t border-dark-border/40 pt-6 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/admin/problems')}
              className="bg-dark-bg hover:bg-dark-hover border border-dark-border text-dark-text px-6 py-3 rounded-xl text-sm font-semibold hover:text-white transition-all hover:cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-primary hover:bg-brand-primary/95 text-black px-8 py-3 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all hover:cursor-pointer shadow-md shadow-brand-primary/10 active:scale-95"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{isEditMode ? 'Update Question' : 'Save Question'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
  );
};

export default AddProblem;
