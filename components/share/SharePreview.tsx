import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { easeOut } from "@/lib/motion";

interface SharePreviewProps {
  previewUrl: string | null;
  busy: boolean;
  failed: boolean;
  buildingLabel: string;
  failLabel: string;
  alt: string;
}

export function SharePreview({
  previewUrl,
  busy,
  failed,
  buildingLabel,
  failLabel,
  alt,
}: SharePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: easeOut }}
      className="relative mx-auto flex w-full justify-center"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(46,207,135,0.22),_transparent_70%)] blur-2xl" />
      <div className="relative h-[280px] w-[158px] overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#000010] shadow-[0_18px_40px_rgba(0,0,0,0.5)]">
        <div className="flex h-full w-full items-center justify-center overflow-hidden bg-[#000010]">
          {busy || (!previewUrl && !failed) ? (
            <div className="flex items-center gap-2 px-3 text-center text-xs text-white/50">
              <Loader2 className="animate-spin" size={16} />
              {buildingLabel}
            </div>
          ) : failed ? (
            <p className="px-3 text-center text-xs text-white/50">{failLabel}</p>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl!}
              alt={alt}
              className="h-full w-full object-cover object-center"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
