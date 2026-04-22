import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import TypeCard from '../components/TypeCard';
import { useUser } from '../context/UserContext';
import { getTypeData } from '../data/types';
import { colors } from '../theme/colors';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Result'>;
};

export default function ResultScreen({ navigation }: Props) {
  const { state, reset } = useUser();
  const { result } = state;

  if (!result) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>結果が見つかりません</Text>
      </View>
    );
  }

  const typeData = getTypeData(result.typeName);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.title}>✦ あなたのAZタイプ ✦</Text>

          {/* Type Card */}
          <TypeCard result={result} />

          {/* Extra Info */}
          {typeData && (
            <View style={styles.infoSection}>
              <InfoRow label="向いていること" value={typeData.suit} />
              <InfoRow label="注意点" value={typeData.weakness} />
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('ShareCard')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>シェアカードを作る</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                reset();
                navigation.navigate('Welcome');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryButtonText}>もう一度診断する</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 2,
  },
  infoSection: {
    gap: 12,
  },
  infoRow: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  infoValue: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  errorText: {
    color: colors.text,
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
});
