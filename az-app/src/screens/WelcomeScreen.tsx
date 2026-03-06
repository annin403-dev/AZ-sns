import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Welcome'>;
};

const NUM_PARTICLES = 20;

function Particle({ index }: { index: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const x = (index * 53 + 17) % width;
  const duration = 3000 + (index * 700) % 4000;
  const delay = (index * 300) % 3000;
  const size = 2 + (index % 3);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, -50],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0, 0.8, 0.8, 0],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: x,
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    />
  );
}

export default function WelcomeScreen({ navigation }: Props) {
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
      }),
    ]).start(() => {
      navigation.navigate('Quiz');
    });
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: NUM_PARTICLES }).map((_, i) => (
        <Particle key={i} index={i} />
      ))}

      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          {/* Logo */}
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <Text style={styles.logoText}>✦  AZ  ✦</Text>
          </LinearGradient>

          <Text style={styles.tagline}>自分を映す鏡のゲーム</Text>

          <View style={styles.descBox}>
            <Text style={styles.desc}>
              あなたの思考・行動・価値観を診断し、{'\n'}
              人生の進め方を見つけよう。
            </Text>
          </View>

          <Text style={styles.timeNote}>所要時間：約2分</Text>

          {/* Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
              <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>診断をはじめる</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.hint}>※ 16問のスライダー質問</Text>
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
  particle: {
    position: 'absolute',
    backgroundColor: colors.primaryLight,
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  logoGradient: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 8,
  },
  tagline: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  descBox: {
    alignItems: 'center',
  },
  desc: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
  },
  timeNote: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  button: {
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 16,
    minWidth: 240,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 1,
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
