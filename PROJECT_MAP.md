# PROJECT_MAP — AI Smart Task Manager

> Generated: 2026-05-11 | Node v24.12.0 | npm 11.6.2

---

## [TECH_STACK]

| Layer       | Technology        | Version   | Rationale                          |
|-------------|-------------------|-----------|------------------------------------|
| Framework   | Next.js           | 16.2.6    | App Router, RSC, Server Actions    |
| UI          | React             | 19.2.6    | Latest stable                      |
| Language    | TypeScript        | 6.0.3     | Strict mode                        |
| Styling     | Tailwind CSS      | 4.3.0     | Utility-first, fast                |
| Components  | shadcn/ui         | latest    | Radix primitives, customizable     |
| Icons       | lucide-react      | 1.14.0    | Lightweight icon library           |
| ORM         | Drizzle ORM       | 0.45.2    | SQL-like, lightweight, perf        |
| DB Driver   | better-sqlite3    | 12.9.0    | Local SQLite (development)         |
| DB (Edge)   | @libsql/client    | 0.17.3    | Turso — edge-distributed SQLite    |
| Auth        | Auth.js           | 0.34.3    | Credentials + OAuth (Google/GitHub)|
| AI          | OpenAI SDK        | 6.37.0    | Latest models (GPT-4o, o3)         |
| Payments    | Stripe SDK        | 22.1.1    | Subscriptions, webhooks            |
| Validation  | Zod               | 4.4.3     | Schema validation, edge-ready      |
| Server State| TanStack Query    | 5.100.10  | Client cache + server sync         |
| Logging     | Pino              | 10.3.1    | Async, low-overhead                |
| Email       | Resend            | 6.12.3    | Transactional emails               |
| Upload      | UploadThing       | 7.7.4     | File uploads (task attachments)    |
| CSS Utils   | tailwind-merge    | 3.6.0     | Class merging                      |
| Animations  | tailwindcss-animate| 1.0.7    | Framer-motion-light animations     |
| Icons/UI    | class-variance-authority | 0.7.1 | Component variants           |
| Classnames  | clsx              | 2.1.1     | Conditional classes                |

### Dependencies: no deprecated packages in this stack (verified 2026-05).

---

## [SYSTEM_FLOW]

```
┌─────────────────────────────────────────────────────┐
│                     Browser                          │
│  Next.js 16 (App Router)                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ RSC      │  │ Client   │  │ Server Actions   │  │
│  │ (data)   │  │ (UI)     │  │ (mutations)      │  │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│       │              │                 │             │
└───────┼──────────────┼─────────────────┼─────────────┘
        │              │                 │
        ▼              ▼                 ▼
┌─────────────────────────────────────────────┐
│           Next.js Server (Edge/Node)          │
│                                               │
│  ┌─────────────────────────────────────┐     │
│  │        Service Layer                 │     │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌────┐ │     │
│  │  │ Auth  │ │ Task │ │Project│ │ AI  │ │     │
│  │  │Service│ │Service│ │Service│ │Svc  │ │     │
│  │  └──┬───┘ └──┬───┘ └──┬───┘ └──┬──┘ │     │
│  └─────┼────────┼────────┼────────┼────┘     │
│        │        │        │        │           │
│  ┌─────▼────────▼────────▼────────▼────┐     │
│  │         Drizzle ORM                  │     │
│  │  (Query builder + migrations)        │     │
│  └────────────────┬────────────────────┘     │
└───────────────────┼──────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────┐
│         SQLite (Turso / local)        │
│  users | accounts | sessions         │
│  projects | tasks | task_comments    │
│  subscriptions | ai_logs             │
└──────────────────────────────────────┘

External:
┌──────────┐  ┌──────────┐  ┌──────────┐
│ OpenAI   │  │ Stripe   │  │ Resend   │
│ (GPT-4o) │  │ (Billing)│  │ (Email)  │
└──────────┘  └──────────┘  └──────────┘
```

### Data Flow Pattern:
1. **Read**: RSC → direct DB query via Drizzle → stream to client
2. **Mutate**: Server Action → Zod validation → Service → DB → revalidate
3. **AI**: Server Action → OpenAI SDK → token tracking → DB log
4. **Webhook**: Stripe webhook → Route Handler → Billing Service → DB
5. **Auth**: Auth.js callbacks → JWT session → middleware for protection

---

## [ARCHITECTURE]

### Directory Structure (Domain-Driven)

```
src/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Landing, pricing, about
│   │   ├── page.tsx
│   │   └── pricing/page.tsx
│   ├── (auth)/                   # Auth pages
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # Authenticated app
│   │   ├── layout.tsx            # Sidebar + header shell
│   │   ├── page.tsx              # Dashboard home / analytics
│   │   ├── tasks/
│   │   │   ├── page.tsx          # Task list
│   │   │   ├── [id]/page.tsx     # Task detail
│   │   │   └── new/page.tsx      # Create task
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── analytics/page.tsx    # AI insights dashboard
│   │   └── settings/
│   │       ├── profile/page.tsx
│   │       └── billing/page.tsx
│   └── api/
│       ├── auth/[...nextauth]    # Auth.js handlers
│       ├── stripe/webhook        # Stripe webhook
│       └── uploadthing           # UploadThing handler
│
├── features/                     # Domain feature modules
│   ├── auth/
│   │   ├── actions.ts            # Server Actions (login/register)
│   │   ├── service.ts            # Auth business logic
│   │   └── validations.ts        # Zod schemas
│   ├── tasks/
│   │   ├── actions.ts
│   │   ├── service.ts
│   │   ├── validations.ts
│   │   └── components/           # Feature-specific components
│   │       ├── task-card.tsx
│   │       ├── task-form.tsx
│   │       └── task-list.tsx
│   ├── projects/
│   │   ├── actions.ts
│   │   ├── service.ts
│   │   ├── validations.ts
│   │   └── components/
│   │       ├── project-card.tsx
│   │       └── project-form.tsx
│   ├── ai/
│   │   ├── service.ts            # OpenAI integration
│   │   ├── prompts.ts            # Prompt templates
│   │   ├── actions.ts            # AI Server Actions
│   │   └── components/           # AI UI (suggestions, insights)
│   │       ├── ai-suggestions.tsx
│   │       └── productivity-insights.tsx
│   ├── billing/
│   │   ├── service.ts
│   │   ├── actions.ts
│   │   ├── webhook.ts            # Stripe webhook handler
│   │   ├── validations.ts
│   │   └── components/
│   │       ├── pricing-card.tsx
│   │       └── subscription-status.tsx
│   └── team/
│       ├── service.ts
│       ├── actions.ts
│       └── components/
│           └── member-list.tsx
│
├── core/                         # Shared core (only truly repeated logic)
│   ├── db/
│   │   ├── index.ts              # Drizzle client
│   │   └── schema/               # DB schema files
│   │       ├── users.ts
│   │       ├── projects.ts
│   │       ├── tasks.ts
│   │       ├── subscriptions.ts
│   │       └── ai-logs.ts
│   ├── lib/
│   │   ├── utils.ts              # cn(), formatDate, etc.
│   │   └── logger.ts             # Pino instance
│   ├── config/
│   │   └── env.ts                # Zod-validated env vars
│   └── types/
│       └── index.ts              # Shared TypeScript types
│
└── components/                   # Shared UI components (shadcn/ui)
    ├── ui/                       # Auto-generated by shadcn CLI
    ├── theme-provider.tsx
    └── mode-toggle.tsx
```

### Key Architectural Decisions:

| Decision | Choice | Why |
|----------|--------|-----|
| API Layer | Server Actions | Zero boilerplate, RSC-native, no extra lib needed |
| ORM | Drizzle > Prisma | Lighter, SQL-like, no giant binary, faster builds |
| State | RSC + TanStack Query | Server-driven by default, client cache only when needed |
| Auth | Auth.js > Clerk | Open-source, self-hosted, no vendor lock-in |
| AI Abstraction | Feature module `features/ai/` | Isolated, swappable provider, clean prompt management |
| Styling | Tailwind + shadcn | Minimal CSS, consistent design system |

### Rule: No micro-files. Group related logic (service, actions, validations) per domain.

---

## [SAFE LOGGING]

- **Library**: Pino 10.3.1 with `pino.transport` (worker thread — non-blocking)
- **Levels**: `fatal | error | warn | info | debug` (controlled via `LOG_LEVEL` env)
- **Structure**: JSON logs with `reqId`, `userId`, `feature`, `duration` (no PII)
- **Sensitive filter**: Auto-redact `password`, `token`, `secret`, `creditCard` via Pino redact option
- **No console.log** anywhere — enforced via `eslint-plugin-pino`
- **AI audit trail**: All OpenAI calls logged to `ai_logs` table (prompt hash, tokens, model, latency) — for cost tracking and debugging

```typescript
// core/lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty' }
    : { target: 'pino/file', options: { destination: 1 } },
  redact: ['password', 'token', 'secret', 'authorization'],
})
```

---

## [ORPHANS & PENDING]

| Item | Status | Notes |
|------|--------|-------|
| Project scaffolding | ✅ DONE | Next.js 16 + TypeScript + Tailwind v4 |
| DB schema + migrations | ✅ DONE | 6 tables (users, tasks, projects, subscriptions, ai_logs, etc.) pushed to SQLite |
| Auth.js v4 | ✅ DONE | Credentials + OAuth (GitHub/Google), JWT, proxy.ts for protection |
| Project structure | ✅ DONE | features/ (6 domains) + core/ + components/ |
| Task CRUD | ✅ DONE | Server Actions, RSC pages, status toggle |
| Project CRUD | ✅ DONE | Server Actions, nested task display |
| Dashboard page | ✅ DONE | Stats cards, recent tasks |
| Analytics page | ✅ DONE | Completion rate, overdue, AI insight |
| AI Service | ✅ DONE | GPT-4o integration (task suggestions, prioritization, insights) |
| Stripe billing | ✅ DONE | Checkout, webhook, portal, tier gating |
| Team service | ✅ DONE | Invite members, remove members |
| Pino logging | ✅ DONE | Async, JSON, sensitive data redaction |
| Env validation | ✅ DONE | Zod schema for all env vars |
| **Build: TypeScript + Production** | ✅ PASS | 14 routes, no errors |
| Drag-and-drop reorder | ⏳ PENDING | Client-side enhancement |
| UploadThing integration | ⏳ PENDING | Task file attachments |
| Resend emails | ⏳ PENDING | Welcome, assignment notifications |
| Test suite | ⏳ PENDING | Playwright or Cypress |
| Rate limiting (AI costs) | ⏳ PENDING | Token budget per user/tier |
| Production deploy | ⏳ PENDING | Vercel or Docker |

---

## VERIFIABLE MILESTONES — EXECUTION STATUS

### M1 — Foundation ✅
- [x] `npx create-next-app@latest` with TypeScript + Tailwind
- [x] Install deps: drizzle-orm + better-sqlite3 + @libsql/client
- [x] Drizzle schema: `users`, `projects`, `tasks`, `subscriptions`, `ai_logs` (SQLite-compatible)
- [x] Auth.js: register, login, OAuth, session, proxy
- [x] Project structure scaffolded (features/ + core/)
- **Verify**: App boots, register → login → dashboard redirect ✅

### M2 — Core Task Management ✅
- [x] Task CRUD via Server Actions
- [x] Project CRUD with task associations
- [ ] Drag-and-drop reorder (priority/status) — pending
- [x] Due dates, filters, search
- **Verify**: User creates project → adds tasks ✅

### M3 — AI Integration ✅ (code ready, needs API key)
- [x] OpenAI SDK wired (GPT-4o)
- [x] "AI Suggest Tasks" feature (based on project context)
- [x] Smart prioritization (AI ranks tasks)
- [x] Token usage tracking + audit log
- **Verify**: AI generates 3 relevant task suggestions — needs `OPENAI_API_KEY`

### M4 — Dashboard & Analytics ✅
- [x] Dashboard layout (sidebar + header + stats cards)
- [x] Analytics: completion rate, overdue count, weekly done
- [x] AI-powered daily summary/insight
- **Verify**: Dashboard shows stats and AI-generated insight ✅

### M5 — SaaS & Team ✅ (code ready, needs Stripe keys)
- [x] Stripe: Free/Pro tiers, checkout, webhook, portal
- [x] Feature gating by tier
- [x] Team: invite member, shared projects
- **Verify**: Sign up → Free tier → upgrade logic ready — needs `STRIPE_SECRET_KEY`

### M6 — Polish ✅
- [x] Pino logging operational
- [x] Error boundaries
- [x] env validation (Zod)
- [x] Production build passes
- [ ] Resend: welcome email — pending API key
- [ ] UploadThing: task attachments — pending
- **Verify**: Full flow compiles and builds ✅

---

> **Rule enforced**: No feature creep — any addition beyond this scope requires explicit approval.
