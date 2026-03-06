import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DiagnosisResult } from '../logic/scoring';
import { getTypeData } from '../data/types';
import { colors } from '../theme/colors';

interface ShareCardProps {
  result: DiagnosisResult;
}

export default function ShareCard({ result }: ShareCardProps) {
  const typeData = getTypeData(result.typeName);

  return (
    <LinearGradient
      colors={['#0D0B1E', '#1A1635', '#251F4A']}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>✦ AZ ✦</Text>
        <Text style={styles.subtitle}>自分を映す鏡のゲーム</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Title */}
      <Text style={styles.label}>私のAZタイプ</Text>

      {/* Type */}
      <Text style={styles.emoji}>{typeData?.emoji ?? '✦'}</Text>
      <Text style={styles.typeName}>{result.typeName}</Text>

      {/* Population */}
      <View style={styles.populationBadge}>
        <Text style={styles.populationText}>人口 {result.population}%</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>HP</Text>
          <Text style={styles.statValue}>{result.hp}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>MP</Text>
          <Text style={styles.statValue}>{result.mp}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Footer */}
      <Text style={styles.url}>az-app.com</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 320,
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primaryLight,
    letterSpacing: 4,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
    letterSpacing: 1,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  typeName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  populationBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  populationText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 4,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  url: {
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 1,
  },
});
