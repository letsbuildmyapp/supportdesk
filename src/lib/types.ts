// SupportDesk · Core types
// Everything is local — no real backend. Persisted to localStorage via Zustand.

export type Role = "customer" | "agent" | "manager" | "admin";

export type TicketStatus = "open" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  avatar: string;
  title?: string;
  team?: string;
  online?: boolean;
  joinedAt: string; // ISO
  // For customers
  company?: string;
  plan?: "Free" | "Starter" | "Growth" | "Enterprise";
  suspended?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string; // OKLCH triplet
  defaultPriority: TicketPriority;
  defaultSlaId: string;
}

export interface SlaPolicy {
  id: string;
  name: string;
  description: string;
  firstResponseMins: number;
  resolutionMins: number;
}

export interface Attachment {
  id: string;
  name: string;
  size: number; // bytes
  mime: string;
  uploadedAt: string;
  // For images < 2MB we store a base64 data URL so previews work
  dataUrl?: string;
}

export interface Reply {
  id: string;
  ticketId: string;
  authorId: string;
  body: string; // markdown
  isInternal: boolean;
  createdAt: string;
  attachments: Attachment[];
  mentions: string[]; // userIds mentioned
  isCannedFrom?: string; // canned response id this came from
}

export interface CsatRating {
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  submittedAt: string;
}

export interface TicketEvent {
  id: string;
  ticketId: string;
  type:
    | "created"
    | "status_changed"
    | "priority_changed"
    | "assigned"
    | "category_changed"
    | "csat_submitted"
    | "reopened"
    | "closed";
  actorId: string; // userId or "system"
  createdAt: string;
  meta?: Record<string, string>;
}

export interface Ticket {
  id: string; // public ID like "T-2418"
  subject: string;
  description: string; // initial markdown
  status: TicketStatus;
  priority: TicketPriority;
  customerId: string;
  assigneeId?: string;
  categoryId: string;
  slaId: string;
  tags: string[];
  attachments: Attachment[];
  replies: Reply[];
  events: TicketEvent[];
  csat?: CsatRating;
  createdAt: string;
  updatedAt: string;
  firstAgentResponseAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  unreadByCustomer: boolean;
  unreadByAgent: boolean;
}

export interface KbArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string; // markdown
  categoryId: string;
  tags: string[];
  published: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  views: number;
}

export interface CannedResponse {
  id: string;
  name: string;
  body: string; // markdown, supports {{customer.name}}, {{ticket.id}}, {{agent.name}}
  categoryId?: string;
  tags: string[];
}

export interface Email {
  id: string;
  to: string;
  toName: string;
  from: string;
  subject: string;
  body: string; // markdown rendered into the template
  template: "new_ticket" | "agent_reply" | "status_change" | "sla_warning" | "mention" | "csat_request" | "welcome";
  ticketId?: string;
  sentAt: string;
  read: boolean;
}

export interface OrgSettings {
  name: string;
  tagline: string;
  supportEmail: string;
  businessHours: string;
  primaryColor: string; // OKLCH
  logoChar: string;
}

export interface Notification {
  id: string;
  userId: string;
  kind: "reply" | "mention" | "assignment" | "sla_warning" | "csat";
  ticketId?: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface AppData {
  users: User[];
  categories: Category[];
  slaPolicies: SlaPolicy[];
  tickets: Ticket[];
  kbArticles: KbArticle[];
  cannedResponses: CannedResponse[];
  outbox: Email[];
  notifications: Notification[];
  orgSettings: OrgSettings;
}

export interface AuthState {
  currentUserId: string | null;
}
