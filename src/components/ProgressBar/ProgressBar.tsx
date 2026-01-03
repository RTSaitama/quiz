import styles from './ProgressBar.module.scss';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  currentQuestion: number;
  totalQuestions: number;
}

export default function ProgressBar({
 
  currentQuestion,
  totalQuestions,
}: ProgressBarProps) {
  const percentage = totalQuestions > 0 ? (currentQuestion / totalQuestions) * 100 : 0;

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className={styles.progressText}>
        Питання {currentQuestion + 1} з {totalQuestions}
      </div>
    </div>
  );
}