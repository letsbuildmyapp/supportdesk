import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";
import { useState, useCallback, type ReactNode } from "react";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3.5">
        {danger && (
          <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-status-breach/15 text-status-breach">
            <AlertTriangle className="w-5 h-5" />
          </span>
        )}
        <div className="flex-1">
          <h2 className="font-display text-[22px] leading-tight text-fg">{title}</h2>
          {description && <div className="mt-2 text-[14px] text-fg-muted leading-relaxed">{description}</div>}
        </div>
      </div>
    </Modal>
  );
}

// Hook-style API for one-shot confirmations.
export function useConfirm() {
  const [state, setState] = useState<{
    title: string;
    description?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    resolve: (ok: boolean) => void;
  } | null>(null);

  const confirm = useCallback(
    (opts: {
      title: string;
      description?: ReactNode;
      confirmLabel?: string;
      cancelLabel?: string;
      danger?: boolean;
    }) =>
      new Promise<boolean>((resolve) => {
        setState({ ...opts, resolve });
      }),
    []
  );

  const node = state ? (
    <ConfirmDialog
      open
      title={state.title}
      description={state.description}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      danger={state.danger}
      onCancel={() => {
        state.resolve(false);
        setState(null);
      }}
      onConfirm={() => {
        state.resolve(true);
        setState(null);
      }}
    />
  ) : null;

  return { confirm, node };
}
