"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveGameSession } from "@/server/actions/game";
import type { LevelPair } from "@/lib/levels";
import { Card } from "./Card";
import { ResultModal } from "./ResultModal";
import { ZoomModal } from "./ZoomModal";

interface MemoryBoardProps {
  levelId: string;
  pairs: LevelPair[];
}

interface BoardCard {
  id: number;
  pairId: string;
  imageUrl: string;
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

function buildDeck(pairs: LevelPair[]): BoardCard[] {
  const cards = pairs.flatMap((pair, idx) => [
    {
      id: idx * 2,
      pairId: pair.pairId,
      imageUrl: pair.cards[0],
      isFlipped: false,
      isMatched: false,
    },
    {
      id: idx * 2 + 1,
      pairId: pair.pairId,
      imageUrl: pair.cards[1],
      isFlipped: false,
      isMatched: false,
    },
  ]);

  return shuffle(cards);
}

function gridColumnsClass(totalCards: number): string {
  if (totalCards <= 12) return "grid-cols-3 sm:grid-cols-4";
  if (totalCards <= 16) return "grid-cols-4";
  if (totalCards <= 20) return "grid-cols-4 sm:grid-cols-5";
  return "grid-cols-4 sm:grid-cols-6";
}

export function MemoryBoard({ levelId, pairs }: MemoryBoardProps) {
  const router = useRouter();
  const [cards, setCards] = useState<BoardCard[]>(() => buildDeck(pairs));
  const [selected, setSelected] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [matches, setMatches] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [locked, setLocked] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<number | undefined>(undefined);
  const [zoomedUrl, setZoomedUrl] = useState<string | null>(null);
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
    if (matches === pairs.length && !savedRef.current) {
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
        if (res.ok) {
          setFinalScore(res.score);
        }
      });
    }
  }, [matches, pairs.length, levelId, attempts, mistakes]);

  const handleCardClick = useCallback(
    (cardId: number) => {
      if (locked) return;
      if (selected.includes(cardId)) return;

      const card = cards.find((current) => current.id === cardId);
      if (!card || card.isMatched) return;

      const newSelected = [...selected, cardId];
      setCards((prev) =>
        prev.map((current) =>
          current.id === cardId ? { ...current, isFlipped: true } : current
        )
      );
      setSelected(newSelected);

      if (newSelected.length === 2) {
        setAttempts((current) => current + 1);
        setLocked(true);

        const [firstId, secondId] = newSelected;
        const first = cards.find((current) => current.id === firstId)!;
        const second = cards.find((current) => current.id === secondId)!;

        if (first.pairId === second.pairId) {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((current) =>
                current.id === firstId || current.id === secondId
                  ? { ...current, isMatched: true, isFlipped: false }
                  : current
              )
            );
            setMatches((current) => current + 1);
            setSelected([]);
            setLocked(false);
          }, 600);
        } else {
          setMistakes((current) => current + 1);
          setTimeout(() => {
            setCards((prev) =>
              prev.map((current) =>
                current.id === firstId || current.id === secondId
                  ? { ...current, isFlipped: false }
                  : current
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
    setCards(buildDeck(pairs));
    setSelected([]);
    setAttempts(0);
    setMatches(0);
    setMistakes(0);
    setLocked(false);
    setElapsedMs(0);
    setFinished(false);
    setFinalScore(undefined);
    setZoomedUrl(null);
    startTimeRef.current = Date.now();
    savedRef.current = false;
  };

  const handleExit = () => router.push("/play");

  const totalSec = Math.floor(elapsedMs / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const gridCols = gridColumnsClass(cards.length);

  return (
    <>
      <div className="flex justify-between items-center w-full max-w-2xl mb-6 px-2">
        <Stat icon="⏱️" value={`${m}:${s.toString().padStart(2, "0")}`} />
        <Stat icon="✨" value={`${matches}/${pairs.length}`} />
        <Stat icon="🎯" value={attempts.toString()} />
      </div>

      <div className={`grid ${gridCols} gap-3 md:gap-4 w-full max-w-3xl`}>
        {cards.map((card, index) => (
          <Card
            key={card.id}
            number={index + 1}
            imageUrl={card.imageUrl}
            isFlipped={card.isFlipped}
            isMatched={card.isMatched}
            onClick={() => handleCardClick(card.id)}
            onZoom={() => setZoomedUrl(card.imageUrl)}
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

      <ZoomModal imageUrl={zoomedUrl} onClose={() => setZoomedUrl(null)} />
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
