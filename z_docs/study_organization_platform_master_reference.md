# Study Organization Platform — Master Product & Technical Reference

> **Document purpose:** This is the primary reference for the product vision, scope, features, architecture, technology choices, workflows, reliability principles, roadmap, and future opportunities for the study-organization platform discussed by Abdullah.
>
> **Status:** Proposed architecture and product specification. Technologies and implementation details in this document are recommendations, not claims that the system has already been built.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision and Positioning](#2-product-vision-and-positioning)
3. [Product Principles](#3-product-principles)
4. [Target Users and Validation](#4-target-users-and-validation)
5. [Platforms: Web First, Mobile Companion](#5-platforms-web-first-mobile-companion)
6. [Core User Journey](#6-core-user-journey)
7. [Feature Specification](#7-feature-specification)
8. [Study Material Processing](#8-study-material-processing)
9. [Study Planning Engine](#9-study-planning-engine)
10. [Study Strategies and Timer](#10-study-strategies-and-timer)
11. [Contextual AI Assistant](#11-contextual-ai-assistant)
12. [Suggestions and Adaptive Planning](#12-suggestions-and-adaptive-planning)
13. [Real-Time Synchronization](#13-real-time-synchronization)
14. [Proposed Architecture](#14-proposed-architecture)
15. [Technology Stack](#15-technology-stack)
16. [Domain Model and Database](#16-domain-model-and-database)
17. [API Design](#17-api-design)
18. [Security, Reliability, and Error Handling](#18-security-reliability-and-error-handling)
19. [Offline and Timer Behavior](#19-offline-and-timer-behavior)
20. [UX Principles](#20-ux-principles)
21. [MVP Scope](#21-mvp-scope)
22. [Development Roadmap](#22-development-roadmap)
23. [Future Features](#23-future-features)
24. [Validation Metrics](#24-validation-metrics)
25. [End-to-End Examples](#25-end-to-end-examples)
26. [Architecture Decisions and Trade-Offs](#26-architecture-decisions-and-trade-offs)
27. [Glossary](#27-glossary)
28. [Final Product Definition](#28-final-product-definition)

---

# 1. Executive Summary

The project is a **study organization and execution platform** for students. It helps a learner turn books, PDFs, lecture notes, and academic goals into an organized, realistic, trackable study process.

The platform is not primarily an AI tutor and is not intended to compete as a tool whose main purpose is to explain entire books or chapters. Its core value is organization:

- organize learning materials into manageable study units;
- estimate how much work remains;
- build a plan around time availability and deadlines;
- choose and run a study strategy such as Pomodoro;
- track planned versus actual work;
- synchronize the student's state across active devices;
- adapt estimates and plans based on actual behavior;
- offer small, contextual AI assistance when the student gets stuck.

**Core loop:**

```text
Materials + Goals
       ↓
Organize into Study Units
       ↓
Build a Study Plan
       ↓
Execute Focus Sessions
       ↓
Record Actual Progress
       ↓
Compare Planned vs Actual
       ↓
Adjust Estimates and Future Plan
       ↺
```

The initial product should be a Web application optimized for laptops and desktops. A Flutter mobile companion can be added after the Web experience has been validated with real users.

---

# 2. Product Vision and Positioning

## 2.1 Vision

Build a personal **Study Operating System** that helps students answer:

1. What should I study now?
2. What is the workload?
3. How should I divide it?
4. How long should each session take?
5. Am I on track for my goal or deadline?
6. What should change based on what I actually completed?

## 2.2 Positioning

A concise product description:

> A study organization platform that turns learning materials and academic goals into structured, executable study plans, manages focus sessions and time, tracks progress, and improves future plans using the student's actual study history.

The AI is an assistant inside this workflow, not the central product.

## 2.3 Differentiator

The main differentiator should be:

**Planning + Execution + Measurement + Adaptation**

A PDF chatbot can answer questions about a document. This product should help the student decide what to study, schedule it, actually do it, measure the result, and adjust the next plan.

---

# 3. Product Principles

## 3.1 Organization first

The product should reduce the mental overhead of planning and tracking study.

## 3.2 AI supports the workflow

The AI should be contextual, concise, and invoked for a specific purpose. Avoid turning the application into a general-purpose chatbot.

## 3.3 The user remains in control

AI-generated breakdowns and recommendations are suggestions. The user can edit, accept, or reject them. Important changes must not happen silently.

## 3.4 The backend owns authoritative state

Web and Mobile are clients of the same backend. They should not independently decide the official state of a study session, task, or plan.

## 3.5 Deterministic logic for deterministic tasks

Use ordinary application code for timers, progress calculations, scheduling constraints, permissions, state transitions, and conflict handling. Use AI for interpretation, language tasks, content structure suggestions, and uncertain estimates.

## 3.6 Build and validate incrementally

Do not build every future feature before the core workflow has proven useful.

---

# 4. Target Users and Validation

## 4.1 Initial users

- University students.
- Self-directed learners studying from documents.
- Learners who need structure, time management, and measurable progress.
- Students with deadlines, exams, and multiple subjects.

## 4.2 Initial validation

Abdullah should use the first version personally, then test it with a small group of university students.

Suggested process:

```text
Build a small MVP
   ↓
Use it in real study sessions
   ↓
Record friction and failures
   ↓
Improve the workflow
   ↓
Test with other students
   ↓
Measure behavior and retention
   ↓
Prioritize based on evidence
```

The goal is to discover whether students repeatedly use planning, timers, material breakdown, and progress tracking—not merely whether they like the idea.

---

# 5. Platforms: Web First, Mobile Companion

## 5.1 Web is the primary study environment

The main product should be built with **Next.js, React, and TypeScript**, optimized for laptop and desktop use.

The Web app is best suited to:

- reading PDFs and notes;
- selecting text;
- navigating chapters and sections;
- viewing the study plan beside the material;
- using multiple panels;
- editing and reordering study units;
- drag-and-drop interactions;
- long focus sessions;
- reviewing charts and statistics;
- keyboard shortcuts and desktop workflows.

## 5.2 Mobile is a companion, not a second full product at first

After validating the Web app, create a **Flutter** mobile app for Android and iOS.

Mobile features can include:

- today's plan;
- progress and statistics;
- reminders and notifications;
- starting, pausing, resuming, or completing sessions;
- quick quizzes and review;
- short AI assistance;
- rescheduling and lightweight plan edits;
- checking upcoming deadlines.

The mobile app can support actual study, but the long-form PDF and multi-panel experience remains optimized for the Web.

**Feature parity is not required.** The Web and Mobile apps can have different interfaces while using the same backend and data.

---

# 6. Core User Journey

A typical user journey:

1. Create a study session or study project.
2. Name it and optionally choose a subject or goal.
3. Upload one or more supported study materials.
4. Wait for material processing.
5. Review the suggested chapter/section/unit structure.
6. Edit the structure as needed.
7. Choose a study strategy such as Pomodoro, Deep Work, or Custom.
8. Enter available study time and an optional deadline.
9. Generate a study plan.
10. Start the recommended task.
11. Read the material while the timer runs.
12. Select a small piece of text if contextual AI help is needed.
13. Complete a focus session and record progress.
14. View actual versus estimated time.
15. Let the system adjust future estimates and recommendations.

---

# 7. Feature Specification

## 7.1 Study sessions and projects

Users should be able to:

- create a study session/project;
- name it;
- associate it with a subject;
- attach study materials;
- set an optional deadline;
- set available study time;
- choose a study strategy;
- view current and completed work;
- pause or resume a study workflow;
- archive or delete a project, subject to safe data-handling rules.

The word *study session* can mean the larger study project in the UI, while a timed focus interval is a *focus session* or *Pomodoro*. Naming should be made consistent during product design to avoid ambiguity.

## 7.2 Materials

Users should be able to:

- upload PDFs and supported documents;
- view processing status;
- inspect the generated structure;
- revisit source materials;
- remove a material;
- see processing failures and retry where appropriate.

## 7.3 Study structure editor

For AI-generated units, users should be able to:

- rename;
- split;
- merge;
- delete;
- reorder;
- move between sections;
- edit estimated duration;
- mark a unit complete;
- override an AI estimate.

## 7.4 Planning

The planner should consider:

- estimated workload;
- available time per day;
- deadline;
- remaining days;
- task dependencies where relevant;
- task difficulty estimates;
- completed work;
- user-adjusted estimates;
- prior study performance.

The planner should explain when a goal is unrealistic rather than pretending every deadline can be met.

## 7.5 Timer and focus sessions

Users should be able to:

- start;
- pause;
- resume;
- complete;
- abandon or cancel with clear semantics;
- record interruptions if desired;
- see the current task and remaining time;
- move through focus and break intervals automatically.

## 7.6 Dashboard

The dashboard should show useful, actionable information:

- today's plan;
- current task;
- remaining workload;
- next recommended action;
- progress toward a goal;
- upcoming deadline;
- recent study history;
- planned versus actual time.

## 7.7 Progress and statistics

Potential metrics:

- planned study time;
- actual focused time;
- completed focus sessions;
- completion rate;
- average session length;
- material completion;
- missed or rescheduled tasks;
- estimated versus actual duration;
- daily and weekly consistency;
- quiz accuracy, if quizzes are used.

Statistics should help users make decisions rather than add decorative complexity.

---

# 8. Study Material Processing

## 8.1 Processing workflow

```text
User uploads a PDF
        ↓
Backend validates the upload
        ↓
File saved in object storage
        ↓
Material record created
        ↓
Background job queued
        ↓
AI/document service extracts text
        ↓
Detect chapters and sections
        ↓
Suggest study units and estimates
        ↓
Save structure
        ↓
Notify the client that processing finished
```

## 8.2 Suggested structure

Example:

```text
Python Fundamentals
├── Chapter 1
│   ├── Variables
│   ├── Data Types
│   └── Input / Output
├── Chapter 2
│   ├── Conditions
│   └── Loops
└── Chapter 3
    ├── Function Basics
    ├── Arguments
    ├── Return Values
    └── *args / **kwargs
```

## 8.3 Estimates

A processing result may include:

- unit title;
- source page range where available;
- estimated duration;
- estimated difficulty;
- dependencies or prerequisites when identifiable;
- extraction confidence or processing warnings.

Example:

```text
Function Basics — 25 minutes
Arguments — 30 minutes
Return Values — 20 minutes
```

These estimates are provisional. The student must be able to edit them, and the system should later compare them with actual duration.

## 8.4 Processing failures

The system should not leave a material indefinitely in a vague state. Use explicit states such as:

- `uploaded`;
- `queued`;
- `processing`;
- `ready`;
- `failed`.

Provide a useful error message and a retry path where safe.

---

# 9. Study Planning Engine

## 9.1 Responsibilities

The planning engine is responsible for converting study units and user constraints into a feasible plan.

It should:

- calculate total estimated workload;
- convert workload into focus sessions;
- distribute tasks over available days;
- respect deadlines;
- account for completed tasks;
- support manual edits;
- reschedule when the user falls behind;
- report when a target is unrealistic.

## 9.2 Example

Input:

```text
Available time: 2 hours/day
Material workload: 9 hours
Strategy: 25-minute Pomodoro
```

The raw focus-session estimate is:

```text
9 hours = 540 minutes
540 ÷ 25 = 21.6
≈ 22 focus intervals
```

Break time and practical scheduling overhead must be accounted for separately. The number of Pomodoros is not the same as the total elapsed time needed to complete them.

## 9.3 Deadline planning

Example:

```text
Deadline: 14 days away
Remaining work: 32 Pomodoros
```

The planner can initially recommend approximately three sessions per day, then calculate more precisely based on available time, break durations, and the student's schedule.

## 9.4 AI versus planning logic

The AI can suggest structure, difficulty, and duration. The deterministic planning engine should handle arithmetic, date constraints, workload distribution, task state, and validation.

```text
AI estimates and suggests
          ↓
Planning engine validates and schedules
          ↓
User reviews and adjusts
```

---

# 10. Study Strategies and Timer

## 10.1 Pomodoro

A default strategy could be:

```text
25 min focus
5 min break
25 min focus
5 min break
25 min focus
15 min long break
```

The exact cycle should be configurable. This is an example, not a universal prescription.

## 10.2 Deep Work

A longer uninterrupted focus block, with duration selected by the user.

## 10.3 Custom strategy

Allow users to define:

- focus duration;
- short break duration;
- long break duration;
- number of focus cycles before a long break.

## 10.4 Timer implementation

The timer should not send a request to the server every second.

Instead, store meaningful state transitions and timestamps, for example:

- `started_at`;
- `planned_duration_seconds`;
- `status`;
- `paused_at`;
- `accumulated_paused_seconds`;
- `completed_at`.

The client calculates the visible countdown. The backend validates the session lifecycle and records authoritative changes.

Use server timestamps and a well-defined pause/resume model. Do not rely only on a local decrementing counter, because browser throttling, device sleep, and app backgrounding can make it inaccurate.

---

# 11. Contextual AI Assistant

## 11.1 Product boundary

The AI is a **Contextual Study Assistant**, not the main product and not a full AI tutor.

It is not intended to:

- teach an entire book;
- explain a complete chapter by default;
- replace a teacher;
- generate long lectures;
- imitate a product whose central purpose is document-wide AI teaching;
- become a general-purpose chatbot.

## 11.2 Intended actions

### Understand
- Explain a selected term, sentence, or short passage.
- Define an unfamiliar term.
- Simplify selected text.
- Give a small example.

### Transform
- Translate selected text.
- Summarize a short selected passage.
- Rewrite or rephrase a selected passage.

### Practice
- Generate a small question about the selected material.
- Offer a quick quiz about a narrow topic.

Responses should be concise and proportional to the selection.

## 11.3 Preferred interaction

Avoid relying on a blank chatbot as the main AI entry point. Prefer a contextual interaction:

```text
User selects text in the PDF
             ↓
     ┌────────────────┐
     │ Explain        │
     │ Simplify       │
     │ Translate      │
     │ Summarize      │
     │ Define         │
     │ Give example   │
     │ Ask a question │
     └────────────────┘
             ↓
      Short AI response
```

A general chat interface may exist as a secondary option, but the primary experience should begin from selected text or the current study unit.

## 11.4 Context supplied to AI

Where useful, the request can include:

- selected text;
- current material ID;
- current section/unit;
- surrounding text;
- requested action;
- preferred output language.

Example payload:

```json
{
  "action": "simplify",
  "selected_text": "Python supports arbitrary positional arguments.",
  "language": "ar",
  "material_id": 123,
  "unit_id": 45
}
```

This is an illustrative contract, not a finalized API schema.

## 11.5 Retrieval and RAG

Use retrieval when surrounding document context improves accuracy. The selected text should remain the primary focus.

```text
Selected text + nearby context
              ↓
Retrieve relevant document chunks if needed
              ↓
LLM receives limited context
              ↓
Concise contextual response
```

A large, document-wide RAG system should not be built before a real use case requires it.

## 11.6 Cost and latency

A narrowly scoped assistant can reduce unnecessary token usage, cost, and latency. The service should impose limits on selected text size, request frequency, and response length.

---

# 12. Suggestions and Adaptive Planning

## 12.1 Purpose

The Suggestions Engine should help users decide what to do next and keep their plans realistic.

Suggestions should be based on relevant data, not generated randomly.

Potential inputs:

- available time;
- today's plan;
- remaining workload;
- deadline;
- incomplete tasks;
- task priority and dependencies;
- actual session history;
- estimation accuracy;
- user preferences.

## 12.2 Example suggestions

```text
You have 40 minutes available.
Suggestion: Finish "Function Arguments" now.
```

```text
You are one session behind today's plan.
Suggestion: Move "OOP Basics" to tomorrow and finish
"Functions" today.
```

```text
Your programming tasks often take longer than estimated.
Suggestion: Increase the duration estimate for this unit.
```

```text
You have completed four focus sessions today.
Suggestion: Take a longer break before continuing.
```

Suggestions should explain the reason where useful, and the user should be able to accept, dismiss, or modify them.

## 12.3 Estimated versus actual duration

Example:

```text
Estimated duration: 25 minutes
Actual duration: 42 minutes
Difference: +17 minutes
```

Over many sessions, calculate a user-specific adjustment factor. Avoid overreacting to one unusual session; use enough observations and sensible bounds.

A basic model:

```text
Adjusted estimate =
Base estimate × User adjustment factor
```

This should be a transparent heuristic initially, not a claim that the system has developed a sophisticated predictive model.

## 12.4 Dynamic rescheduling

If the user misses a day, the system can:

- recalculate the remaining workload;
- redistribute tasks;
- offer a revised daily target;
- warn when a deadline is no longer feasible;
- let the user lower the scope or change the deadline.

Do not silently increase daily workload without showing the consequences and asking for confirmation where appropriate.

## 12.5 “What should I study now?”

A key convenience feature:

1. The user indicates how much time they have, or the system uses a known availability setting.
2. The engine evaluates today's plan and deadlines.
3. It recommends a suitable task or short sequence.
4. The user presses **Start Studying**.

This reduces decision fatigue and gives the product a concrete daily entry point.

---

# 13. Real-Time Synchronization

## 13.1 Goal

If a session is completed on Mobile, the active Web application should update automatically without requiring a manual refresh—and vice versa.

## 13.2 Recommended pattern

- **REST API:** commands and queries.
- **WebSockets:** notify connected clients that something changed.
- **PostgreSQL/backend:** authoritative state.
- **Client cache:** performance optimization, not the source of truth.

Example:

```text
Flutter
   ↓ POST /focus-sessions/123/complete
Laravel validates the transition
   ↓
Database transaction commits
   ↓
Laravel broadcasts FocusSessionCompleted
   ↓
WebSocket
   ↓
Next.js updates or refetches relevant data
```

## 13.3 Laravel Reverb

Laravel Reverb is the proposed WebSocket server for Laravel broadcasting.

Possible events:

- `StudySessionStarted`;
- `StudySessionPaused`;
- `StudySessionCompleted`;
- `StudyPlanUpdated`;
- `StudyTaskCompleted`;
- `MaterialProcessingCompleted`;
- `ProgressUpdated`.

Use authenticated, authorized channels. A user must never be able to subscribe to another user's private study data.

## 13.4 Reconnection and reconciliation

WebSockets can disconnect because of network loss, device sleep, backgrounding, or server restarts.

Therefore, events are not a permanent source of truth.

On reconnect:

```text
Reconnect
   ↓
Refetch authoritative state
   ↓
Reconcile client cache
   ↓
Render current state
```

For important screens, refetch on reconnect or app foregrounding. Consider event IDs or versions if event delivery and ordering matter.

## 13.5 Handling simultaneous actions

Example:

- Mobile completes a session.
- Web attempts to pause the same session.

Laravel must enforce valid state transitions transactionally. Once completed, a later pause request should be rejected or treated as an idempotent no-op according to the defined API contract.

The final state is decided by backend rules—not by which UI updates last.

## 13.6 Reliability mechanisms

Use where appropriate:

- database transactions;
- state transition validation;
- idempotency keys for retry-prone commands;
- entity versioning or optimistic concurrency;
- server timestamps;
- retry policies with limits;
- event broadcasting after commit;
- reconciliation after reconnect;
- monitoring and structured logs.

No distributed system can guarantee that network delivery never fails. The goal is to detect stale state, recover automatically, and avoid silent divergence.

---

# 14. Proposed Architecture

```text
                    ┌──────────────────────┐
                    │ Next.js Web App      │
                    │ React + TypeScript   │
                    └──────────┬───────────┘
                               │ HTTPS / REST
                               ▼
                    ┌──────────────────────┐
                    │ Laravel Backend      │
                    │ API + Business Logic │
                    └─────┬─────┬─────┬────┘
                          │     │     │
                          ▼     ▼     ▼
                    PostgreSQL Redis Storage
                    + pgvector  Queue  S3/R2/
                                      Supabase
                          │
                          │ Internal API / jobs
                          ▼
                    ┌──────────────────────┐
                    │ Python / FastAPI     │
                    │ AI + Document Tasks  │
                    └──────────┬───────────┘
                               ▼
                         LLM / Embeddings

                    Realtime: Laravel Reverb
                         │            │
                         ▼            ▼
                       Web        Flutter Mobile
                                  (later phase)
```

## 14.1 Responsibilities

### Next.js
Presentation, Web interactions, PDF study workspace, local UI state, client-side routing, and WebSocket event handling.

### Laravel
Authentication, authorization, business rules, planning, session lifecycle, persistence, validation, API, queue orchestration, notifications, and broadcasting.

### PostgreSQL
Authoritative relational data, transactions, constraints, and—if needed—vector storage through pgvector.

### Redis
Queue backend, caching, and supporting realtime infrastructure where required.

### Object storage
Original PDFs and other large files.

### Python/FastAPI
Document extraction and AI-related processing, isolated from core product rules.

### LLM provider
Selected-text explanations, simplification, translation, summarization, definitions, and small question generation.

---

# 15. Technology Stack

| Layer | Recommended technology | Purpose |
|---|---|---|
| Primary Web | Next.js | Main desktop-first Web application |
| UI framework | React | Interactive interface |
| Language | TypeScript | Type safety and maintainability |
| Server-state cache | TanStack Query | Fetching, caching, invalidation, and refetching |
| Client/UI state | Zustand, only where needed | Local UI state |
| Styling | Tailwind CSS | Styling and layout |
| Components | shadcn/ui or equivalent | Accessible reusable UI |
| PDF experience | Suitable React PDF viewer | Display and navigate documents |
| Backend | Laravel / PHP | API and core business logic |
| Database | PostgreSQL | Authoritative relational data |
| Vector search | pgvector, when needed | Retrieval over document chunks |
| Queue/cache | Redis + Laravel Queue | Background jobs and caching |
| Realtime | Laravel Reverb + WebSockets | Live updates across clients |
| AI/document service | Python + FastAPI | Document processing and AI calls |
| File storage | Supabase Storage, AWS S3, or Cloudflare R2 | Store uploaded documents |
| Push notifications | Firebase Cloud Messaging | Mobile push notifications |
| Mobile, later | Flutter / Dart | Android and iOS companion |
| Mobile state | Bloc/Cubit | Mobile state management |
| Local mobile storage | Isar or Hive, if appropriate | Local persistence |
| Containers | Docker | Reproducible environments |
| CI/CD | GitHub Actions | Automated checks and deployment |

## 15.1 Important implementation note

This is the proposed stack, not a requirement to install every technology on day one. Start with the smallest set needed for a reliable MVP. Add Redis, vector retrieval, FastAPI, or mobile infrastructure when the corresponding feature is ready.

---

# 16. Domain Model and Database

The following is an initial conceptual model. Exact tables, foreign keys, indexes, and naming should be finalized during database design.

## 16.1 Core entities

- `users`
- `subjects` (optional if subjects are first-class)
- `study_projects` or `study_sessions` (choose one consistent term for the larger project)
- `materials`
- `material_units`
- `study_plans`
- `study_tasks`
- `study_strategies`
- `focus_sessions` or `pomodoro_sessions`
- `study_progress`
- `quizzes`
- `quiz_questions`
- `quiz_answers`
- `ai_interactions` or `ai_conversations`

Potential future entities:

- `user_study_profiles`
- `estimation_profiles`
- `notification_preferences`
- `study_goals`
- `streaks`
- `review_items`
- `flashcards`
- `analytics_events`

## 16.2 Conceptual relationships

```text
User
 ├── Study Projects
 │    ├── Materials
 │    │    └── Material Units
 │    ├── Study Plan
 │    │    └── Study Tasks
 │    ├── Study Strategy
 │    ├── Focus Sessions
 │    └── Progress
 └── Preferences / Goals
```

A project may contain multiple materials, and a material may have many units. Tasks should reference the unit or work item they represent.

## 16.3 Material metadata

Potential fields:

```text
id
user_id
study_project_id
original_file_name
storage_key
mime_type
file_size_bytes
processing_status
processing_error_code
created_at
updated_at
```

Avoid storing public permanent URLs if a private storage key and temporary signed URL are more appropriate.

## 16.4 Focus-session data

Potential fields:

```text
id
user_id
study_task_id
strategy_id
status
started_at
paused_at
planned_duration_seconds
accumulated_paused_seconds
completed_at
actual_focus_seconds
version
created_at
updated_at
```

The exact pause/resume model should be designed before implementation.

## 16.5 Study task data

Potential fields:

```text
id
study_plan_id
material_unit_id
title
estimated_minutes
actual_minutes
status
scheduled_date
priority
position
version
created_at
updated_at
```

Store derived analytics only when necessary; otherwise calculate them from reliable source records or maintain them through carefully tested aggregation logic.

---

# 17. API Design

The exact API is not finalized. These routes illustrate likely boundaries.

## 17.1 Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Laravel Sanctum is a candidate for API authentication. The precise authentication setup should match the Web and Mobile clients and security model.

## 17.2 Study projects

```text
GET    /api/study-projects
POST   /api/study-projects
GET    /api/study-projects/{id}
PATCH  /api/study-projects/{id}
DELETE /api/study-projects/{id}
```

## 17.3 Materials

```text
POST   /api/materials
GET    /api/materials
GET    /api/materials/{id}
DELETE /api/materials/{id}
POST   /api/materials/{id}/retry-processing
```

## 17.4 Study plans and tasks

```text
GET   /api/study-plans/today
GET   /api/study-plans/{id}
PATCH /api/study-plans/{id}
POST  /api/study-plans/{id}/recalculate

PATCH /api/study-tasks/{id}
POST  /api/study-tasks/{id}/complete
POST  /api/study-tasks/{id}/reschedule
```

## 17.5 Focus sessions

```text
POST /api/focus-sessions
POST /api/focus-sessions/{id}/start
POST /api/focus-sessions/{id}/pause
POST /api/focus-sessions/{id}/resume
POST /api/focus-sessions/{id}/complete
POST /api/focus-sessions/{id}/cancel
GET  /api/focus-sessions/{id}
```

Prefer explicit state-transition endpoints over a generic status update that lets clients set arbitrary states.

## 17.6 Contextual AI

```text
POST /api/assistant/explain
POST /api/assistant/simplify
POST /api/assistant/translate
POST /api/assistant/summarize
POST /api/assistant/define
POST /api/assistant/question
```

A single action endpoint with a validated action enum may also be reasonable. Choose one convention and keep it consistent.

## 17.7 Progress

```text
GET /api/progress/dashboard
GET /api/progress/history
GET /api/progress/statistics
```

---

# 18. Security, Reliability, and Error Handling

## 18.1 Authentication and authorization

- Every private record must be scoped to the authenticated user.
- Never trust a user-provided ID as proof of ownership.
- Authorize private WebSocket channels.
- Keep LLM and storage credentials on the server.
- Do not expose permanent private document URLs unnecessarily.

## 18.2 File upload security

- Validate MIME type, extension, file size, and processing limits.
- Treat uploaded documents as untrusted input.
- Avoid executing embedded content.
- Use safe PDF/text extraction libraries.
- Prevent prompt injection in document text from overriding system instructions.
- Limit page count, extracted text size, and processing time.
- Provide clear errors for unsupported or corrupted files.

## 18.3 API reliability

- Validate all requests server-side.
- Use database transactions for multi-record state changes.
- Use idempotency for operations that may be retried.
- Define valid state transitions.
- Rate-limit AI and upload endpoints.
- Use bounded retries and timeouts.
- Record structured errors and request IDs.

## 18.4 Realtime reliability

- Broadcast committed changes, not uncommitted database state.
- Do not assume every client receives every event.
- Refetch authoritative data after reconnect.
- Use versions or event IDs when needed.
- Keep event payloads minimal and avoid leaking private content.

## 18.5 AI reliability

- Limit input and output length.
- Treat AI estimates as estimates, not facts.
- Show uncertainty where relevant.
- Allow users to edit AI-generated structures.
- Do not allow an AI response to mutate a plan without explicit confirmation.
- Monitor cost, latency, and error rates.

---

# 19. Offline and Timer Behavior

## 19.1 Timer

The timer should continue to display sensibly through brief network interruptions. Use timestamps and elapsed-time calculations rather than depending on a counter that decrements only while the app is active.

## 19.2 Web offline behavior

For the first MVP, it may be sufficient to show connection status, preserve the current screen, and recover automatically when the connection returns. Full offline editing is not required initially.

## 19.3 Mobile offline behavior

A later Flutter app may use Isar or Hive for local persistence of:

- today's plan;
- current timer metadata;
- recently viewed materials or progress;
- queued low-risk user actions.

Offline commands require explicit conflict rules. Do not blindly replay a stale pause/complete command after the backend state has changed.

---

# 20. UX Principles

The interface should feel:

- calm;
- focused;
- fast;
- organized;
- predictable;
- professional;
- minimal without hiding useful controls.

Avoid cluttering the dashboard with every metric.

At any point, the user should be able to answer:

- What am I studying?
- What is the current task?
- How much time remains?
- What should I do next?
- How much have I completed?
- Am I on track?

## 20.1 Example dashboard

```text
Python Fundamentals

Today's progress: 72%
Completed: 3 of 4 planned sessions

Current / Next task:
Functions — Arguments

Estimated duration:
25 minutes

[Start Studying]
```

## 20.2 Example study workspace

```text
┌─────────────────┬──────────────────────────┬──────────────────┐
│ Study Plan      │ PDF / Material           │ AI Assistant     │
│                 │                          │                  │
│ ✓ Variables     │ Current page and text    │ Explain selected │
│ ✓ Data Types    │                          │ text             │
│ → Functions     │                          │ Simplify         │
│   Arguments     │                          │ Translate        │
│   Return        │                          │ Summarize        │
├─────────────────┴──────────────────────────┴──────────────────┤
│ Current task · Focus timer · Pause · Finish session           │
└───────────────────────────────────────────────────────────────┘
```

This is a conceptual layout, not a finalized design.

---

# 21. MVP Scope

The first release should prove the core loop with as little complexity as practical.

## 21.1 Include in MVP

### Core workflow
- create a study project;
- set a name and optional deadline;
- upload a PDF;
- view processing status;
- review and edit the suggested material structure.

### Planning
- basic workload estimate;
- Pomodoro calculation;
- daily plan based on availability;
- remaining-work display;
- manual plan adjustments.

### Timer
- start, pause, resume, complete;
- associate a focus session with a task;
- record actual focus duration;
- recover state after refresh/reconnect.

### Dashboard
- today's plan;
- current/next task;
- progress;
- remaining workload.

### Contextual AI
- explain selected text;
- simplify;
- translate;
- summarize a short selection;
- define a term;
- generate a small question.

### Reliability
- one backend source of truth;
- server-side validation;
- realtime updates for important state changes;
- automatic refetch/reconciliation after reconnect.

## 21.2 Defer from MVP

- native mobile app;
- social features;
- study groups;
- extensive gamification;
- large flashcard system;
- full AI tutor;
- complex calendar integrations;
- advanced analytics;
- sophisticated predictive models;
- many different study strategies.

## 21.3 Practical simplification

The complete target architecture includes multiple services, but the earliest MVP may start with:

- Next.js;
- Laravel;
- PostgreSQL;
- object storage;
- one LLM API integration.

Add a separate FastAPI service, Redis, pgvector, and expanded realtime infrastructure when the related features justify them. If PDF processing or AI workloads need isolation from the beginning, introduce FastAPI earlier.

---

# 22. Development Roadmap

## Phase 1 — Product and technical foundation

- finalize terminology and user flows;
- create repository structure;
- set up Next.js and TypeScript;
- set up Laravel API;
- configure PostgreSQL;
- define authentication and authorization;
- establish API conventions;
- create the initial design system;
- set up local development and environment configuration.

## Phase 2 — Study core

- study projects;
- material metadata;
- material units;
- study plans;
- study tasks;
- progress records.

## Phase 3 — Timer and focus workflow

- Pomodoro;
- session state machine;
- start/pause/resume/complete;
- timestamp-based timing;
- actual duration tracking;
- recovery after refresh and network interruption.

## Phase 4 — Planning engine

- workload calculation;
- daily scheduling;
- deadlines;
- task completion;
- manual edits;
- rescheduling.

## Phase 5 — Document processing and contextual AI

- secure upload;
- PDF text extraction;
- chapter/section detection;
- editable study-unit generation;
- selected-text AI actions;
- concise responses;
- processing status and error handling.

## Phase 6 — Realtime and reliability

- Laravel broadcasting/Reverb;
- client subscriptions;
- state invalidation/refetch;
- reconnect handling;
- transactions and idempotency;
- conflict testing across two clients.

Realtime fundamentals may be implemented earlier if cross-device operation is needed in the first usable version.

## Phase 7 — Adaptive planning and suggestions

- compare estimated versus actual duration;
- calculate cautious user-specific adjustment factors;
- recommend the next task;
- suggest rescheduling;
- show deadline risk.

## Phase 8 — Production readiness

- logs and monitoring;
- error tracking;
- rate limits;
- backup and restore procedures;
- security review;
- CI/CD;
- deployment;
- performance and load testing.

## Phase 9 — Mobile companion

After the Web product demonstrates repeated use:

- Flutter app;
- authentication;
- today's plan;
- quick study controls;
- progress and statistics;
- push notifications;
- quick quizzes and AI actions;
- realtime synchronization.

---

# 23. Future Features

These are candidates for later prioritization, not promises for the first release.

## 23.1 Smart Review

Suggest revisiting previously completed material.

## 23.2 Flashcards and spaced repetition

Generate optional flashcards and schedule reviews at intervals.

## 23.3 Exam mode

Given an exam date:

- estimate remaining workload;
- identify incomplete units;
- build a schedule;
- prioritize topics;
- show whether the goal is feasible.

## 23.4 Multiple subjects and goals

Example:

```text
University
├── Programming
├── Mathematics
└── Databases

Personal Learning
└── Language Study
```

## 23.5 Calendar integration

Potential integrations include Google Calendar, Apple Calendar, and Outlook Calendar.

## 23.6 Study groups and shared plans

Allow users to share a plan or coordinate study goals. Keep collaboration out of the MVP until there is evidence of demand.

## 23.7 Focus insights

Identify patterns such as session length or time of day associated with stronger completion rates. Present these as personal observations, not universal truths.

## 23.8 Goals, streaks, and achievements

Possible features:

- weekly study goals;
- monthly hour goals;
- streaks;
- milestones;
- achievements.

Gamification should reinforce useful behavior rather than become the product's focus.

## 23.9 More document formats

Support additional formats only after validating demand and safe extraction.

## 23.10 Accessibility and localization

- keyboard navigation;
- screen-reader support;
- adjustable text size;
- multiple interface languages;
- Arabic RTL support if required by the target audience.

---

# 24. Validation Metrics

The main question is whether the platform helps students study more consistently and finish planned work.

## Planning
- percentage of users who create a plan;
- percentage who start the recommended task;
- plan-edit frequency;
- plan completion rate.

## Execution
- focus sessions started and completed;
- average focused duration;
- interruption rate, if measured;
- number of study days per week.

## Estimate quality
- difference between estimated and actual time;
- whether estimates improve after enough observations;
- frequency of unrealistic plans.

## Retention
- daily and weekly active users;
- repeat sessions per user;
- return rate after first use.

## Outcomes
- material completion;
- deadline completion;
- quiz accuracy, if quizzes exist;
- consistency over time.

Do not optimize only for AI usage or time spent inside the app. A good organization tool may help a user finish efficiently and leave the app.

---

# 25. End-to-End Examples

## 25.1 Upload and plan a book

The student uploads `Python Fundamentals.pdf`.

1. Laravel validates the upload and stores the file.
2. A background job starts processing.
3. The document service extracts text and detects structure.
4. The system suggests chapters, sections, study units, and estimated duration.
5. The student edits the structure.
6. The student selects Pomodoro, daily availability, and a deadline.
7. The planning engine creates a daily plan.
8. The dashboard displays the next task.

## 25.2 Contextual AI help

The student selects:

> Python supports arbitrary positional arguments.

They choose **Simplify**.

The AI returns a short explanation, such as:

> A function can accept a variable number of positional arguments.

The assistant does not automatically launch into a full chapter explanation.

## 25.3 Completing a session on Mobile

The student is studying on the Web, but completes the focus session on Mobile.

```text
Mobile sends completion command
             ↓
Laravel validates current state
             ↓
Database transaction commits
             ↓
Backend broadcasts event
             ↓
Web client receives event
             ↓
Relevant query/cache updates
             ↓
Web shows completed state
```

If the Web client was disconnected, it fetches authoritative state after reconnect and corrects its display.

## 25.4 Learning from actual duration

The planner estimates a unit at 25 minutes. The student spends 42 minutes.

The system records both values. After sufficient observations, it may adjust future estimates for similar tasks. One unusual session should not cause a large permanent adjustment.

---

# 26. Architecture Decisions and Trade-Offs

## 26.1 Why Next.js instead of Flutter for the primary app?

The main experience is desktop-first and document-heavy. React's Web ecosystem is a natural fit for PDF viewers, text selection, sidebars, resizable panels, drag-and-drop, keyboard shortcuts, and browser workflows.

Flutter remains a good option for a later cross-platform mobile companion.

## 26.2 Why Laravel?

Laravel is suitable for authentication, relational data, validation, business rules, queues, notifications, and broadcasting. It also matches the existing skills and experience available for the project.

## 26.3 Why PostgreSQL?

The core data is relational and needs transactions and clear constraints. PostgreSQL is a good primary database and can support pgvector later if retrieval is useful.

## 26.4 Why a separate Python service?

Python has a strong ecosystem for document extraction and AI-related tooling. Separating these tasks keeps the main Laravel application focused on product rules.

The service should not be split out merely for architectural fashion. If the first MVP can be implemented reliably with fewer moving parts, defer the split until needed.

## 26.5 Why WebSockets plus REST?

REST handles explicit commands and normal queries. WebSockets notify active clients about changes. The database remains authoritative, and reconnect triggers reconciliation.

## 26.6 Why not promise zero synchronization errors?

Networks fail, clients sleep, and events can be missed. No architecture can promise that this never happens. The correct goal is controlled state transitions, automatic recovery, and no persistent silent divergence.

## 26.7 Why not build every platform at once?

Building Web and Mobile simultaneously increases UI, testing, offline, synchronization, and maintenance work. Validate the main Web workflow first, then build Mobile around demonstrated user needs.

---

# 27. Glossary

| Term | Meaning |
|---|---|
| Study project | A larger container for a goal, materials, plan, and progress |
| Study unit | A manageable piece of material, such as a section or topic |
| Study task | A planned action to work on a unit |
| Focus session | A timed work interval |
| Pomodoro | A focus-and-break strategy |
| Study plan | The schedule and ordering of work |
| Planning engine | Deterministic code that calculates and adjusts schedules |
| Contextual AI | AI invoked for a specific selection or narrow study task |
| RAG | Retrieval-Augmented Generation; supplying relevant source context to an LLM |
| Source of truth | The authoritative persisted state, here maintained by the backend/database |
| REST API | Request/response interface for commands and queries |
| WebSocket | Persistent connection used to deliver realtime events |
| Reconciliation | Refetching authoritative state and correcting stale client data |
| Idempotency | Repeating a command safely without duplicating its effect |
| Adaptive planning | Adjusting future plans using actual performance data |

---

# 28. Final Product Definition

> **A desktop-first study organization platform that converts learning materials and academic goals into structured, executable study plans; manages focus sessions and time; tracks actual progress; synchronizes state across connected devices; and improves future planning based on the student's behavior.**

The AI is deliberately a supporting, contextual assistant for small explanations, simplification, definitions, translation, short summaries, examples, and small questions. It is not the main product and is not intended to teach entire books or chapters.

The core product loop is:

```text
ORGANIZE
   ↓
PLAN
   ↓
EXECUTE
   ↓
MEASURE
   ↓
ADAPT
```

**Final development principle:** Build a reliable, genuinely useful study workflow first. Add AI, advanced adaptation, and Mobile expansion when they strengthen that workflow and when real users demonstrate the need.
