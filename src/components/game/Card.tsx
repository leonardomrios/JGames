"use client";

import { motion } from "framer-motion";

interface CardProps {
  number: number;
  imageUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
  disabled: boolean;
}

export function Card({
  number,
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
      aria-label={showFront ? `Carta ${number} descubierta` : `Carta ${number}`}
    >
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d]"
        animate={{ rotateY: showFront ? 180 : 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-xl bg-primary shadow-md shadow-primary/30 flex items-center justify-center">
          <span className="font-display text-2xl md:text-3xl font-bold text-white/90">
            {number}
          </span>
        </div>

        <div
          className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl shadow-md flex items-center justify-center p-1 transition-colors ${
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
