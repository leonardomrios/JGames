"use client";

import { motion } from "framer-motion";

interface CardProps {
  imageUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
  disabled: boolean;
}

export function Card({
  imageUrl,
  isFlipped,
  isMatched,
  onClick,
  disabled,
}: CardProps) {
  const showFront = isFlipped || isMatched;

  return (
    <button
      onClick={onClick}
      disabled={disabled || isMatched}
      className="relative aspect-square w-full [perspective:1000px] disabled:cursor-default cursor-pointer"
      aria-label={showFront ? "Carta descubierta" : "Carta volteada"}
    >
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d]"
        animate={{ rotateY: showFront ? 180 : 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl bg-primary shadow-lg shadow-primary/30 flex items-center justify-center">
          <span className="font-display text-4xl md:text-5xl text-white">🌱</span>
        </div>

        <div
          className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl shadow-lg flex items-center justify-center p-2 transition-colors ${
            isMatched ? "bg-success/20 shadow-success/30" : "bg-white shadow-ink/10"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            draggable={false}
            className="w-full h-full object-contain select-none pointer-events-none"
          />
        </div>
      </motion.div>
    </button>
  );
}
