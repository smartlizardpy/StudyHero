import { useEffect, useState } from "react";

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function SessionTimerPill() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-full bg-slate-900 text-white px-3 py-1.5 text-xs font-bold tracking-wide">
      Session {formatTime(seconds)}
    </div>
  );
}
