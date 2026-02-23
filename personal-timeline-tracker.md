# Personal Timeline Tracker — Project Starter

> **Living Planning Doc** — update status as phases complete.

## Implementation Status

| Phase | Scope | Status |
|---|---|---|
| Phase 1 | Foundations (MVP) | ✅ Complete |
| Phase 2 | PWA Enhancement | ⬜ Pending |
| Phase 3 | Timeline Experience | ⬜ Pending |
| Phase 4 | Notifications (Serverless) | ⬜ Pending |
| Phase 5 | Future Expansion | ⬜ Pending |

### Phase 1 Checklist
- [x] Project scaffold (React + Vite + TypeScript)
- [x] `TimelineEvent` type definition
- [x] IndexedDB storage layer (`idb`)
- [x] Date calculation utilities (`timeCalc.ts`)
- [x] `useEvents` hook (CRUD + state)
- [x] `EventCard` component
- [x] `EventList` component + empty state
- [x] `EventForm` modal (create / edit)
- [x] Global CSS design system (dark-mode, mobile-first)
- [x] PWA manifest + service worker (basic offline)
- [x] Verified: create/edit/delete events persist offline

---

## 1. Project Overview

**Personal Timeline Tracker** is a Progressive Web App (PWA) designed to
help users understand their life and plans through time-based anchors.

Instead of being a simple countdown application, the app organizes
events into a **personal timeline** that shows:

-   Days remaining until future milestones
-   Days elapsed since past milestones
-   Recurring life events
-   Personal progress across time

The goal is to create a lightweight, offline-first tool that feels like
a personal dashboard for life planning, memory tracking, and milestone
awareness.

------------------------------------------------------------------------

## 2. Core Concept

Every entry is a **Time Anchor**.

A Time Anchor represents an important moment in time: - A future event
(trip, deadline, anniversary) - A past event (career start, relocation,
achievements) - A recurring event (birthdays, renewals, habits)

The application calculates all counters dynamically from these anchors.

### Key Principle

We store **dates**, not counters.\
All countdowns and elapsed days are derived values.

------------------------------------------------------------------------

## 3. Features

### 3.1 Core Features (MVP)

-   Create timeline events
-   Future event → shows remaining days
-   Past event → shows days since
-   Local data persistence (offline-first)
-   Categories and icons
-   Manual sorting of events
-   Installable PWA
-   Works offline

------------------------------------------------------------------------

### 3.2 Recurring Events

Support recurring rules such as:

-   Yearly (birthday, anniversary)
-   Monthly
-   Custom recurrence (future expansion)

The system automatically calculates the next occurrence.

------------------------------------------------------------------------

### 3.3 Notifications (Future Feature)

-   Local reminder configuration
-   Push notification before events
-   Background notification delivery via serverless backend

This feature is intentionally postponed in MVP but must be considered in
architecture design.

------------------------------------------------------------------------

## 4. Visual UI / UX Direction

### Design Philosophy

-   Calm and minimal
-   Time-focused
-   Emotionally meaningful but not cluttered
-   Fast and distraction-free

### Primary Screens

#### Dashboard (Main View)

-   List of timeline cards
-   Each card displays:
    -   Title
    -   Icon
    -   Category
    -   Countdown or elapsed days
    -   Progress visualization

#### Timeline View (Future)

-   Horizontal or vertical timeline visualization
-   Past → Present → Future layout

#### Event Editor

-   Create/edit event
-   Date picker
-   Recurrence selector
-   Category & icon selector
-   Notification settings (future)

------------------------------------------------------------------------

### Visual Style Suggestions

-   Card-based layout
-   Large readable day counter
-   Subtle color coding by category
-   Smooth micro animations for transitions
-   Mobile-first design

------------------------------------------------------------------------

## 5. Technical Architecture

### Frontend

-   React
-   Vite
-   TypeScript
-   Progressive Web App (PWA)

Key responsibilities: - UI rendering - Date calculations - Offline
support - Local storage management

------------------------------------------------------------------------

### Storage

-   IndexedDB (via `idb` library)

Why: - Structured data - Scalable storage - Supports sorting and complex
objects

Data model example:

``` ts
TimelineEvent {
  id: string
  title: string
  anchorDate: Date
  direction: "past" | "future"
  recurrenceRule?: object
  category?: string
  icon?: string
  sortOrder: number
}
```

------------------------------------------------------------------------

### PWA Layer

-   Service Worker
-   Web App Manifest
-   Offline caching strategy

Capabilities: - Installable application - Offline usage - Fast load
experience

------------------------------------------------------------------------

### Backend (Future Phase)

Serverless backend for push notifications:

Recommended: - Cloudflare Workers (learning modern serverless) -
Alternative: Firebase Cloud Messaging

Responsibilities: - Store push subscriptions - Send scheduled push
notifications - Trigger reminders before events

------------------------------------------------------------------------

## 6. Development Plan

### Phase 1 --- Foundations (MVP)

Goal: Learn modern web fundamentals.

-   Project setup (React + Vite)
-   Event CRUD
-   Countdown & elapsed calculation
-   IndexedDB storage
-   Manual sorting
-   GitHub Pages deployment

Deliverable: Functional offline day counter.

------------------------------------------------------------------------

### Phase 2 --- PWA Enhancement

Goal: Make it feel like a real app.

-   Service worker
-   Installable PWA
-   Offline caching
-   Mobile UX improvements

Deliverable: Installable offline-first application.

------------------------------------------------------------------------

### Phase 3 --- Timeline Experience

Goal: Transform into timeline tracker.

-   Categories & filtering
-   Timeline visualization
-   Progress indicators
-   Recurring event engine

Deliverable: Personal timeline dashboard.

------------------------------------------------------------------------

### Phase 4 --- Notifications (Serverless)

Goal: Introduce backend learning.

-   Push subscription system
-   Cloudflare Worker backend
-   Scheduled notifications

Deliverable: Real push reminders even when app closed.

------------------------------------------------------------------------

### Phase 5 --- Future Expansion Ideas

Potential long-term directions:

-   Life progress analytics
-   Milestone reflections / notes
-   Photo attachments
-   Habit timeline tracking
-   Smart reminders ("halfway to goal")
-   Export/import backup

------------------------------------------------------------------------

## 7. Design Constraints

-   Offline-first architecture
-   Static hosting compatible (GitHub Pages)
-   Minimal backend dependency
-   Privacy-first (local data by default)

------------------------------------------------------------------------

## 8. Project Vision

This project is both:

1.  A practical productivity tool
2.  A learning journey into modern web development

By building progressively, contributors learn:

-   Modern frontend architecture
-   PWAs and offline apps
-   IndexedDB data modeling
-   Serverless backend patterns
-   Push notification systems

The final product should feel like a **personal timeline companion**,
not just a utility counter.

------------------------------------------------------------------------

## 9. Initial Success Criteria

-   User can install app
-   Events persist offline
-   Counters update correctly
-   UI remains fast and simple
-   Architecture allows notification feature later without redesign

------------------------------------------------------------------------

End of Project Starter Document.
