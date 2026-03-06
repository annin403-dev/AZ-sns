import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import ProgressBar from '../components/ProgressBar';
import SliderQuestion from '../components/SliderQuestion';
import { useQuiz } from '../hooks/useQuiz';
import { colors } from '../theme/colors';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Quiz'>;
};

export default function QuizScreen({ navigation }: Props) {
  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    progress,
    isLastQuestion,
    currentAnswer,
    handleAnswer,
    goNext,
    goPrev,
  } = useQuiz();

  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentIndex]);

  const handleNext = async () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(async () => {
      const result = await goNext();
      if (result) {
        navigation.navigate('Result');
      }
    });
  };

  const handleBack = () => {
    if (currentIndex === 0) {
      navigation.goBack();
    } else {
      goPrev();
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backText}>← 戻る</Text>
          </TouchableOpacity>
          <Text style={styles.counter}>
            {currentIndex + 1} / {totalQuestions}
          </Text>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} />
        </View>

        {/* Question */}
        <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
          <Text style={styles.axisTag}>{getAxisLabel(currentQuestion.axis)}</Text>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>

          <SliderQuestion
            value={currentAnswer}
            onValueChange={handleAnswer}
            lowLabel={currentQuestion.lowLabel}
            highLabel={currentQuestion.highLabel}
          />
        </Animated.View>

        {/* Next Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleNext}
            style={styles.nextButton}
            activeOpacity={0.85}
          >
            <Text style={styles.nextText}>
              {isLastQuestion ? '結果を見る ✦' : '次へ →'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function getAxisLabel(axis: string): string {
  const labels: Record<string, string> = {
    thinking: '思考スタイル',
    action: '行動スタイル',
    theme: '人生テーマ',
    energy: 'エネルギー',
  };
  return labels[axis] ?? '';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    padding: 4,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  counter: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 40,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  axisTag: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 34,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 24,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  nextText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
