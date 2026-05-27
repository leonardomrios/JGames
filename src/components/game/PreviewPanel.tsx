"use client";

import { AnimatePresence, motion } from "framer-motion";

interface PreviewPanelProps {
  imageUrl: string | null;
  label: string;
  isMatch: boolean;
}

export function PreviewPanel({
  imageUrl,
  label,
  isMatch,
}: PreviewPanelProps) {
  return (
    <div
      className={`flex-1 rounded-3xl border-2 overflow-hidden flex items-center justify-center h-[160px] md:h-[250px] lg:h-[300px] transition-colors ${
        isMatch
          ? "bg-success/10 border-success/40"
          : imageUrl
            ? "bg-white border-ink/10 shadow-lg"
            : "bg-cream border-dashed border-ink/20"
      }`}
    >
      <AnimatePresence mode="wait">
        {imageUrl ? (
          <motion.div
            key={imageUrl}
            className="w-full h-full flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              draggable={false}
              className="max-w-full max-h-full object-contain select-none"
            />
          </motion.div>
        ) : (
          <motion.span
            key="empty"
            className="font-display text-4xl md:text-5xl text-ink/15"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
