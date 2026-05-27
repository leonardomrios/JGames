"use client";

import { AnimatePresence, motion } from "framer-motion";

interface ResultModalProps {
  open: boolean;
  durationMs: number;
  attempts: number;
  mistakes: number;
  score?: number;
  onPlayAgain: () => void;
  onExit: () => void;
}

function formatTime(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ResultModal({
  open,
  durationMs,
  attempts,
  mistakes,
  score,
  onPlayAgain,
  onExit,
}: ResultModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-cream rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="font-display text-4xl font-bold text-primary-dark mb-2">
              ¡Lo lograste!
            </h2>
            <p className="text-ink/60 mb-8">Encontraste todas las parejas</p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              <Stat label="Tiempo" value={formatTime(durationMs)} />
              <Stat label="Intentos" value={attempts.toString()} />
              <Stat label="Errores" value={mistakes.toString()} />
            </div>

            {score !== undefined && (
              <div className="bg-secondary/30 rounded-2xl py-4 mb-8">
                <div className="text-sm text-ink/60">Puntuación</div>
                <div className="font-display text-4xl font-bold text-ink">{score}</div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={onPlayAgain}
                className="font-display text-xl bg-accent hover:bg-accent/90 active:scale-95 transition-all text-white py-4 rounded-2xl shadow-lg shadow-accent/30"
              >
                🔁 Jugar otra vez
              </button>
              <button
                onClick={onExit}
                className="font-display text-lg text-ink/60 hover:text-ink transition-colors py-2"
              >
                Salir
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl py-3 shadow-sm">
      <div className="text-xs text-ink/50 uppercase tracking-wide">{label}</div>
      <div className="font-display text-2xl font-bold text-ink">{value}</div>
    </div>
  );
}
