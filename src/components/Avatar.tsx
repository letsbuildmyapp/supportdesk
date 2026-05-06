import { avatarColor, initials } from '@/lib/utils';

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const bg = avatarColor(name);
  return (
    <div
      aria-hidden
      className="rounded-full grid place-items-center font-semibold text-white shrink-0"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.4 }}
    >
      {initials(name)}
    </div>
  );
}
