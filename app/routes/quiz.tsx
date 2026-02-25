import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/quiz";
import { StudyShell } from "../components/study-shell";
import { questions } from "../data/study-content";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Quiz | 7. Sınıf Türkçe" }];
}

export default function Quiz() {
  const navigate = useNavigate();
  const items = useMemo(() => questions.slice(0, 5), []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const item = items[index];
  const accuracy = useMemo(() => Math.round((correctCount / items.length) * 100), [correctCount]);

  const onCheck = () => {
    if (selected === null) return;
    setChecked(true);
    if (selected === item.correctIndex) {
      setCorrectCount((x) => x + 1);
    }
  };

  const onNext = () => {
    if (index < items.length - 1) {
      setIndex((x) => x + 1);
      setSelected(null);
      setChecked(false);
      return;
    }

    navigate(`/results?accuracy=${accuracy}`);
  };

  return (
    <StudyShell title="Exam Mode" subtitle="Timed exam-style session" showTimer>
      <section className="max-w-4xl mx-auto">
        <p className="text-sm font-bold text-slate-600 mb-3">Soru {index + 1}/{items.length}</p>
        <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
          <h2 className="text-xl font-black text-slate-900">{item.prompt}</h2>

          <div className="mt-5 space-y-3">
            {item.choices.map((choice, choiceIndex) => {
              const base = "w-full text-left rounded-2xl border-2 p-4 font-semibold transition-all";
              const style = !checked
                ? selected === choiceIndex
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-indigo-300"
                : choiceIndex === item.correctIndex
                  ? "border-emerald-500 bg-emerald-50"
                  : choiceIndex === selected
                    ? "border-rose-500 bg-rose-50"
                    : "border-slate-200 bg-white opacity-50";

              return (
                <button
                  key={choice}
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
              <p><strong>Rule:</strong> {item.rule}</p>
              <p className="mt-1"><strong>Trap:</strong> {item.trap}</p>
              <p className="mt-1"><strong>Memory Hook:</strong> {item.memoryHook}</p>
            </div>
          ) : null}

          <div className="mt-6">
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
                className="inline-flex items-center rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white"
              >
                {index < items.length - 1 ? "Next" : "Go to results"}
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            )}
          </div>
        </article>
      </section>
    </StudyShell>
  );
}
