import type { SlaPolicy, Ticket } from "./types";
import { minutesBetween } from "./utils";

export type SlaStatus = "ok" | "approaching" | "breached" | "n/a";

export interface SlaInfo {
  status: SlaStatus;
  responseStatus: SlaStatus;
  resolutionStatus: SlaStatus;
  responseRemainingMins: number;
  resolutionRemainingMins: number;
}

export function evaluateSla(t: Ticket, sla: SlaPolicy | undefined): SlaInfo {
  if (!sla || t.status === "closed") {
    return {
      status: "n/a",
      responseStatus: "n/a",
      resolutionStatus: "n/a",
      responseRemainingMins: 0,
      resolutionRemainingMins: 0,
    };
  }
  const now = new Date().toISOString();
  let responseStatus: SlaStatus = "ok";
  let responseRemaining = 0;
  if (!t.firstAgentResponseAt && t.status !== "resolved") {
    const elapsed = minutesBetween(t.createdAt, now);
    responseRemaining = sla.firstResponseMins - elapsed;
    if (responseRemaining < 0) responseStatus = "breached";
    else if (responseRemaining < sla.firstResponseMins * 0.2) responseStatus = "approaching";
  }
  let resolutionStatus: SlaStatus = "ok";
  let resolutionRemaining = 0;
  if (t.status !== "resolved") {
    const elapsed = minutesBetween(t.createdAt, now);
    resolutionRemaining = sla.resolutionMins - elapsed;
    if (resolutionRemaining < 0) resolutionStatus = "breached";
    else if (resolutionRemaining < sla.resolutionMins * 0.2) resolutionStatus = "approaching";
  }
  // Aggregate
  const status: SlaStatus =
    [responseStatus, resolutionStatus].includes("breached")
      ? "breached"
      : [responseStatus, resolutionStatus].includes("approaching")
      ? "approaching"
      : "ok";
  return { status, responseStatus, resolutionStatus, responseRemainingMins: responseRemaining, resolutionRemainingMins: resolutionRemaining };
}
