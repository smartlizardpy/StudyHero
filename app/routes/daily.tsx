import { useMemo, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/daily";
import { StudyShell } from "../components/study-shell";
import { generateDailyPlan } from "../data/session-engine";
import { questions, topicLabels } from "../data/study-content";
import { useProgressStore } from "../data/progress-store";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Daily Plan | 7. Sınıf Türkçe" }];
}

const questionById = Object.fromEntries(questions.map((question) => [question.id, question]));

export default function Daily() {
  const { progress, recordQuestionAttempt, completeSession } = useProgressStore();
  const [plan, setPlan] = useState(() => generateDailyPlan(progress));
  const [queue, setQueue] = useState<string[]>(plan.questionIds);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [questionStartMs, setQuestionStartMs] = useState(Date.now());
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalTimeMs, setTotalTimeMs] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentQuestion = queue[0] ? questionById[queue[0]] : null;
  const weakTopicLabels = useMemo(
    () => plan.weakTopicIds.map((topicId) => topicLabels[topicId]).join(" + "),
    [plan.weakTopicIds],
  );

  const resetWithFreshPlan = () => {
    const nextPlan = generateDailyPlan(progress);
    setPlan(nextPlan);
    setQueue(nextPlan.questionIds);
    setSelected(null);
    setChecked(false);
    setLastCorrect(false);
    setQuestionStartMs(Date.now());
    setAnsweredCount(0);
    setCorrectCount(0);
    setTotalTimeMs(0);
    setCompleted(false);
  };

  const finishSession = () => {
    if (answeredCount === 0 || completed) return;

    completeSession({
      mode: "daily",
      accuracy: Math.round((correctCount / answeredCount) * 100),
      avgTimeMs: Math.round(totalTimeMs / answeredCount),
      totalQuestions: answeredCount,
      correctCount,
      improvedTopicId: plan.weakTopicIds[0],
      worsenedTopicId: plan.weakTopicIds[1] ?? plan.weakTopicIds[0],
    });

    setCompleted(true);
  };

  const onCheck = () => {
    if (!currentQuestion || selected === null) return;

    const elapsedMs = Math.max(1000, Date.now() - questionStartMs);
    const isCorrect = selected === currentQuestion.correctIndex;

    setChecked(true);
    setLastCorrect(isCorrect);
    setAnsweredCount((count) => count + 1);
    setTotalTimeMs((current) => current + elapsedMs);

    if (isCorrect) {
      setCorrectCount((count) => count + 1);
    }

    recordQuestionAttempt({
      questionId: currentQuestion.id,
      topicId: currentQuestion.topicId,
      isCorrect,
      elapsedMs,
    });
  };

  const onNext = () => {
    if (!currentQuestion) return;

    setQueue((current) => {
      const rest = current.slice(1);
      const next = [...rest];

      if (!lastCorrect) {
        const insertion = Math.min(2, next.length);
        next.splice(insertion, 0, currentQuestion.id);
      }

      if (next.length === 0) {
        finishSession();
      }

      return next;
    });

    setSelected(null);
    setChecked(false);
    setQuestionStartMs(Date.now());
  };

  return (
    <StudyShell title="Daily Plan" subtitle="Auto-generated 10-12 minute session" showTimer>
      <div className="grid gap-4 md:grid-cols-2">
        <PlanCard title="Due Reviews" value={String(plan.counts.dueReviews)} note="From spaced repetition queue" />
        <PlanCard title="Weighted Weak" value={String(plan.counts.weightedWeakQuestions)} note={`Focus: ${weakTopicLabels}`} />
        <PlanCard title="Error Correction" value={String(plan.counts.retryQuestions)} note="Recent wrong answers return quickly" />
        <PlanCard title="New Learn" value={String(plan.counts.newLearnQuestions)} note="Unseen items mixed into session" />
      </div>

      <section className="mt-6 max-w-4xl rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
        {currentQuestion ? (
          <>
            <p className="text-sm font-bold text-slate-600">Question queue: {queue.length} left</p>
            <h2 className="mt-4 text-xl font-black text-slate-900">{currentQuestion.prompt}</h2>

            <div className="mt-5 space-y-3">
              {currentQuestion.choices.map((choice, choiceIndex) => {
                const base = "w-full text-left rounded-2xl border-2 p-4 font-semibold transition-all";
                const style = !checked
                  ? selected === choiceIndex
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 bg-white hover:border-indigo-300"
                  : choiceIndex === currentQuestion.correctIndex
                    ? "border-emerald-500 bg-emerald-50"
                    : choiceIndex === selected
                      ? "border-rose-500 bg-rose-50"
                      : "border-slate-200 bg-white opacity-50";

                return (
                  <button
                    key={`${currentQuestion.id}-${choiceIndex}`}
                    className={`${base} ${style}`}
                    onClick={() => !checked && setSelected(choiceIndex)}
                  >
                    {String.fromCharCode(65 + choiceIndex)}) {choice}
                  </button>
                );
              })}
            </div>

            {checked ? (
              <div className="mt-6 rounded-2xl bg-indigo-50 border border-indigo-100 p-4 text-sm text-indigo-900">
                <p><strong>Rule:</strong> {currentQuestion.rule}</p>
                <p className="mt-1"><strong>Trap:</strong> {currentQuestion.trap}</p>
                <p className="mt-1"><strong>Memory Hook:</strong> {currentQuestion.memoryHook}</p>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              {!checked ? (
                <button
                  onClick={onCheck}
                  disabled={selected === null}
                  className="rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white disabled:bg-slate-300"
                >
                  Check
                </button>
              ) : (
                <button
                  onClick={onNext}
                  className="rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white"
                >
                  Next item
                </button>
              )}
              <button
                onClick={resetWithFreshPlan}
                className="rounded-2xl bg-slate-100 px-5 py-3 font-bold text-slate-800"
              >
                Regenerate plan
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-black text-emerald-900">Daily session completed</h2>
            <p className="mt-2 text-emerald-800">
              Accuracy: {answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0}% | Avg time: {answeredCount ? Math.round(totalTimeMs / answeredCount / 1000) : 0}s
            </p>
            <div className="mt-5 flex gap-3">
              <Link
                to="/results"
                className="rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white"
              >
                View results
              </Link>
              <button
                onClick={resetWithFreshPlan}
                className="rounded-2xl bg-slate-100 px-5 py-3 font-bold text-slate-800"
              >
                Start another daily
              </button>
            </div>
          </>
        )}
      </section>
    </StudyShell>
  );
}

function PlanCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-2 text-4xl font-black tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{note}</p>
    </article>
  );
}
