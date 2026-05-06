export type Role = 'customer' | 'agent' | 'admin';

export type User = {
  uid: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  company?: string;
  createdAt: number;
};

export type Priority = 'low' | 'normal' | 'high' | 'urgent';
export type Status = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';

export type Attachment = {
  name: string;
  url: string;
  size: number;
  type: string;
};

export type Ticket = {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: Priority;
  status: Status;
  customerId: string;
  customerName: string;
  customerEmail: string;
  assigneeId?: string | null;
  assigneeName?: string | null;
  attachments: Attachment[];
  createdAt: number;
  updatedAt: number;
  firstResponseAt?: number | null;
  resolvedAt?: number | null;
};

export type Message = {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  body: string;
  internal: boolean;
  attachments: Attachment[];
  createdAt: number;
  /** A status/priority/assignee change event vs a normal reply */
  event?: { kind: 'status' | 'priority' | 'assignee' | 'created'; from?: string; to?: string };
};

export type Category = { id: string; name: string; color: string };
