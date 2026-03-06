import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { DiagnosisResult } from '../logic/scoring';
import { getTypeData } from '../data/types';
import { colors } from '../theme/colors';

interface TypeCardProps {
  result: DiagnosisResult;
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(300, withTiming(value, { duration: 800 }));
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statTrack}>
        <Animated.View style={[styles.statFill, { backgroundColor: color }, animatedStyle]} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function TypeCard({ result }: TypeCardProps) {
  const typeData = getTypeData(result.typeName);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 500 });
    opacity.value = withTiming(1, { duration: 500 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const isRare = result.population <= 5;

  return (
    <Animated.View style={animatedStyle}>
      <LinearGradient
        colors={['#1A1635', '#251F4A']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.emoji}>{typeData?.emoji ?? '✦'}</Text>
        <Text style={styles.typeName}>{result.typeName}</Text>

        <View style={styles.populationRow}>
          <Text style={styles.populationText}>
            {isRare ? '✨ 超希少タイプ ' : ''}人口 {result.population}%
          </Text>
        </View>

        <View style={styles.stats}>
          <StatBar label="HP" value={result.hp} color={colors.success} />
          <StatBar label="MP" value={result.mp} color={colors.primary} />
        </View>

        {typeData && (
          <>
            <Text style={styles.desc}>{typeData.shortDesc}</Text>
            <View style={styles.strategyBox}>
              <Text style={styles.strategyLabel}>人生攻略法</Text>
              <Text style={styles.strategy}>{typeData.strategy}</Text>
            </View>
          </>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 8,
  },
  typeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  populationRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  populationText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  stats: {
    marginBottom: 16,
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    width: 28,
    fontWeight: '600',
  },
  statTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statFill: {
    height: '100%',
    borderRadius: 4,
  },
  statValue: {
    color: colors.text,
    fontSize: 13,
    width: 32,
    textAlign: 'right',
    fontWeight: '600',
  },
  desc: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  strategyBox: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  strategyLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  strategy: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
