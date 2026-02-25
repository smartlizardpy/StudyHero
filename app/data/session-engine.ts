import type { ProgressState } from "./progress-store";
import { questions, type Question, type TopicId } from "./study-content";

type PlanSectionCounts = {
  dueReviews: number;
  retryQuestions: number;
  weightedWeakQuestions: number;
  newLearnQuestions: number;
  mixedRecallQuestions: number;
};

export type GeneratedPlan = {
  mode: "daily" | "drill";
  questionIds: string[];
  weakTopicIds: TopicId[];
  retryQuestionIds: string[];
  counts: PlanSectionCounts;
};

const questionsById: Record<string, Question> = Object.fromEntries(
  questions.map((question) => [question.id, question]),
);

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getTopicAccuracy(progress: ProgressState, topicId: TopicId): number {
  const stats = progress.topicStats[topicId];
  if (!stats || stats.attempts === 0) return 0;
  return stats.correct / stats.attempts;
}

export function getBottomTopics(progress: ProgressState, count = 2): TopicId[] {
  const topicIds = Object.keys(progress.topicStats) as TopicId[];

  return [...topicIds]
    .sort((a, b) => getTopicAccuracy(progress, a) - getTopicAccuracy(progress, b))
    .slice(0, count);
}

export function getRecentWrongQuestionIds(progress: ProgressState): string[] {
  return Object.entries(progress.questionHistory)
    .filter(([, history]) => history.seen > 0 && history.lastResultCorrect === false)
    .sort((a, b) => {
      const aTime = new Date(a[1].lastSeenAt ?? 0).getTime();
      const bTime = new Date(b[1].lastSeenAt ?? 0).getTime();
      return bTime - aTime;
    })
    .map(([questionId]) => questionId)
    .filter((questionId) => Boolean(questionsById[questionId]));
}

function pickWeightedByWeakness(
  progress: ProgressState,
  sourceQuestions: Question[],
  count: number,
  priorityTopics: TopicId[],
): Question[] {
  if (sourceQuestions.length === 0 || count <= 0) return [];

  const weighted = sourceQuestions.flatMap((question) => {
    const topicAccuracy = getTopicAccuracy(progress, question.topicId);
    const weaknessWeight = Math.max(1, Math.round((1 - topicAccuracy) * 6));
    const priorityBoost = priorityTopics.includes(question.topicId) ? 2 : 1;
    const copies = weaknessWeight * priorityBoost;
    return Array.from({ length: copies }, () => question);
  });

  const picked: Question[] = [];
  const used = new Set<string>();

  for (const question of shuffle(weighted)) {
    if (used.has(question.id)) continue;
    picked.push(question);
    used.add(question.id);
    if (picked.length === count) break;
  }

  if (picked.length < count) {
    for (const question of shuffle(sourceQuestions)) {
      if (used.has(question.id)) continue;
      picked.push(question);
      used.add(question.id);
      if (picked.length === count) break;
    }
  }

  return picked;
}

export function generateDailyPlan(progress: ProgressState): GeneratedPlan {
  const weakTopicIds = getBottomTopics(progress, 2);
  const recentWrong = getRecentWrongQuestionIds(progress);
  const retryQuestionIds = recentWrong.slice(0, 2);

  const dueReviewCount = Math.min(
    6,
    Object.values(progress.reviewSchedule).filter(
      (entry) => new Date(entry.dueAt).getTime() <= Date.now(),
    ).length,
  );

  const retryQuestions = retryQuestionIds
    .map((questionId) => questionsById[questionId])
    .filter(Boolean);

  const retryIdSet = new Set(retryQuestionIds);
  const nonRetryPool = questions.filter((question) => !retryIdSet.has(question.id));
  const weightedWeak = pickWeightedByWeakness(progress, nonRetryPool, 6, weakTopicIds);

  const composed = [...retryQuestions, ...weightedWeak];
  const uniqueById = Array.from(new Map(composed.map((question) => [question.id, question])).values());

  const newLearnCount = uniqueById.filter(
    (question) => (progress.questionHistory[question.id]?.seen ?? 0) === 0,
  ).length;

  return {
    mode: "daily",
    questionIds: uniqueById.map((question) => question.id),
    weakTopicIds,
    retryQuestionIds,
    counts: {
      dueReviews: dueReviewCount,
      retryQuestions: retryQuestions.length,
      weightedWeakQuestions: weightedWeak.length,
      newLearnQuestions: newLearnCount,
      mixedRecallQuestions: Math.max(0, uniqueById.length - newLearnCount - retryQuestions.length),
    },
  };
}

export function generateDrillPlan(progress: ProgressState): GeneratedPlan {
  const weakTopicIds = getBottomTopics(progress, 2);
  const recentWrong = getRecentWrongQuestionIds(progress).filter((questionId) =>
    weakTopicIds.includes(questionsById[questionId]?.topicId),
  );

  const retryQuestionIds = recentWrong.slice(0, 3);
  const retryIdSet = new Set(retryQuestionIds);

  const weakPool = questions.filter(
    (question) => weakTopicIds.includes(question.topicId) && !retryIdSet.has(question.id),
  );
  const otherPool = questions.filter(
    (question) => !weakTopicIds.includes(question.topicId) && !retryIdSet.has(question.id),
  );

  const weakQuestions = pickWeightedByWeakness(progress, weakPool, 8, weakTopicIds);
  const otherQuestions = pickWeightedByWeakness(progress, otherPool, 2, weakTopicIds);

  const baseQuestions = [...weakQuestions, ...otherQuestions];
  const retryQuestions = retryQuestionIds
    .map((questionId) => questionsById[questionId])
    .filter(Boolean);

  const queue = [...baseQuestions];
  retryQuestions.forEach((question, index) => {
    const insertAt = Math.min(queue.length, 3 + index * 4);
    queue.splice(insertAt, 0, question);
  });

  const uniqueQueue = Array.from(new Map(queue.map((question) => [question.id, question])).values());

  const newLearnCount = uniqueQueue.filter(
    (question) => (progress.questionHistory[question.id]?.seen ?? 0) === 0,
  ).length;

  return {
    mode: "drill",
    questionIds: uniqueQueue.map((question) => question.id),
    weakTopicIds,
    retryQuestionIds,
    counts: {
      dueReviews: 0,
      retryQuestions: retryQuestions.length,
      weightedWeakQuestions: weakQuestions.length,
      newLearnQuestions: newLearnCount,
      mixedRecallQuestions: Math.max(0, uniqueQueue.length - weakQuestions.length - retryQuestions.length),
    },
  };
}
