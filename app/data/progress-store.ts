import { useMemo, useState } from "react";
import { flashcards, questions, topicLabels, type TopicId } from "./study-content";

type QuestionHistory = {
  seen: number;
  correct: number;
  totalTimeMs: number;
  lastSeenAt: string | null;
};

type TopicStats = {
  attempts: number;
  correct: number;
};

type ReviewSchedule = {
  dueAt: string;
  intervalDays: number;
  ease: number;
  reps: number;
  lapses: number;
};

type SessionSummary = {
  mode: "daily" | "quiz" | "review" | "drill";
  accuracy: number;
  avgTimeMs: number;
  totalQuestions: number;
  correctCount: number;
  improvedTopicId?: TopicId;
  worsenedTopicId?: TopicId;
  finishedAt: string;
};

type StudySettings = {
  examDate: string;
  sessionLengthMinutes: number;
};

export type ProgressState = {
  topicStats: Record<TopicId, TopicStats>;
  questionHistory: Record<string, QuestionHistory>;
  reviewSchedule: Record<string, ReviewSchedule>;
  streak: number;
  totalStudyMinutes: number;
  readiness: number;
  lastSession: SessionSummary | null;
  settings: StudySettings;
  updatedAt: string;
};

const STORAGE_KEY = "ates.study.progress.v1";

function nowIso() {
  return new Date().toISOString();
}

function defaultQuestionHistory(): Record<string, QuestionHistory> {
  return Object.fromEntries(
    questions.map((question) => [
      question.id,
      { seen: 0, correct: 0, totalTimeMs: 0, lastSeenAt: null },
    ]),
  );
}

function defaultTopicStats(): Record<TopicId, TopicStats> {
  return Object.fromEntries(
    Object.keys(topicLabels).map((topicId) => [topicId, { attempts: 0, correct: 0 }]),
  ) as Record<TopicId, TopicStats>;
}

function defaultReviewSchedule(): Record<string, ReviewSchedule> {
  return Object.fromEntries(
    flashcards.map((card) => [
      card.id,
      {
        dueAt: nowIso(),
        intervalDays: 0,
        ease: 2.5,
        reps: 0,
        lapses: 0,
      },
    ]),
  );
}

export function createDefaultProgress(): ProgressState {
  return {
    topicStats: defaultTopicStats(),
    questionHistory: defaultQuestionHistory(),
    reviewSchedule: defaultReviewSchedule(),
    streak: 0,
    totalStudyMinutes: 0,
    readiness: 0,
    lastSession: null,
    settings: {
      examDate: "2026-04-06",
      sessionLengthMinutes: 12,
    },
    updatedAt: nowIso(),
  };
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function mergeProgress(raw: Partial<ProgressState> | null | undefined): ProgressState {
  const base = createDefaultProgress();

  if (!raw) return base;

  return {
    ...base,
    ...raw,
    topicStats: { ...base.topicStats, ...(raw.topicStats ?? {}) },
    questionHistory: { ...base.questionHistory, ...(raw.questionHistory ?? {}) },
    reviewSchedule: { ...base.reviewSchedule, ...(raw.reviewSchedule ?? {}) },
    settings: { ...base.settings, ...(raw.settings ?? {}) },
    updatedAt: raw.updatedAt ?? base.updatedAt,
  };
}

export function loadProgress(): ProgressState {
  const storage = getStorage();
  if (!storage) return createDefaultProgress();

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return createDefaultProgress();

  try {
    return mergeProgress(JSON.parse(raw) as Partial<ProgressState>);
  } catch {
    return createDefaultProgress();
  }
}

export function saveProgress(progress: ProgressState): ProgressState {
  const storage = getStorage();
  const merged = mergeProgress({ ...progress, updatedAt: nowIso() });
  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }
  return merged;
}

function computeReadiness(progress: ProgressState): number {
  const totals = Object.values(progress.topicStats).reduce(
    (acc, topic) => {
      acc.attempts += topic.attempts;
      acc.correct += topic.correct;
      return acc;
    },
    { attempts: 0, correct: 0 },
  );

  if (totals.attempts === 0) return 0;

  const accuracy = (totals.correct / totals.attempts) * 100;
  const streakBonus = Math.min(progress.streak * 2, 20);
  return Math.round(Math.min(100, accuracy * 0.8 + streakBonus));
}

export function recordQuestionAttempt(params: {
  questionId: string;
  topicId: TopicId;
  isCorrect: boolean;
  elapsedMs: number;
}): ProgressState {
  const progress = loadProgress();

  const questionHistory = progress.questionHistory[params.questionId] ?? {
    seen: 0,
    correct: 0,
    totalTimeMs: 0,
    lastSeenAt: null,
  };

  const topic = progress.topicStats[params.topicId] ?? { attempts: 0, correct: 0 };

  const next = {
    ...progress,
    questionHistory: {
      ...progress.questionHistory,
      [params.questionId]: {
        seen: questionHistory.seen + 1,
        correct: questionHistory.correct + (params.isCorrect ? 1 : 0),
        totalTimeMs: questionHistory.totalTimeMs + params.elapsedMs,
        lastSeenAt: nowIso(),
      },
    },
    topicStats: {
      ...progress.topicStats,
      [params.topicId]: {
        attempts: topic.attempts + 1,
        correct: topic.correct + (params.isCorrect ? 1 : 0),
      },
    },
  };

  next.readiness = computeReadiness(next);
  return saveProgress(next);
}

export function completeSession(summary: Omit<SessionSummary, "finishedAt">): ProgressState {
  const progress = loadProgress();

  const sessionMinutes = Math.max(1, Math.round((summary.avgTimeMs * summary.totalQuestions) / 60000));

  const next: ProgressState = {
    ...progress,
    streak: progress.streak + 1,
    totalStudyMinutes: progress.totalStudyMinutes + sessionMinutes,
    lastSession: {
      ...summary,
      finishedAt: nowIso(),
    },
    updatedAt: nowIso(),
  };

  next.readiness = computeReadiness(next);
  return saveProgress(next);
}

export function updateSettings(settings: Partial<StudySettings>): ProgressState {
  const progress = loadProgress();
  const next: ProgressState = {
    ...progress,
    settings: {
      ...progress.settings,
      ...settings,
    },
    updatedAt: nowIso(),
  };

  return saveProgress(next);
}

export function resetProgress(): ProgressState {
  return saveProgress(createDefaultProgress());
}

export function getDueReviewStats(progress: ProgressState) {
  const now = Date.now();
  let due = 0;
  let overdue = 0;

  Object.values(progress.reviewSchedule).forEach((entry) => {
    const dueAt = new Date(entry.dueAt).getTime();
    if (dueAt <= now) {
      due += 1;
    }

    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    if (dueAt < oneDayAgo) {
      overdue += 1;
    }
  });

  return { due, overdue };
}

export function getWeakestTopicId(progress: ProgressState): TopicId {
  const entries = Object.entries(progress.topicStats) as Array<[TopicId, TopicStats]>;

  entries.sort((a, b) => {
    const aAcc = a[1].attempts === 0 ? 0 : a[1].correct / a[1].attempts;
    const bAcc = b[1].attempts === 0 ? 0 : b[1].correct / b[1].attempts;
    return aAcc - bAcc;
  });

  return entries[0]?.[0] ?? "ek-fiil";
}

export function useProgressStore() {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());

  return useMemo(
    () => ({
      progress,
      refresh: () => setProgress(loadProgress()),
      recordQuestionAttempt: (params: {
        questionId: string;
        topicId: TopicId;
        isCorrect: boolean;
        elapsedMs: number;
      }) => {
        const next = recordQuestionAttempt(params);
        setProgress(next);
        return next;
      },
      completeSession: (summary: Omit<SessionSummary, "finishedAt">) => {
        const next = completeSession(summary);
        setProgress(next);
        return next;
      },
      updateSettings: (settings: Partial<StudySettings>) => {
        const next = updateSettings(settings);
        setProgress(next);
        return next;
      },
      resetProgress: () => {
        const next = resetProgress();
        setProgress(next);
        return next;
      },
    }),
    [progress],
  );
}
