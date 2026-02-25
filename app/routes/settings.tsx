import type { Route } from "./+types/settings";
import { StudyShell } from "../components/study-shell";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Settings | 7. Sınıf Türkçe" }];
}

export default function Settings() {
  return (
    <StudyShell title="Settings" subtitle="Exam date, session, and data controls">
      <div className="max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.08)] space-y-5">
        <label className="block">
          <span className="text-sm font-semibold text-slate-600">Exam Date</span>
          <input type="date" className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue="2026-04-06" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-600">Session Length (minutes)</span>
          <input type="number" className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue={12} min={5} max={30} />
        </label>
        <button className="rounded-xl bg-rose-600 px-4 py-2.5 text-white font-bold">Reset progress</button>
      </div>
    </StudyShell>
  );
}
