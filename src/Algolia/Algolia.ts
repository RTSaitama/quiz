import { algoliasearch } from 'algoliasearch';
import type { QuizResult } from '../utils/processResults';

const client = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID || '',
  import.meta.env.VITE_ALGOLIA_ADMIN_KEY || ''
);

export interface AlgoliaResultRecord {
  objectID: string;
  timestamp: number;
  totalQuestions: number;
  totalCorrect: number;
  percentage: number;
  stepResults: {
    stepNumber: number;
    stepTitle: string;
    correctCount: number;
    totalCount: number;
  }[];
}

export async function indexQuizResult(result: QuizResult): Promise<void> {
  const record: AlgoliaResultRecord = {
    objectID: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    totalQuestions: result.totalQuestions,
    totalCorrect: result.totalCorrect,
    percentage: result.percentage,
    stepResults: result.steps.map((step) => ({
      stepNumber: step.stepNumber,
      stepTitle: step.stepTitle,
      correctCount: step.correctCount,
      totalCount: step.totalCount,
    })),
  };

  try {
    await client.saveObject({
      indexName: 'quiz_results',
      body: record,
    });
    console.log('Quiz result indexed to Algolia:', record.objectID);
  } catch (error) {
    console.error('Error indexing to Algolia:', error);
    throw error;
  }
}