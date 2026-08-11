# Workspace Platform — Core Vision & Overall Architecture

## Project Vision

The goal of this project is **not to build another coding page or a LeetCode clone.**

The real objective is to build a **generic, reusable, extensible Workspace Platform** that can power any type of application requiring a multi-panel workspace.

Instead of creating one static coding layout, we are building a **Workspace Engine** that behaves similarly to professional IDEs such as **VS Code, JetBrains IDEs, Figma, Photoshop, and modern development platforms**.

The coding workspace is only the **first consumer** of this engine.

---

# Core Philosophy

The Workspace Engine must never know anything about:

- Problems
- Contests
- Practice
- Admin
- AI
- Business Logic
- APIs
- Backend
- Monaco
- Discussions
- Code Execution

The engine is responsible only for:

- Rendering layouts
- Managing panels
- Dragging
- Docking
- Tabs
- Resizing
- Floating windows
- Persistence
- Panel lifecycle
- Workspace lifecycle

Everything else belongs outside the engine.

---

# Design Philosophy

The project follows one important architectural rule:

> **Separate Platform from Product.**

Platform

- Workspace Engine
- Runtime
- Plugin System
- Marketplace
- AI Framework
- Collaboration Framework

Products

- Coding Workspace
- Contest Workspace
- Practice Workspace
- Admin Workspace
- AI Workspace
- Future Applications

Products consume the platform.

The platform never depends on products.

---

# Architecture Philosophy

Every layer has a single responsibility.

```
Applications

↓

Workspace Engine

↓

Platform Runtime

↓

Capability Framework

↓

Extensibility Platform

↓

Productivity Framework

↓

Workspace Management

↓

Extension Ecosystem

↓

Collaboration Framework

↓

AI Framework
```

Every layer communicates only through stable public APIs.

No layer reaches inside another layer.

---

# Workspace Engine

The Workspace Engine is the heart of the platform.

Responsibilities

- Dynamic Layout Rendering
- Drag & Drop
- Docking
- Split Panels
- Resize Engine
- Floating Windows
- Tabs
- Layout Persistence
- Panel Lifecycle
- Workspace Lifecycle

The engine is completely generic.

It does not know what a panel actually displays.

---

# Manifest Driven Architecture

Applications never build layouts manually.

Instead they provide a Workspace Manifest.

Example

```
Problem Workspace

↓

Problem Manifest

↓

Workspace Engine
```

or

```
Contest Workspace

↓

Contest Manifest

↓

Workspace Engine
```

The engine renders everything dynamically from the manifest.

---

# Panel Registry

Panels are never hardcoded.

Applications register panels.

Example

```
Description Panel

Editor Panel

Console Panel

Discussion Panel

AI Panel
```

The Workspace Engine simply renders registered panels.

---

# Layout Adapter

The engine never depends directly on a layout library.

Architecture

```
Workspace Engine

↓

Layout Adapter

↓

Dockview
```

If Dockview is replaced in the future, only the Layout Adapter changes.

Applications remain untouched.

---

# Runtime

The Runtime manages the engine.

Responsibilities

- Workspace Store
- Command Pipeline
- Event System
- Manifest Service
- Registry Service
- Layout Service
- Persistence
- Error Handling

The Runtime coordinates everything.

---

# Capability Framework

The engine supports capabilities instead of hardcoded behaviors.

Examples

```
Floating

Resizable

Closable

Multi Instance

Lazy Loading

Dockable

Pinned
```

Panels declare capabilities.

The engine reacts accordingly.

---

# Extensibility

The Workspace Platform is plugin-based.

Everything after the core engine is implemented as plugins.

Examples

- Productivity Plugin
- Workspace Management Plugin
- Collaboration Plugin
- AI Plugin
- Marketplace Plugin

Even first-party features are plugins.

---

# Productivity Framework

Provides productivity features.

Examples

- Command Palette
- Toolbar
- Context Menu
- Keyboard Shortcuts
- Overlay System
- Templates

Plugins contribute actions dynamically.

---

# Workspace Management

Owns the user's workspace lifecycle.

Responsibilities

- Auto Save
- Crash Recovery
- User Presets
- Workspace Templates
- Session History
- Import
- Export
- Workspace Packages

This is completely separated from the Workspace Engine.

---

# Extension Ecosystem

Transforms the platform into an ecosystem.

Provides

- Marketplace
- Extension Registry
- Plugin Installation
- Hot Reload
- Hot Disable
- Dependency Resolution
- Permission Validation

Extensions can be installed or removed without restarting the application.

---

# Collaboration Framework

Provides reusable collaboration services.

Responsibilities

- Presence
- Collaboration Sessions
- Discussions
- Follow User
- Shared Commands
- Awareness
- Notifications

Transport is abstracted.

Current provider

- Mock Provider

Future providers

- Socket.IO
- Firebase
- Supabase
- WebRTC
- Yjs
- Liveblocks

No architectural changes required.

---

# AI Framework

AI is treated as another platform service.

It is **not tied to any single AI provider**.

Architecture

```
AI Framework

↓

AI Adapter

↓

Provider Manager

↓

Mock Provider

↓

OpenAI

↓

Gemini

↓

Claude

↓

Local Models
```

Responsibilities

- AI Assistant
- Context Manager
- Prompt Manager
- Conversation Manager
- Tool Manager
- Action Manager

AI never accesses internal platform services directly.

All actions go through the standard Command Pipeline.

---

# Public APIs

Everything communicates through public APIs.

Examples

- Plugin API
- Command API
- Event API
- Workspace API
- Extension Platform API
- AI Platform API
- Collaboration Platform API

No module directly accesses internal services.

---

# Frozen Core Principle

After the core architecture reached maturity, the Workspace Engine became frozen.

This means:

- No new business logic inside the engine.
- No feature-specific code inside the runtime.
- No application-specific behavior inside the platform.

New features are implemented as:

- Plugins
- Extensions
- Adapters
- Providers

Never by modifying the core engine.

---

# Scalability

The platform is designed to support unlimited future workspaces.

Examples

- Coding Workspace
- Contest Workspace
- Practice Workspace
- AI Workspace
- Admin Workspace
- Database Workspace
- DevOps Workspace
- Design Workspace

Each provides only a Manifest and registered Panels.

The same Workspace Engine powers them all.

---

# Long-Term Goal

The final objective is to create a **modern IDE Platform** comparable in architecture to products like:

- VS Code
- JetBrains IDEs
- Cursor
- Windsurf
- Figma
- Photoshop (workspace system)

The platform should allow developers to build completely different applications using the same Workspace Engine.

---

# Guiding Principles

1. Generic before specific.
2. Platform before product.
3. Configuration over hardcoding.
4. Plugins over modifications.
5. Adapters over direct dependencies.
6. Stable public APIs.
7. Business logic stays outside the engine.
8. Every major feature is extensible.
9. Providers are replaceable.
10. The Workspace Engine remains permanently reusable, scalable, and independent.

---

# Final Vision

This project is not a coding workspace.

It is a **Workspace Platform**.

The coding environment is simply the first application built on top of that platform.

The long-term vision is to create a reusable, plugin-driven, AI-native, collaborative IDE platform where new products, features, integrations, and providers can be added without redesigning or modifying the Workspace Engine itself.
