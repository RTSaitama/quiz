/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from 'contentful';
import type { Entry } from 'contentful';
import type { QuizStep, QuizStepSkeleton, QuestionSkeleton } from '../typedefs/types';

const client = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE || '',
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN || '',
});

export async function fetchSteps(): Promise<QuizStep[]> {
  const response = await client.getEntries<QuizStepSkeleton>({
    content_type: 'quizStep',
    order: ['fields.stepNumber' as any],
    include: 2,
  });

  return response.items.map((stepItem: Entry<QuizStepSkeleton, undefined, string>) => {
    const stepFields = stepItem.fields;
    
    const questions = (stepFields.questions || [])
      .filter((question): question is Entry<QuestionSkeleton, undefined, string> => 
        question && typeof question === 'object' && 'fields' in question
      )
      .map((question) => {
        const questionFields = question.fields;
        
        let options: string[] = [];
        const rawAnswers = questionFields.answers as any;

        if (rawAnswers) {
          if (Array.isArray(rawAnswers.answers)) {
            options = rawAnswers.answers;
          } else if (Array.isArray(rawAnswers.options)) {
            options = rawAnswers.options;
          } else if (Array.isArray(rawAnswers)) {
            options = rawAnswers;
          }
        }

        const rawCorrectAnswer = questionFields.correctAnswer as any;
        let correctAnswer = '';
        
        if (typeof rawCorrectAnswer === 'string') {
          correctAnswer = rawCorrectAnswer;
        } else if (rawCorrectAnswer && typeof rawCorrectAnswer === 'object') {
          correctAnswer = rawCorrectAnswer.correctAnswer || rawCorrectAnswer.answer || '';
        }

        return {
          id: question.sys.id,
          text: String(questionFields.questionText || ''),
          type: String(questionFields.questionType || 'multi').toLowerCase(),
          options: options.map(String).filter(option => option.trim() !== ''),
          correctAnswer: correctAnswer,
        };
      });

    return {
      id: stepItem.sys.id,
      title: String(stepFields.title || ''),
      stepNumber: Number(stepFields.stepNumber || 0),
      questions,
    };
  });
}