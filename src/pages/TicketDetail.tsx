import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import {
  subscribeTicket, subscribeMessages, postReply, setStatus, setPriority, assignTicket, listAgents,
} from '@/lib/queries';
import type { Ticket, Message, User, Status, Priority } from '@/lib/types';
import { Avatar } from '@/components/Avatar';
import { PriorityChip, StatusChip } from '@/components/Chip';
import { ArrowLeft, Paperclip, Lock, Send, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateTime, relativeTime, statusLabel, priorityLabel, bytes, cn } from '@/lib/utils';
import { useConfirm } from '@/components/ConfirmModal';

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const nav = useNavigate();
  const confirm = useConfirm();
  const [ticket, setTicket] = useState<Ticket | null | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [body, setBody] = useState('');
  const [internal, setInternal] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!id) return;
    return subscribeTicket(id, setTicket);
  }, [id]);
  useEffect(() => {
    if (!id) return;
    return subscribeMessages(id, setMessages);
  }, [id]);
  useEffect(() => {
    if (user && (user.role === 'agent' || user.role === 'admin')) {
      listAgents().then(setAgents).catch(() => {});
    }
  }, [user]);

  if (ticket === undefined) {
    return <div className="max-w-[1200px] mx-auto px-6 py-10"><div className="card p-8 animate-pulse h-32" /></div>;
  }
  if (ticket === null) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Ticket not found.</h1>
        <p className="text-fg-muted mt-2">It may have been deleted or you may not have access.</p>
        <button onClick={() => nav(-1)} className="btn mt-6 inline-flex"><ArrowLeft size={14} /> Go back</button>
      </div>
    );
  }
  if (!user) return null;
  const isAgent = user.role === 'agent' || user.role === 'admin';
  const isOwnTicket = user.uid === ticket.customerId;

  const visible = messages.filter(m => isAgent || !m.internal);

  async function send() {
    if (!user || !ticket) return;
    if (!body.trim() && files.length === 0) return;
    setPosting(true);
    try {
      await postReply({
        ticketId: ticket.id,
        author: user,
        body: body.trim(),
        internal: isAgent && internal,
        files,
      });
      setBody(''); setFiles([]);
      toast.success(internal ? 'Internal note added' : 'Reply sent');
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setPosting(false); }
  }

  async function changeStatus(s: Status) {
    if (!ticket || !user) return;
    if (s === 'resolved' && !(await confirm({
      title: 'Mark this ticket resolved?',
      message: 'The customer will be notified by email. They can reopen by replying.',
      confirmLabel: 'Mark resolved',
    }))) return;
    await setStatus(ticket.id, s, user);
    toast.success(`Status → ${statusLabel(s)}`);
  }
  async function changePriority(p: Priority) {
    if (!ticket || !user) return;
    await setPriority(ticket.id, p, user);
    toast.success(`Priority → ${priorityLabel(p)}`);
  }
  async function changeAssignee(uid: string | null) {
    if (!ticket || !user) return;
    const assignee = uid ? agents.find(a => a.uid === uid) ?? null : null;
    await assignTicket(ticket.id, assignee, user);
    toast.success(assignee ? `Assigned to ${assignee.name}` : 'Unassigned');
  }
  async function customerResolve() {
    if (!ticket || !user) return;
    if (!(await confirm({
      title: 'Mark resolved?',
      message: 'You can reopen this any time by replying.',
      confirmLabel: 'Mark resolved',
    }))) return;
    await setStatus(ticket.id, 'resolved', user);
    toast.success('Marked resolved');
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <Link to={isAgent ? '/queue' : '/tickets'} className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg mb-5">
        <ArrowLeft size={14} /> Back to {isAgent ? 'queue' : 'tickets'}
      </Link>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="min-w-0">
          <div className="card p-7 mb-6">
            <div className="flex items-start gap-3 flex-wrap mb-2">
              <span className="font-mono text-xs text-fg-subtle tnum">#{ticket.id.slice(-6)}</span>
              <StatusChip s={ticket.status} />
              <PriorityChip p={ticket.priority} />
              <span className="text-xs text-fg-subtle ml-auto">{formatDateTime(ticket.createdAt)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{ticket.subject}</h1>
            <div className="flex items-center gap-2 mt-3 text-sm text-fg-muted">
              <Avatar name={ticket.customerName} size={24} />
              <span>{ticket.customerName}</span>
              <span className="text-fg-subtle">·</span>
              <span className="truncate">{ticket.customerEmail}</span>
            </div>
          </div>

          <div className="space-y-3">
            {visible.map(m => <MessageCard key={m.id} m={m} />)}
          </div>

          <div className="card mt-6 overflow-hidden">
            <div className="flex items-center gap-1 px-3 pt-3">
              {isAgent ? (
                <>
                  <button
                    onClick={() => setInternal(false)}
                    className={cn('h-9 px-4 rounded-lg text-sm font-medium', !internal ? 'bg-bg-subtle text-fg' : 'text-fg-muted hover:bg-bg-subtle')}
                  >Public reply</button>
                  <button
                    onClick={() => setInternal(true)}
                    className={cn('h-9 px-4 rounded-lg text-sm font-medium inline-flex items-center gap-1.5', internal ? 'bg-warn/10 text-warn' : 'text-fg-muted hover:bg-bg-subtle')}
                  ><Lock size={13} /> Internal note</button>
                </>
              ) : (
                <span className="h-9 px-4 inline-flex items-center text-sm text-fg-muted">Reply</span>
              )}
              {isAgent && internal && <span className="text-[11px] text-warn ml-auto pr-2">Only agents see this</span>}
            </div>
            <textarea
              value={body} onChange={(e) => setBody(e.target.value)}
              placeholder={internal ? 'Note for your team — customers will not see this.' : 'Type your reply…'}
              className={cn('w-full p-4 bg-transparent outline-none resize-y min-h-[120px] text-base', internal && 'bg-warn/5')}
            />
            {files.length > 0 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {files.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-2 bg-bg-subtle rounded-lg px-2.5 py-1 text-xs">
                    <Paperclip size={12} /> {f.name} <span className="text-fg-subtle tnum">{bytes(f.size)}</span>
                    <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-fg-subtle hover:text-danger ml-1"><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between border-t border-line px-3 h-12">
              <label className="btn-ghost cursor-pointer !px-3">
                <Paperclip size={14} /> Attach
                <input type="file" multiple className="hidden" onChange={(e) => setFiles([...files, ...Array.from(e.target.files ?? [])])} />
              </label>
              <button onClick={send} disabled={posting || (!body.trim() && files.length === 0)} className="btn-primary !h-9 !px-4">
                <Send size={14} /> {posting ? 'Sending…' : (internal ? 'Add note' : 'Send reply')}
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="card p-5">
            <p className="eyebrow mb-3">Details</p>
            <DetailRow label="Customer" value={ticket.customerName} />
            <DetailRow label="Category" value={ticket.category} />
            <DetailRow label="Created" value={relativeTime(ticket.createdAt)} />
            <DetailRow label="Updated" value={relativeTime(ticket.updatedAt)} />
            {ticket.firstResponseAt && <DetailRow label="First reply" value={relativeTime(ticket.firstResponseAt)} />}
            {ticket.resolvedAt && <DetailRow label="Resolved" value={relativeTime(ticket.resolvedAt)} />}
          </div>

          {isAgent && (
            <>
              <div className="card p-5">
                <p className="eyebrow mb-3">Status</p>
                <select value={ticket.status} onChange={(e) => changeStatus(e.target.value as Status)} className="input !h-10">
                  {(['open','in_progress','waiting','resolved','closed'] as Status[]).map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                </select>
              </div>
              <div className="card p-5">
                <p className="eyebrow mb-3">Priority</p>
                <select value={ticket.priority} onChange={(e) => changePriority(e.target.value as Priority)} className="input !h-10">
                  {(['low','normal','high','urgent'] as Priority[]).map(p => <option key={p} value={p}>{priorityLabel(p)}</option>)}
                </select>
              </div>
              <div className="card p-5">
                <p className="eyebrow mb-3">Assignee</p>
                <select value={ticket.assigneeId ?? ''} onChange={(e) => changeAssignee(e.target.value || null)} className="input !h-10">
                  <option value="">Unassigned</option>
                  {agents.map(a => <option key={a.uid} value={a.uid}>{a.name}</option>)}
                </select>
              </div>
            </>
          )}

          {isOwnTicket && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
            <button onClick={customerResolve} className="btn w-full">
              <CheckCircle2 size={15} /> Mark resolved
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm py-1.5">
      <span className="text-fg-subtle">{label}</span>
      <span className="text-fg font-medium truncate ml-3 max-w-[60%] text-right">{value}</span>
    </div>
  );
}

function MessageCard({ m }: { m: Message }) {
  if (m.event && m.event.kind !== 'created' && !m.body) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 text-xs text-fg-subtle">
        <div className="h-px flex-1 bg-line" />
        <span><span className="font-medium text-fg-muted">{m.authorName}</span> changed {m.event.kind} to <span className="font-medium text-fg-muted">{m.event.to}</span> · {relativeTime(m.createdAt)}</span>
        <div className="h-px flex-1 bg-line" />
      </div>
    );
  }
  const isInternal = m.internal;
  const isAgent = m.authorRole === 'agent' || m.authorRole === 'admin';
  return (
    <div className={cn(
      'card p-5',
      isInternal && 'bg-warn/5 border-warn/30',
      isAgent && !isInternal && 'border-l-2 border-l-accent',
    )}>
      <div className="flex items-center gap-3 mb-3">
        <Avatar name={m.authorName} size={32} />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold tracking-tight">{m.authorName}</div>
          <div className="text-[11px] text-fg-subtle uppercase tracking-wider">{m.authorRole} · {relativeTime(m.createdAt)}</div>
        </div>
        {isInternal && <span className="chip !bg-warn/10 !border-warn/30 !text-warn"><Lock size={11} /> Internal</span>}
      </div>
      {m.body && <div className="text-[15px] text-fg whitespace-pre-wrap leading-relaxed">{m.body}</div>}
      {m.attachments.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {m.attachments.map((a, i) => (
            <li key={i}>
              <a href={a.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-bg-subtle hover:bg-bg-hover rounded-lg px-2.5 py-1.5 text-xs">
                <Paperclip size={12} /> {a.name} <span className="text-fg-subtle tnum">{bytes(a.size)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
