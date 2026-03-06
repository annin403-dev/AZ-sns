import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import ShareCard from '../components/ShareCard';
import { useUser } from '../context/UserContext';
import { colors } from '../theme/colors';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'ShareCard'>;
};

export default function ShareCardScreen({ navigation }: Props) {
  const { state } = useUser();
  const { result } = state;
  const viewShotRef = useRef<ViewShot>(null);
  const [isSharing, setIsSharing] = useState(false);

  if (!result) {
    navigation.goBack();
    return null;
  }

  const handleShare = async () => {
    if (!viewShotRef.current) return;
    setIsSharing(true);
    try {
      const uri = await viewShotRef.current.capture?.();
      if (!uri) throw new Error('Capture failed');
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `私のAZタイプは「${result.typeName}」`,
        });
      } else {
        Alert.alert('シェアできません', 'このデバイスではシェア機能を利用できません。');
      }
    } catch {
      Alert.alert('エラー', 'シェアカードの生成に失敗しました。');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← 戻る</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>シェアカード</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Preview */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>プレビュー</Text>
          <ViewShot
            ref={viewShotRef}
            options={{ format: 'png', quality: 1 }}
            style={styles.viewShot}
          >
            <ShareCard result={result} />
          </ViewShot>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.shareButton, isSharing && styles.disabled]}
            onPress={handleShare}
            disabled={isSharing}
            activeOpacity={0.85}
          >
            {isSharing ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.shareButtonText}>シェアする ✦</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 16,
  },
  backBtn: {
    width: 60,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  previewLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  viewShot: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  actions: {
    paddingBottom: 24,
    gap: 12,
  },
  shareButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  shareButtonText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
