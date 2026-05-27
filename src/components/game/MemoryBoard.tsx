"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveGameSession } from "@/server/actions/game";
import { Card } from "./Card";
import { ResultModal } from "./ResultModal";

interface MemoryBoardProps {
  levelId: string;
  symbols: string[];
}

interface BoardCard {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildDeck(symbols: string[]): BoardCard[] {
  const pairs = symbols.flatMap((s, idx) => [
    { id: idx * 2, symbol: s, isFlipped: false, isMatched: false },
    { id: idx * 2 + 1, symbol: s, isFlipped: false, isMatched: false },
  ]);
  return shuffle(pairs);
}

export function MemoryBoard({ levelId, symbols }: MemoryBoardProps) {
  const router = useRouter();
  const [cards, setCards] = useState<BoardCard[]>(() => buildDeck(symbols));
  const [selected, setSelected] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [matches, setMatches] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [locked, setLocked] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<number | undefined>(undefined);
  const startTimeRef = useRef<number>(Date.now());
  const savedRef = useRef(false);

  useEffect(() => {
    if (finished) return;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 250);
    return () => clearInterval(interval);
  }, [finished]);

  useEffect(() => {
    if (matches === symbols.length && !savedRef.current) {
      savedRef.current = true;
      const duration = Date.now() - startTimeRef.current;
      setFinished(true);
      setElapsedMs(duration);

      saveGameSession({
        levelId,
        durationMs: duration,
        attempts,
        matches,
        mistakes,
      }).then((res) => {
        if (res.ok) setFinalScore(res.score);
      });
    }
  }, [matches, symbols.length, levelId, attempts, mistakes]);

  const handleCardClick = useCallback(
    (cardId: number) => {
      if (locked) return;
      if (selected.includes(cardId)) return;

      const card = cards.find((c) => c.id === cardId);
      if (!card || card.isMatched) return;

      const newSelected = [...selected, cardId];
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
      );
      setSelected(newSelected);

      if (newSelected.length === 2) {
        setAttempts((a) => a + 1);
        setLocked(true);

        const [firstId, secondId] = newSelected;
        const first = cards.find((c) => c.id === firstId)!;
        const second = cards.find((c) => c.id === secondId)!;

        if (first.symbol === second.symbol) {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isMatched: true, isFlipped: false }
                  : c
              )
            );
            setMatches((m) => m + 1);
            setSelected([]);
            setLocked(false);
          }, 600);
        } else {
          setMistakes((m) => m + 1);
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isFlipped: false }
                  : c
              )
            );
            setSelected([]);
            setLocked(false);
          }, 1000);
        }
      }
    },
    [cards, selected, locked]
  );

  const handlePlayAgain = () => {
    setCards(buildDeck(symbols));
    setSelected([]);
    setAttempts(0);
    setMatches(0);
    setMistakes(0);
    setLocked(false);
    setElapsedMs(0);
    setFinished(false);
    setFinalScore(undefined);
    startTimeRef.current = Date.now();
    savedRef.current = false;
  };

  const handleExit = () => router.push("/");

  const totalSec = Math.floor(elapsedMs / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;

  return (
    <>
      <div className="flex justify-between items-center w-full max-w-2xl mb-6 px-2">
        <Stat icon="⏱️" value={`${m}:${s.toString().padStart(2, "0")}`} />
        <Stat icon="✨" value={`${matches}/${symbols.length}`} />
        <Stat icon="🎯" value={attempts.toString()} />
      </div>

      <div className="grid grid-cols-4 gap-3 md:gap-4 w-full max-w-2xl">
        {cards.map((card) => (
          <Card
            key={card.id}
            symbol={card.symbol}
            isFlipped={card.isFlipped}
            isMatched={card.isMatched}
            onClick={() => handleCardClick(card.id)}
            disabled={locked}
          />
        ))}
      </div>

      <ResultModal
        open={finished}
        durationMs={elapsedMs}
        attempts={attempts}
        mistakes={mistakes}
        score={finalScore}
        onPlayAgain={handlePlayAgain}
        onExit={handleExit}
      />
    </>
  );
}

function Stat({ icon, value }: { icon: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl px-4 py-2 shadow-sm flex items-center gap-2">
      <span className="text-xl">{icon}</span>
      <span className="font-display text-xl font-bold text-ink">{value}</span>
    </div>
  );
}
