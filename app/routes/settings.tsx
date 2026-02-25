import { useEffect, useState } from "react";
import type { Route } from "./+types/settings";
import { StudyShell } from "../components/study-shell";
import { useProgressStore } from "../data/progress-store";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Settings | 7. Sınıf Türkçe" }];
}

export default function Settings() {
  const { progress, updateSettings, resetProgress } = useProgressStore();
  const [examDate, setExamDate] = useState(progress.settings.examDate);
  const [sessionLengthMinutes, setSessionLengthMinutes] = useState(
    progress.settings.sessionLengthMinutes,
  );

  useEffect(() => {
    setExamDate(progress.settings.examDate);
    setSessionLengthMinutes(progress.settings.sessionLengthMinutes);
  }, [progress.settings.examDate, progress.settings.sessionLengthMinutes]);

  const handleSave = () => {
    updateSettings({ examDate, sessionLengthMinutes });
  };

  return (
    <StudyShell title="Settings" subtitle="Exam date, session, and data controls">
      <div className="max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.08)] space-y-5">
        <label className="block">
          <span className="text-sm font-semibold text-slate-600">Exam Date</span>
          <input
            type="date"
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2"
            value={examDate}
            onChange={(event) => setExamDate(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-600">Session Length (minutes)</span>
          <input
            type="number"
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2"
            value={sessionLengthMinutes}
            min={5}
            max={30}
            onChange={(event) => {
              const value = Number(event.target.value);
              setSessionLengthMinutes(Number.isNaN(value) ? 12 : value);
            }}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSave}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-white font-bold"
          >
            Save settings
          </button>
          <button
            onClick={() => resetProgress()}
            className="rounded-xl bg-rose-600 px-4 py-2.5 text-white font-bold"
          >
            Reset progress
          </button>
        </div>
      </div>
    </StudyShell>
  );
}
