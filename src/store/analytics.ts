/**
 * Derived learning analytics from the persisted progress store.
 * Accuracy per topic combines the latest score of each attempted exercise
 * with exam-part results (weighted by points).
 */
import { EXERCISES } from '../content/exercises';
import { TOPICS } from '../content/topics';
import { FLASHCARDS } from '../content/flashcards';
import { LESSONS } from '../content/course';
import { useProgress, ExerciseRecord, ExamSession, CardState } from './progress';

export interface TopicStat {
  id: string;
  label: string;
  lesson: string;
  total: number;
  attempted: number;
  solved: number;
  accuracy: number | null; // 0..1
  confidence: number | null; // 1..3
  examScore: number | null;
  weakness: number; // higher = weaker
}

export function topicStats(exercises: Record<string, ExerciseRecord>, exams: ExamSession[]): TopicStat[] {
  return TOPICS.map((t) => {
    const exs = EXERCISES.filter((e) => e.topics.includes(t.id));
    const recs = exs.map((e) => exercises[e.id]).filter((r): r is ExerciseRecord => !!r && r.attempts.length > 0);
    const scores = recs.map((r) => r.attempts[r.attempts.length - 1].score);
    const conf = recs.map((r) => r.confidence).filter((c): c is 1 | 2 | 3 => !!c);
    let examPts = 0;
    let examMax = 0;
    for (const s of exams) {
      for (const p of s.results ?? []) {
        if (p.topics.includes(t.id)) {
          examPts += p.score;
          examMax += p.max;
        }
      }
    }
    const exAcc = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    const examScore = examMax > 0 ? examPts / examMax : null;
    const parts = [exAcc, examScore].filter((v): v is number => v !== null);
    const accuracy = parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : null;
    const coverage = exs.length ? recs.length / exs.length : 1;
    const confidence = conf.length ? conf.reduce((a, b) => a + b, 0) / conf.length : null;
    // weakness: unknown topics are moderately weak; low accuracy & low confidence are weak
    const weakness = accuracy === null ? 0.6 : (1 - accuracy) * 0.75 + (1 - coverage) * 0.15 + (confidence !== null ? ((3 - confidence) / 2) * 0.1 : 0.05);
    return {
      id: t.id,
      label: t.label,
      lesson: t.lesson,
      total: exs.length,
      attempted: recs.length,
      solved: recs.filter((r) => r.solved).length,
      accuracy,
      confidence,
      examScore,
      weakness,
    };
  });
}

export function useTopicStats() {
  const exercises = useProgress((s) => s.exercises);
  const exams = useProgress((s) => s.exams);
  return topicStats(exercises, exams);
}

export function dueCards(cards: Record<string, CardState>, now = Date.now()) {
  return FLASHCARDS.filter((c) => {
    const st = cards[c.id];
    return !st || st.due <= now;
  });
}

export function overall(lessonsDone: Record<string, number>, exercises: Record<string, ExerciseRecord>) {
  const solved = EXERCISES.filter((e) => exercises[e.id]?.solved).length;
  const attempted = EXERCISES.filter((e) => (exercises[e.id]?.attempts.length ?? 0) > 0).length;
  const done = LESSONS.filter((l) => lessonsDone[l.id]).length;
  return { solved, attempted, totalEx: EXERCISES.length, lessonsDone: done, totalLessons: LESSONS.length };
}
