# SupportDesk

Premium customer-support portal for SaaS teams. Built as a one-day portfolio
demo for [letsbuildmyapp.com](https://letsbuildmyapp.com).

This is a **showcase demo**, not a real product. There is no signup, no real
auth, no real backend. Everything is local to the browser. Click any role tile
on the login screen to step inside.

## Visual archetype

- **Glassy / Apple-esque.** visionOS / premium B2B SaaS energy. Soft gradient
  meshes drifting behind every page; frosted-glass surfaces on every card and
  panel; layered depth via blur and shadow.
- **Type:** Newsreader (display, modern editorial serif at 400/600 + italic)
  + Geist (UI body) + Geist Mono (numbers, kbd hints). The serif/sans pairing
  gives the typographic contrast that makes the glassy archetype read as
  refined rather than templated.
  - Newsreader is used for page titles, hero headlines, ticket subjects in
    detail views, and section headers ≥22px.
  - Geist is used for everything ≤22px: body, UI labels, button text,
    table cells, metadata.
  - Body type stays at 16px minimum on public surfaces, 14px floor in dense
    data views with `tabular-nums`, per STACK.md.
- **Palette (OKLCH-authored, see `src/index.css`).** All body text passes WCAG
  AA on every surface in both light and dark modes (≥4.5:1).
  - Light:
    - `--bg` `oklch(0.985 0.005 285)` off-white with cool cast
    - `--fg` `oklch(0.18 0.018 285)` near-black
    - `--accent` `oklch(0.52 0.250 305)` electric violet
    - `--mesh-1..4`: peach, lavender, mint, warm cream pastels
  - Dark:
    - `--bg` `oklch(0.13 0.025 285)` deep midnight
    - `--fg` `oklch(0.96 0.010 285)` near-white
    - `--accent` `oklch(0.72 0.220 305)` lifted violet
    - `--mesh-1..4`: deep violet, indigo, teal, plum
  - Status colors (used identically in both modes, lifted lightness in dark):
    Open electric blue, Pending amber, Resolved emerald, Closed slate,
    Breach coral.
- **Radius:** `rounded-2xl` (1rem) consistently across all elements.
- **Modes:** dark primary in design, light fully supported. System-preference
  default. Toggle in the user menu (top right) or via Cmd-K.

## The fictional org

**Northwind Cloud Services** — B2B infrastructure SaaS for mid-market
companies. Customers are infra leads, founders, and CTOs at SaaS / consumer-
app companies running their workloads on Northwind. The seeded tickets reflect
the real shape of an infra-SaaS support queue: webhook signatures, deploy
failures, SSO setup, billing edge cases, performance complaints, feature
requests.

## Seeded identities

Click any tile on the login screen to enter as that role.

| Role | Identity | Title |
|---|---|---|
| Customer | Aisha Mansour | Infrastructure Lead, Cobalt Health (Enterprise) |
| Agent | Priya Bhatt | Senior Support Agent · Billing |
| Manager | Wesley Park | Support Manager |
| Admin | Maya Okonkwo | Head of Customer Operations |

Three additional agents (Tomás Rivera · Integrations, Lena Kowalski ·
Performance, Jordan Cho · Onboarding) populate the team queue and the
@-mention picker. Twelve customer accounts populate the customer roster, with
realistic plan distribution (1 Free, 4 Starter, 5 Growth, 2 Enterprise).

Switch roles at any time from the avatar menu top-right — handy for the
demo so a prospect can see the customer view, the agent view, and the
manager dashboard in one session.

## Run

```bash
npm install
npm run dev
```

## Reset demo

In the user menu (top right) or via the command palette (`⌘K → Reset demo
data`). Wipes everything under the `supportdesk:` namespace in `localStorage`
and reloads to a fresh seed. Useful before a sales call.

## Cmd-K command palette

`⌘K` (or `Ctrl+K`) anywhere in the app. Searches tickets by ID/subject,
articles by title/tag, customers by name/email/company, plus quick-nav to any
admin page, theme toggle, and reset demo.

## Two-tab live sync

Open the app in two browser tabs and switch role between them. When one tab
mutates a ticket (reply, status change, assignment), the other tab updates via
`localStorage` `storage` events. The "real-time" demo moment without
websockets.

## Onboarding tour

Per-role storage keys: `supportdesk:tutorial_seen:<role>`. Each role gets its
own step list. Spotlight-style on ≥768px viewports with a cutout and accent
ring; centered modal fallback below 768px or for steps without a target.
Keyboard nav (Esc closes, ←/→ step, Enter advances), click-outside dismisses,
clickable step dots, body scroll lock.

## Stack

- **Vite + React 18 + TypeScript** — Vite-bundled SPA.
- **Tailwind CSS** for styling, with a Glassy-archetype design system under
  `src/index.css` (OKLCH tokens, frosted-glass utilities, gradient mesh
  background, animated drift).
- **Zustand** for state (auth + appData), persisted to `localStorage`.
- **TanStack Query** for cache shape (no real backend; queries are no-ops).
- **React Router v6** for routing.
- **Framer Motion** for the gradient mesh drift, modals, tour transitions.
- **dnd-kit** for ticket drag-and-drop reassignment in the team queue.
- **react-markdown + remark-gfm** for rendering markdown in tickets and KB.
- **react-dropzone** for file uploads (simulated locally, images stored as
  base64 data URLs up to 2MB so previews work).
- **cmdk** for the command palette.
- **Recharts** for the metrics dashboard.
- **sonner** for toasts.
- **lucide-react** for icons.

## What's simulated

| Real product would use | Demo uses |
|---|---|
| Firebase Auth + role tiles | Role tile picker writes `currentUserId` to localStorage |
| Firestore | Zustand store persisted to localStorage |
| Cloud Storage uploads | `react-dropzone` + `FileReader` → base64 in localStorage (images <2MB) |
| Resend email | Outbox in localStorage, full HTML preview in the Notifications log admin page |
| AI features | Out of scope for this demo |
| Stripe billing | Plan field on customer record; no real billing flow |

## Deploy

```bash
# staging
npm run deploy:staging
# prod
npm run deploy:prod
```

Two Firebase Hosting sites: `supportdesk-lbma-staging` and
`supportdesk-lbma-prod`, both under the `supportdesk-lbma` Firebase project.

## Manual smoke test

1. Click the **Customer** tile → search the KB ("webhook") → submit a new
   ticket with a screenshot attachment → see the ticket detail.
2. Open avatar menu → switch to **Agent** → see the new ticket in
   *Unassigned* → assign to self → reply with markdown → add an internal note
   with `@tomas-rivera` mention → mark Resolved.
3. Switch to **Customer** → see the agent reply → submit 5-star CSAT.
4. Switch to **Manager** → metrics dashboard reflects the new resolution and
   CSAT; SLA monitor shows tickets within targets.
5. Switch to **Admin** → Notifications log shows the emails generated by the
   above flow.

## Decisions to revisit

A few autonomous choices on this build that may be worth revisiting:

- **Accent color: electric violet `oklch(0.52 0.250 305)` (light), `oklch(0.72
  0.220 305)` (dark).** Reads as confident and premium next to TalentBoard's
  electric green and EventDock's electric blue. If you'd like something
  warmer or more muted, the swap is one variable in `src/index.css`.
- **Status colors.** Open `oklch(0.55 0.215 254)` blue, Pending `oklch(0.72
  0.165 65)` amber, Resolved `oklch(0.62 0.155 158)` emerald, Breach `oklch(0.58
  0.220 22)` coral. Resolved-emerald sits next to CashWise's emerald gain
  but here it's one of several status colors, not a brand color. If that
  collision bothers you, push it to a deeper green.
- **Gradient mesh stops.** Light: peach / lavender / mint / cream pastels at
  ~65% opacity. Dark: deep violet / indigo / teal / plum at ~55%. Slow drift
  animations (28–36s loops). Could be tuned for less motion if motion-
  sensitive prospects come up.
- **Fictional org: Northwind Cloud Services.** B2B infra SaaS framing.
  Reasonable for the glassy / premium archetype. If you'd rather pitch
  SupportDesk to consumer-app companies or agencies-with-clients,
  re-skinnable in `src/lib/seed.ts` (`orgSettings`) plus seeded ticket
  bodies.
- **Copy tone on the customer portal.** Calm, confident, "Help, refined."
  hero. If you'd rather it lean warmer ("We're here when you need us") or
  more enterprise ("Mission-critical support, on call"), all hero copy is in
  `src/pages/Login.tsx` and `src/pages/portal/Landing.tsx`.
- **The four agent identities and the manager/admin.** Maya Okonkwo, Wesley
  Park, Priya Bhatt, Tomás Rivera, Lena Kowalski, Jordan Cho. Names chosen
  to read as a real, modern, internationally-mixed support team. Easy to
  swap in `src/lib/seed.ts`.
- **SLA policy numbers.** Standard 4h first response / 24h resolution;
  Priority 1h / 8h; VIP 30min / 4h. These are realistic for a B2B-infra
  support team. Adjust in the SLA admin page or in seed.
- **Bundle size.** 1.36MB JS (395KB gzipped). Recharts + framer-motion + dnd-
  kit + cmdk are the big contributors. Acceptable for a demo where prospects
  are on broadband; if you want to slim it, route-level code splitting on
  the manager/admin views buys ~150KB.
- **Two-tab sync** is wired but only fires on `storage` events. If a prospect
  asks for "real-time across devices," that's the right place to point at a
  Firestore `onSnapshot` listener in a real build.

—

Built for letsbuildmyapp.com. Glassy archetype, OKLCH palette, AA contrast
verified.
