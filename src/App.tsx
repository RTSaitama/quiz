 import { useEffect, useState } from 'react';
import { fetchSteps } from './api/fetchSteps';
import type { QuizStep, AnswerMap } from './typedefs/types';
import ProgressBar from './components/ProgressBar/ProgressBar';
import QuestionInput from './components/QuestionInput/QuestionInput';
import ResultsScreen from './components/ResultsScreen/ResultsScreen';
import { processResults, type QuizResult } from './utils/processResults';
import { indexQuizResult } from './Algolia/Algolia';

import styles from './App.module.scss';

export default function App() {
  const [steps, setSteps] = useState<QuizStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    fetchSteps()
      .then((data) => {
        console.log('Fetched steps:', data);
        setSteps(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.container}>LOADING...</div>;
  if (!steps.length) return <div className={styles.container}>NO STEPS LOADED</div>;

  const currentStep = steps[currentStepIndex];
  const currentQuestion = currentStep?.questions[activeQuestionIndex];
  const totalQuestions = steps.reduce((sum, step) => sum + step.questions.length, 0);
  
  const globalQuestionIndex = steps
    .slice(0, currentStepIndex)
    .reduce((sum, step) => sum + step.questions.length, 0) + activeQuestionIndex;

  if (finished && quizResult) {
    return (
      <ResultsScreen
        result={quizResult}
        onRestart={() => window.location.reload()}
      />
    );
  }

  if (!currentQuestion) {
    return <div className={styles.container}>QUESTION NOT FOUND</div>
  }

  const handleSelect = (option: string) => {
    setAnswers((prev) => {
      const current = prev[currentQuestion.id];
      if (currentQuestion.type === 'multi') {
        const selected = Array.isArray(current) ? current : [];
        return {
          ...prev,
          [currentQuestion.id]: selected.includes(option) ? selected.filter(item => item !== option) : [...selected, option]
        };
      }
      return { ...prev, [currentQuestion.id]: option };
    });
  };

  const handleNext = () => {
    if (activeQuestionIndex < currentStep.questions.length - 1) {
      setActiveQuestionIndex(prev => prev + 1);
    } else if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setActiveQuestionIndex(0);
    } else {
      console.log('Steps:', steps);
      console.log('Answers:', answers);
      const result = processResults(steps, answers);
      setQuizResult(result);
      setFinished(true);
 
      indexQuizResult(result).catch((error) => {
        console.error('Failed to index result:', error);
      });
    }
  };

  const handlePrevious = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(prev => prev - 1);
    } else if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setActiveQuestionIndex(steps[currentStepIndex - 1].questions.length - 1);
    }
  };

  const isSelected = (option: string) => {
    const value = answers[currentQuestion.id];
    return Array.isArray(value) ? value.includes(option) : value === option;
  };

  const canContinue = true;

  const isFirstQuestion = currentStepIndex === 0 && activeQuestionIndex === 0;
  const isLastQuestion = currentStepIndex === steps.length - 1 && activeQuestionIndex === currentStep.questions.length - 1;
  
  console.log('Current answers state:', answers);

  return (
    <div className={styles.container}>
      <div>
        <ProgressBar
          currentStep={currentStepIndex}
          totalSteps={steps.length}
          currentQuestion={globalQuestionIndex}
          totalQuestions={totalQuestions}
        />
        <h2 className={styles.questionTitle}>{currentQuestion.text}</h2>
        <div className={styles.optionsList}>
          {currentQuestion.type === 'multi' ? (
            currentQuestion.options.length > 0 ? (
              currentQuestion.options.map((option) => {
                const active = isSelected(option);
                return (
                  <div
                    key={option}
                    onClick={() => handleSelect(option)}
                    className={`${styles.optionTile} ${active ? styles.active : ''}`}
                  >
                    <div className={`${styles.checkbox} ${active ? styles.checked : ''}`} />
                    <span className={styles.optionText}>{option}</span>
                  </div>
                );
              })
            ) : (
              <div style={{color: 'red'}}>No options for ID: {currentQuestion.id}</div>
            )
          ) : (
            <QuestionInput
              value={(answers[currentQuestion.id] as string) || ''}
              onChange={(value) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))}
            />
          )}
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button 
          disabled={isFirstQuestion}
          onClick={handlePrevious}
          className={styles.prevButton}
        >
          Previous
        </button>
        <button 
          disabled={!canContinue}
          onClick={handleNext}
          className={styles.nextButton}
        >
          {isLastQuestion ? 'SUBMIT' : 'Next'}
        </button>
      </div>
    </div>
  );
}