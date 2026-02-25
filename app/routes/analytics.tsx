import type { Route } from "./+types/analytics";
import { StudyShell } from "../components/study-shell";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Analytics | 7. Sınıf Türkçe" }];
}

export default function Analytics() {
  return (
    <StudyShell title="Analytics" subtitle="Trends, heatmaps, and weak points">
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Topic heatmap" desc="Accuracy by topic matrix will be rendered here." />
        <Panel title="Time trend" desc="Average response time trend by session." />
        <Panel title="Leeches" desc="Items repeatedly failed and auto-promoted to drill queue." />
      </div>
    </StudyShell>
  );
}

function Panel({ title, desc }: { title: string; desc: string }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.08)] min-h-52">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{desc}</p>
    </article>
  );
}
