# ProcureFlow — Inventory Procurement Web Application

A frontend implementation of the **Inventory Procurement** case study: Purchase Request → Approval → Purchase Order → Goods Receipt → Inventory Updated.

This repository is the **frontend only**, built to be connected to a real backend later without structural changes (see [Mock API / Data Strategy](#mock-api--data-strategy)).
---

## Project Overview

ProcureFlow lets warehouse **USER**s raise Purchase Requests, **APPROVER**s approve or reject them, and — once approved — the resulting Purchase Order can be partially or fully received against, with inventory updating live as goods arrive.

Implemented screens:

- **Dashboard** — summary metrics + recent activity feed
- **Purchase Requests** — list (search/status filter), create, edit (DRAFT only), detail with role-based actions (Edit/Submit, Approve/Reject with required rejection reason)
- **Purchase Orders** — list (search/status filter), detail with per-item receiving breakdown and progress
- **Goods Receipt** — modal form off the PO detail page, validated against remaining quantity
- **Inventory** — stock list (search/warehouse filter) with a movement-history drill-down (point-plus feature)

Role is simulated via a **Role Switcher** in the top bar (no real authentication, per the out-of-scope list). A **Demo** menu next to it lets you force the next request to fail, to preview the Error state on demand.

---

## Tech Stack

| Concern | Choice | Why |
|---|---|---|
| Language | TypeScript | Type-safe domain modeling across the whole data flow |
| Framework | React 19 | Required stack |
| Build tool | Vite | Fast dev/build, first-class TS + plugin ecosystem |
| Routing | TanStack Router (file-based, code-split) | Requested "point plus"; fully typed routes/params |
| Server state | TanStack Query | Caching, invalidation, loading/error states without hand-rolled state machines |
| Styling | Tailwind CSS v4 | Requested preferred stack; utility-first, themeable via `@theme` tokens |
| Components | Radix UI primitives + a small shadcn-style layer (`src/components/ui`) | Accessible primitives (focus trap, keyboard nav, ARIA) without pulling in a full component library |
| Forms | React Hook Form + Zod | Requested point-plus; schema-driven validation shared between fields |
| Testing | Vitest + React Testing Library | Fast, Vite-native, good RTL ergonomics for behavior tests |
| Icons | lucide-react | Consistent icon set, tree-shakeable |
| Toasts | sonner | Lightweight success/error feedback |

---

## Project Structure

```
src/
├── api/
│   ├── mock-db.ts                  # single in-memory "database" + seed data
│   ├── http/simulated-network.ts   # latency + forced-error simulation
│   └── repositories/
│       ├── types.ts                # repository INTERFACES (the abstraction boundary)
│       ├── index.ts                # composition root — swap Mock*Repository for Http*Repository here
│       └── mock/                   # mock implementations, one per aggregate
├── types/                          # domain.ts (entities) + api.ts (ApiError, pagination)
├── lib/                            # cn(), formatters, query-keys, query-client, PO business rules
├── hooks/                          # cross-feature hooks (reference data, id -> entity lookups)
├── context/                        # session-context.tsx — simulated auth / role switcher
├── components/
│   ├── ui/                         # design-system primitives (Button, Select, Dialog, Table, ...)
│   ├── shared/                     # app-level reusable components (EmptyState, StatusBadge, ...)
│   └── layout/                     # AppShell, sidebar, role switcher, debug menu
├── features/
│   ├── dashboard/
│   ├── purchase-requests/          # schema, permissions, hooks, components, pages
│   ├── purchase-orders/
│   └── inventory/
├── routes/                         # TanStack Router file-based routes (thin — delegate to features/*)
└── test/                           # vitest setup + render helpers
```

**Why this split:** `api/` never leaks into components — every feature talks to `repositories.*` (typed interfaces), never to `mock-db.ts` directly. `features/*` own business logic and page composition; `components/ui` and `components/shared` are the only things allowed to be generic/reused across features. Routes stay intentionally thin (a route = params + which page component to render), so routing concerns don't bleed into business logic.

### Design System

A small set of Radix-based primitives in `components/ui` (Button, Badge, Input, Select, Dialog, Tabs, Table, Progress, DropdownMenu, ...) plus app-specific shared components in `components/shared` (`StatusBadge`, `EmptyState`, `ErrorState`, `ConfirmDialog`, `PageHeader`, `FormField`, skeletons). Every status pill in the app (PR and PO) goes through the single `StatusBadge` mapping table, so status colors can't drift between screens.

---

## Setup

```bash
npm install
```

### Environment Variables

None required — the app runs entirely against the in-memory mock backend described below. (No `.env` file is needed for this submission; if a real API is wired in later, a `VITE_API_BASE_URL` variable would be the natural place to start.)

## Run Application

```bash
npm run dev       # start the Vite dev server (http://localhost:5173)
npm run build     # type-check (tsc -b) + production build to dist/
npm run preview   # preview the production build locally
npm run lint      # oxlint
```

## Testing

```bash
npm run test        # run once (CI mode)
npm run test:watch  # watch mode
npm run test:ui     # Vitest UI
```

24 tests across 5 files, focused on **behavior over rendering**:

- `features/purchase-requests/schema.test.ts` — quantity > 0, duplicate product, required warehouse/items
- `features/purchase-requests/permissions.test.ts` — USER cannot see approval actions; APPROVER can only act on SUBMITTED requests
- `api/repositories/mock/purchase-request.repository.test.ts` — DRAFT→SUBMITTED→APPROVED/REJECTED transitions, approving a request creates a PO, rejecting requires a reason
- `api/repositories/mock/purchase-order.repository.test.ts` — Goods Receipt cannot exceed remaining quantity, a successful receipt updates received/remaining and inventory stock, PO status derives correctly (ORDERED → PARTIALLY_RECEIVED → RECEIVED)
- `features/purchase-requests/components/approval-actions.test.tsx` — component-level test asserting Reject is blocked without a reason, and that a successful approve/reject updates state without a page reload

## Mock API / Data Strategy

There is no real backend. Instead:

- `api/mock-db.ts` holds a single in-memory, seeded "database" (warehouses, products, purchase requests, purchase orders, goods receipts, inventory, movements).
- `api/http/simulated-network.ts` wraps every mock repository call so it behaves like a real network request: **300–800ms latency**, and a **"force error" toggle** (persisted to `localStorage`, flippable from the Demo menu in the top bar) that makes the next call throw, so the Error + "Try Again" state can be demonstrated without devtools. Both are disabled in the test environment so the test suite stays fast.
- Every feature depends on the `PurchaseRequestRepository` / `PurchaseOrderRepository` / etc. **interfaces** in `api/repositories/types.ts`, composed in `api/repositories/index.ts`. To connect a real backend, add `Http*Repository` classes implementing the same interfaces and swap the instantiation in that one file — no hook, page, or component needs to change.
- Business rules that must hold regardless of transport (quantity > 0, no duplicate product, receipt ≤ remaining, valid status transitions) live **inside the repository**, not just in the form — so they'd still be enforced even if a future UI bypassed the form.

## Engineering Decisions

1. **TanStack Query owns all server state; component/local state is only ever used for pure UI state** (which dialog is open, form field values before submit, search/filter text). This keeps "what did the server say" and "what is the user doing right now" from ever being tangled together, and it's what makes cache invalidation (e.g. approving a PR refreshing both the PR list *and* the PO list) declarative instead of manual prop-drilling.

2. **Repository pattern with interfaces, not a hooks-call-fetch-directly approach.** `features/*/hooks` never talk to `mock-db.ts`; they only talk to `repositories.*`, which are typed interfaces (`api/repositories/types.ts`) backed today by mock implementations. This is the seam where a real backend plugs in later — swap the composition in `api/repositories/index.ts`, nothing else changes. It also makes the repository classes independently testable (see the two `*.repository.test.ts` files), without needing to render any React at all.

3. **Business rules live in the data layer, not only in the form.** Zod validates the *form* (fast feedback, inline errors), but the mock repository re-validates the same rules (quantity > 0, no duplicate product, status transitions, receipt ≤ remaining) before mutating state. A real backend would do the same — the frontend shouldn't be the only thing standing between a bad request and bad data, so the mock backend was built the same way on purpose.

4. **Responsive tables become cards below `md`, not a horizontally-scrolled shrunken table.** Every list page (PRs, POs, Inventory) renders a `<table>` on `md:` and up and a stacked card list below it, both fed by the same filtered data array. This was chosen over "just let the table scroll" because request/order lists are read far more often on a phone in a warehouse aisle than on a desktop, and a cramped 6-column table is unusable there.

5. **Approving a Purchase Request automatically creates a Purchase Order** (see Assumptions below) rather than requiring a separate manual "create PO" step, since the requirement document has no such screen. This is implemented as a side effect inside `MockPurchaseRequestRepository.approve()` so the rule is enforced in one place, and the resulting PO is linked back to its originating PR (visible as a "Resulting Purchase Order" card on the PR detail page) so the end-to-end flow is easy to follow during a demo.

6. **A single `StatusBadge` component maps every PR/PO status to a label + color**, instead of each page choosing its own badge colors. This was worth the small abstraction because PR and PO status vocabularies are easy to visually confuse (`SUBMITTED` vs `ORDERED`, `APPROVED` vs `RECEIVED`) — centralizing it means a status always looks the same everywhere it appears (list, detail, dashboard activity feed).

## Assumptions

The requirement document intentionally leaves some conditions to engineering judgment. Assumptions made, in order of impact:

- **Approving a Purchase Request automatically creates a Purchase Order.** The brief describes PR → Approval → PO → GR → Inventory as one continuous flow and gives USER/APPROVER permissions for PRs and Goods Receipt, but never describes a manual "create PO" action or screen. Auto-generating a PO (one supplier, items copied 1:1 from the PR) on approval was the most defensible reading of "the process the company wants to run," and keeps the demo flow (PR → Approve → see PO → receive) working end to end.
- **An APPROVER can only approve or reject a Purchase Request that is currently SUBMITTED.** (Given as the example assumption in the brief; implemented exactly as stated, enforced in the repository, not just hidden in the UI.)
- **Creating a Purchase Request always creates it as DRAFT.** "Submit" is a separate, explicit action from the PR detail page (with its own confirmation dialog), matching the brief's own status-based action table (`DRAFT` → Edit/Submit). This also means "Submit Form" in the Create-PR section of the brief refers to *saving the draft*, not submitting for approval — the two are already described as distinct actions elsewhere in the document.
- **Rejected Purchase Requests are terminal.** The brief doesn't describe resubmission of a REJECTED request, and the status enum (`DRAFT | SUBMITTED | APPROVED | REJECTED`) has no "back to DRAFT" transition, so REJECTED has no further actions available, matching "action yang sudah tidak valid sebaiknya tidak tersedia."
- **Goods Receipt is a USER action**, per the explicit USER capability list ("mencatat Goods Receipt"), gated additionally on PO status being `ORDERED` or `PARTIALLY_RECEIVED`.
- **A Purchase Order can have multiple line items, each received independently and partially**, with the PO's overall status derived from the sum of all lines (`deriveReceivingStatus` in `lib/purchase-order-rules.ts`) rather than tracked as a separate field — this guarantees the status can never drift out of sync with the actual received quantities.
- **Unsaved-form navigation protection** is implemented as a basic `beforeunload` warning (browser tab close/refresh) rather than an in-app route-leave confirmation, since the brief marks this optional and a full router-level guard would add meaningful complexity for a "nice to have."
- **Duplicate-product prevention** is enforced both while adding a new row (the dropdown disables already-selected products) and on submit (schema + repository), rather than only one or the other, since both a proactive and a defensive check are cheap and the brief explicitly calls out this rule.

## Limitations / What I'd Do With More Time

- No pagination — lists are rendered in full, which is fine for the seeded dataset size but wouldn't scale.
- No E2E tests (Playwright/Cypress) — only unit + component tests, per the brief marking E2E as optional.
- No dark mode, no CI pipeline, no deployment — all explicitly optional in the brief.
- Figma-exact spacing/typography couldn't be verified since the design file wasn't reachable in this environment; a follow-up pass against the real file would likely adjust spacing scale and possibly font choice.
