import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowRight, BrainCircuit, Flame, Target, Timer } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/home";
import { StudyShell } from "../components/study-shell";
import { flashcards, questions, topicLabels } from "../data/study-content";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard | 7. Sınıf Türkçe" },
    { name: "description", content: "Readiness, due work, and next study actions." },
  ];
}

export default function Home() {
  const [daysUntilExam, setDaysUntilExam] = useState(0);
  const readiness = 64;
  const dueCards = flashcards.length;
  const suggestedDrills = 2;
  const weakestTopic = topicLabels[questions[0].topicId];

  useEffect(() => {
    const today = new Date();
    const examDate = new Date("2026-04-06");
    const diffTime = Math.max(examDate.getTime() - today.getTime(), 0);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysUntilExam(diffDays);
  }, []);

  const minutesPerDay = useMemo(() => {
    if (daysUntilExam <= 0) return 45;
    return Math.max(10, Math.ceil((dueCards * 6 + 90) / daysUntilExam));
  }, [daysUntilExam]);

  return (
    <StudyShell title="7. Sınıf Türkçe" subtitle="Bootcamp dashboard and action center">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Readiness" value={`${readiness}/100`} icon={<Target className="w-5 h-5" />} />
        <MetricCard label="Due Workload" value={`${dueCards} kart`} icon={<Timer className="w-5 h-5" />} />
        <MetricCard label="Weakest Topic" value={weakestTopic} icon={<BrainCircuit className="w-5 h-5" />} />
        <MetricCard label="Daily Pace" value={`${minutesPerDay} dk/gün`} icon={<Flame className="w-5 h-5" />} />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <ActionCard
          to="/daily"
          title="Start Daily Plan"
          description="Auto-mixed due reviews, new items, and retries in a 10-12 min session."
          tone="primary"
        />
        <ActionCard
          to="/review"
          title="Review Due Cards"
          description={`${dueCards} card(s) due, spaced repetition queue ready.`}
          tone="secondary"
        />
        <ActionCard
          to="/drill"
          title="Weakness Drill"
          description={`${suggestedDrills} targeted drill(s) recommended for low-accuracy topics.`}
          tone="danger"
        />
        <ActionCard
          to="/quiz"
          title="Exam Mode (Timed)"
          description={`Exam in ${daysUntilExam} day(s). Run a timed set and score prediction.`}
          tone="neutral"
        />
      </section>
    </StudyShell>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between text-slate-500 text-sm font-semibold">
        <span>{label}</span>
        <span>{icon}</span>
      </div>
      <p className="mt-3 text-slate-900 text-2xl font-black tracking-tight">{value}</p>
    </article>
  );
}

type Tone = "primary" | "secondary" | "danger" | "neutral";

function ActionCard({
  to,
  title,
  description,
  tone,
}: {
  to: string;
  title: string;
  description: string;
  tone: Tone;
}) {
  const toneStyles: Record<Tone, string> = {
    primary: "bg-indigo-600 text-white border-indigo-700",
    secondary: "bg-amber-100 text-amber-900 border-amber-200",
    danger: "bg-rose-100 text-rose-900 border-rose-200",
    neutral: "bg-slate-100 text-slate-900 border-slate-200",
  };

  return (
    <Link
      to={to}
      className={`rounded-3xl border p-6 shadow-[0_8px_20px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_30px_rgba(15,23,42,0.14)] transition-all ${toneStyles[tone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
          <p className="mt-2 text-sm/6 opacity-90">{description}</p>
        </div>
        <ArrowRight className="w-5 h-5 mt-1 shrink-0" />
      </div>
    </Link>
  );
}
