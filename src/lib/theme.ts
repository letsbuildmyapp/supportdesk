import { THEME_KEY } from "./utils";

export type Theme = "light" | "dark" | "system";

export function initTheme() {
  const stored = (localStorage.getItem(THEME_KEY) as Theme) ?? "system";
  applyTheme(stored);
  // Re-apply on system change if "system"
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", () => {
    const cur = (localStorage.getItem(THEME_KEY) as Theme) ?? "system";
    if (cur === "system") applyTheme("system");
  });
}

export function applyTheme(t: Theme) {
  const isDark =
    t === "dark" ||
    (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
  // theme-color meta for mobile chrome
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = isDark ? "#0b0815" : "#f6f5fb";
  localStorage.setItem(THEME_KEY, t);
}

export function getTheme(): Theme {
  return (localStorage.getItem(THEME_KEY) as Theme) ?? "system";
}

export function cycleTheme() {
  const cur = getTheme();
  const next: Theme = cur === "system" ? "light" : cur === "light" ? "dark" : "system";
  applyTheme(next);
  return next;
}
