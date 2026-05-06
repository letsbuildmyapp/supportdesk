import {
  collection, doc, query, where, orderBy, onSnapshot, getDocs, getDoc,
  setDoc, updateDoc, addDoc, serverTimestamp, Timestamp, limit,
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { db, storage, functions } from './firebase';
import type { Ticket, Message, Category, User, Status, Priority, Attachment, Role } from './types';

// ---------- Tickets ----------

function ticketFromDoc(d: any): Ticket {
  const v = d.data();
  return {
    id: d.id,
    subject: v.subject,
    description: v.description,
    category: v.category,
    priority: v.priority,
    status: v.status,
    customerId: v.customerId,
    customerName: v.customerName,
    customerEmail: v.customerEmail,
    assigneeId: v.assigneeId ?? null,
    assigneeName: v.assigneeName ?? null,
    attachments: v.attachments ?? [],
    createdAt: v.createdAt instanceof Timestamp ? v.createdAt.toMillis() : v.createdAt,
    updatedAt: v.updatedAt instanceof Timestamp ? v.updatedAt.toMillis() : v.updatedAt,
    firstResponseAt: v.firstResponseAt ?? null,
    resolvedAt: v.resolvedAt ?? null,
  };
}

export function subscribeAllTickets(cb: (t: Ticket[]) => void) {
  const q = query(collection(db, 'tickets'), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map(ticketFromDoc)));
}

export function subscribeMyTickets(uid: string, cb: (t: Ticket[]) => void) {
  const q = query(collection(db, 'tickets'), where('customerId', '==', uid), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map(ticketFromDoc)));
}

export function subscribeTicket(id: string, cb: (t: Ticket | null) => void) {
  return onSnapshot(doc(db, 'tickets', id), (snap) => cb(snap.exists() ? ticketFromDoc(snap) : null));
}

function msgFromDoc(d: any, ticketId: string): Message {
  const v = d.data();
  return {
    id: d.id,
    ticketId,
    authorId: v.authorId,
    authorName: v.authorName,
    authorRole: v.authorRole,
    body: v.body ?? '',
    internal: !!v.internal,
    attachments: v.attachments ?? [],
    createdAt: v.createdAt instanceof Timestamp ? v.createdAt.toMillis() : v.createdAt,
    event: v.event,
  };
}

export function subscribeMessages(ticketId: string, cb: (m: Message[]) => void) {
  const q = query(collection(db, 'tickets', ticketId, 'messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => msgFromDoc(d, ticketId))));
}

// ---------- Categories ----------

export async function listCategories(): Promise<Category[]> {
  const snap = await getDocs(collection(db, 'categories'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function upsertCategory(c: Category) {
  await setDoc(doc(db, 'categories', c.id), c);
}

// ---------- Agents ----------

export async function listAgents(): Promise<User[]> {
  const q = query(collection(db, 'users'), where('role', 'in', ['agent', 'admin']));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as User);
}

// ---------- Mutations ----------

async function uploadFiles(ticketId: string, files: File[]): Promise<Attachment[]> {
  const out: Attachment[] = [];
  for (const f of files) {
    if (f.size > 10 * 1024 * 1024) throw new Error(`${f.name} exceeds 10MB`);
    const r = storageRef(storage, `tickets/${ticketId}/${Date.now()}-${f.name}`);
    await uploadBytes(r, f);
    const url = await getDownloadURL(r);
    out.push({ name: f.name, url, size: f.size, type: f.type });
  }
  return out;
}

export async function createTicket(args: {
  subject: string; description: string; category: string; priority: Priority;
  customer: User; files: File[];
}): Promise<string> {
  const id = `tkt-${Date.now().toString(36)}`;
  const now = Date.now();
  const attachments = await uploadFiles(id, args.files);

  const ticket: Ticket = {
    id,
    subject: args.subject,
    description: args.description,
    category: args.category,
    priority: args.priority,
    status: 'open',
    customerId: args.customer.uid,
    customerName: args.customer.name,
    customerEmail: args.customer.email,
    assigneeId: null,
    assigneeName: null,
    attachments,
    createdAt: now,
    updatedAt: now,
    firstResponseAt: null,
    resolvedAt: null,
  };
  await setDoc(doc(db, 'tickets', id), ticket);
  await addDoc(collection(db, 'tickets', id, 'messages'), {
    ticketId: id,
    authorId: args.customer.uid,
    authorName: args.customer.name,
    authorRole: args.customer.role,
    body: args.description,
    internal: false,
    attachments,
    createdAt: now,
    event: { kind: 'created' },
  });

  // Fire email notification (best-effort)
  notify('ticket.created', { ticketId: id, ticket }).catch(() => {});
  return id;
}

export async function postReply(args: {
  ticketId: string; author: User; body: string; internal: boolean; files: File[];
}) {
  const attachments = await uploadFiles(args.ticketId, args.files);
  const now = Date.now();
  await addDoc(collection(db, 'tickets', args.ticketId, 'messages'), {
    ticketId: args.ticketId,
    authorId: args.author.uid,
    authorName: args.author.name,
    authorRole: args.author.role,
    body: args.body,
    internal: args.internal,
    attachments,
    createdAt: now,
  });
  // Update ticket meta
  const ticketRef = doc(db, 'tickets', args.ticketId);
  const snap = await getDoc(ticketRef);
  if (snap.exists()) {
    const t = snap.data() as Ticket;
    const patch: Partial<Ticket> = { updatedAt: now };
    if (!args.internal && (args.author.role === 'agent' || args.author.role === 'admin') && !t.firstResponseAt) {
      patch.firstResponseAt = now;
    }
    // Customer reply on a resolved ticket reopens
    if (args.author.role === 'customer' && (t.status === 'resolved' || t.status === 'closed')) {
      patch.status = 'open';
    } else if (args.author.role !== 'customer' && t.status === 'open') {
      patch.status = 'in_progress';
    }
    await updateDoc(ticketRef, patch as any);
  }
  if (!args.internal) notify('ticket.reply', { ticketId: args.ticketId, body: args.body, author: args.author.name }).catch(() => {});
}

export async function setStatus(ticketId: string, status: Status, actor: User) {
  const now = Date.now();
  const ref = doc(db, 'tickets', ticketId);
  const snap = await getDoc(ref);
  const prev = snap.exists() ? (snap.data() as Ticket).status : null;
  const patch: any = { status, updatedAt: now };
  if (status === 'resolved' || status === 'closed') patch.resolvedAt = now;
  await updateDoc(ref, patch);
  await addDoc(collection(db, 'tickets', ticketId, 'messages'), {
    authorId: actor.uid, authorName: actor.name, authorRole: actor.role,
    body: '', internal: false, attachments: [], createdAt: now,
    event: { kind: 'status', from: prev, to: status },
  });
  notify('ticket.status', { ticketId, from: prev, to: status }).catch(() => {});
}

export async function setPriority(ticketId: string, priority: Priority, actor: User) {
  const now = Date.now();
  const ref = doc(db, 'tickets', ticketId);
  const snap = await getDoc(ref);
  const prev = snap.exists() ? (snap.data() as Ticket).priority : null;
  await updateDoc(ref, { priority, updatedAt: now });
  await addDoc(collection(db, 'tickets', ticketId, 'messages'), {
    authorId: actor.uid, authorName: actor.name, authorRole: actor.role,
    body: '', internal: false, attachments: [], createdAt: now,
    event: { kind: 'priority', from: prev, to: priority },
  });
}

export async function assignTicket(ticketId: string, assignee: User | null, actor: User) {
  const now = Date.now();
  const ref = doc(db, 'tickets', ticketId);
  await updateDoc(ref, {
    assigneeId: assignee?.uid ?? null,
    assigneeName: assignee?.name ?? null,
    updatedAt: now,
  });
  await addDoc(collection(db, 'tickets', ticketId, 'messages'), {
    authorId: actor.uid, authorName: actor.name, authorRole: actor.role,
    body: '', internal: false, attachments: [], createdAt: now,
    event: { kind: 'assignee', to: assignee?.name ?? 'Unassigned' },
  });
}

// ---------- Notifications ----------

async function notify(event: string, payload: Record<string, unknown>) {
  try {
    const fn = httpsCallable(functions, 'sendNotification');
    await fn({ event, payload });
  } catch (e) {
    // Silent — emulator function may not be running
    console.info('[notify] (skipped)', event);
  }
}

// ---------- Settings (SLA) ----------

export type SLASettings = {
  firstResponseHours: number;
  resolveHoursUrgent: number;
  resolveHoursHigh: number;
  reminderEnabled: boolean;
};
const DEFAULT_SLA: SLASettings = { firstResponseHours: 4, resolveHoursUrgent: 8, resolveHoursHigh: 24, reminderEnabled: true };

export async function loadSLA(): Promise<SLASettings> {
  const snap = await getDoc(doc(db, 'settings', 'sla'));
  return snap.exists() ? { ...DEFAULT_SLA, ...(snap.data() as any) } : DEFAULT_SLA;
}
export async function saveSLA(s: SLASettings) {
  await setDoc(doc(db, 'settings', 'sla'), s);
}
