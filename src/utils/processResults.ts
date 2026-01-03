 import type { QuizStep, AnswerMap } from '../typedefs/types';

export interface QuestionResult {
  questionId: string;
  questionText: string;
  questionType: string;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
}

export interface StepResult {
  stepId: string;
  stepTitle: string;
  stepNumber: number;
  questions: QuestionResult[];
  correctCount: number;
  totalCount: number;
}

export interface QuizResult {
  steps: StepResult[];
  totalQuestions: number;
  totalCorrect: number;
  percentage: number;
}

function normalizeCorrectAnswers(correct: string | string[]): string[] {
  if (Array.isArray(correct)) {
    return correct.map(answer => String(answer).trim());
  }
  if (typeof correct === 'string') {
    if (correct.includes(',')) {
      return correct.split(',').map(answer => answer.trim());
    }
    return [correct.trim()];
  }
  return [];
}

function isAnswerCorrect(userAnswer: string | string[], correctAnswer: string | string[]): boolean {
  const correctArray = normalizeCorrectAnswers(correctAnswer);
  
  if (Array.isArray(userAnswer)) {
    if (userAnswer.length !== correctArray.length) {
      return false;
    }
    const userSorted = userAnswer.map(answer => String(answer).trim()).sort();
    const correctSorted = correctArray.sort();
    return userSorted.every((answer, index) => answer === correctSorted[index]);
  } else {
    return correctArray.includes(String(userAnswer).trim());
  }
}

export function processResults(
  steps: QuizStep[],
  answers: AnswerMap
): QuizResult {
  const stepResults: StepResult[] = steps.map((step) => {
    const questionResults: QuestionResult[] = step.questions.map((question) => {
      const userAnswer = answers[question.id] || '';
      
      let isCorrect: boolean;
      if (question.type === 'open') {
        isCorrect = true;
      } else {
        isCorrect = isAnswerCorrect(userAnswer, question.correctAnswer);
      }

      return {
        questionId: question.id,
        questionText: question.text,
        questionType: question.type,
        userAnswer: userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
      };
    });

    const correctCount = questionResults.filter((question) => question.isCorrect).length;

    return {
      stepId: step.id,
      stepTitle: step.title,
      stepNumber: step.stepNumber,
      questions: questionResults,
      correctCount,
      totalCount: questionResults.length,
    };
  });

  const totalCorrect = stepResults.reduce((sum, step) => sum + step.correctCount, 0);
  const totalQuestions = stepResults.reduce((sum, step) => sum + step.totalCount, 0);
  const percentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return {
    steps: stepResults,
    totalQuestions,
    totalCorrect,
    percentage,
  };
}