// SupportDesk · Seed
// Northwind Cloud Services — B2B infra SaaS for mid-market companies.
// One run on first load (sentinel `supportdesk:seeded:v1`). Reproducible via PRNG.

import { SEED_KEY, STORAGE_KEY, uid, ticketId as makeTicketId, mulberry32 } from "./utils";
import type {
  AppData,
  CannedResponse,
  Category,
  Email,
  KbArticle,
  Notification,
  Reply,
  SlaPolicy,
  Ticket,
  TicketEvent,
  TicketStatus,
  User,
} from "./types";

function isoDaysAgo(days: number, hours = 0, mins = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours, d.getMinutes() - mins, 0, 0);
  return d.toISOString();
}
function isoMinsAgo(mins: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - mins, 0, 0);
  return d.toISOString();
}
function isoHoursAgo(hours: number, mins = 0): string {
  const d = new Date();
  d.setHours(d.getHours() - hours, d.getMinutes() - mins, 0, 0);
  return d.toISOString();
}

// Avatar URLs from public, royalty-free sources. Using DiceBear avatars + Unsplash portraits.
function dicebear(seed: string, style = "lorelei"): string {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

export function buildSeed(): AppData {
  const rng = mulberry32(424242);

  // ---------- Users
  const admin: User = {
    id: "u_admin",
    role: "admin",
    name: "Maya Okonkwo",
    email: "maya@northwindcloud.com",
    avatar: dicebear("Maya Okonkwo"),
    title: "Head of Customer Operations",
    team: "Customer Ops",
    online: true,
    joinedAt: isoDaysAgo(680),
  };
  const manager: User = {
    id: "u_manager",
    role: "manager",
    name: "Wesley Park",
    email: "wesley@northwindcloud.com",
    avatar: dicebear("Wesley Park"),
    title: "Support Manager",
    team: "Support",
    online: true,
    joinedAt: isoDaysAgo(420),
  };
  const agents: User[] = [
    {
      id: "u_priya",
      role: "agent",
      name: "Priya Bhatt",
      email: "priya@northwindcloud.com",
      avatar: dicebear("Priya Bhatt"),
      title: "Senior Support Agent · Billing",
      team: "Support",
      online: true,
      joinedAt: isoDaysAgo(390),
    },
    {
      id: "u_tomas",
      role: "agent",
      name: "Tomás Rivera",
      email: "tomas@northwindcloud.com",
      avatar: dicebear("Tomas Rivera"),
      title: "Support Agent · Integrations",
      team: "Support",
      online: true,
      joinedAt: isoDaysAgo(220),
    },
    {
      id: "u_lena",
      role: "agent",
      name: "Lena Kowalski",
      email: "lena@northwindcloud.com",
      avatar: dicebear("Lena Kowalski"),
      title: "Support Agent · Performance",
      team: "Support",
      online: false,
      joinedAt: isoDaysAgo(180),
    },
    {
      id: "u_jordan",
      role: "agent",
      name: "Jordan Cho",
      email: "jordan@northwindcloud.com",
      avatar: dicebear("Jordan Cho"),
      title: "Onboarding Specialist",
      team: "Support",
      online: true,
      joinedAt: isoDaysAgo(60),
    },
  ];

  const customers: User[] = [
    { id: "c_rina", role: "customer", name: "Rina Singh", email: "rina@northwindlogistics.io", avatar: dicebear("Rina Singh"), company: "Northwind Logistics", title: "Operations Lead", joinedAt: isoDaysAgo(280), plan: "Growth" },
    { id: "c_ben", role: "customer", name: "Ben Hartley", email: "ben@mossfield.studio", avatar: dicebear("Ben Hartley"), company: "Mossfield Studios", title: "Founder", joinedAt: isoDaysAgo(95), plan: "Starter" },
    { id: "c_aisha", role: "customer", name: "Aisha Mansour", email: "aisha@cobalthealth.com", avatar: dicebear("Aisha Mansour"), company: "Cobalt Health", title: "Infrastructure Lead", joinedAt: isoDaysAgo(540), plan: "Enterprise" },
    { id: "c_marcus", role: "customer", name: "Marcus Reeves", email: "marcus@riversidetax.com", avatar: dicebear("Marcus Reeves"), company: "Riverside Tax Group", title: "CTO", joinedAt: isoDaysAgo(360), plan: "Growth" },
    { id: "c_yuki", role: "customer", name: "Yuki Tanaka", email: "yuki@lumentravel.co", avatar: dicebear("Yuki Tanaka"), company: "Lumen Travel", title: "Operations Engineer", joinedAt: isoDaysAgo(210), plan: "Growth" },
    { id: "c_diego", role: "customer", name: "Diego Soto", email: "diego@ferryhaul.app", avatar: dicebear("Diego Soto"), company: "FerryHaul", title: "Founder", joinedAt: isoDaysAgo(72), plan: "Starter" },
    { id: "c_freya", role: "customer", name: "Freya Olsen", email: "freya@kestrelanalytics.io", avatar: dicebear("Freya Olsen"), company: "Kestrel Analytics", title: "Head of Platform", joinedAt: isoDaysAgo(620), plan: "Enterprise" },
    { id: "c_henry", role: "customer", name: "Henry Chu", email: "henry@bluewaveimaging.com", avatar: dicebear("Henry Chu"), company: "Bluewave Imaging", title: "Engineering Lead", joinedAt: isoDaysAgo(310), plan: "Growth" },
    { id: "c_naomi", role: "customer", name: "Naomi Brooks", email: "naomi@pinegrovelabs.dev", avatar: dicebear("Naomi Brooks"), company: "Pinegrove Labs", title: "Developer", joinedAt: isoDaysAgo(40), plan: "Free" },
    { id: "c_andre", role: "customer", name: "Andre Whitfield", email: "andre@stellarcouriers.com", avatar: dicebear("Andre Whitfield"), company: "Stellar Couriers", title: "Infrastructure Engineer", joinedAt: isoDaysAgo(195), plan: "Growth" },
    { id: "c_sophia", role: "customer", name: "Sophia Petrov", email: "sophia@sandcastle.studio", avatar: dicebear("Sophia Petrov"), company: "Sandcastle Studios", title: "Founder", joinedAt: isoDaysAgo(58), plan: "Starter" },
    { id: "c_kingsley", role: "customer", name: "Kingsley Adeyemi", email: "kingsley@loomandloft.com", avatar: dicebear("Kingsley Adeyemi"), company: "Loom & Loft", title: "Operations Manager", joinedAt: isoDaysAgo(140), plan: "Growth" },
  ];

  const users: User[] = [admin, manager, ...agents, ...customers];

  // ---------- SLA policies
  const slaPolicies: SlaPolicy[] = [
    { id: "sla_std", name: "Standard", description: "Default policy for Free, Starter, and Growth plans.", firstResponseMins: 240, resolutionMins: 1440 },
    { id: "sla_pri", name: "Priority", description: "Tightened response targets for High priority and Growth plans.", firstResponseMins: 60, resolutionMins: 480 },
    { id: "sla_vip", name: "VIP", description: "Enterprise-tier accounts. Tightest first response and resolution.", firstResponseMins: 30, resolutionMins: 240 },
  ];

  // ---------- Categories
  const categories: Category[] = [
    { id: "cat_billing", name: "Billing & Subscriptions", description: "Invoices, plan changes, payment methods, refunds.", color: "0.72 0.165 65", defaultPriority: "normal", defaultSlaId: "sla_std" },
    { id: "cat_technical", name: "Technical Support", description: "Errors, downtime, configuration issues.", color: "0.55 0.215 254", defaultPriority: "high", defaultSlaId: "sla_pri" },
    { id: "cat_account", name: "Account & Access", description: "Login, SSO, MFA, team permissions.", color: "0.62 0.155 158", defaultPriority: "normal", defaultSlaId: "sla_std" },
    { id: "cat_integrations", name: "Integrations", description: "Webhooks, APIs, third-party connectors.", color: "0.52 0.250 305", defaultPriority: "normal", defaultSlaId: "sla_pri" },
    { id: "cat_feature", name: "Feature Requests", description: "Suggestions and enhancement requests.", color: "0.65 0.140 220", defaultPriority: "low", defaultSlaId: "sla_std" },
    { id: "cat_bug", name: "Bug Reports", description: "Reproducible defects in the product.", color: "0.58 0.220 22", defaultPriority: "high", defaultSlaId: "sla_pri" },
  ];

  // ---------- Canned responses
  const cannedResponses: CannedResponse[] = [
    {
      id: "cr_ack",
      name: "Initial acknowledgement",
      categoryId: undefined,
      tags: ["greeting"],
      body: `Hi {{customer.name}},\n\nThanks for reaching out — I've got this and I'll dig into it now. I'll have an update for you shortly.\n\n— {{agent.name}}`,
    },
    {
      id: "cr_billing_invoice",
      name: "Invoice resend",
      categoryId: "cat_billing",
      tags: ["billing", "invoice"],
      body: `Hi {{customer.name}},\n\nI've just resent the invoice to the email address on file. If you'd like it sent to a different address, let me know.\n\n— {{agent.name}}`,
    },
    {
      id: "cr_billing_refund",
      name: "Refund processed",
      categoryId: "cat_billing",
      tags: ["billing", "refund"],
      body: `Hi {{customer.name}},\n\nThe refund has been processed and will appear on your statement within 5–10 business days. The reference number for your records is on the invoice.\n\nLet me know if there's anything else I can help with.\n\n— {{agent.name}}`,
    },
    {
      id: "cr_billing_plan_change",
      name: "Plan upgrade confirmation",
      categoryId: "cat_billing",
      tags: ["billing", "plan"],
      body: `Hi {{customer.name}},\n\nYour plan has been updated. The new tier is active immediately and your next invoice will reflect the prorated amount.\n\nIf the new tier doesn't fit, you can downgrade at any time from **Settings → Billing**.\n\n— {{agent.name}}`,
    },
    {
      id: "cr_account_password_reset",
      name: "Password reset link",
      categoryId: "cat_account",
      tags: ["account", "password"],
      body: `Hi {{customer.name}},\n\nI've triggered a password reset for the account on file. You'll receive an email with a link valid for 30 minutes.\n\nIf the link doesn't arrive, please check your spam folder and let me know.\n\n— {{agent.name}}`,
    },
    {
      id: "cr_account_sso",
      name: "SSO setup walkthrough",
      categoryId: "cat_account",
      tags: ["account", "sso"],
      body: `Hi {{customer.name}},\n\nHere's a quick walkthrough to enable SSO on your account:\n\n1. Go to **Settings → Authentication**\n2. Choose your IdP (Okta, Azure AD, Google Workspace)\n3. Paste your metadata URL or upload the IdP metadata XML\n4. Map the email and name claims\n5. Test with a non-admin user before rolling out broadly\n\nHappy to jump on a call if you'd like to walk through it together.\n\n— {{agent.name}}`,
    },
    {
      id: "cr_technical_logs",
      name: "Need logs to investigate",
      categoryId: "cat_technical",
      tags: ["technical", "logs"],
      body: `Hi {{customer.name}},\n\nTo investigate further I'll need a bit more from your side:\n\n- The time of the incident (UTC if possible)\n- Any error message or status code returned\n- The request ID from the response headers\n- A snippet of the request payload (with secrets redacted)\n\nYou can paste it here or attach a file. I'll dig in as soon as it lands.\n\n— {{agent.name}}`,
    },
    {
      id: "cr_technical_post_resolved",
      name: "Resolved — performance",
      categoryId: "cat_technical",
      tags: ["technical", "resolved"],
      body: `Hi {{customer.name}},\n\nGood news — the issue is resolved. The root cause was a queue saturation on one of our regional workers; we've added capacity and re-balanced traffic.\n\nLet me know if you see anything else off, otherwise I'll mark this resolved in a few hours.\n\n— {{agent.name}}`,
    },
    {
      id: "cr_integrations_webhook",
      name: "Webhook signature verification",
      categoryId: "cat_integrations",
      tags: ["integrations", "webhook"],
      body: `Hi {{customer.name}},\n\nWebhook signature failures usually come from one of three things:\n\n1. The secret in your env doesn't match the one on the dashboard (rotate to confirm)\n2. The body is being parsed/transformed before signature verification (must verify on the raw body)\n3. The header name has been lower-cased by a proxy — we send \`X-Northwind-Signature\` but check both casings\n\nTry rotating the secret first; that catches it ~70% of the time.\n\n— {{agent.name}}`,
    },
    {
      id: "cr_integrations_api_rate",
      name: "API rate limits explained",
      categoryId: "cat_integrations",
      tags: ["integrations", "api"],
      body: `Hi {{customer.name}},\n\nRate limits are per-organization and reset every 60 seconds. For your current plan that's:\n\n- 600 read requests/min\n- 120 write requests/min\n\nIf you're hitting limits regularly, the cleanest path is exponential backoff on 429 responses. We also offer batch endpoints that count as one request — happy to point you at the right one for your use case.\n\n— {{agent.name}}`,
    },
    {
      id: "cr_feature_received",
      name: "Feature request acknowledged",
      categoryId: "cat_feature",
      tags: ["feature"],
      body: `Hi {{customer.name}},\n\nThanks for the suggestion — I've logged it in our roadmap with your account attached so you'll get an update if/when we ship it.\n\nNo promises on timing, but we do prioritise based on how many customers ask for the same thing.\n\n— {{agent.name}}`,
    },
    {
      id: "cr_bug_repro",
      name: "Need a repro",
      categoryId: "cat_bug",
      tags: ["bug"],
      body: `Hi {{customer.name}},\n\nThanks for the report. To reproduce on our side I'll need:\n\n- The exact steps to trigger it\n- Browser + OS (or runtime + version if it's an API call)\n- Whether it reproduces in a private/incognito window\n- A screenshot or screen recording if visible in the UI\n\n— {{agent.name}}`,
    },
    {
      id: "cr_bug_filed",
      name: "Bug filed with engineering",
      categoryId: "cat_bug",
      tags: ["bug", "engineering"],
      body: `Hi {{customer.name}},\n\nI've reproduced this and filed it with engineering. The internal tracking ID is logged on this ticket and I'll update you as the fix moves through review.\n\nIn the meantime, the workaround is documented in our knowledge base — let me know if you'd like me to walk through it.\n\n— {{agent.name}}`,
    },
    {
      id: "cr_followup",
      name: "Gentle follow-up",
      categoryId: undefined,
      tags: ["followup"],
      body: `Hi {{customer.name}},\n\nJust checking in — were you able to try the steps above? If you're stuck I'm happy to jump on a quick call.\n\n— {{agent.name}}`,
    },
    {
      id: "cr_close_polite",
      name: "Close — polite no-response",
      categoryId: undefined,
      tags: ["closing"],
      body: `Hi {{customer.name}},\n\nI haven't heard back so I'll mark this closed for now. If anything else comes up — or if the issue resurfaces — just reply here and it'll reopen automatically.\n\n— {{agent.name}}`,
    },
    {
      id: "cr_handoff",
      name: "Handing off internally",
      categoryId: undefined,
      tags: ["internal"],
      body: `@tomas-rivera — passing this to you since it's in the integrations bucket and you've worked with this customer before. Context above; let me know if you want me to stay copied.`,
    },
  ];

  // ---------- KB articles
  const kbArticles: KbArticle[] = [
    {
      id: "kb_1",
      slug: "getting-started",
      title: "Getting started with Northwind Cloud",
      excerpt: "Spin up your first environment, invite your team, and ship your first deployment.",
      categoryId: "cat_account",
      tags: ["onboarding", "getting-started"],
      published: true,
      authorId: admin.id,
      createdAt: isoDaysAgo(420),
      updatedAt: isoDaysAgo(60),
      views: 4218,
      body: `# Getting started with Northwind Cloud\n\nWelcome. This guide takes you from a fresh account to your first deployment in about fifteen minutes.\n\n## 1. Create your first environment\n\nFrom the dashboard, click **New environment**. Pick a region close to your users — we operate primary regions in **us-west**, **us-east**, **eu-central**, and **ap-southeast**.\n\n> Tip: most teams start with a *staging* environment first and add *production* once they've kicked the tires.\n\n## 2. Invite your team\n\nGo to **Settings → Team** and add teammates by email. There are three roles:\n\n- **Owner** — full control including billing\n- **Admin** — full control except billing\n- **Member** — read/write on environments they're added to\n\n## 3. Connect your repository\n\nAuthorise GitHub, GitLab, or Bitbucket from **Settings → Integrations**. We listen for pushes on the branch you nominate and trigger a build. The first build takes a couple of minutes; subsequent builds are typically under thirty seconds thanks to layer caching.\n\n## 4. Deploy\n\nMerge to your nominated branch and watch the deployment stream in the **Activity** tab. Each deployment gets a unique URL so you can roll forward or roll back without losing history.\n\n## What's next\n\n- Set up a [custom domain](#)\n- Configure [environment variables](#)\n- Add [observability with our metrics dashboard](#)\n\nIf you get stuck at any step, open a ticket in the support portal and we'll help.`,
    },
    {
      id: "kb_2",
      slug: "billing-and-invoices",
      title: "Billing, invoices, and plan changes",
      excerpt: "How billing works, where to find invoices, and how to change plans without downtime.",
      categoryId: "cat_billing",
      tags: ["billing", "invoices"],
      published: true,
      authorId: admin.id,
      createdAt: isoDaysAgo(310),
      updatedAt: isoDaysAgo(28),
      views: 2840,
      body: `# Billing, invoices, and plan changes\n\nNorthwind bills monthly in arrears. Your invoice is generated on the first of every month and charged to the payment method on file.\n\n## Where to find invoices\n\nGo to **Settings → Billing → Invoices**. We retain invoices for seven years and you can download any of them as PDF.\n\n## Plan changes\n\nUpgrades take effect immediately and are prorated for the remainder of the billing cycle. Downgrades take effect at the start of the next cycle so you keep the features you've paid for through the current month.\n\n## Payment methods\n\nWe accept all major credit cards. Annual invoices over **$10,000** can be paid by ACH or wire — contact billing@northwindcloud.com to switch.\n\n## Refunds\n\nWe issue prorated refunds when you cancel. To request one, open a ticket in the **Billing** category and our team will process it within one business day.\n\n## Tax and VAT\n\nIf you have a tax-exempt status, upload your certificate at **Settings → Billing → Tax**. EU customers can add their VAT ID to have VAT removed from future invoices.`,
    },
    {
      id: "kb_3",
      slug: "sso-okta-azure-google",
      title: "Setting up SSO with Okta, Azure AD, or Google Workspace",
      excerpt: "Step-by-step SAML configuration for the three identity providers we see most often.",
      categoryId: "cat_account",
      tags: ["sso", "saml", "okta", "azure", "google"],
      published: true,
      authorId: agents[0].id,
      createdAt: isoDaysAgo(220),
      updatedAt: isoDaysAgo(45),
      views: 1620,
      body: `# Setting up SSO with Okta, Azure AD, or Google Workspace\n\nNorthwind supports SAML 2.0 SSO on **Growth** and **Enterprise** plans. This guide covers the three IdPs we see most.\n\n## Common settings\n\nIn **Settings → Authentication → SSO**, you'll find the Northwind-side endpoints:\n\n- **ACS URL:** \`https://auth.northwindcloud.com/saml/{org-slug}/acs\`\n- **Entity ID:** \`https://auth.northwindcloud.com/saml/{org-slug}\`\n- **Name ID format:** EmailAddress\n\nWe expect these claims:\n\n| Claim | Value |\n|---|---|\n| \`email\` | user's email |\n| \`given_name\` | first name |\n| \`family_name\` | last name |\n\n## Okta\n\n1. In Okta admin, **Applications → Create App Integration → SAML 2.0**\n2. Paste the ACS URL and Entity ID from above\n3. Map the three claims\n4. Download the metadata XML and upload it back to Northwind\n5. Test with a non-admin user before rolling out\n\n## Azure AD / Entra ID\n\n1. **Enterprise applications → New application → Non-gallery**\n2. Configure SAML, paste the URLs from above\n3. Edit the user attributes & claims to match the table\n4. Download **Federation Metadata XML** and upload to Northwind\n\n## Google Workspace\n\n1. **Apps → Web and mobile apps → Add custom SAML app**\n2. Paste the ACS URL and Entity ID\n3. Map claims\n4. Turn on **User access**\n\n## Troubleshooting\n\n- **Login loop:** the email claim isn't being passed. Check the IdP-side mapping.\n- **No matching user:** Just-in-time provisioning is on by default; check that **Settings → Authentication → JIT provisioning** is enabled.\n- **403 on first attempt:** the user's email domain isn't on your verified domains list.`,
    },
    {
      id: "kb_4",
      slug: "webhooks-explained",
      title: "Webhooks: events, signatures, and delivery guarantees",
      excerpt: "Everything you need to receive Northwind events reliably in your own infrastructure.",
      categoryId: "cat_integrations",
      tags: ["webhooks", "integrations"],
      published: true,
      authorId: agents[1].id,
      createdAt: isoDaysAgo(180),
      updatedAt: isoDaysAgo(12),
      views: 3105,
      body: `# Webhooks: events, signatures, and delivery guarantees\n\nNorthwind webhooks let you react to platform events in your own infrastructure.\n\n## Setting up an endpoint\n\nGo to **Settings → Integrations → Webhooks → Add endpoint**, paste your URL, and pick the events you care about.\n\n## Events\n\nThe full event list is in the API reference. The most-subscribed events:\n\n- \`deployment.succeeded\` / \`deployment.failed\`\n- \`environment.created\`\n- \`team.member_invited\`\n- \`billing.invoice_finalized\`\n\n## Signature verification\n\nEvery webhook has an \`X-Northwind-Signature\` header. It's an HMAC-SHA256 of the raw request body using the secret shown on the endpoint settings page.\n\n\`\`\`js\nconst crypto = require('crypto');\nfunction verify(rawBody, signature, secret) {\n  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');\n  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));\n}\n\`\`\`\n\nVerify on the **raw body**, not the parsed JSON — any whitespace change breaks the signature.\n\n## Delivery guarantees\n\nWe deliver at least once. If your endpoint returns a non-2xx status, we retry with exponential backoff (1m, 5m, 30m, 2h, 6h) up to five times.\n\nDeduplicate using the \`X-Northwind-Event-Id\` header — same event ID means same event.\n\n## Testing\n\nThe dashboard has a **Send test event** button on every endpoint. The test event uses a fixed payload so you can build your handler before real events arrive.`,
    },
    {
      id: "kb_5",
      slug: "api-rate-limits",
      title: "API rate limits and best practices",
      excerpt: "How rate limits are calculated and what to do when you hit one.",
      categoryId: "cat_integrations",
      tags: ["api", "rate-limits"],
      published: true,
      authorId: agents[1].id,
      createdAt: isoDaysAgo(155),
      updatedAt: isoDaysAgo(30),
      views: 1480,
      body: `# API rate limits and best practices\n\nRate limits are applied per organization, not per API key, and reset every 60 seconds.\n\n## Limits by plan\n\n| Plan | Reads/min | Writes/min |\n|---|---|---|\n| Free | 60 | 20 |\n| Starter | 240 | 60 |\n| Growth | 600 | 120 |\n| Enterprise | 2,400 | 480 |\n\n## Headers on every response\n\n- \`X-RateLimit-Limit\` — your current limit\n- \`X-RateLimit-Remaining\` — requests remaining this window\n- \`X-RateLimit-Reset\` — Unix timestamp when the window resets\n- \`Retry-After\` — sent on 429 responses\n\n## What to do when you hit one\n\n1. Read \`Retry-After\` and respect it\n2. Implement exponential backoff with jitter\n3. Use the **batch endpoints** where possible — they count as one request\n4. Cache reads where the data is unlikely to change in the next minute\n\n## Need higher limits?\n\nMost teams never need to ask. If you're consistently bumping against the ceiling, open a ticket in **Integrations** and we'll work with you on a tailored quota.`,
    },
    {
      id: "kb_6",
      slug: "deployment-troubleshooting",
      title: "Troubleshooting failed deployments",
      excerpt: "The half-dozen reasons a deployment usually fails, and how to fix each.",
      categoryId: "cat_technical",
      tags: ["deployment", "troubleshooting"],
      published: true,
      authorId: agents[2].id,
      createdAt: isoDaysAgo(140),
      updatedAt: isoDaysAgo(20),
      views: 2620,
      body: `# Troubleshooting failed deployments\n\nA deployment can fail at three stages: **build**, **deploy**, and **healthcheck**. The colour of the failure pill tells you which.\n\n## Build failures\n\nMost build failures are dependency-related.\n\n- **Lockfile drift:** your CI lockfile is out of sync with the manifest. Run \`npm ci\` (or equivalent) locally to confirm.\n- **Native compilation:** missing system dependencies. Add them to your Dockerfile, or pin to a base image that includes them.\n- **OOM during build:** large monorepos with many TypeScript projects can hit our default 4GB memory cap. Bump it in **Settings → Build settings**.\n\n## Deploy failures\n\nDeploy is the step after build where we ship the artefact to runners.\n\n- **Image too large:** our hard cap is 2GB. The dashboard shows a layer breakdown — usually it's a node_modules layer that wasn't pruned.\n- **Region capacity:** rare, but it does happen. Check our [status page](#).\n\n## Healthcheck failures\n\nThe app deployed but didn't come up healthy.\n\n- **Wrong port:** we expect your app to listen on the port set by the \`PORT\` env var\n- **Slow boot:** we time out after 90s by default. Bump it in **Settings → Healthcheck**\n- **Failing migrations:** check the deploy logs for migration errors\n\nIf the failure mode doesn't match anything here, open a ticket in **Technical Support** with the deployment ID and we'll dig in.`,
    },
    {
      id: "kb_7",
      slug: "team-roles-permissions",
      title: "Team roles and permissions",
      excerpt: "Owner, Admin, Member — what each can do and how to scope access.",
      categoryId: "cat_account",
      tags: ["account", "permissions"],
      published: true,
      authorId: admin.id,
      createdAt: isoDaysAgo(120),
      updatedAt: isoDaysAgo(30),
      views: 980,
      body: `# Team roles and permissions\n\nThree roles, scoped to your organisation.\n\n## Owner\n\n- Manage billing and plan changes\n- Add and remove other Owners\n- Everything an Admin can do\n\n## Admin\n\n- Add and remove Members\n- Configure SSO and security settings\n- Create and delete environments\n- Read and write on every environment\n\n## Member\n\n- Read and write on **environments they're explicitly added to**\n- Cannot manage billing, SSO, or membership\n\n## Environment-level permissions\n\nWithin an environment you can further restrict to read-only. This is useful for letting auditors or product managers see deployments without having the keys to push.\n\n## Recommended pattern\n\n- Two Owners (one is a recovery account)\n- 1–3 Admins per team\n- Members get added to environments by Admins as needed\n- A separate "viewer" Member account for read-only access by stakeholders`,
    },
    {
      id: "kb_8",
      slug: "data-export",
      title: "Exporting your data",
      excerpt: "How to export everything Northwind has on you and your environments.",
      categoryId: "cat_account",
      tags: ["data", "export", "compliance"],
      published: true,
      authorId: admin.id,
      createdAt: isoDaysAgo(95),
      updatedAt: isoDaysAgo(40),
      views: 540,
      body: `# Exporting your data\n\nYou can export your full Northwind dataset at any time.\n\n## What's included\n\n- All environments and their configurations\n- Deployment history and metadata for the past 24 months\n- Audit logs for the past 12 months\n- Billing history for the lifetime of your account\n- Team membership and role history\n\n## What's not included\n\n- Live secrets (deliberately — they're stored encrypted and we can't decrypt them out-of-band)\n- Build artefacts older than 30 days (they're pruned automatically)\n\n## How to request\n\n**Settings → Account → Export data**. We bundle everything into a tarball and email a download link. Most exports are ready in under five minutes; very large enterprise accounts can take up to an hour.\n\n## GDPR / CCPA / data deletion\n\nIf you need a full data deletion (not just an export), open a ticket and we'll process it within 30 days as required by GDPR/CCPA.`,
    },
    {
      id: "kb_9",
      slug: "monitoring-and-alerts",
      title: "Monitoring, metrics, and alerting",
      excerpt: "How to set up alerts that page you when something breaks — and not before.",
      categoryId: "cat_technical",
      tags: ["monitoring", "alerts"],
      published: true,
      authorId: agents[2].id,
      createdAt: isoDaysAgo(85),
      updatedAt: isoDaysAgo(15),
      views: 1830,
      body: `# Monitoring, metrics, and alerting\n\nNorthwind ships built-in metrics for every environment, plus an alerting layer that integrates with PagerDuty, Slack, and email.\n\n## Built-in metrics\n\n- **Request rate** (req/sec)\n- **Latency** (p50, p95, p99)\n- **Error rate** (% of 5xx)\n- **Memory** and **CPU** per instance\n\nAll metrics retain at 1-minute granularity for 30 days, 5-minute granularity for 12 months.\n\n## Setting up alerts\n\n**Environment → Alerts → New alert**. Each alert needs:\n\n- A metric and threshold\n- A duration (how long the threshold must be exceeded — start at 5 minutes to avoid pager fatigue)\n- A notification channel\n\n## Recommended starter alerts\n\n1. p95 latency > 500ms for 10 minutes → Slack\n2. Error rate > 2% for 5 minutes → PagerDuty\n3. Memory > 85% for 15 minutes → email\n\n## Custom metrics\n\nUse the \`@northwind/metrics\` package or any StatsD-compatible client to emit custom counters and gauges from your app. They show up in the same dashboards.`,
    },
    {
      id: "kb_10",
      slug: "downgrading-and-canceling",
      title: "Downgrading or cancelling your subscription",
      excerpt: "What happens to your data, your team, and your invoices when you downgrade or cancel.",
      categoryId: "cat_billing",
      tags: ["billing", "cancel"],
      published: true,
      authorId: admin.id,
      createdAt: isoDaysAgo(70),
      updatedAt: isoDaysAgo(70),
      views: 410,
      body: `# Downgrading or cancelling your subscription\n\nWe try to make this as friction-free as upgrading.\n\n## Downgrading\n\n- Effective at the start of the next billing cycle\n- Excess team members past the new plan's limit retain read-only access\n- Excess environments stop receiving deploys but data is retained for 90 days\n\n## Cancelling\n\n**Settings → Billing → Cancel**. You'll be asked to confirm, and your account will be downgraded to **Free** at the end of the billing cycle.\n\nIf you'd like a prorated refund instead of running out the cycle, open a ticket in **Billing** and we'll process it.\n\n## Data retention after cancellation\n\n- Your account is locked to **Free** for 90 days\n- After 90 days of inactivity, environments are deleted\n- Account record (so you can re-activate) is retained for 24 months\n\n## Reactivating\n\nLog in any time within the retention window and pick a new plan. Your environments and team membership are restored as long as they're within the new plan's limits.`,
    },
  ];

  // ---------- Tickets

  const tickets: Ticket[] = [];
  const eventsAdd = (t: Ticket, ev: Omit<TicketEvent, "id" | "ticketId">) => {
    t.events.push({ id: uid("ev"), ticketId: t.id, ...ev });
  };

  let seq = 0;
  const T = (
    overrides: Omit<Partial<Ticket>, "events" | "replies"> & {
      replies?: Omit<Reply, "id" | "ticketId">[];
      events?: Omit<TicketEvent, "id" | "ticketId">[];
    }
  ): Ticket => {
    seq++;
    const id = makeTicketId(seq);
    const createdAt = overrides.createdAt ?? isoDaysAgo(seq);
    const t: Ticket = {
      id,
      subject: overrides.subject ?? "Untitled",
      description: overrides.description ?? "",
      status: overrides.status ?? "open",
      priority: overrides.priority ?? "normal",
      customerId: overrides.customerId ?? customers[0].id,
      assigneeId: overrides.assigneeId,
      categoryId: overrides.categoryId ?? "cat_technical",
      slaId: overrides.slaId ?? "sla_std",
      tags: overrides.tags ?? [],
      attachments: overrides.attachments ?? [],
      replies: (overrides.replies ?? []).map((r) => ({ ...r, id: uid("r"), ticketId: id })),
      events: [
        { id: uid("ev"), ticketId: id, type: "created", actorId: overrides.customerId ?? customers[0].id, createdAt },
        ...(overrides.events ?? []).map((e) => ({ ...e, id: uid("ev"), ticketId: id })),
      ],
      csat: overrides.csat,
      createdAt,
      updatedAt: overrides.updatedAt ?? createdAt,
      firstAgentResponseAt: overrides.firstAgentResponseAt,
      resolvedAt: overrides.resolvedAt,
      closedAt: overrides.closedAt,
      unreadByCustomer: overrides.unreadByCustomer ?? false,
      unreadByAgent: overrides.unreadByAgent ?? false,
    };
    return t;
  };

  // -- Hand-authored anchor tickets ----------------------------------

  // 1: Active urgent — webhook signature failures, in-flight (used in tour)
  tickets.push(
    T({
      subject: "Webhook signatures failing on deployment.succeeded events",
      description:
        "Hi team — since this morning all our \`deployment.succeeded\` webhooks are failing signature verification on our side. We rotated the secret yesterday so I assumed that was it, but the new secret is correct and we still see the mismatch.\n\nIs there any chance the rotation didn't propagate, or is the signature being computed on a transformed body somehow?\n\nRequest IDs from a few of the failing events:\n\n- \`req_2N3xDk_8412\`\n- \`req_2N3xDl_2240\`\n- \`req_2N3xDm_8819\`",
      status: "pending",
      priority: "urgent",
      customerId: "c_aisha",
      assigneeId: "u_tomas",
      categoryId: "cat_integrations",
      slaId: "sla_vip",
      tags: ["webhooks", "signature"],
      createdAt: isoHoursAgo(3),
      updatedAt: isoMinsAgo(28),
      firstAgentResponseAt: isoHoursAgo(2),
      unreadByCustomer: true,
      replies: [
        {
          authorId: "u_tomas",
          body: "Hi Aisha — thanks for the IDs, looking now. Quick check first: is your verifier running on the **raw** body or the parsed JSON? If you're using Express, default \`express.json()\` middleware will silently transform the body before the signature middleware sees it.\n\nWill keep digging in parallel.",
          isInternal: false,
          createdAt: isoHoursAgo(2),
          attachments: [],
          mentions: [],
        },
        {
          authorId: "c_aisha",
          body: "We're running the verifier before any body parsing — that was actually the first thing I checked. Both \`X-Northwind-Signature\` and the lowercase variant are being read.\n\nOne wrinkle: this only started after the rotation. Pre-rotation events still verify cleanly when I replay them.",
          isInternal: false,
          createdAt: isoHoursAgo(1, 30),
          attachments: [],
          mentions: [],
        },
        {
          authorId: "u_tomas",
          body: "@lena-kowalski — quick second pair of eyes? Customer has a clean verifier, signatures pre-rotation work, post-rotation fail. I'm wondering if the dashboard rotation didn't actually swap the active secret on the worker side. Can you check ops?",
          isInternal: true,
          createdAt: isoHoursAgo(1),
          attachments: [],
          mentions: ["u_lena"],
        },
        {
          authorId: "u_lena",
          body: "Confirmed — there's a 4-hour replication lag on secret rotations because of how we cache them on the edge workers. Rotation went out at 09:14 UTC, propagation finishes ~13:14 UTC. Aisha rotated at 09:30 today.\n\nWe should add a banner on the rotation modal. Filing internally.",
          isInternal: true,
          createdAt: isoMinsAgo(45),
          attachments: [],
          mentions: [],
        },
        {
          authorId: "u_tomas",
          body: "Hi Aisha — found it. Secret rotations have a propagation window of up to 4 hours due to edge caching, which we don't surface clearly enough on the dashboard (we'll fix that). Your rotation went out at 09:30 today; new secret will be live across all workers by ~13:30 UTC.\n\nWorkaround for the next 90 minutes: keep accepting both old and new secrets — about half of the events you receive will be signed with each. After 13:30 you can drop the old one.\n\nI'll mark this pending while you confirm.",
          isInternal: false,
          createdAt: isoMinsAgo(28),
          attachments: [],
          mentions: [],
        },
      ],
    })
  );

  // 2: Open high — billing, agent has not replied yet (will trip SLA warning if unreplied)
  tickets.push(
    T({
      subject: "Invoice for March is double-billed",
      description:
        "Hey — I just got our March invoice and the line items look correct, but the total is exactly double what it should be. Two of the same charges, same amounts, both dated March 1.\n\nCould you take a look? I'd rather not pay it as-is.",
      status: "open",
      priority: "high",
      customerId: "c_marcus",
      assigneeId: "u_priya",
      categoryId: "cat_billing",
      slaId: "sla_pri",
      tags: ["billing", "invoice"],
      createdAt: isoMinsAgo(38),
      updatedAt: isoMinsAgo(38),
      unreadByAgent: true,
    })
  );

  // 3: Resolved with 5-star CSAT, recent — populates metrics
  tickets.push(
    T({
      subject: "SSO login looping with Okta",
      description: "We can't get SSO to work — every attempt loops back to the login page. Set up was clean on Okta side.",
      status: "resolved",
      priority: "high",
      customerId: "c_freya",
      assigneeId: "u_priya",
      categoryId: "cat_account",
      slaId: "sla_vip",
      tags: ["sso", "okta"],
      createdAt: isoDaysAgo(2, 4),
      updatedAt: isoDaysAgo(0, 6),
      firstAgentResponseAt: isoDaysAgo(2, 3),
      resolvedAt: isoDaysAgo(0, 6),
      csat: { rating: 5, comment: "Lightning fast. Priya found the misconfigured claim mapping in about ten minutes.", submittedAt: isoDaysAgo(0, 5) },
      replies: [
        {
          authorId: "u_priya",
          body: "Hi Freya — got it. Loop on first login almost always means the email claim isn't being passed correctly. Could you grab a SAML response from your IdP (use the SAML-tracer extension if you don't have one handy) and paste me the AttributeStatement section?",
          isInternal: false,
          createdAt: isoDaysAgo(2, 3),
          attachments: [],
          mentions: [],
        },
        {
          authorId: "c_freya",
          body: "Got it — the email claim is being sent as `Email` (capital E) and we expect `email`. The other two claims are correct.\n\n```xml\n<saml:Attribute Name=\"Email\">\n  <saml:AttributeValue>freya@kestrelanalytics.io</saml:AttributeValue>\n</saml:Attribute>\n```",
          isInternal: false,
          createdAt: isoDaysAgo(2, 2),
          attachments: [],
          mentions: [],
        },
        {
          authorId: "u_priya",
          body: "That's the one. Switch the claim name to lowercase `email` in Okta and you should be in. The mapping is case-sensitive on our side.",
          isInternal: false,
          createdAt: isoDaysAgo(2, 1, 30),
          attachments: [],
          mentions: [],
        },
        {
          authorId: "c_freya",
          body: "Logged in cleanly. Thanks, fast turnaround.",
          isInternal: false,
          createdAt: isoDaysAgo(0, 7),
          attachments: [],
          mentions: [],
        },
      ],
    })
  );

  // 4: Open urgent — production down, just opened, unassigned (populates unassigned queue with urgency)
  tickets.push(
    T({
      subject: "Production environment 502s on all routes",
      description:
        "URGENT — our production environment (env_prod_a18f) started returning 502s about 8 minutes ago across the board. Last successful deploy was 4 hours ago and we haven't pushed since. Status page is green.\n\nThis is impacting paying customers right now.",
      status: "open",
      priority: "urgent",
      customerId: "c_aisha",
      categoryId: "cat_technical",
      slaId: "sla_vip",
      tags: ["production", "down"],
      createdAt: isoMinsAgo(8),
      updatedAt: isoMinsAgo(8),
      unreadByAgent: true,
    })
  );

  // 5: Open normal — feature request
  tickets.push(
    T({
      subject: "Per-environment alert routing — possible?",
      description:
        "We'd love to send alerts from staging to a Slack channel and alerts from production to PagerDuty. Right now the routing is global per-org which means staging noise wakes up the on-call.\n\nIs this on the roadmap?",
      status: "open",
      priority: "low",
      customerId: "c_yuki",
      assigneeId: "u_lena",
      categoryId: "cat_feature",
      slaId: "sla_std",
      tags: ["feature", "alerts"],
      createdAt: isoDaysAgo(1, 2),
      updatedAt: isoDaysAgo(1, 1),
      firstAgentResponseAt: isoDaysAgo(1, 1),
      replies: [
        {
          authorId: "u_lena",
          body: "Hi Yuki — yes, this comes up regularly. It's on the roadmap (no committed date yet) and your account is now attached to the request, so you'll get an update when it ships.\n\nFor now, the workaround a few teams use is a webhook → Zapier router that splits by environment ID. Happy to share a config if useful.",
          isInternal: false,
          createdAt: isoDaysAgo(1, 1),
          attachments: [],
          mentions: [],
        },
      ],
    })
  );

  // 6: Pending — bug filed
  tickets.push(
    T({
      subject: "Build cache invalidation skipping shared lockfile",
      description:
        "When we update our root yarn.lock, deploys still pick up the cached node_modules from the previous build. The workspace packages don't see the new dep until we manually clear the cache. Repro is:\n\n1. Add a new dep to a workspace package's package.json\n2. yarn install at root\n3. Push — build uses old cache, deploy fails on import",
      status: "pending",
      priority: "high",
      customerId: "c_henry",
      assigneeId: "u_tomas",
      categoryId: "cat_bug",
      slaId: "sla_pri",
      tags: ["build", "cache", "monorepo"],
      createdAt: isoDaysAgo(3, 4),
      updatedAt: isoDaysAgo(0, 5),
      firstAgentResponseAt: isoDaysAgo(3, 3),
      replies: [
        {
          authorId: "u_tomas",
          body: "Reproduced. The cache key is hashing only the workspace package's lockfile, not the root. Filing with the build infra team.",
          isInternal: false,
          createdAt: isoDaysAgo(3, 3),
          attachments: [],
          mentions: [],
        },
        {
          authorId: "u_tomas",
          body: "Internal: this is build-infra-2418. Engineering has it; ETA next sprint. Workaround until then: add a no-op file in workspace package that's touched on root lockfile change so the cache key invalidates correctly.",
          isInternal: true,
          createdAt: isoDaysAgo(3, 3),
          attachments: [],
          mentions: [],
        },
        {
          authorId: "u_tomas",
          body: "Quick update — engineering has confirmed the bug and a fix is in review. ETA is end of next sprint. In the meantime, the workaround is to bump the workspace's own lockfile (or a marker file) when the root lockfile changes; that re-keys the cache.",
          isInternal: false,
          createdAt: isoDaysAgo(0, 5),
          attachments: [],
          mentions: [],
        },
      ],
    })
  );

  // 7-10: Resolved with varying CSAT
  tickets.push(
    T({
      subject: "Need to add a tax-exempt certificate",
      description: "We just got our 501(c)(3) approved and need to add the certificate so VAT comes off our next invoice.",
      status: "resolved",
      priority: "normal",
      customerId: "c_naomi",
      assigneeId: "u_priya",
      categoryId: "cat_billing",
      slaId: "sla_std",
      tags: ["billing", "tax"],
      createdAt: isoDaysAgo(8),
      updatedAt: isoDaysAgo(7),
      firstAgentResponseAt: isoDaysAgo(8),
      resolvedAt: isoDaysAgo(7),
      csat: { rating: 5, submittedAt: isoDaysAgo(7) },
      replies: [
        { authorId: "u_priya", body: "Hi Naomi — congratulations on the status. Upload the certificate at **Settings → Billing → Tax** and it'll apply from your next invoice. If you've already paid VAT on this month's invoice, I can issue a one-time credit — just confirm.", isInternal: false, createdAt: isoDaysAgo(8), attachments: [], mentions: [] },
        { authorId: "c_naomi", body: "Uploaded, all good. No credit needed, this month was prorated low. Thanks!", isInternal: false, createdAt: isoDaysAgo(7), attachments: [], mentions: [] },
      ],
    })
  );

  tickets.push(
    T({
      subject: "Database migration timing out during deploy",
      description: "Our deploys are hitting the 90-second healthcheck timeout because the migration we're running takes ~110s. Is there a clean way to bump the timeout for just this one deploy?",
      status: "resolved",
      priority: "normal",
      customerId: "c_kingsley",
      assigneeId: "u_lena",
      categoryId: "cat_technical",
      slaId: "sla_pri",
      tags: ["deploy", "migration"],
      createdAt: isoDaysAgo(11),
      updatedAt: isoDaysAgo(10),
      firstAgentResponseAt: isoDaysAgo(11),
      resolvedAt: isoDaysAgo(10),
      csat: { rating: 4, comment: "Good answer, took a few rounds to land on the cleanest approach.", submittedAt: isoDaysAgo(10) },
      replies: [
        { authorId: "u_lena", body: "Hi Kingsley — bump it in **Settings → Healthcheck → Boot timeout**. The cap is 5 minutes. For long migrations the cleaner pattern is a separate one-shot migrator job that runs pre-deploy (we can set this up via a release command). Happy to walk through it.", isInternal: false, createdAt: isoDaysAgo(11), attachments: [], mentions: [] },
        { authorId: "c_kingsley", body: "Bumped the timeout to 3 min for this one and it shipped fine. We'll move to the release-command pattern next week.", isInternal: false, createdAt: isoDaysAgo(10), attachments: [], mentions: [] },
      ],
    })
  );

  tickets.push(
    T({
      subject: "Can we get a custom domain on a staging environment?",
      description: "We'd like to put staging.kestrelanalytics.io in front of our staging env so internal demos look real. Possible?",
      status: "resolved",
      priority: "low",
      customerId: "c_freya",
      assigneeId: "u_jordan",
      categoryId: "cat_account",
      slaId: "sla_vip",
      tags: ["domain", "dns"],
      createdAt: isoDaysAgo(15),
      updatedAt: isoDaysAgo(14),
      firstAgentResponseAt: isoDaysAgo(15),
      resolvedAt: isoDaysAgo(14),
      csat: { rating: 5, submittedAt: isoDaysAgo(14) },
      replies: [
        { authorId: "u_jordan", body: "Yes — any environment can have a custom domain, no different from production. Add the CNAME in **Environment → Domains** and we'll provision the cert automatically.", isInternal: false, createdAt: isoDaysAgo(15), attachments: [], mentions: [] },
        { authorId: "c_freya", body: "Done. Thanks!", isInternal: false, createdAt: isoDaysAgo(14), attachments: [], mentions: [] },
      ],
    })
  );

  tickets.push(
    T({
      subject: "Two-factor enrollment failed and now I'm locked out",
      description: "I scanned the QR code with the wrong authenticator and now neither the old nor new TOTP works. Locked out of admin.",
      status: "resolved",
      priority: "urgent",
      customerId: "c_marcus",
      assigneeId: "u_priya",
      categoryId: "cat_account",
      slaId: "sla_pri",
      tags: ["account", "2fa", "lockout"],
      createdAt: isoDaysAgo(18),
      updatedAt: isoDaysAgo(18),
      firstAgentResponseAt: isoDaysAgo(18),
      resolvedAt: isoDaysAgo(18),
      csat: { rating: 5, comment: "Resolved in twenty minutes flat. This is what good support looks like.", submittedAt: isoDaysAgo(18) },
      replies: [
        { authorId: "u_priya", body: "Hi Marcus — verifying your identity now. Could you reply from the email that's on the account and confirm the last four digits of the card on file?", isInternal: false, createdAt: isoDaysAgo(18), attachments: [], mentions: [] },
        { authorId: "c_marcus", body: "Yes — verified, last four are 4118.", isInternal: false, createdAt: isoDaysAgo(18), attachments: [], mentions: [] },
        { authorId: "u_priya", body: "Confirmed. I've reset 2FA on your account; on next login you'll be prompted to enroll a new device. I've also dropped a note on the audit log.", isInternal: false, createdAt: isoDaysAgo(18), attachments: [], mentions: [] },
      ],
    })
  );

  // 11: Closed — long-tail
  tickets.push(
    T({
      subject: "Question about our data retention",
      description: "Is build artefact retention configurable per-plan, or is it fixed at 30 days?",
      status: "closed",
      priority: "low",
      customerId: "c_ben",
      assigneeId: "u_lena",
      categoryId: "cat_account",
      slaId: "sla_std",
      tags: ["data-retention"],
      createdAt: isoDaysAgo(35),
      updatedAt: isoDaysAgo(33),
      firstAgentResponseAt: isoDaysAgo(35),
      resolvedAt: isoDaysAgo(34),
      closedAt: isoDaysAgo(33),
      csat: { rating: 4, submittedAt: isoDaysAgo(33) },
      replies: [
        { authorId: "u_lena", body: "Fixed at 30 days on Free, Starter, and Growth. Configurable up to 365 days on Enterprise. Most teams don't need more than 30 — what's the use case?", isInternal: false, createdAt: isoDaysAgo(35), attachments: [], mentions: [] },
        { authorId: "c_ben", body: "Audit. Got it, 30 is fine for now. Closing.", isInternal: false, createdAt: isoDaysAgo(34), attachments: [], mentions: [] },
      ],
    })
  );

  // -- Generated tickets ---------------------------------------------

  const ticketTemplates: Array<Pick<Ticket, "subject" | "description" | "categoryId" | "priority"> & { tags: string[] }> = [
    { subject: "GitHub integration disconnected without warning", description: "Our GitHub app got revoked overnight and we don't know why. Pushes aren't building.", categoryId: "cat_integrations", priority: "high", tags: ["github", "integration"] },
    { subject: "Custom domain SSL renewal failed", description: "Got an email about the cert renewal failing for app.bluewaveimaging.com. The DNS record looks unchanged.", categoryId: "cat_account", priority: "high", tags: ["domain", "ssl"] },
    { subject: "Cannot invite teammate — invite email never arrives", description: "Tried inviting a new engineer three times. None of the emails arrive (yes, we checked spam).", categoryId: "cat_account", priority: "normal", tags: ["invites"] },
    { subject: "Bulk environment delete possible?", description: "We're cleaning up and have ~40 stale preview environments. Is there a bulk delete or do I need to script it via API?", categoryId: "cat_feature", priority: "low", tags: ["environments", "bulk"] },
    { subject: "Receipts not showing the company name on the invoice", description: "Our invoices say my personal name instead of the company. Where do I update that?", categoryId: "cat_billing", priority: "low", tags: ["billing", "invoice"] },
    { subject: "API returning 500s on the metrics endpoint", description: "The /v1/metrics endpoint has been intermittently returning 500s for the last hour. Other endpoints look fine.", categoryId: "cat_technical", priority: "high", tags: ["api", "metrics"] },
    { subject: "How do I rotate environment variables without a redeploy?", description: "We need to rotate a secret without a full redeploy — possible?", categoryId: "cat_account", priority: "normal", tags: ["env-vars"] },
    { subject: "PagerDuty integration not firing on alerts", description: "Our PagerDuty integration was working last week. Set up a new alert today, threshold is being hit, no page.", categoryId: "cat_integrations", priority: "high", tags: ["pagerduty", "alerts"] },
    { subject: "Audit log export — date range bug?", description: "When I pick a date range that spans a DST transition, the export is missing entries on the boundary day.", categoryId: "cat_bug", priority: "normal", tags: ["audit-log", "dst"] },
    { subject: "Can we change the org slug?", description: "We were 'stagecoach' and rebranded to 'stagedeck'. Want to update the slug.", categoryId: "cat_account", priority: "low", tags: ["org"] },
    { subject: "p99 latency suddenly jumped 4x", description: "p99 went from 180ms to 720ms about two hours ago. No deploys in the last 48h. Same traffic shape.", categoryId: "cat_technical", priority: "urgent", tags: ["performance", "latency"] },
    { subject: "Annual invoice instead of monthly?", description: "Can we switch to annual billing? We're committed for the year.", categoryId: "cat_billing", priority: "low", tags: ["billing", "annual"] },
    { subject: "Memory metric showing >100% on one instance", description: "Dashboard shows 117% memory on one instance, which can't be right. Process is running fine.", categoryId: "cat_bug", priority: "low", tags: ["metrics", "ui"] },
    { subject: "Slack integration: can we filter by environment?", description: "All deploy notifications go to the same channel which is noisy. Can the integration filter?", categoryId: "cat_integrations", priority: "low", tags: ["slack"] },
    { subject: "How do I delete a user permanently?", description: "Removing them from the team keeps their access record. Need a hard delete for compliance.", categoryId: "cat_account", priority: "normal", tags: ["compliance", "deletion"] },
    { subject: "Build minutes meter shows wrong total", description: "Dashboard says we used 4,200 build minutes this month. Manual tally from build logs is closer to 2,800.", categoryId: "cat_bug", priority: "normal", tags: ["billing", "metrics"] },
    { subject: "Webhook retries hammering our endpoint", description: "An endpoint we removed 2 weeks ago is still receiving retries. We deleted it from the dashboard.", categoryId: "cat_integrations", priority: "normal", tags: ["webhooks"] },
    { subject: "TLS 1.2 still required for compliance, can we enforce min version?", description: "We need to enforce TLS 1.2+ for SOC 2. Is that already the default?", categoryId: "cat_account", priority: "normal", tags: ["compliance", "tls"] },
    { subject: "Healthcheck path config not honored", description: "Set healthcheck to /health, deploys still hitting /. Other env vars are taking effect.", categoryId: "cat_bug", priority: "high", tags: ["healthcheck"] },
    { subject: "Deploy hook not firing on tag pushes", description: "We push tags for releases. The deploy hook only fires on branch pushes despite the dashboard config showing tags.", categoryId: "cat_bug", priority: "normal", tags: ["deploy-hook"] },
    { subject: "Need a static IP for outbound traffic", description: "Our DB whitelists by IP. Can the worker pool give me a static egress IP?", categoryId: "cat_technical", priority: "high", tags: ["networking", "static-ip"] },
    { subject: "How does multi-region work for read replicas?", description: "We're considering EU + US deployment. How do read replicas sync between regions?", categoryId: "cat_technical", priority: "low", tags: ["multi-region"] },
    { subject: "Search broke after the dashboard update", description: "After yesterday's dashboard update, the global search no longer finds environments by name — only by ID.", categoryId: "cat_bug", priority: "normal", tags: ["dashboard", "search"] },
    { subject: "Can I sign up additional users without going through the invite flow?", description: "We have 12 engineers joining at once and inviting them one-by-one is painful.", categoryId: "cat_feature", priority: "low", tags: ["onboarding", "team"] },
    { subject: "Charge appeared from 'Northwind Cloud' that we don't recognize", description: "$240 charge on the corporate card from Northwind Cloud that nobody on the team initiated.", categoryId: "cat_billing", priority: "high", tags: ["billing", "fraud-check"] },
    { subject: "Region migration: us-west to eu-central", description: "We need to move our prod environment from us-west to eu-central for GDPR. What's the procedure?", categoryId: "cat_technical", priority: "normal", tags: ["region", "gdpr"] },
    { subject: "Dashboard logs are truncated", description: "Log lines longer than ~300 chars get truncated in the UI. JSON payloads are unreadable.", categoryId: "cat_bug", priority: "low", tags: ["dashboard", "logs"] },
    { subject: "GitLab integration: doesn't pick up monorepo path", description: "Our build path is /apps/web inside a monorepo. The GitLab integration only sees the repo root.", categoryId: "cat_integrations", priority: "high", tags: ["gitlab", "monorepo"] },
    { subject: "How do I export billing data for our finance team?", description: "Finance needs CSV-format billing data for the last 12 months.", categoryId: "cat_billing", priority: "low", tags: ["billing", "export"] },
    { subject: "TOTP backup codes — where do I find them?", description: "Set up 2FA two weeks ago and want to grab my backup codes. Can't find them in the UI.", categoryId: "cat_account", priority: "normal", tags: ["account", "2fa"] },
    { subject: "Performance degradation on eu-central this morning", description: "We saw 2x latency on our eu-central env between 06:00-07:30 UTC. Status page didn't show anything. Postmortem?", categoryId: "cat_technical", priority: "high", tags: ["performance", "incident"] },
    { subject: "Cannot edit canned response — getting 'permission denied'", description: "Trying to edit a canned response template gives me 'permission denied' even though I'm an admin.", categoryId: "cat_bug", priority: "normal", tags: ["bug", "permissions"] },
    { subject: "Stripe webhook from your end — is it down?", description: "Receiving a billing webhook that's signed but the payload schema doesn't match what's documented.", categoryId: "cat_bug", priority: "high", tags: ["webhooks", "billing"] },
    { subject: "Scheduled maintenance notifications — opt out for non-critical?", description: "We get a notification for every scheduled maintenance window even when it doesn't affect our region.", categoryId: "cat_feature", priority: "low", tags: ["notifications"] },
    { subject: "Add a teammate as billing-only contact?", description: "Our finance contact needs invoices but shouldn't have any product access. Currently the only way is to give them a member seat.", categoryId: "cat_feature", priority: "low", tags: ["billing", "permissions"] },
    { subject: "Custom metric retention is shorter than documented", description: "Docs say 12 months at 5-min granularity. Mine drop off at ~6 months.", categoryId: "cat_bug", priority: "normal", tags: ["metrics", "retention"] },
  ];

  const customerPool = customers.map((c) => c.id);
  const agentPool = ["u_priya", "u_tomas", "u_lena", "u_jordan"];

  for (let i = 0; i < ticketTemplates.length; i++) {
    const tpl = ticketTemplates[i];
    const ageDays = 1 + Math.floor(rng() * 28);
    const customerId = customerPool[Math.floor(rng() * customerPool.length)];
    const r = rng();
    let status: TicketStatus;
    if (r < 0.18) status = "closed";
    else if (r < 0.42) status = "resolved";
    else if (r < 0.62) status = "pending";
    else status = "open";

    const assigned = rng() > 0.18;
    const assigneeId = assigned ? agentPool[Math.floor(rng() * agentPool.length)] : undefined;

    const createdAt = isoDaysAgo(ageDays);
    const firstResp = assigned ? isoDaysAgo(ageDays, Math.floor(rng() * 3)) : undefined;
    const updatedAt = status === "open"
      ? isoDaysAgo(ageDays, Math.floor(rng() * 4))
      : isoDaysAgo(Math.max(0, ageDays - Math.floor(rng() * 4)));
    const resolvedAt = status === "resolved" || status === "closed" ? isoDaysAgo(Math.max(0, ageDays - 1)) : undefined;
    const closedAt = status === "closed" ? isoDaysAgo(Math.max(0, ageDays - 2)) : undefined;
    const cat = categories.find((c) => c.id === tpl.categoryId)!;

    const replies: Omit<Reply, "id" | "ticketId">[] = [];
    if (assigned) {
      replies.push({
        authorId: assigneeId!,
        body: `Hi — thanks for the report. Looking into it now and I'll have an update shortly.`,
        isInternal: false,
        createdAt: firstResp ?? createdAt,
        attachments: [],
        mentions: [],
      });
      if (status !== "open") {
        replies.push({
          authorId: assigneeId!,
          body: `Quick update: we've identified the issue and a fix is in flight. Will keep you posted.`,
          isInternal: false,
          createdAt: isoDaysAgo(Math.max(0, ageDays - 1)),
          attachments: [],
          mentions: [],
        });
      }
      if (status === "resolved" || status === "closed") {
        replies.push({
          authorId: assigneeId!,
          body: `Fixed and verified. Closing this out — let me know if you see anything else.`,
          isInternal: false,
          createdAt: resolvedAt ?? updatedAt,
          attachments: [],
          mentions: [],
        });
      }
    }

    const csat =
      (status === "resolved" || status === "closed") && rng() > 0.3
        ? {
            rating: ((): 1 | 2 | 3 | 4 | 5 => {
              const x = rng();
              if (x < 0.62) return 5;
              if (x < 0.85) return 4;
              if (x < 0.94) return 3;
              if (x < 0.98) return 2;
              return 1;
            })(),
            comment: rng() > 0.65 ? "Helpful response." : undefined,
            submittedAt: resolvedAt ?? updatedAt,
          }
        : undefined;

    tickets.push(
      T({
        subject: tpl.subject,
        description: tpl.description,
        status,
        priority: tpl.priority,
        customerId,
        assigneeId,
        categoryId: tpl.categoryId,
        slaId: cat.defaultSlaId,
        tags: tpl.tags,
        createdAt,
        updatedAt,
        firstAgentResponseAt: firstResp,
        resolvedAt,
        closedAt,
        csat,
        replies,
        unreadByCustomer: status === "resolved" && rng() > 0.5,
        unreadByAgent: status === "open" && !assigned,
      })
    );
  }

  // ---------- Outbox — generate 35 historical emails
  const outbox: Email[] = [];
  const orgEmail = "support@northwindcloud.com";
  const subjects = [
    "Your ticket was opened",
    "New reply from support",
    "How did we do?",
    "Welcome to Northwind Cloud",
    "Your invoice is ready",
    "Approaching SLA — heads up",
  ];
  for (let i = 0; i < 35; i++) {
    const c = customers[Math.floor(rng() * customers.length)];
    const t = tickets[Math.floor(rng() * Math.min(tickets.length, 30))];
    const tplKind = i % 6;
    const templates: Email["template"][] = ["new_ticket", "agent_reply", "csat_request", "welcome", "status_change", "sla_warning"];
    outbox.push({
      id: uid("em"),
      to: c.email,
      toName: c.name,
      from: orgEmail,
      subject: `[${t.id}] ${subjects[tplKind]} — ${t.subject}`,
      body: t.description.slice(0, 200),
      template: templates[tplKind],
      ticketId: t.id,
      sentAt: isoDaysAgo(1 + Math.floor(rng() * 28)),
      read: rng() > 0.5,
    });
  }
  outbox.sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1));

  // ---------- Notifications
  const notifications: Notification[] = [
    {
      id: uid("n"),
      userId: "u_tomas",
      kind: "mention",
      ticketId: tickets[0].id,
      message: "Tomás was mentioned on a webhook signature ticket",
      createdAt: isoHoursAgo(1),
      read: false,
    },
    {
      id: uid("n"),
      userId: "u_lena",
      kind: "mention",
      ticketId: tickets[0].id,
      message: "Lena was mentioned for a second pair of eyes",
      createdAt: isoHoursAgo(1),
      read: false,
    },
    {
      id: uid("n"),
      userId: "u_priya",
      kind: "reply",
      ticketId: tickets[1].id,
      message: "New invoice double-billing ticket from Marcus Reeves",
      createdAt: isoMinsAgo(38),
      read: false,
    },
    {
      id: uid("n"),
      userId: "u_manager",
      kind: "sla_warning",
      ticketId: tickets[3].id,
      message: "Production 502s ticket approaching VIP SLA",
      createdAt: isoMinsAgo(5),
      read: false,
    },
    {
      id: uid("n"),
      userId: "u_priya",
      kind: "csat",
      ticketId: tickets[2].id,
      message: "5-star CSAT from Freya Olsen on SSO fix",
      createdAt: isoDaysAgo(0, 5),
      read: true,
    },
  ];

  return {
    users,
    categories,
    slaPolicies,
    tickets,
    kbArticles,
    cannedResponses,
    outbox,
    notifications,
    orgSettings: {
      name: "Northwind Cloud Services",
      tagline: "Enterprise infrastructure, refined.",
      supportEmail: orgEmail,
      businessHours: "Mon–Fri · 7am – 7pm PT · 24×7 for Priority and VIP",
      primaryColor: "0.52 0.250 305",
      logoChar: "N",
    },
  };
}

export function initSeed() {
  const seeded = localStorage.getItem(SEED_KEY);
  if (seeded) return;
  const data = buildSeed();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  localStorage.setItem(SEED_KEY, "1");
}
