// Seed script for SupportDesk Firebase emulators.
// Run: npm run emulators (in one tab), then: npm run seed
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, setDoc, collection, writeBatch } from 'firebase/firestore';

const PROJECT_ID = 'demo-supportdesk';
const PASSWORD = 'demo1234';

const app = initializeApp({ projectId: PROJECT_ID, apiKey: 'demo-api-key' });
const auth = getAuth(app);
const db = getFirestore(app);
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
connectFirestoreEmulator(db, '127.0.0.1', 8080);

// Mirror seed data here (keep in sync with src/lib/seed.ts).
const SEED_USERS = [
  { uid: 'agent-maya',   email: 'maya@supportdesk.demo',   name: 'Maya Chen',     role: 'agent',    company: 'Northwind Support' },
  { uid: 'agent-jordan', email: 'jordan@supportdesk.demo', name: 'Jordan Reyes',  role: 'agent',    company: 'Northwind Support' },
  { uid: 'agent-priya',  email: 'priya@supportdesk.demo',  name: 'Priya Patel',   role: 'agent',    company: 'Northwind Support' },
  { uid: 'agent-tom',    email: 'tom@supportdesk.demo',    name: 'Tom Becker',    role: 'agent',    company: 'Northwind Support' },
  { uid: 'admin-alex',   email: 'admin@supportdesk.demo',  name: 'Alex Morgan',   role: 'admin',    company: 'Northwind Support' },
  { uid: 'cust-sam',     email: 'sam@acme.demo',           name: 'Sam Brooks',    role: 'customer', company: 'Acme Industries' },
  { uid: 'cust-elena',   email: 'elena@globex.demo',       name: 'Elena Park',    role: 'customer', company: 'Globex Trading' },
  { uid: 'cust-raj',     email: 'raj@hooli.demo',          name: 'Raj Kapoor',    role: 'customer', company: 'Hooli Cloud' },
  { uid: 'cust-mia',     email: 'mia@initech.demo',        name: 'Mia Watanabe',  role: 'customer', company: 'Initech Forms' },
  { uid: 'cust-ben',     email: 'ben@stark.demo',          name: 'Ben Halloway',  role: 'customer', company: 'Stark Robotics' },
  { uid: 'cust-noor',    email: 'noor@umbrella.demo',      name: 'Noor Ahmadi',   role: 'customer', company: 'Umbrella Logistics' },
];

const CATEGORIES = [
  { id: 'billing',     name: 'Billing',         color: '#f59e0b' },
  { id: 'technical',   name: 'Technical issue', color: '#0ea5e9' },
  { id: 'feature',     name: 'Feature request', color: '#a855f7' },
  { id: 'account',     name: 'Account',         color: '#10b981' },
  { id: 'integration', name: 'Integrations',    color: '#f43f5e' },
];

// Import the seed tickets via dynamic import of the TS source (using esbuild-friendly trick: re-define here)
import { SEED_TICKETS } from './tickets.mjs';

async function ensureUser(u) {
  try {
    await createUserWithEmailAndPassword(auth, u.email, PASSWORD);
    console.log(`  + auth: ${u.email}`);
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      console.log(`  = auth: ${u.email} (exists)`);
    } else {
      throw e;
    }
  }
  // Sign in to grab uid (emulator allocates a UID per email)
  const cred = await signInWithEmailAndPassword(auth, u.email, PASSWORD);
  const uid = cred.user.uid;
  await setDoc(doc(db, 'users', uid), {
    uid,
    email: u.email,
    name: u.name,
    role: u.role,
    company: u.company ?? null,
    createdAt: Date.now(),
  });
  return { ...u, realUid: uid };
}

async function main() {
  console.log(`[seed] Project: ${PROJECT_ID}`);

  console.log('[seed] Users…');
  const userMap = {};
  for (const u of SEED_USERS) {
    const result = await ensureUser(u);
    userMap[u.uid] = result;
  }

  console.log('[seed] Categories…');
  const catBatch = writeBatch(db);
  for (const c of CATEGORIES) {
    catBatch.set(doc(db, 'categories', c.id), c);
  }
  await catBatch.commit();

  console.log('[seed] Tickets…');
  for (const t of SEED_TICKETS) {
    const customer = userMap[t.customerId];
    const assignee = t.assigneeId ? userMap[t.assigneeId] : null;
    const createdAt = Date.now() - t.ageHours * 60 * 60 * 1000;
    let firstResponseAt = null;
    let resolvedAt = null;
    if (t.thread.length > 0) {
      const firstAgentReply = t.thread.find(m => userMap[m.authorId]?.role === 'agent');
      if (firstAgentReply) firstResponseAt = createdAt + firstAgentReply.offsetMinutes * 60 * 1000;
    }
    if (t.status === 'resolved' || t.status === 'closed') {
      const last = t.thread[t.thread.length - 1];
      resolvedAt = createdAt + (last ? last.offsetMinutes : 30) * 60 * 1000;
    }

    const ticketDoc = {
      id: t.id,
      subject: t.subject,
      description: t.description,
      category: t.category,
      priority: t.priority,
      status: t.status,
      customerId: customer.realUid,
      customerName: customer.name,
      customerEmail: customer.email,
      assigneeId: assignee?.realUid ?? null,
      assigneeName: assignee?.name ?? null,
      attachments: [],
      createdAt,
      updatedAt: createdAt + (t.thread.length ? t.thread[t.thread.length - 1].offsetMinutes * 60 * 1000 : 0),
      firstResponseAt,
      resolvedAt,
    };

    await setDoc(doc(db, 'tickets', t.id), ticketDoc);

    // Initial message = the ticket creation event with description
    const msgs = collection(db, 'tickets', t.id, 'messages');
    await setDoc(doc(msgs, 'm0'), {
      id: 'm0',
      ticketId: t.id,
      authorId: customer.realUid,
      authorName: customer.name,
      authorRole: 'customer',
      body: t.description,
      internal: false,
      attachments: [],
      createdAt,
      event: { kind: 'created' },
    });

    // Thread messages
    let i = 1;
    for (const m of t.thread) {
      const author = userMap[m.authorId];
      await setDoc(doc(msgs, `m${i}`), {
        id: `m${i}`,
        ticketId: t.id,
        authorId: author.realUid,
        authorName: author.name,
        authorRole: author.role,
        body: m.body,
        internal: !!m.internal,
        attachments: [],
        createdAt: createdAt + m.offsetMinutes * 60 * 1000,
      });
      i++;
    }

    console.log(`  + ticket ${t.id} — ${t.subject.slice(0, 48)}…`);
  }

  console.log('[seed] Done.');
  process.exit(0);
}

main().catch((e) => {
  console.error('[seed] FAILED', e);
  process.exit(1);
});
