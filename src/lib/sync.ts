// Cross-tab sync — when the demo is opened in two tabs (customer + agent),
// localStorage `storage` events let each tab refresh its store from disk.
// This is the demo moment for "real-time" without websockets.

import { STORAGE_KEY, AUTH_KEY } from "./utils";

export function initCrossTabSync() {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY || e.key === AUTH_KEY) {
      // The store subscribes to its own rehydrate via this custom event.
      window.dispatchEvent(new CustomEvent("supportdesk:external-update", { detail: { key: e.key } }));
    }
  });
}
