import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/results";
import { StudyShell } from "../components/study-shell";
import { topicLabels } from "../data/study-content";
import { useProgressStore } from "../data/progress-store";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Results | 7. Sınıf Türkçe" }];
}

export default function Results() {
  const { progress } = useProgressStore();
  const [searchParams] = useSearchParams();
  const session = progress.lastSession;
  const fallbackAccuracy = Number(searchParams.get("accuracy") ?? 0);
  const accuracy = session?.accuracy ?? fallbackAccuracy;
  const avgTime = session ? `${Math.round(session.avgTimeMs / 1000)}s` : "-";
  const improved = session?.improvedTopicId
    ? topicLabels[session.improvedTopicId]
    : "N/A";
  const worsened = session?.worsenedTopicId
    ? topicLabels[session.worsenedTopicId]
    : "N/A";

  return (
    <StudyShell title="Results" subtitle="Performance and next action">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Avg time / question" value={avgTime} />
        <Stat label="Improved" value={improved} />
        <Stat label="Worsened" value={worsened} />
      </section>

      <Link
        to="/drill"
        className="mt-6 inline-flex rounded-2xl bg-rose-600 text-white px-5 py-3 font-bold shadow-[0_10px_20px_rgba(225,29,72,0.35)]"
      >
        Drill weakest topic now
      </Link>
    </StudyShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-900 tracking-tight">{value}</p>
    </article>
  );
}
