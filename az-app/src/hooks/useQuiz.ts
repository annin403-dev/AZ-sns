import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';
import { calculateResult, DiagnosisResult } from '../logic/scoring';
import { questions } from '../data/questions';

export function useQuiz() {
  const { state, setAnswer, setResult } = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = (currentIndex + 1) / totalQuestions;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleAnswer = (value: number) => {
    setAnswer(currentIndex, value);
  };

  const goNext = async (): Promise<DiagnosisResult | null> => {
    if (isLastQuestion) {
      const result = calculateResult(state.answers);
      setResult(result);
      try {
        await AsyncStorage.setItem('az_result', JSON.stringify(result));
      } catch {
        // ignore storage errors
      }
      return result;
    } else {
      setCurrentIndex((i) => i + 1);
      return null;
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  return {
    currentQuestion,
    currentIndex,
    totalQuestions,
    progress,
    isLastQuestion,
    currentAnswer: state.answers[currentIndex],
    handleAnswer,
    goNext,
    goPrev,
  };
}
