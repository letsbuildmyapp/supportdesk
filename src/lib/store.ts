import { create } from "zustand";
import type {
  AppData,
  AuthState,
  Attachment,
  CannedResponse,
  Category,
  CsatRating,
  Email,
  KbArticle,
  Notification,
  Reply,
  Role,
  SlaPolicy,
  Ticket,
  TicketEvent,
  TicketPriority,
  TicketStatus,
  User,
  OrgSettings,
} from "./types";
import { STORAGE_KEY, AUTH_KEY, SEED_KEY, uid, ticketId as makeTicketId, extractMentions } from "./utils";
import { buildSeed } from "./seed";

const emptyData: AppData = {
  users: [],
  categories: [],
  slaPolicies: [],
  tickets: [],
  kbArticles: [],
  cannedResponses: [],
  outbox: [],
  notifications: [],
  orgSettings: {
    name: "Northwind Cloud Services",
    tagline: "Enterprise infrastructure, refined.",
    supportEmail: "support@northwindcloud.com",
    businessHours: "Mon–Fri · 7am – 7pm PT · 24×7 for Priority and VIP",
    primaryColor: "0.52 0.250 305",
    logoChar: "N",
  },
};

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...emptyData, ...JSON.parse(raw) };
    }
    // First load: seed inline so the store is populated synchronously
    // before React renders. (Doing this in main.tsx racing with module
    // import order means the store can be created with empty data and
    // require a refresh.)
    const seeded = buildSeed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    localStorage.setItem(SEED_KEY, "1");
    return seeded;
  } catch {
    return emptyData;
  }
}

function saveData(d: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

function loadAuth(): AuthState {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return { currentUserId: null };
    return JSON.parse(raw);
  } catch {
    return { currentUserId: null };
  }
}

function saveAuth(a: AuthState) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(a));
}

// ----- Store interface

interface StoreState extends AppData {
  currentUserId: string | null;
  // Setters
  setCurrentUser: (id: string | null) => void;
  reload: () => void;
  // Tickets
  createTicket: (input: {
    subject: string;
    description: string;
    customerId: string;
    categoryId: string;
    priority: TicketPriority;
    attachments?: Attachment[];
  }) => Ticket;
  addReply: (input: {
    ticketId: string;
    authorId: string;
    body: string;
    isInternal: boolean;
    attachments?: Attachment[];
    fromCannedId?: string;
  }) => Reply;
  changeStatus: (ticketId: string, status: TicketStatus, actorId: string) => void;
  changePriority: (ticketId: string, priority: TicketPriority, actorId: string) => void;
  assign: (ticketId: string, assigneeId: string | undefined, actorId: string) => void;
  changeCategory: (ticketId: string, categoryId: string, actorId: string) => void;
  setTags: (ticketId: string, tags: string[]) => void;
  submitCsat: (ticketId: string, rating: CsatRating["rating"], comment?: string) => void;
  markRead: (ticketId: string, by: "agent" | "customer") => void;
  bulkUpdate: (ticketIds: string[], patch: Partial<Pick<Ticket, "status" | "priority" | "assigneeId">>, actorId: string) => void;
  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  // Outbox
  markOutboxRead: (id: string) => void;
  // CRUD admin
  upsertCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  upsertSla: (s: SlaPolicy) => void;
  deleteSla: (id: string) => void;
  upsertCanned: (c: CannedResponse) => void;
  deleteCanned: (id: string) => void;
  upsertUser: (u: User) => void;
  upsertArticle: (a: KbArticle) => void;
  deleteArticle: (id: string) => void;
  setOrgSettings: (s: Partial<OrgSettings>) => void;
  // Demo
  resetDemo: () => void;
}

export const useStore = create<StoreState>((set, get) => {
  const initial = loadData();
  const auth = loadAuth();

  // helper: persist after mutation
  function persist(patch: Partial<AppData>) {
    set(patch as Partial<StoreState>);
    const s = get();
    saveData({
      users: s.users,
      categories: s.categories,
      slaPolicies: s.slaPolicies,
      tickets: s.tickets,
      kbArticles: s.kbArticles,
      cannedResponses: s.cannedResponses,
      outbox: s.outbox,
      notifications: s.notifications,
      orgSettings: s.orgSettings,
    });
  }

  function pushOutbox(emails: Email[]) {
    persist({ outbox: [...emails, ...get().outbox] });
  }
  function pushNotifications(notifs: Notification[]) {
    persist({ notifications: [...notifs, ...get().notifications] });
  }

  function nextTicketSeq(): number {
    return get().tickets.length;
  }

  function emailFromTicket(t: Ticket, template: Email["template"], extraSubject = ""): Email {
    const cust = get().users.find((u) => u.id === t.customerId);
    return {
      id: uid("em"),
      to: cust?.email ?? "unknown@example.com",
      toName: cust?.name ?? "Customer",
      from: get().orgSettings.supportEmail,
      subject: extraSubject
        ? `[${t.id}] ${extraSubject} — ${t.subject}`
        : `[${t.id}] ${t.subject}`,
      body: t.description.slice(0, 240),
      template,
      ticketId: t.id,
      sentAt: new Date().toISOString(),
      read: false,
    };
  }

  return {
    ...initial,
    currentUserId: auth.currentUserId,

    setCurrentUser: (id) => {
      set({ currentUserId: id });
      saveAuth({ currentUserId: id });
    },

    reload: () => {
      const fresh = loadData();
      const a = loadAuth();
      set({ ...fresh, currentUserId: a.currentUserId });
    },

    createTicket: ({ subject, description, customerId, categoryId, priority, attachments = [] }) => {
      const cat = get().categories.find((c) => c.id === categoryId);
      const slaId = cat?.defaultSlaId ?? get().slaPolicies[0]?.id ?? "";
      const seq = nextTicketSeq();
      const now = new Date().toISOString();
      const t: Ticket = {
        id: makeTicketId(seq + 18),
        subject,
        description,
        status: "open",
        priority,
        customerId,
        assigneeId: undefined,
        categoryId,
        slaId,
        tags: [],
        attachments,
        replies: [],
        events: [
          {
            id: uid("ev"),
            ticketId: "",
            type: "created",
            actorId: customerId,
            createdAt: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
        unreadByCustomer: false,
        unreadByAgent: true,
      };
      t.events[0].ticketId = t.id;
      persist({ tickets: [t, ...get().tickets] });
      // Send confirmation email + agent assignment notification
      pushOutbox([emailFromTicket(t, "new_ticket", "Your ticket was opened")]);
      // Notify managers/admins of new unassigned ticket
      const teamLeads = get().users.filter((u) => u.role === "manager" || u.role === "admin");
      pushNotifications(
        teamLeads.map<Notification>((u) => ({
          id: uid("n"),
          userId: u.id,
          kind: "assignment",
          ticketId: t.id,
          message: `New unassigned ticket · ${t.subject}`,
          createdAt: now,
          read: false,
        }))
      );
      return t;
    },

    addReply: ({ ticketId, authorId, body, isInternal, attachments = [], fromCannedId }) => {
      const tickets = get().tickets.slice();
      const idx = tickets.findIndex((t) => t.id === ticketId);
      if (idx < 0) throw new Error("ticket not found");
      const author = get().users.find((u) => u.id === authorId);
      const isAgent = author && author.role !== "customer";
      const now = new Date().toISOString();
      const mentionIds = isInternal ? extractMentions(body, get().users) : [];
      const reply: Reply = {
        id: uid("r"),
        ticketId,
        authorId,
        body,
        isInternal,
        createdAt: now,
        attachments,
        mentions: mentionIds,
        isCannedFrom: fromCannedId,
      };
      const t = { ...tickets[idx] };
      t.replies = [...t.replies, reply];
      t.updatedAt = now;
      // First agent response time
      if (isAgent && !isInternal && !t.firstAgentResponseAt) {
        t.firstAgentResponseAt = now;
      }
      // Customer reply on resolved ticket → auto-reopen
      if (!isAgent && t.status === "resolved" && !isInternal) {
        const ev: TicketEvent = {
          id: uid("ev"),
          ticketId,
          type: "reopened",
          actorId: authorId,
          createdAt: now,
        };
        t.events = [...t.events, ev];
        t.status = "open";
        t.resolvedAt = undefined;
      }
      // Unread flags
      if (isAgent && !isInternal) t.unreadByCustomer = true;
      if (!isAgent) t.unreadByAgent = true;
      tickets[idx] = t;
      persist({ tickets });

      // Outbox + notifications
      if (!isInternal) {
        if (isAgent) {
          pushOutbox([emailFromTicket(t, "agent_reply", "New reply from support")]);
        } else {
          // Customer reply → notify assignee
          if (t.assigneeId) {
            pushNotifications([
              {
                id: uid("n"),
                userId: t.assigneeId,
                kind: "reply",
                ticketId: t.id,
                message: `Customer replied · ${t.subject}`,
                createdAt: now,
                read: false,
              },
            ]);
          }
        }
      }
      // Mentions
      if (mentionIds.length) {
        pushNotifications(
          mentionIds.map<Notification>((uId) => ({
            id: uid("n"),
            userId: uId,
            kind: "mention",
            ticketId: t.id,
            message: `${author?.name ?? "Someone"} mentioned you on ${t.subject}`,
            createdAt: now,
            read: false,
          }))
        );
      }
      return reply;
    },

    changeStatus: (id, status, actorId) => {
      const tickets = get().tickets.map((t) => {
        if (t.id !== id) return t;
        const now = new Date().toISOString();
        const ev: TicketEvent = {
          id: uid("ev"),
          ticketId: id,
          type: "status_changed",
          actorId,
          createdAt: now,
          meta: { from: t.status, to: status },
        };
        const updates: Partial<Ticket> = { status, updatedAt: now };
        if (status === "resolved") {
          updates.resolvedAt = now;
          updates.unreadByCustomer = true;
        }
        if (status === "closed") {
          updates.closedAt = now;
        }
        return { ...t, ...updates, events: [...t.events, ev] };
      });
      persist({ tickets });
      const t = tickets.find((x) => x.id === id);
      if (t && status === "resolved") {
        pushOutbox([emailFromTicket(t, "csat_request", "How did we do?")]);
      }
    },

    changePriority: (id, priority, actorId) => {
      const tickets = get().tickets.map((t) => {
        if (t.id !== id) return t;
        const now = new Date().toISOString();
        const ev: TicketEvent = {
          id: uid("ev"),
          ticketId: id,
          type: "priority_changed",
          actorId,
          createdAt: now,
          meta: { from: t.priority, to: priority },
        };
        return { ...t, priority, updatedAt: now, events: [...t.events, ev] };
      });
      persist({ tickets });
    },

    assign: (id, assigneeId, actorId) => {
      const tickets = get().tickets.map((t) => {
        if (t.id !== id) return t;
        const now = new Date().toISOString();
        const ev: TicketEvent = {
          id: uid("ev"),
          ticketId: id,
          type: "assigned",
          actorId,
          createdAt: now,
          meta: { to: assigneeId ?? "unassigned" },
        };
        return { ...t, assigneeId, updatedAt: now, events: [...t.events, ev] };
      });
      persist({ tickets });
      if (assigneeId && assigneeId !== actorId) {
        const t = tickets.find((x) => x.id === id);
        if (t) {
          pushNotifications([
            {
              id: uid("n"),
              userId: assigneeId,
              kind: "assignment",
              ticketId: t.id,
              message: `Assigned to you · ${t.subject}`,
              createdAt: new Date().toISOString(),
              read: false,
            },
          ]);
        }
      }
    },

    changeCategory: (id, categoryId, actorId) => {
      const tickets = get().tickets.map((t) => {
        if (t.id !== id) return t;
        const now = new Date().toISOString();
        const ev: TicketEvent = {
          id: uid("ev"),
          ticketId: id,
          type: "category_changed",
          actorId,
          createdAt: now,
          meta: { from: t.categoryId, to: categoryId },
        };
        return { ...t, categoryId, updatedAt: now, events: [...t.events, ev] };
      });
      persist({ tickets });
    },

    setTags: (id, tags) => {
      const tickets = get().tickets.map((t) => (t.id === id ? { ...t, tags, updatedAt: new Date().toISOString() } : t));
      persist({ tickets });
    },

    submitCsat: (id, rating, comment) => {
      const tickets = get().tickets.map((t) => {
        if (t.id !== id) return t;
        const now = new Date().toISOString();
        const csat: CsatRating = { rating, comment, submittedAt: now };
        const ev: TicketEvent = { id: uid("ev"), ticketId: id, type: "csat_submitted", actorId: t.customerId, createdAt: now };
        return { ...t, csat, updatedAt: now, events: [...t.events, ev] };
      });
      persist({ tickets });
      const t = tickets.find((x) => x.id === id);
      if (t?.assigneeId) {
        pushNotifications([
          {
            id: uid("n"),
            userId: t.assigneeId,
            kind: "csat",
            ticketId: t.id,
            message: `${rating}-star CSAT received · ${t.subject}`,
            createdAt: new Date().toISOString(),
            read: false,
          },
        ]);
      }
    },

    markRead: (id, by) => {
      const tickets = get().tickets.map((t) => {
        if (t.id !== id) return t;
        if (by === "agent") return { ...t, unreadByAgent: false };
        return { ...t, unreadByCustomer: false };
      });
      persist({ tickets });
    },

    bulkUpdate: (ids, patch, actorId) => {
      const now = new Date().toISOString();
      const tickets = get().tickets.map((t) => {
        if (!ids.includes(t.id)) return t;
        const events: TicketEvent[] = [...t.events];
        if (patch.status && patch.status !== t.status) {
          events.push({ id: uid("ev"), ticketId: t.id, type: "status_changed", actorId, createdAt: now, meta: { from: t.status, to: patch.status } });
        }
        if (patch.priority && patch.priority !== t.priority) {
          events.push({ id: uid("ev"), ticketId: t.id, type: "priority_changed", actorId, createdAt: now, meta: { from: t.priority, to: patch.priority } });
        }
        if (patch.assigneeId !== undefined && patch.assigneeId !== t.assigneeId) {
          events.push({ id: uid("ev"), ticketId: t.id, type: "assigned", actorId, createdAt: now, meta: { to: patch.assigneeId ?? "unassigned" } });
        }
        return { ...t, ...patch, events, updatedAt: now };
      });
      persist({ tickets });
    },

    markNotificationRead: (id) => {
      const notifications = get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      persist({ notifications });
    },

    markAllNotificationsRead: (userId) => {
      const notifications = get().notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n));
      persist({ notifications });
    },

    markOutboxRead: (id) => {
      const outbox = get().outbox.map((e) => (e.id === id ? { ...e, read: true } : e));
      persist({ outbox });
    },

    upsertCategory: (c) => {
      const exists = get().categories.find((x) => x.id === c.id);
      const categories = exists
        ? get().categories.map((x) => (x.id === c.id ? c : x))
        : [...get().categories, c];
      persist({ categories });
    },

    deleteCategory: (id) => {
      // reassign tickets in this category to first remaining category
      const remaining = get().categories.filter((c) => c.id !== id);
      if (remaining.length === 0) return;
      const fallbackId = remaining[0].id;
      const tickets = get().tickets.map((t) => (t.categoryId === id ? { ...t, categoryId: fallbackId } : t));
      persist({ categories: remaining, tickets });
    },

    upsertSla: (s) => {
      const exists = get().slaPolicies.find((x) => x.id === s.id);
      const slaPolicies = exists ? get().slaPolicies.map((x) => (x.id === s.id ? s : x)) : [...get().slaPolicies, s];
      persist({ slaPolicies });
    },

    deleteSla: (id) => {
      const remaining = get().slaPolicies.filter((s) => s.id !== id);
      if (remaining.length === 0) return;
      const fallbackId = remaining[0].id;
      const tickets = get().tickets.map((t) => (t.slaId === id ? { ...t, slaId: fallbackId } : t));
      const categories = get().categories.map((c) => (c.defaultSlaId === id ? { ...c, defaultSlaId: fallbackId } : c));
      persist({ slaPolicies: remaining, tickets, categories });
    },

    upsertCanned: (c) => {
      const exists = get().cannedResponses.find((x) => x.id === c.id);
      const cannedResponses = exists ? get().cannedResponses.map((x) => (x.id === c.id ? c : x)) : [...get().cannedResponses, c];
      persist({ cannedResponses });
    },

    deleteCanned: (id) => {
      persist({ cannedResponses: get().cannedResponses.filter((x) => x.id !== id) });
    },

    upsertUser: (u) => {
      const exists = get().users.find((x) => x.id === u.id);
      const users = exists ? get().users.map((x) => (x.id === u.id ? u : x)) : [...get().users, u];
      persist({ users });
    },

    upsertArticle: (a) => {
      const exists = get().kbArticles.find((x) => x.id === a.id);
      const kbArticles = exists ? get().kbArticles.map((x) => (x.id === a.id ? a : x)) : [...get().kbArticles, a];
      persist({ kbArticles });
    },

    deleteArticle: (id) => {
      persist({ kbArticles: get().kbArticles.filter((x) => x.id !== id) });
    },

    setOrgSettings: (patch) => {
      persist({ orgSettings: { ...get().orgSettings, ...patch } });
    },

    resetDemo: () => {
      // Clear everything we own and force a hard reload so the in-memory store
      // re-initializes from the freshly seeded localStorage.
      Object.keys(localStorage)
        .filter((k) => k.startsWith("supportdesk:"))
        .forEach((k) => localStorage.removeItem(k));
      window.location.replace("/");
      // Belt and suspenders for browsers that don't re-execute on same-origin replace
      setTimeout(() => window.location.reload(), 50);
    },
  };
});

// Cross-tab live sync — refresh local state when another tab persists
if (typeof window !== "undefined") {
  window.addEventListener("supportdesk:external-update", () => {
    useStore.getState().reload();
  });
}
