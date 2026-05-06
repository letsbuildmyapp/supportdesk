# SupportDesk

Customer support portal — portfolio app for [letsbuildmyapp.com](https://letsbuildmyapp.com).

Niche: SaaS product support. Three roles — **customer**, **agent**, **admin** — each with a tailored workspace against the same realtime data.

## Visual archetype

- **Modern minimal**: clean slate-50 background, warm orange primary, charcoal text, `rounded-2xl`, soft shadows (no glass blur).
- **Type:** Spline Sans + Spline Sans Mono.
- **Vibe:** Intercom/Front meets Linear.
- Light mode primary, dark mode supported via CSS vars.

## Stack

React 18 + TS + Vite, Tailwind, React Router v6, TanStack Query, Zustand, react-hook-form + zod, Framer Motion, lucide-react, sonner, cmdk. Firebase (Auth, Firestore, Storage, Functions TS, Hosting). Resend for email notifications (with fixture fallback when `RESEND_API_KEY` is unset).

## Run locally

```bash
# 1. Install
npm install
cd functions && npm install && cd ..

# 2. Start emulators (auth, firestore, functions, storage)
npm run emulators

# 3. In a second terminal, seed demo data
npm run seed

# 4. In a third terminal, run the dev server
npm run dev
# → http://localhost:5173
```

Hosting emulator runs on **port 5050** when started.

Firebase project ID for the demo: `demo-supportdesk`.

## Demo accounts

All passwords: `demo1234`

| Role | Email |
|---|---|
| Admin | `admin@supportdesk.demo` |
| Agent | `maya@supportdesk.demo`, `jordan@supportdesk.demo`, `priya@supportdesk.demo`, `tom@supportdesk.demo` |
| Customer | `sam@acme.demo`, `elena@globex.demo`, `raj@hooli.demo`, `mia@initech.demo`, `ben@stark.demo`, `noor@umbrella.demo` |

The Login page surfaces three one-click tiles — Customer / Agent / Admin — for fast role switching.

## Onboarding tour

First-run interactive spotlight tour, scoped per role per device.

| Role | Storage key | Steps |
|---|---|---|
| Customer | `supportdesk:tutorial_seen:customer` | 5 |
| Agent | `supportdesk:tutorial_seen:agent` | 5 |
| Admin | `supportdesk:tutorial_seen:admin` | 5 |

To re-trigger: `localStorage.removeItem('supportdesk:tutorial_seen:agent')` etc.

## Email notifications

Cloud Function `sendNotification` triggers on ticket creation, reply, and status change. With `RESEND_API_KEY` set, it sends real email via Resend. Without a key, it logs a fixture-mode payload to function logs — the demo works either way.

To enable real sends:

```bash
cd functions
firebase functions:secrets:set RESEND_API_KEY
```
