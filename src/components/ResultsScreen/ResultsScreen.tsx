import type { QuizResult } from '../../utils/processResults';
import styles from './ResultsScreen.module.scss';

interface ResultsScreenProps {
  result: QuizResult;
  onRestart: () => void;
}

export default function ResultsScreen({ result, onRestart }: ResultsScreenProps) {
  return (
    <div className={styles.resultsContainer}>
      <h2 className={styles.title}>Результати квізу</h2>
      
      <div className={styles.scoreCard}>
        <div className={styles.percentage}>{result.percentage}%</div>
        <div className={styles.scoreText}>
          Правильних відповідей: {result.totalCorrect} з {result.totalQuestions}
        </div>
      </div>

      <div className={styles.stepsDetails}>
        {result.steps.map((step) => (
          <div key={step.stepId} className={styles.stepSection}>
            <h3 className={styles.stepTitle}>
              Крок {step.stepNumber}: {step.stepTitle}
            </h3>
            <div className={styles.stepStats}>
              {step.correctCount} з {step.totalCount}
            </div>
            
            <div className={styles.questionsDetail}>
              {step.questions.map((question) => (
                <div key={question.questionId} className={styles.questionDetail}>
                  <div className={`${styles.questionStatus} ${question.isCorrect ? styles.correct : styles.incorrect}`}>
                    {question.isCorrect ? '✓' : '✗'}
                  </div>
                  <div className={styles.questionContent}>
                    <p className={styles.questionText}>{question.questionText}</p>
                    <div className={styles.answerInfo}>
                      <div>
                        <span className={styles.label}>Твоя відповідь:</span>
                        <span className={styles.answer}>{question.userAnswer}</span>
                      </div>
                      {!question.isCorrect && (
                        <div>
                          <span className={styles.label}>Правильна відповідь:</span>
                          <span className={styles.correctAnswer}>{question.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={onRestart} className={styles.restartButton}>
        ПОВТОРИТИ КВІЗ
      </button>
    </div>
  );
}