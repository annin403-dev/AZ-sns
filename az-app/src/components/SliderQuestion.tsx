import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';

interface SliderQuestionProps {
  value: number;
  onValueChange: (value: number) => void;
  lowLabel: string;
  highLabel: string;
}

export default function SliderQuestion({
  value,
  onValueChange,
  lowLabel,
  highLabel,
}: SliderQuestionProps) {
  const handleValueChange = (v: number) => {
    if (v !== value) {
      Haptics.selectionAsync();
      onValueChange(v);
    }
  };

  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={5}
        step={1}
        value={value}
        onValueChange={handleValueChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.accent}
      />
      <View style={styles.labels}>
        <Text style={styles.label}>{lowLabel}</Text>
        <Text style={styles.label}>{highLabel}</Text>
      </View>
      <View style={styles.dots}>
        {[1, 2, 3, 4, 5].map((n) => (
          <View
            key={n}
            style={[styles.dot, value >= n && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    maxWidth: '45%',
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
});
