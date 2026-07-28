import type { ReactNode } from "react";
import {
  Share2,
  Download,
  Link2,
  AtSign,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ShareExportControlsProps {
  busy: boolean;
  hasBlob: boolean;
  onInstagram: () => void;
  onApps: () => void;
  onSave: () => void;
  onCopyLink: () => void;
  onCaption: () => void;
  labels: {
    toInstagram: string;
    toAppsShort: string;
    saveShort: string;
    linkShort: string;
    captionShort: string;
  };
}

export function ShareExportControls({
  busy,
  hasBlob,
  onInstagram,
  onApps,
  onSave,
  onCopyLink,
  onCaption,
  labels,
}: ShareExportControlsProps) {
  return (
    <div className="space-y-2.5">
      <Button
        fullWidth
        size="lg"
        disabled={busy || !hasBlob}
        onClick={onInstagram}
        className="shadow-[0_12px_32px_rgba(26,159,99,0.28)]"
      >
        <AtSign size={18} />
        {labels.toInstagram}
      </Button>
      <div className="grid grid-cols-4 gap-2">
        <ActionTile
          icon={<Share2 size={18} />}
          label={labels.toAppsShort}
          disabled={busy || !hasBlob}
          onClick={onApps}
        />
        <ActionTile
          icon={<Download size={18} />}
          label={labels.saveShort}
          disabled={busy || !hasBlob}
          onClick={onSave}
        />
        <ActionTile
          icon={<Link2 size={18} />}
          label={labels.linkShort}
          onClick={onCopyLink}
        />
        <ActionTile
          icon={<MessageCircle size={18} />}
          label={labels.captionShort}
          onClick={onCaption}
        />
      </div>
    </div>
  );
}

function ActionTile({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="evolve-press flex min-h-[3.75rem] flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-background/60 px-1 text-center text-[10px] font-medium text-muted transition hover:border-accent/35 hover:text-foreground disabled:opacity-40"
    >
      <span className="text-foreground">{icon}</span>
      {label}
    </button>
  );
}
