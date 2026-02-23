# CONTRIBUTING.md --- Personal Timeline Tracker

Thank you for contributing to the Personal Timeline Tracker.

This project values clarity, learning, and thoughtful development over
rapid feature accumulation.

------------------------------------------------------------------------

## Project Goals

-   Build a modern offline‑first PWA
-   Learn modern web development progressively
-   Maintain a clean and understandable codebase

Contributions should support these goals.

------------------------------------------------------------------------

## Getting Started

### Requirements

-   Node.js (LTS)
-   npm or pnpm
-   Modern browser (Chrome / Edge / Safari)

### Install

``` bash
npm install
npm run dev
```

------------------------------------------------------------------------

## Development Workflow

1.  Create a feature branch
2.  Implement small, focused changes
3.  Test locally
4.  Submit pull request

Keep pull requests small and readable.

------------------------------------------------------------------------

## Contribution Principles

### Prefer Simplicity

If two solutions exist: - choose the easier one to understand

### Avoid Premature Optimization

Do not introduce: - complex caching layers - global state libraries -
backend dependencies

unless clearly necessary.

------------------------------------------------------------------------

## Code Style

-   TypeScript preferred
-   Functional React components
-   Descriptive variable names
-   Avoid deeply nested logic

------------------------------------------------------------------------

## UI Guidelines

-   Mobile-first design
-   Minimal visual noise
-   Consistent spacing
-   Accessible contrast

UI changes should not sacrifice usability for aesthetics.

------------------------------------------------------------------------

## Data Model Rules

Do NOT store computed values such as:

-   countdown numbers
-   elapsed days
-   progress percentage

These must always be calculated dynamically.

------------------------------------------------------------------------

## Testing Expectations

At minimum: - Core date calculations must be testable - Recurrence logic
should be isolated and testable

UI testing is optional in early phases.

------------------------------------------------------------------------

## Feature Roadmap Awareness

Before adding features, check project phases:

1.  MVP
2.  PWA Enhancement
3.  Timeline Experience
4.  Notifications

Avoid jumping ahead unless explicitly requested.

------------------------------------------------------------------------

## Good First Contributions

-   Improve accessibility
-   Refactor confusing components
-   Improve error handling
-   Performance improvements
-   Documentation updates

------------------------------------------------------------------------

## Communication

When proposing changes:

Explain: - What problem it solves - Why this approach was chosen -
Tradeoffs considered

------------------------------------------------------------------------

## Guiding Principle

This project is both a product and a learning journey.

Readable code is more valuable than clever code.

------------------------------------------------------------------------

End of CONTRIBUTING.md
