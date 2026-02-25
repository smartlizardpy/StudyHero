import type { ReactNode } from "react";
import { BookOpen } from "lucide-react";
import { NavLink } from "react-router";
import { SessionTimerPill } from "./session-timer-pill";

type StudyShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  showTimer?: boolean;
};

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/daily", label: "Daily" },
  { to: "/quiz", label: "Quiz" },
  { to: "/review", label: "Review" },
  { to: "/drill", label: "Drill" },
  { to: "/results", label: "Results" },
  { to: "/analytics", label: "Analytics" },
  { to: "/settings", label: "Settings" },
];

export function StudyShell({ title, subtitle, children, showTimer = false }: StudyShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_45%,_#e2e8f0)] font-sans">
      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-slate-200 shadow-[0_4px_16px_rgba(15,23,42,0.08)]">
        <div className="px-4 sm:px-7 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-[0_8px_16px_rgba(79,70,229,0.35)]">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 tracking-tight text-lg">{title}</h1>
                <p className="text-xs text-slate-500">{subtitle}</p>
              </div>
            </div>
            {showTimer ? <SessionTimerPill /> : null}
          </div>

          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "px-3 py-2 text-sm rounded-full font-semibold transition-colors",
                    isActive
                      ? "bg-indigo-600 text-white shadow-[0_8px_16px_rgba(79,70,229,0.28)]"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="p-5 sm:p-8 lg:p-10 min-h-[calc(100vh-126px)]">{children}</main>
    </div>
  );
}
