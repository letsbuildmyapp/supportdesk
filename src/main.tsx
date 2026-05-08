import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import App from "./App";
import { initTheme } from "./lib/theme";
import { initSeed } from "./lib/seed";
import { initCrossTabSync } from "./lib/sync";
import "./index.css";

initTheme();
initSeed();
initCrossTabSync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity, refetchOnWindowFocus: false } },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="bottom-right"
          theme="system"
          closeButton
          toastOptions={{
            className: "!rounded-2xl !text-fg !bg-bg-elevated !border-border-strong",
            style: { fontFamily: "Geist, sans-serif" },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
