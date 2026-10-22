/**
 * Persistent learning progress (localStorage via zustand/persist).
 * Everything here reflects real user actions – nothing is mocked.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { progressKey, migrateLegacyProgress } from './user';

migrateLegacyProgress();

export interface Attempt {
  at: number;
  score: number; // 0..1
}

export interface ExerciseRecord {
  attempts: Attempt[];
  hintsUsed: number;
  solved: boolean;
  revealed: boolean;
  confidence?: 1 | 2 | 3;
  lastAt: number;
}

export interface CardState {
  box: number; // Leitner box 0..5
  due: number; // timestamp
  reviews: number;
  lapses: number;
}

export interface ExamPartResult {
  partId: string;
  score: number; // points earned
  max: number;
  topics: string[];
}

export interface ExamSession {
  id: string; // unique session id
  examId: string;
  startedAt: number;
  durationMin: number;
  finishedAt?: number;
  answers: Record<string, unknown>;
  selfGrades: Record<string, number[]>; // partId -> checked rubric indices
  results?: ExamPartResult[];
}

interface State {
  theme: 'light' | 'dark';
  lessonsVisited: Record<string, number>;
  lessonsDone: Record<string, number>;
  exercises: Record<string, ExerciseRecord>;
  cards: Record<string, CardState>;
  exams: ExamSession[];
  lastPath?: string;
  examDate: string; // ISO
  setTheme: (t: 'light' | 'dark') => void;
  visitLesson: (id: string) => void;
  toggleLessonDone: (id: string) => void;
  recordAttempt: (id: string, score: number) => void;
  useHint: (id: string) => void;
  reveal: (id: string) => void;
  setConfidence: (id: string, c: 1 | 2 | 3) => void;
  resetExercise: (id: string) => void;
  reviewCard: (id: string, grade: 'again' | 'hard' | 'good' | 'easy') => void;
  startExam: (examId: string, durationMin: number) => string;
  saveExamAnswer: (sessionId: string, key: string, value: unknown) => void;
  saveSelfGrade: (sessionId: string, partId: string, checked: number[]) => void;
  finishExam: (sessionId: string, results: ExamPartResult[]) => void;
  deleteExam: (sessionId: string) => void;
  setLastPath: (p: string) => void;
  setExamDate: (d: string) => void;
  resetAll: () => void;
  importState: (json: string) => boolean;
}

export const BOX_DAYS = [0, 1, 2, 4, 8, 16];
const DAY = 86400000;

const initial = {
  theme: 'light' as const,
  lessonsVisited: {},
  lessonsDone: {},
  exercises: {},
  cards: {},
  exams: [],
  examDate: '2026-11-04T09:00:00+08:00',
};

const emptyRec = (): ExerciseRecord => ({ attempts: [], hintsUsed: 0, solved: false, revealed: false, lastAt: Date.now() });

export const useProgress = create<State>()(
  persist(
    (set, get) => ({
      ...initial,
      theme: typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      setTheme: (t) => {
        document.documentElement.classList.toggle('dark', t === 'dark');
        try {
          localStorage.setItem('ieda-theme', t);
        } catch {
          /* ignore */
        }
        set({ theme: t });
      },
      visitLesson: (id) => set((s) => ({ lessonsVisited: { ...s.lessonsVisited, [id]: Date.now() } })),
      toggleLessonDone: (id) =>
        set((s) => {
          const d = { ...s.lessonsDone };
          if (d[id]) delete d[id];
          else d[id] = Date.now();
          return { lessonsDone: d };
        }),
      recordAttempt: (id, score) =>
        set((s) => {
          const r = s.exercises[id] ?? emptyRec();
          return {
            exercises: {
              ...s.exercises,
              [id]: { ...r, attempts: [...r.attempts, { at: Date.now(), score }], solved: r.solved || score >= 0.999, lastAt: Date.now() },
            },
          };
        }),
      useHint: (id) =>
        set((s) => {
          const r = s.exercises[id] ?? emptyRec();
          return { exercises: { ...s.exercises, [id]: { ...r, hintsUsed: r.hintsUsed + 1, lastAt: Date.now() } } };
        }),
      reveal: (id) =>
        set((s) => {
          const r = s.exercises[id] ?? emptyRec();
          return { exercises: { ...s.exercises, [id]: { ...r, revealed: true, lastAt: Date.now() } } };
        }),
      setConfidence: (id, c) =>
        set((s) => {
          const r = s.exercises[id] ?? emptyRec();
          return { exercises: { ...s.exercises, [id]: { ...r, confidence: c } } };
        }),
      resetExercise: (id) =>
        set((s) => {
          const e = { ...s.exercises };
          delete e[id];
          return { exercises: e };
        }),
      reviewCard: (id, grade) =>
        set((s) => {
          const c = s.cards[id] ?? { box: 0, due: 0, reviews: 0, lapses: 0 };
          let box = c.box;
          if (grade === 'again') box = 0;
          else if (grade === 'hard') box = Math.max(1, box);
          else if (grade === 'good') box = Math.min(5, box + 1);
          else box = Math.min(5, box + 2);
          const days = grade === 'again' ? 0 : BOX_DAYS[box];
          const due = grade === 'again' ? Date.now() + 60_000 : Date.now() + days * DAY;
          return {
            cards: {
              ...s.cards,
              [id]: { box, due, reviews: c.reviews + 1, lapses: c.lapses + (grade === 'again' ? 1 : 0) },
            },
          };
        }),
      startExam: (examId, durationMin) => {
        const id = `${examId}-${Date.now()}`;
        set((s) => ({ exams: [...s.exams, { id, examId, startedAt: Date.now(), durationMin, answers: {}, selfGrades: {} }] }));
        return id;
      },
      saveExamAnswer: (sid, key, value) =>
        set((s) => ({ exams: s.exams.map((e) => (e.id === sid ? { ...e, answers: { ...e.answers, [key]: value } } : e)) })),
      saveSelfGrade: (sid, partId, checked) =>
        set((s) => ({ exams: s.exams.map((e) => (e.id === sid ? { ...e, selfGrades: { ...e.selfGrades, [partId]: checked } } : e)) })),
      finishExam: (sid, results) =>
        set((s) => ({ exams: s.exams.map((e) => (e.id === sid ? { ...e, finishedAt: e.finishedAt ?? Date.now(), results } : e)) })),
      deleteExam: (sid) => set((s) => ({ exams: s.exams.filter((e) => e.id !== sid) })),
      setLastPath: (p) => set({ lastPath: p }),
      setExamDate: (d) => set({ examDate: d }),
      resetAll: () => set({ ...initial, theme: get().theme }),
      importState: (json) => {
        try {
          const data = JSON.parse(json);
          if (typeof data !== 'object' || !data) return false;
          set({
            lessonsVisited: data.lessonsVisited ?? {},
            lessonsDone: data.lessonsDone ?? {},
            exercises: data.exercises ?? {},
            cards: data.cards ?? {},
            exams: data.exams ?? [],
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: progressKey(),
      version: 1,
      storage: createJSONStorage(() => {
        try {
          localStorage.setItem('__t', '1');
          localStorage.removeItem('__t');
          return localStorage;
        } catch {
          const mem: Record<string, string> = {};
          return {
            getItem: (k: string) => mem[k] ?? null,
            setItem: (k: string, v: string) => void (mem[k] = v),
            removeItem: (k: string) => void delete mem[k],
          };
        }
      }),
      partialize: (s) => ({
        lessonsVisited: s.lessonsVisited,
        lessonsDone: s.lessonsDone,
        exercises: s.exercises,
        cards: s.cards,
        exams: s.exams,
        lastPath: s.lastPath,
        examDate: s.examDate,
      }),
    },
  ),
);
