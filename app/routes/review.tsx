import type { Route } from "./+types/review";
import { StudyShell } from "../components/study-shell";
import { flashcards, topicLabels } from "../data/study-content";
import { getDueReviewStats, useProgressStore } from "../data/progress-store";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Review | 7. Sınıf Türkçe" }];
}

export default function Review() {
  const { progress } = useProgressStore();
  const { due, overdue } = getDueReviewStats(progress);
  const currentCard = flashcards[0];

  return (
    <StudyShell title="Spaced Review" subtitle="Anki-style runner" showTimer>
      <section className="max-w-3xl mx-auto rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_10px_26px_rgba(15,23,42,0.1)]">
        <p className="text-sm font-semibold text-slate-500">
          Due today: {due} | Overdue: {overdue}
        </p>
        <p className="mt-3 inline-flex rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1">
          {topicLabels[currentCard.topicId]} · {currentCard.skill} · zorluk {currentCard.difficulty}
        </p>
        <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">{currentCard.front}</h2>
        <p className="mt-4 text-slate-700">{currentCard.back}</p>
        <p className="mt-5 text-slate-600">Feature 4 will turn this into full Again/Hard/Good/Easy scheduling.</p>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="rounded-2xl px-4 py-3 bg-rose-100 text-rose-900 font-bold">Again</button>
          <button className="rounded-2xl px-4 py-3 bg-amber-100 text-amber-900 font-bold">Hard</button>
          <button className="rounded-2xl px-4 py-3 bg-emerald-100 text-emerald-900 font-bold">Good</button>
          <button className="rounded-2xl px-4 py-3 bg-indigo-100 text-indigo-900 font-bold">Easy</button>
        </div>
      </section>
    </StudyShell>
  );
}
