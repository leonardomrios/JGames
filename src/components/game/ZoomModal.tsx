"use client";

import { AnimatePresence, motion } from "framer-motion";

interface ZoomModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function ZoomModal({ imageUrl, onClose }: ZoomModalProps) {
  return (
    <AnimatePresence>
      {imageUrl ? (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4 cursor-pointer"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl p-4 max-w-lg w-full max-h-[80vh] flex items-center justify-center cursor-default"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-contain max-h-[70vh] select-none"
              draggable={false}
            />
            <button
              onClick={onClose}
              className="absolute top-2 right-2 w-10 h-10 rounded-full bg-ink/10 hover:bg-ink/20 flex items-center justify-center font-display text-lg text-ink/60 transition-colors"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
