import { useEffect, useMemo, useState } from "react";
import type { Route } from "./+types/review";
import { StudyShell } from "../components/study-shell";
import { flashcards, topicLabels } from "../data/study-content";
import {
  getDueReviewCardIds,
  getDueReviewStats,
  type ReviewRating,
  useProgressStore,
} from "../data/progress-store";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Review | 7. Sınıf Türkçe" }];
}

const flashcardsById = Object.fromEntries(flashcards.map((card) => [card.id, card]));

export default function Review() {
  const { progress, rateReviewCard, completeSession } = useProgressStore();
  const { due, overdue } = getDueReviewStats(progress);
  const dueIds = useMemo(() => getDueReviewCardIds(progress), [progress]);

  const [sessionQueue, setSessionQueue] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [successfulCount, setSuccessfulCount] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (sessionQueue.length === 0 && reviewedCount === 0 && dueIds.length > 0) {
      setSessionQueue(dueIds);
      setSessionStartedAt(Date.now());
      setCompleted(false);
    }
  }, [dueIds, reviewedCount, sessionQueue.length]);

  const currentId = sessionQueue[0];
  const currentCard = currentId ? flashcardsById[currentId] : null;

  const finishSessionIfNeeded = (
    nextQueue: string[],
    nextReviewedCount: number,
    nextSuccessfulCount: number,
  ) => {
    if (nextQueue.length > 0 || nextReviewedCount === 0 || completed || sessionStartedAt === null) {
      return;
    }

    const totalMs = Math.max(1000, Date.now() - sessionStartedAt);
    const avgTimeMs = Math.round(totalMs / nextReviewedCount);
    const accuracy = Math.round((nextSuccessfulCount / nextReviewedCount) * 100);

    completeSession({
      mode: "review",
      accuracy,
      avgTimeMs,
      totalQuestions: nextReviewedCount,
      correctCount: nextSuccessfulCount,
    });

    setCompleted(true);
  };

  const handleRate = (rating: ReviewRating) => {
    if (!currentCard) return;

    const nextReviewedCount = reviewedCount + 1;
    const nextSuccessfulCount = successfulCount + (rating === "again" ? 0 : 1);

    rateReviewCard(currentCard.id, rating);
    setReviewedCount(nextReviewedCount);
    setSuccessfulCount(nextSuccessfulCount);

    setSessionQueue((current) => {
      const rest = current.slice(1);
      if (rating === "again") {
        const insertIndex = Math.min(3, rest.length);
        const nextQueue = [...rest];
        nextQueue.splice(insertIndex, 0, currentCard.id);
        setRevealed(false);
        finishSessionIfNeeded(nextQueue, nextReviewedCount, nextSuccessfulCount);
        return nextQueue;
      }

      setRevealed(false);
      finishSessionIfNeeded(rest, nextReviewedCount, nextSuccessfulCount);
      return rest;
    });
  };

  const restartSession = () => {
    setSessionQueue(dueIds);
    setSessionStartedAt(Date.now());
    setReviewedCount(0);
    setSuccessfulCount(0);
    setRevealed(false);
    setCompleted(false);
  };

  return (
    <StudyShell title="Spaced Review" subtitle="Anki-style runner" showTimer>
      <section className="max-w-3xl mx-auto rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_10px_26px_rgba(15,23,42,0.1)]">
        <p className="text-sm font-semibold text-slate-500">
          Due today: {due} | Overdue: {overdue}
        </p>

        {currentCard ? (
          <>
            <p className="mt-3 inline-flex rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1">
              {topicLabels[currentCard.topicId]} · {currentCard.skill} · zorluk {currentCard.difficulty}
            </p>
            <p className="mt-3 text-xs font-semibold text-slate-500">
              Kalan kart: {sessionQueue.length} | Bu oturumda yanıtlanan: {reviewedCount}
            </p>
            <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">{currentCard.front}</h2>

            {revealed ? (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-slate-800">{currentCard.back}</p>
              </div>
            ) : (
              <button
                onClick={() => setRevealed(true)}
                className="mt-5 rounded-2xl px-4 py-3 bg-slate-900 text-white font-bold"
              >
                Reveal answer
              </button>
            )}

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => handleRate("again")}
                disabled={!revealed}
                className="rounded-2xl px-4 py-3 bg-rose-100 text-rose-900 font-bold disabled:opacity-50"
              >
                Again
              </button>
              <button
                onClick={() => handleRate("hard")}
                disabled={!revealed}
                className="rounded-2xl px-4 py-3 bg-amber-100 text-amber-900 font-bold disabled:opacity-50"
              >
                Hard
              </button>
              <button
                onClick={() => handleRate("good")}
                disabled={!revealed}
                className="rounded-2xl px-4 py-3 bg-emerald-100 text-emerald-900 font-bold disabled:opacity-50"
              >
                Good
              </button>
              <button
                onClick={() => handleRate("easy")}
                disabled={!revealed}
                className="rounded-2xl px-4 py-3 bg-indigo-100 text-indigo-900 font-bold disabled:opacity-50"
              >
                Easy
              </button>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <h2 className="text-xl font-black text-emerald-900">Review queue completed</h2>
            <p className="mt-2 text-emerald-800">
              Reviewed: {reviewedCount} | Successful recalls: {successfulCount}
            </p>
            <button
              onClick={restartSession}
              className="mt-4 rounded-2xl px-4 py-2.5 bg-emerald-700 text-white font-bold"
            >
              Refresh due queue
            </button>
          </div>
        )}
      </section>
    </StudyShell>
  );
}
