import { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { router } from 'expo-router';
import { Icon, Row, T } from './ui';
import { colors } from '../tokens/colors';

interface VibeStory {
  id: string;
  title: string;
  subtitle: string;
  caption: string;
  score: number;
  intent: string;
  tag: string;
  accent: string;
  accentSoft: string;
  gradientId: string;
  soundtrack: string;
}

const stories: VibeStory[] = [
  {
    id: 'golden_hour',
    title: 'Golden Hour Glow',
    subtitle: 'Warm sunset light & soft contrast',
    caption: 'Taking the slow way home.',
    score: 94,
    intent: 'effortless',
    tag: '#golden-hour',
    accent: '#E06D14',
    accentSoft: '#FFF3E8',
    gradientId: 'goldGrad',
    soundtrack: 'Soft Indie Sunset',
  },
  {
    id: 'after_hours',
    title: 'After Hours Neon',
    subtitle: 'Cinematic shadows & ambient glow',
    caption: 'A little less rush. A little more this.',
    score: 89,
    intent: 'night_out',
    tag: '#after-hours',
    accent: '#6941C6',
    accentSoft: '#F3EFFF',
    gradientId: 'neonGrad',
    soundtrack: 'Late Night Wave',
  },
  {
    id: 'minimal_aesthetic',
    title: 'Sunday Clean Aesthetic',
    subtitle: 'Balanced arches & crisp focal point',
    caption: 'Sunday pace. Quiet clarity.',
    score: 96,
    intent: 'aesthetic',
    tag: '#clean-vibe',
    accent: '#087F65',
    accentSoft: '#EBF7EE',
    gradientId: 'cleanGrad',
    soundtrack: 'Acoustic Morning',
  },
];

export function AnimatedVibeShowcase() {
  const pulse = useRef(new Animated.Value(1)).current;
  const wave1 = useRef(new Animated.Value(0.4)).current;
  const wave2 = useRef(new Animated.Value(0.85)).current;
  const wave3 = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
      ])
    );

    const w1Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wave1, { toValue: 1, duration: 550, useNativeDriver: false }),
        Animated.timing(wave1, { toValue: 0.35, duration: 550, useNativeDriver: false }),
      ])
    );

    const w2Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wave2, { toValue: 0.3, duration: 700, useNativeDriver: false }),
        Animated.timing(wave2, { toValue: 0.95, duration: 700, useNativeDriver: false }),
      ])
    );

    const w3Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wave3, { toValue: 0.9, duration: 450, useNativeDriver: false }),
        Animated.timing(wave3, { toValue: 0.4, duration: 450, useNativeDriver: false }),
      ])
    );

    pulseLoop.start();
    w1Loop.start();
    w2Loop.start();
    w3Loop.start();

    return () => {
      try {
        pulseLoop.stop();
        w1Loop.stop();
        w2Loop.stop();
        w3Loop.stop();
      } catch {
        // Safe unmount in browser preview
      }
    };
  }, [pulse, wave1, wave2, wave3]);

  return (
    <View style={{ gap: 12 }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2 }}>
        <Row style={{ gap: 6, alignItems: 'center' }}>
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.blue }} />
          </Animated.View>
          <T variant="label" color={colors.blue} style={{ fontSize: 11 }}>Today’s Inspiration</T>
        </Row>
        <T variant="small" color={colors.muted} style={{ fontSize: 11 }}>Swipe for vibes</T>
      </Row>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 14, paddingRight: 8, paddingVertical: 2 }}
      >
        {stories.map(item => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`Try ${item.title}`}
            onPress={() => router.push({ pathname: '/check/new', params: { intent: item.intent } })}
            style={({ pressed }) => [{
              width: 260,
              backgroundColor: colors.surface,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              overflow: 'hidden',
              opacity: pressed ? 0.92 : 1,
              shadowColor: '#080D23',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }]}
          >
            {/* Stylized Animated Vector Artwork Header */}
            <View style={{ width: '100%', height: 145, backgroundColor: item.accentSoft, position: 'relative', overflow: 'hidden' }}>
              <Svg width="100%" height="100%" viewBox="0 0 260 145" preserveAspectRatio="none">
                <Defs>
                  <LinearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#FF9F43" stopOpacity="0.8" />
                    <Stop offset="50%" stopColor="#FF6B6B" stopOpacity="0.85" />
                    <Stop offset="100%" stopColor="#F368E0" stopOpacity="0.75" />
                  </LinearGradient>
                  <LinearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#0A1931" stopOpacity="0.95" />
                    <Stop offset="50%" stopColor="#2E0854" stopOpacity="0.9" />
                    <Stop offset="100%" stopColor="#005BFF" stopOpacity="0.8" />
                  </LinearGradient>
                  <LinearGradient id="cleanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#10AC84" stopOpacity="0.75" />
                    <Stop offset="50%" stopColor="#1DD1A1" stopOpacity="0.65" />
                    <Stop offset="100%" stopColor="#54A0FF" stopOpacity="0.7" />
                  </LinearGradient>
                </Defs>

                {/* Ambient dynamic background paths */}
                <Rect width="260" height="145" fill={`url(#${item.gradientId})`} />

                {item.id === 'golden_hour' ? (
                  <G opacity="0.45">
                    <Circle cx="130" cy="110" r="70" fill="#FFEAA7" opacity="0.6" />
                    <Circle cx="130" cy="110" r="95" stroke="#FFEAA7" strokeWidth="2" opacity="0.4" strokeDasharray="6,6" />
                    <Path d="M0 115 Q65 90 130 115 T260 115 L260 145 L0 145 Z" fill="#D35400" opacity="0.5" />
                    <Path d="M0 125 Q70 110 140 125 T260 125 L260 145 L0 145 Z" fill="#962D00" opacity="0.6" />
                  </G>
                ) : item.id === 'after_hours' ? (
                  <G opacity="0.55">
                    <Circle cx="190" cy="45" r="32" fill="#00D2D3" opacity="0.3" />
                    <Circle cx="70" cy="85" r="45" stroke="#5F27CD" strokeWidth="3" opacity="0.5" />
                    <Path d="M0 135 L40 100 L75 125 L120 90 L160 120 L210 80 L260 110 L260 145 L0 145 Z" fill="#050C1A" opacity="0.8" />
                    <Circle cx="50" cy="30" r="2" fill="#FFFFFF" />
                    <Circle cx="110" cy="20" r="1.5" fill="#FFFFFF" />
                    <Circle cx="220" cy="35" r="2" fill="#FFFFFF" />
                  </G>
                ) : (
                  <G opacity="0.5">
                    <Rect x="40" y="30" width="60" height="115" rx="30" fill="#FFFFFF" opacity="0.3" />
                    <Rect x="120" y="55" width="80" height="90" rx="20" fill="#FFFFFF" opacity="0.2" />
                    <Circle cx="210" cy="40" r="25" fill="#F8EFBA" opacity="0.5" />
                  </G>
                )}
              </Svg>

              {/* Top Floating Badge */}
              <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(8, 13, 35, 0.8)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Icon name="zap" size={11} color="#FFD166" />
                <T variant="small" color="#FFFFFF" style={{ fontWeight: '700', fontSize: 11 }}>
                  {item.score} · {item.title.split(' ')[0]}
                </T>
              </View>

              {/* Animated Equalizer Wave in top right */}
              <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(8, 13, 35, 0.65)', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 10, flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 22 }}>
                <Animated.View style={{ width: 3, height: wave1.interpolate({ inputRange: [0, 1], outputRange: [4, 14] }), backgroundColor: '#00D2D3', borderRadius: 2 }} />
                <Animated.View style={{ width: 3, height: wave2.interpolate({ inputRange: [0, 1], outputRange: [4, 14] }), backgroundColor: '#54A0FF', borderRadius: 2 }} />
                <Animated.View style={{ width: 3, height: wave3.interpolate({ inputRange: [0, 1], outputRange: [4, 14] }), backgroundColor: '#5F27CD', borderRadius: 2 }} />
              </View>

              {/* Quick Jump Action Pin */}
              <View style={{ position: 'absolute', bottom: 10, right: 10, width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3 }}>
                <Icon name="arrow-up-right" size={15} color={colors.blue} />
              </View>
            </View>

            {/* Story Card Content */}
            <View style={{ padding: 14, gap: 8 }}>
              <View style={{ gap: 2 }}>
                <T variant="bold" style={{ fontSize: 15, lineHeight: 19 }}>{item.title}</T>
                <T style={{ fontSize: 12, lineHeight: 16, color: colors.muted, fontStyle: 'italic' }}>
                  “{item.caption}”
                </T>
              </View>

              <Row style={{ justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderColor: colors.line }}>
                <View style={{ backgroundColor: item.accentSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                  <T variant="small" color={item.accent} style={{ fontSize: 11, fontWeight: '600' }}>
                    {item.tag}
                  </T>
                </View>
                <T variant="small" color={colors.blue} style={{ fontWeight: '600', fontSize: 11 }}>
                  Try this vibe →
                </T>
              </Row>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
