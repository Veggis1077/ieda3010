import { Exercise } from '../types';
import { INTRO_EXERCISES } from './intro';
import { LO_EXERCISES } from './lo';
import { DO_EXERCISES } from './do';

export const EXERCISES: Exercise[] = [...INTRO_EXERCISES, ...LO_EXERCISES, ...DO_EXERCISES];
export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
