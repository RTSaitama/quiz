 import type { EntrySkeletonType, EntryFieldTypes } from 'contentful';
export type Answer = {
  id: number,
  text: string,
  answers: string | string[] ,
  correctAnswer: string | string[],
}
export interface Question {
  id: string;
  text: string;
  type: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizStep {
  id: string;
  title: string;
  stepNumber: number;
  questions: Question[];
}

export type AnswerMap = Record<string, string | string[]>;

export interface QuestionSkeleton extends EntrySkeletonType {
  contentTypeId: 'question';
  fields: {
    questionText: EntryFieldTypes.Text;
    questionType: EntryFieldTypes.Symbol;
    answers: EntryFieldTypes.Object;
    correctAnswer: EntryFieldTypes.Object;
  };
}

export interface QuizStepSkeleton extends EntrySkeletonType {
  contentTypeId: 'quizStep';
  fields: {
    title: EntryFieldTypes.Text;
    stepNumber: EntryFieldTypes.Integer;
    questions: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<QuestionSkeleton>>;
  };
}