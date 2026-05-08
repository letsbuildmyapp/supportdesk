import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

const SIZE = {
  xs: "w-5 h-5 text-[9px]",
  sm: "w-7 h-7 text-[11px]",
  md: "w-9 h-9 text-[13px]",
  lg: "w-12 h-12 text-[15px]",
  xl: "w-16 h-16 text-[19px]",
};

export function Avatar({
  user,
  size = "md",
  className,
  showStatus = false,
}: {
  user: Pick<User, "name" | "avatar" | "online"> | null | undefined;
  size?: keyof typeof SIZE;
  className?: string;
  showStatus?: boolean;
}) {
  if (!user) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-bg-elevated/60 text-fg-muted border border-border",
          SIZE[size],
          className
        )}
      >
        ?
      </span>
    );
  }
  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-full overflow-hidden bg-bg-elevated/60 border border-border ring-1 ring-inset ring-white/5 shrink-0",
        SIZE[size],
        className
      )}
    >
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            // fall back to initials if image fails
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : null}
      <span className="absolute inset-0 flex items-center justify-center font-medium text-fg-muted -z-10">
        {initials}
      </span>
      {showStatus && user.online !== undefined && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-bg",
            user.online ? "bg-status-resolved" : "bg-fg-subtle"
          )}
        />
      )}
    </span>
  );
}

export function AvatarStack({ users, size = "sm", max = 4 }: { users: User[]; size?: keyof typeof SIZE; max?: number }) {
  const shown = users.slice(0, max);
  const rest = users.length - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((u) => (
        <Avatar key={u.id} user={u} size={size} className="ring-2 ring-bg" />
      ))}
      {rest > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-bg-elevated/80 text-fg-muted border border-border ring-2 ring-bg font-medium",
            SIZE[size]
          )}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}
