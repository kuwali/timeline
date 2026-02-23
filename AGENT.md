# AGENT.md --- Personal Timeline Tracker

## Purpose

This document guides AI coding agents working on the **Personal Timeline
Tracker** project.

The goal is to ensure all contributions remain aligned with the
architectural vision, learning goals, and long‑term maintainability of
the application.

Agents should prioritize **clarity, simplicity, and extensibility** over
premature optimization.

------------------------------------------------------------------------

## Project Philosophy

This project is:

-   A learning project for modern web development
-   An offline‑first Progressive Web App
-   A personal timeline system built around time anchors

Agents must avoid introducing unnecessary complexity or enterprise
patterns.

Key rule:

> Prefer simple, understandable solutions over clever abstractions.

------------------------------------------------------------------------

## Core Concepts

### Time Anchor Model

All events are stored as anchors in time.

NEVER store derived values such as: - remaining days - elapsed days -
progress percentages

These must always be computed dynamically.

Example data model:

``` ts
TimelineEvent {
  id: string
  title: string
  anchorDate: Date
  recurrenceRule?: object
  category?: string
  icon?: string
  sortOrder: number
}
```

------------------------------------------------------------------------

## Architectural Constraints

### Frontend

-   React + Vite + TypeScript
-   Client‑side rendering only
-   Static hosting compatible (GitHub Pages)

### Storage

-   IndexedDB via `idb`
-   No server dependency for core features

### PWA

-   Service Worker required
-   Offline-first behavior
-   Cache UI assets responsibly

### Backend (Future Only)

Push notifications will use a serverless backend. Do NOT introduce
backend coupling before Phase 4.

------------------------------------------------------------------------

## Development Rules for Agents

### ✅ Allowed

-   Refactor for clarity
-   Improve accessibility
-   Add reusable UI components
-   Improve performance without reducing readability
-   Add tests where meaningful

### ❌ Avoid

-   Adding global state libraries prematurely
-   Introducing heavy frameworks
-   Storing computed countdown values
-   Adding backend requirements
-   Overengineering abstractions

------------------------------------------------------------------------

## UI/UX Principles

-   Calm, minimal interface
-   Mobile-first layout
-   Fast interaction feedback
-   Readable typography
-   Focus on time perception

Animations must be subtle and purposeful.

------------------------------------------------------------------------

## Coding Guidelines

-   Prefer functional React components
-   Keep components small and focused
-   Separate UI from logic when reasonable
-   Use clear naming over short naming

Example:

GOOD:

``` ts
calculateDaysUntil(date)
```

BAD:

``` ts
calc(d)
```

------------------------------------------------------------------------

## Recurrence System (Important)

Recurring logic must be isolated in a dedicated module.

Agents must NOT scatter recurrence calculations across components.

Goal: Single source of truth for time logic.

------------------------------------------------------------------------

## Notification Preparation

Even before notifications exist:

-   Event model must allow reminder configuration
-   Notification logic must remain abstracted

Create interfaces instead of implementations.

Example:

``` ts
NotificationService.schedule(event)
```

Implementation will come later.

------------------------------------------------------------------------

## Decision Priority

When making decisions, optimize for:

1.  Maintainability
2.  Learning clarity
3.  Performance
4.  Feature completeness

------------------------------------------------------------------------

## When Unsure

Agents should: - choose simpler implementation - leave TODO comments -
avoid speculative features

------------------------------------------------------------------------

End of AGENT.md
