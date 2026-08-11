import { lazy } from 'react';
import ProblemDescription from '../components/ProblemDescription';

import SubmissionsPanel from '../components/SubmissionsPanel';
import DiscussionsPanel from '../components/DiscussionsPanel';
import SolutionsPanel from '../components/SolutionsPanel';
import TestcasesPanel from '../components/TestcasesPanel';
import TestResultsPanel from '../components/TestResultsPanel';
import * as DiagnosticsPlugin from './plugins/DiagnosticsPlugin';
import * as HelloWorkspacePlugin from './plugins/HelloWorkspacePlugin';
import * as ProductivityPlugin from './plugins/productivity/ProductivityPlugin';
import * as WorkspaceManagementPlugin from './plugins/management/WorkspaceManagementPlugin';
import * as EcosystemPlugin from './plugins/ecosystem/EcosystemPlugin';
import * as CollaborationPlugin from './plugins/collaboration/CollaborationPlugin';
import * as AIPlugin from './plugins/ai/AIPlugin';

export const ProblemWorkspaceManifest = {
  version: 4,
  id: 'problem-workspace',
  minEngineVersion: 1,
  
  // Panel Registry: Maps IDs to configurations (Component or LazyLoader)
  panels: {
    description: { component: ProblemDescription },
    editor: { lazyLoader: () => import('../components/CodeEditor') },
    testcases: { component: TestcasesPanel },
    testresults: { component: TestResultsPanel },
    solutions: { component: SolutionsPanel },
    submissions: { component: SubmissionsPanel },
    discussions: { component: DiscussionsPanel },
  },
  
  // Formalized Capabilities definition
  capabilities: {
    description: { canClose: false, canMove: true, canFloat: true, multiInstance: false },
    solutions: { canClose: true, canMove: true, canFloat: true, multiInstance: false },
    submissions: { canClose: true, canMove: true, canFloat: true, multiInstance: false },
    discussions: { canClose: true, canMove: true, canFloat: true, multiInstance: false },
    editor: { canClose: true, canMove: true, canResize: true, canFloat: true, multiInstance: true },
    testcases: { canClose: false, canMove: true, canResize: true, canFloat: true, multiInstance: true },
    testresults: { canClose: false, canMove: true, canResize: true, canFloat: true, multiInstance: true }
  },

  // Metadata definition (titles, icons)
  metadata: {
    description: { title: 'Description', icon: 'FileText' },
    solutions: { title: 'Solutions', icon: 'Lightbulb' },
    submissions: { title: 'Submissions', icon: 'History' },
    discussions: { title: 'Discussions', icon: 'MessagesSquare' },
    editor: { title: 'Editor', icon: 'Code2' },
    testcases: { title: 'Testcases', icon: 'Beaker' },
    testresults: { title: 'Test Results', icon: 'CheckCircle' }
  },

  // Extensions to load
  extensions: [
    {
      id: 'system.diagnostics',
      version: '1.0.0',
      permissions: ['panels', 'commands', 'state.read'],
      moduleLoader: DiagnosticsPlugin // For Phase 5 we pass the module directly
    },
    {
      id: 'demo.hello',
      version: '1.0.0',
      permissions: ['panels', 'commands', 'toolbar'],
      moduleLoader: HelloWorkspacePlugin
    },
    {
      id: 'system.productivity',
      version: '1.0.0',
      permissions: ['panels', 'commands', 'toolbar', 'menus', 'templates', 'shortcuts'],
      moduleLoader: ProductivityPlugin
    },
    {
      id: 'system.management',
      version: '1.0.0',
      permissions: ['panels', 'commands', 'toolbar', 'menus', 'templates', 'shortcuts', 'state.read', 'state.write'],
      moduleLoader: WorkspaceManagementPlugin
    },
    {
      id: 'system.ecosystem',
      version: '1.0.0',
      permissions: ['panels', 'commands', 'toolbar', 'extensions.manage'],
      moduleLoader: EcosystemPlugin
    },
    {
      id: 'system.collaboration',
      version: '1.0.0',
      permissions: ['panels', 'commands', 'toolbar', 'state.read'],
      moduleLoader: CollaborationPlugin
    },
    {
      id: 'system.ai',
      version: '1.0.0',
      permissions: ['panels', 'commands', 'toolbar', 'state.read'],
      moduleLoader: AIPlugin
    }
  ],

  // Future command registry
  commands: {},
  
  // Future keyboard shortcuts
  shortcuts: {},

  // Default layout (Will be parsed by LayoutEngine in Phase 3)
  // For Phase 2, this is just a structural representation
  defaultLayout: {
    type: 'layout',
    children: [
      {
        type: 'row',
        children: [
          {
            type: 'tabset',
            weight: 50,
            children: [
              { type: 'tab', component: 'description', active: true },
              { type: 'tab', component: 'submissions' },
              { type: 'tab', component: 'discussions' },
              { type: 'tab', component: 'solutions' }
            ]
          },
          {
            type: 'column',
            weight: 50,
            children: [
              {
                type: 'tabset',
                weight: 50,
                children: [
                  { type: 'tab', component: 'editor', active: true },
                  { type: 'tab', component: 'testresults' }
                ]
              },
              {
                type: 'tabset',
                weight: 50,
                children: [
                  { type: 'tab', component: 'testcases', active: true }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};
