import type { Route } from "./+types/drill";
import { StudyShell } from "../components/study-shell";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Drill | 7. Sınıf Türkçe" }];
}

export default function Drill() {
  return (
    <StudyShell title="Weakness Drill" subtitle="80% from your bottom topics" showTimer>
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 max-w-4xl">
        <h2 className="text-2xl font-black text-rose-900">Current drill target</h2>
        <p className="mt-2 text-rose-800">Topic focus: Fiilde Yapı + Cümlede Anlam</p>
        <p className="mt-3 text-rose-800">Wrong items return in 3-5 questions with altered prompts.</p>
      </div>
    </StudyShell>
  );
}
