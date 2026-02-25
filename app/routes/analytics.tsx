import { useMemo } from "react";
import type { Route } from "./+types/analytics";
import { StudyShell } from "../components/study-shell";
import { questions, topicLabels, type TopicId } from "../data/study-content";
import { useProgressStore } from "../data/progress-store";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Analytics | 7. Sınıf Türkçe" }];
}

const questionById = Object.fromEntries(questions.map((question) => [question.id, question]));

export default function Analytics() {
  const { progress, refresh } = useProgressStore();

  const topicRows = useMemo(() => {
    const entries = Object.entries(progress.topicStats) as Array<[
      TopicId,
      { attempts: number; correct: number },
    ]>;

    return entries
      .map(([topicId, stats]) => {
        const accuracy = stats.attempts === 0 ? 0 : Math.round((stats.correct / stats.attempts) * 100);
        return {
          topicId,
          label: topicLabels[topicId],
          attempts: stats.attempts,
          accuracy,
        };
      })
      .sort((a, b) => a.accuracy - b.accuracy);
  }, [progress.topicStats]);

  const timingRows = useMemo(() => {
    return questions
      .map((question) => {
        const history = progress.questionHistory[question.id];
        if (!history || history.seen === 0) {
          return {
            id: question.id,
            prompt: question.prompt,
            topic: topicLabels[question.topicId],
            avgSeconds: null,
            seen: 0,
          };
        }

        return {
          id: question.id,
          prompt: question.prompt,
          topic: topicLabels[question.topicId],
          avgSeconds: Math.round(history.totalTimeMs / history.seen / 1000),
          seen: history.seen,
        };
      })
      .filter((row) => row.seen > 0)
      .sort((a, b) => (b.avgSeconds ?? 0) - (a.avgSeconds ?? 0));
  }, [progress.questionHistory]);

  const errorLog = useMemo(() => {
    return Object.entries(progress.questionHistory)
      .filter(([, history]) => history.lastResultCorrect === false && history.lastSeenAt)
      .sort((a, b) => {
        const aTime = new Date(a[1].lastSeenAt ?? 0).getTime();
        const bTime = new Date(b[1].lastSeenAt ?? 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 8)
      .reduce<Array<{ id: string; topic: string; prompt: string; seen: number; correct: number; at: string | null }>>((acc, [questionId, history]) => {
        const question = questionById[questionId];
        if (!question) return acc;
        acc.push({
          id: questionId,
          topic: topicLabels[question.topicId],
          prompt: question.prompt,
          seen: history.seen,
          correct: history.correct,
          at: history.lastSeenAt,
        });
        return acc;
      }, []);
  }, [progress.questionHistory]);

  const leeches = useMemo(() => {
    return Object.entries(progress.questionHistory)
      .map(([questionId, history]) => {
        const wrong = history.seen - history.correct;
        const accuracy = history.seen === 0 ? 0 : history.correct / history.seen;
        return {
          questionId,
          wrong,
          seen: history.seen,
          accuracy,
          lastResultCorrect: history.lastResultCorrect,
        };
      })
      .filter(
        (row) =>
          row.seen >= 3 && row.wrong >= 2 && (row.accuracy < 0.6 || row.lastResultCorrect === false),
      )
      .sort((a, b) => b.wrong - a.wrong)
      .slice(0, 6)
      .reduce<Array<{ id: string; topic: string; prompt: string; wrong: number; accuracy: number }>>((acc, row) => {
        const question = questionById[row.questionId];
        if (!question) return acc;
        acc.push({
          id: row.questionId,
          topic: topicLabels[question.topicId],
          prompt: question.prompt,
          wrong: row.wrong,
          accuracy: Math.round(row.accuracy * 100),
        });
        return acc;
      }, []);
  }, [progress.questionHistory]);

  const totalAttempts = topicRows.reduce((sum, row) => sum + row.attempts, 0);
  const avgAccuracy =
    totalAttempts === 0
      ? 0
      : Math.round(
          topicRows.reduce((sum, row) => sum + row.accuracy * row.attempts, 0) / totalAttempts,
        );

  return (
    <StudyShell title="Analytics" subtitle="Heatmaps, trends, weak topics, and error intelligence">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <KpiCard label="Readiness" value={`${progress.readiness}/100`} />
        <KpiCard label="Total Attempts" value={String(totalAttempts)} />
        <KpiCard label="Average Accuracy" value={`${avgAccuracy}%`} />
        <KpiCard label="Study Minutes" value={String(progress.totalStudyMinutes)} />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.08)] lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900">Topic Heatmap</h2>
          <p className="mt-1 text-sm text-slate-600">Accuracy and attempts by topic</p>

          <div className="mt-4 space-y-3">
            {topicRows.map((row) => (
              <div key={row.topicId}>
                <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span>{row.label}</span>
                  <span>{row.accuracy}% · {row.attempts} deneme</span>
                </div>
                <div className="mt-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={[
                      "h-full rounded-full",
                      row.accuracy >= 75
                        ? "bg-emerald-500"
                        : row.accuracy >= 50
                          ? "bg-amber-500"
                          : "bg-rose-500",
                    ].join(" ")}
                    style={{ width: `${row.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
          <h2 className="text-lg font-bold text-slate-900">Session Snapshot</h2>
          <p className="mt-1 text-sm text-slate-600">Latest recorded session</p>
          {progress.lastSession ? (
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p><strong>Mode:</strong> {progress.lastSession.mode}</p>
              <p><strong>Accuracy:</strong> {progress.lastSession.accuracy}%</p>
              <p><strong>Avg Time:</strong> {Math.round(progress.lastSession.avgTimeMs / 1000)}s</p>
              <p><strong>Questions:</strong> {progress.lastSession.totalQuestions}</p>
              <p><strong>Correct:</strong> {progress.lastSession.correctCount}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No completed session yet.</p>
          )}
          <button
            onClick={refresh}
            className="mt-5 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-800"
          >
            Refresh analytics
          </button>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.08)] lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900">Time Per Question Trend</h2>
          <p className="mt-1 text-sm text-slate-600">Slowest items by average response time</p>

          <div className="mt-4 divide-y divide-slate-100">
            {timingRows.length > 0 ? (
              timingRows.slice(0, 8).map((row) => (
                <div key={row.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{row.prompt}</p>
                    <p className="text-xs text-slate-500">{row.topic}</p>
                  </div>
                  <div className="text-right text-sm font-bold text-slate-700">
                    {row.avgSeconds}s
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-sm text-slate-500">Not enough timing data yet.</p>
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
          <h2 className="text-lg font-bold text-slate-900">Leeches</h2>
          <p className="mt-1 text-sm text-slate-600">Repeatedly failed questions</p>

          <div className="mt-4 space-y-3">
            {leeches.length > 0 ? (
              leeches.map((item) => (
                <div key={item.id} className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
                  <p className="text-sm font-semibold text-rose-900">{item.topic}</p>
                  <p className="text-xs text-rose-800 mt-1">{item.prompt}</p>
                  <p className="text-xs text-rose-700 mt-1">Wrong: {item.wrong} · Accuracy: {item.accuracy}%</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No leeches detected yet.</p>
            )}
          </div>
        </article>
      </div>

      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
        <h2 className="text-lg font-bold text-slate-900">Error Log</h2>
        <p className="mt-1 text-sm text-slate-600">Most recent wrong answers (for targeted drills)</p>

        <div className="mt-4 divide-y divide-slate-100">
          {errorLog.length > 0 ? (
            errorLog.map((item) => (
              <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.prompt}</p>
                  <p className="text-xs text-slate-500">{item.topic}</p>
                </div>
                <div className="text-right text-xs text-slate-600 whitespace-nowrap">
                  <p>Seen: {item.seen}</p>
                  <p>Correct: {item.correct}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="py-6 text-sm text-slate-500">No recent mistakes logged.</p>
          )}
        </div>
      </section>
    </StudyShell>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-900 tracking-tight">{value}</p>
    </article>
  );
}
