# Studia — Feature Implementation Roadmap

**Web-first product delivery plan | Version 1.0 | 15 October 2026**

Objective: Turn the approved Studia frontend into a reliable, end-to-end study organization platform by implementing and validating features in dependency order. This is an execution roadmap—not a claim that individual features are already functional.

# 1. Baseline and rules

- UI direction is accepted for now. Avoid broad redesigns; fix usability issues only when they block a workflow.

- Confirm actual repository status before marking any feature complete. A visible button or mock data is not evidence of implementation.

- Build the smallest working vertical slice first: Course → Material → Units → Plan → Focus → Progress.

- Keep frontend and backend responsibilities explicit. Deterministic planning and timers are authoritative application logic; AI provides optional suggestions.

- Each phase requires working UI, API integration as applicable, database persistence, error handling, and a verified test gate.

- Use feature branches, database migrations, seed/demo data separated from real data, and basic automated checks.

# 2. Proposed stack (confirm against repository)

| Layer            | Planned choice                                        | Responsibility                                            |
|------------------|-------------------------------------------------------|-----------------------------------------------------------|
| Web              | Next.js / React / TypeScript / Tailwind / shadcn/ui   | Desktop-first product UI                                  |
| Core API         | Laravel + PostgreSQL                                  | Auth, permissions, domain state, planning, timers         |
| Background tasks | Laravel Queue + Redis, when required                  | Long-running processing, retries                          |
| Documents        | Private object storage (S3/R2/Supabase or equivalent) | Original uploads and secure retrieval                     |
| AI & extraction  | Python / FastAPI, when needed                         | PDF/text extraction, structure suggestions, contextual AI |
| Realtime         | Laravel Reverb / WebSockets, later                    | Cross-device change notifications                         |
| Mobile           | Flutter, future phase                                 | Companion app after web validation                        |

Architecture note: These are proposed choices from the product specification. Do not migrate an existing functioning implementation merely to match the table; verify what the repository already uses.

# 3. Milestones at a glance

| Phase | Milestone                        | Priority | Exit outcome                                |
|-------|----------------------------------|----------|---------------------------------------------|
| 0     | Audit and baseline               | P0       | Actual implemented/not implemented list     |
| 1     | Data, auth, projects/courses     | P0       | User can securely create and manage courses |
| 2     | Material upload and PDF viewing  | P0       | PDF persists and can be reopened            |
| 3     | Material units and editing       | P0       | User can manage a study structure           |
| 4     | Planning engine                  | P0       | Editable realistic plan is saved            |
| 5     | Focus sessions and strategies    | P0       | Reliable start/pause/resume/complete        |
| 6     | Progress dashboard and analytics | P0       | Metrics derived from real records           |
| 7     | Rescheduling and recommendations | P1       | Suggested changes are reviewable            |
| 8     | Contextual AI assistance         | P1       | Small selected-text actions work            |
| 9     | Realtime and resilience          | P1       | State reconciles across clients             |
| 10    | QA, security and release         | P0       | Release candidate passes gates              |
| 11    | Flutter companion                | Later    | Mobile built against stable API             |

# Phase 0 — Repository Audit & Delivery Baseline

Goal: Identify the real state of the existing UI, backend and database before adding code.

Prerequisites: Existing repository and access to a local development environment

## Implementation checklist

- [ ] Inventory routes, components, APIs, database tables, feature flags and existing services.

- [ ] For each screen/action, label: Working / Partial / Mock / Not built / Broken.

- [ ] Confirm framework versions, deployment target, test tooling and proposed stack differences.

- [ ] Capture screenshots and UX issues; preserve the approved design as a baseline.

- [ ] Define a feature tracking board and create a reusable acceptance-test template.

## Acceptance / test gate

- [ ] Baseline matrix is recorded and reviewed.

- [ ] Local development setup and existing test/build commands run successfully or failures are documented.

- [ ] No existing feature is declared complete from appearance alone.

# Phase 1 — Identity, Courses & Persistence

Goal: Build the stable ownership and course/project data foundation.

Prerequisites: Phase 0; confirmed identity and database approach

## Implementation checklist

- [x] Implement or validate registration/login/logout/current-user endpoints and protected routes.

- [x] Define user-scoped courses/study projects and database migrations.

- [x] Create, list, open, edit, archive and (with confirmation) delete courses.

- [x] Add course details: subject/name, optional target date, available study time and status.

- [x] Connect sidebar course selector and course library to persisted data.

- [x] Provide input validation, authorization, and loading/empty/error states.

## Acceptance / test gate

- [x] After refresh and relogin, courses remain correct.

- [x] User A cannot read or modify User B data.

- [x] Create/edit/archive/delete flows behave correctly including errors.

# Phase 2 — Study Materials & Actual PDF Workspace

Goal: Allow a student to upload, store, view and manage academic documents.

Prerequisites: Phase 1; private storage configured

## Implementation checklist

- [x] Validate PDF upload type, size and access permissions.

- [x] Store original files privately and record upload metadata/status in database.

- [x] Add material list and open/download/remove actions with authorization.

- [x] Wire existing Study Workspace to a real PDF viewer, page navigation and independent zoom.

- [x] Provide uploading, queued, ready, failed, retry and unsupported-file states.

- [x] Introduce asynchronous document processing only when required; do not block uploads on AI.

## Acceptance / test gate

- [x] A valid PDF uploads, survives refresh and opens to readable pages.

- [x] Invalid/corrupt/oversize files fail cleanly.

- [x] Private document URLs and cross-user access are protected.

# Phase 3 — Study Units & Material Structure

Goal: Convert materials into manageable editable study units.

Prerequisites: Phase 2

## Implementation checklist

- [x] Define sections/units with title, material, page range, order, duration estimate and completion state.

- [x] Create a manual unit editor first: add, rename, reorder, split/merge if feasible, delete, estimate duration.

- [x] Add completion toggling with database persistence and validation.

- [x] Connect unit selection to PDF page ranges and current course.

- [x] Optionally add extraction/AI-generated draft structure behind a review-and-confirm flow.

- [x] Mark auto-generated estimates as suggestions and permit user overrides.

## Acceptance / test gate

- [x] Units can be saved, reordered and reopened correctly.

- [x] Selecting a unit opens its associated material/page when metadata exists.

- [x] Changes to units update downstream planning inputs without silently corrupting existing plans.

# Phase 4 — Study Planning Engine

Goal: Generate a realistic, editable study schedule from work, time and deadline.

Prerequisites: Phase 3; available time and deadline settings exist

## Implementation checklist

- [ ] Define a study plan, tasks, date/time allocation, duration estimates and statuses.

- [ ] Implement deterministic scheduling using remaining units, daily capacity, deadline and breaks.

- [ ] Expose a preview before accepting plan creation; signal infeasible deadlines explicitly.

- [ ] Build daily/weekly views using saved tasks, with edit, reorder and reschedule actions.

- [ ] Handle completed units, dependencies where relevant, and time-zone/date boundaries.

- [ ] Ensure re-running planning does not overwrite user edits without confirmation.

## Acceptance / test gate

- [ ] Test a simple plan by hand: total minutes, number of focus intervals, free days and deadline.

- [ ] Impossible workloads trigger a clear explanation, not a false success.

- [ ] Plan survives refresh and reflects manual edits.

# Phase 5 — Focus Timer & Study Strategies

Goal: Execute study tasks with reliable timed focus sessions.

Prerequisites: Phase 4 for planned tasks; can prototype independently with Phase 1

## Implementation checklist

- [ ] Support Pomodoro, Deep Work and custom focus/break durations.

- [ ] Implement explicit start/pause/resume/complete/cancel transitions and persist timestamps.

- [ ] Use server-authoritative lifecycle state and client countdown calculated from timestamps.

- [ ] Attach focus sessions to selected study tasks and course/material where possible.

- [ ] Keep current session state through route changes, background tabs and refresh.

- [ ] Provide focus/break indications and controls without duplicating competing timers.

- [ ] On completion record actual focus duration; do not automatically mark a whole unit complete without explicit rules.

## Acceptance / test gate

- [ ] Timer remains accurate after refresh, browser throttling and brief network interruption.

- [ ] Invalid transitions are rejected; duplicate completion does not double-count time.

- [ ] Completed session appears in persisted history.

# Phase 6 — Dashboard, Progress & Analytics

Goal: Replace mock metrics with trustworthy summaries from actual data.

Prerequisites: Phases 1–5

## Implementation checklist

- [ ] Connect recommended task, remaining units and current plan to real records.

- [ ] Calculate unit/course completion consistently; define denominator explicitly.

- [ ] Calculate planned minutes vs actual focused minutes from stored plans/sessions.

- [ ] Show course deadlines and recent focus history.

- [ ] Add meaningful weekly trends; show helpful empty states with insufficient data.

- [ ] Reconcile inconsistent percentages (for example unit completion versus course completion) with one documented metric definition.

## Acceptance / test gate

- [ ] Dashboard numbers match direct database/test fixtures.

- [ ] Completing a task/session updates only the appropriate metrics.

- [ ] No seeded values are presented as real user progress.

# Phase 7 — Adaptive Planning & Suggestions

Goal: Help users adjust plans based on actual study behavior.

Prerequisites: Phases 4–6; sufficient session history

## Implementation checklist

- [ ] Compare estimated and actual study durations on sufficient completed sessions.

- [ ] Suggest bounded adjustments to estimated durations and next actions.

- [ ] Detect missed planned days and propose rescheduling.

- [ ] Warn about insufficient capacity before a deadline.

- [ ] Require explicit acceptance for changes that rewrite scheduled tasks.

- [ ] Keep a clear before/after preview and a recoverable change history if practical.

## Acceptance / test gate

- [ ] Explanations reference actual workload/capacity inputs.

- [ ] Dismissing suggestions never changes the plan.

- [ ] Accepting changes updates plan and related views consistently.

# Phase 8 — Contextual AI Assistant (Optional Enhancement)

Goal: Offer targeted help on selected study content without replacing Studia planning.

Prerequisites: Phase 2; Phase 3 for unit-generation assistance; API/LLM access

## Implementation checklist

- [ ] Enable selected-text actions: explain, simplify, translate, summarize, define and short question.

- [ ] Send selected passage and limited adjacent context to a server-side AI endpoint.

- [ ] Protect credentials, set size/rate limits, and surface timeout/error states.

- [ ] Use retrieval only where document context requires it; keep responses concise.

- [ ] Keep AI-generated unit breakdowns/estimates editable and user-confirmed.

- [ ] Treat document text as untrusted input and guard against prompt injection.

## Acceptance / test gate

- [ ] AI response is scoped to selected text rather than inventing a whole chapter.

- [ ] Errors and missing AI configuration degrade gracefully without blocking core study workflows.

- [ ] No model output mutates plans automatically.

# Phase 9 — Realtime Sync, Offline Recovery & Background Jobs

Goal: Improve reliability when a user switches tabs or devices.

Prerequisites: Core data and session lifecycle stable; defer until required

## Implementation checklist

- [ ] Use WebSockets/event broadcasts for meaningful committed state changes when multi-client need exists.

- [ ] Refetch authoritative state on reconnect, app foreground and missed event recovery.

- [ ] Protect private channels; reject conflicting invalid state transitions.

- [ ] Add queue retries, status polling/events and observability for processing tasks.

- [ ] Document practical offline scope; preserve an active timer display during brief outages.

## Acceptance / test gate

- [ ] Changes in one client appear in another or reconcile after reconnect.

- [ ] Network interruption does not permanently desynchronize task/session status.

- [ ] Unauthorized subscriptions and conflicting updates fail safely.

# Phase 10 — Security, QA, Accessibility & Web Launch

Goal: Produce a release candidate suitable for actual student testing.

Prerequisites: Core MVP phases 1–6; optional phases gated by scope

## Implementation checklist

- [ ] Exercise end-to-end happy paths and failure paths for upload → units → plan → focus → progress.

- [ ] Check auth/ownership, upload validation, signed URLs, API rate limits and safe deletion.

- [ ] Run lint, typecheck, unit/integration tests and production build; fix regressions.

- [ ] Test keyboard interactions, accessible labels, contrast, mobile/tablet overflow and reduced motion.

- [ ] Confirm data backup/migrations, logs, monitoring and basic deployment recovery.

- [ ] Recruit a small pilot group and record confusion, completion rates and failure reports.

## Acceptance / test gate

- [ ] Critical journey succeeds in staging without manual database edits.

- [ ] No release-blocking security issues or data-loss scenarios remain.

- [ ] Known limitations are documented and the pilot feedback loop is established.

# Phase 11 — Flutter Mobile Companion (Future)

Goal: Extend proven workflows to mobile without duplicating backend rules.

Prerequisites: Successful web MVP validation; phase 9 patterns as needed

## Implementation checklist

- [ ] Freeze documented stable authenticated API contracts.

- [ ] Add course dashboard, plan, progress, reminders and brief focus-session controls.

- [ ] Implement reconnection/reconciliation against the same backend state.

- [ ] Keep PDF multi-panel workflows web-first unless validated as necessary on mobile.

## Acceptance / test gate

- [ ] Changes made on mobile persist and reconcile correctly with web.

- [ ] Cross-platform timer state stays consistent and authorized.

# 4. MVP release boundary

Required for first useful pilot: Phases 0–6 plus the release-critical subset of Phase 10. AI, automated adaptation, broad realtime infrastructure and Flutter must not block the initial web MVP.

# 5. Recommended development order (vertical slices)

- Slice A — Create a course and reopen it after login.

- Slice B — Upload a PDF, read it and reopen it later.

- Slice C — Create 3–5 study units from that PDF and save them.

- Slice D — Generate a feasible plan from those units and edit it.

- Slice E — Start a focus session from the plan; complete it and save actual time.

- Slice F — Dashboard and analytics correctly reflect the saved work.

- Slice G — Add intelligent suggestions, AI and realtime only after the loop works.

# 6. Minimum tests to maintain

| Area              | Key test                                              |
|-------------------|-------------------------------------------------------|
| Identity          | User-specific data isolation; session expiry          |
| Course            | CRUD and persistence across refresh                   |
| Files             | PDF validation, private retrieval, corrupted upload   |
| Units             | Ordering, linking, and completion consistency         |
| Planner           | Capacity math, impossible deadlines, manual overrides |
| Timer             | Pause/resume/reload, duplicate completion, drift      |
| Metrics           | Totals, percentages, planned-vs-actual consistency    |
| AI optional       | Error fallback and safe selected-text scope           |
| Realtime optional | Missed events and reconnect reconciliation            |

# 7. Feature tracking template

For every phase create a work item with: Feature ID • Owner • Priority (P0/P1/Later) • State (Not started/In progress/Blocked/Ready for QA/Done) • Dependencies • Route/component • API/data contract • Acceptance tests • Evidence (screenshot, test output, PR) • Known limitations.

# 8. Definition of Done (applies to every milestone)

- [ ] Functional end-to-end interaction, not just a rendered component.

- [ ] Data persistence and authorization verified where applicable.

- [ ] Loading, empty, validation, failure and retry behavior handled.

- [ ] No broken existing routes or state transitions.

- [ ] Tests added or a documented manual QA checklist executed.

- [ ] Feature demo recorded and status updated accurately.

# 9. First sprint: start here

- Run Phase 0 audit and produce a feature-status matrix.

- Confirm auth, courses and database migrations are wired correctly.

- Choose one real PDF and one course for the first vertical slice.

- Implement the smallest upload → view → create unit path.

- Review functionality together before starting automatic study planning.

Planning caveat: Task estimates and calendar duration intentionally omitted until the actual repo, team capacity and implemented features have been audited. Do not treat the phase numbers as fixed calendar commitments.
