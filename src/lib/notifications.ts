import { useStore } from "./store";
import type { Notification } from "./types";

export function unreadNotificationsFor(userId: string): Notification[] {
  return useStore.getState().notifications.filter((n) => n.userId === userId && !n.read);
}
