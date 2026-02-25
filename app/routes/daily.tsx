import type { Route } from "./+types/daily";
import { StudyShell } from "../components/study-shell";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Daily Plan | 7. Sınıf Türkçe" }];
}

export default function Daily() {
  return (
    <StudyShell title="Daily Plan" subtitle="Auto-generated 10-12 minute session">
      <div className="grid gap-4 md:grid-cols-2">
        <PlanCard title="Due Reviews" value="6" note="From spaced repetition queue" />
        <PlanCard title="New Learn" value="6" note="Weighted toward weak topics" />
        <PlanCard title="Error Correction" value="2" note="Recent mistakes, fast retries" />
        <PlanCard title="Mixed Recall" value="4" note="Interleaved topic mix" />
      </div>
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
