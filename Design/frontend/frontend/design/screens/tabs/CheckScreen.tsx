import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Card, Icon, Row, Screen, T } from '../../components/ui';
import { InkPanel } from '../../components/InkPanel';
import { AnimatedVibeShowcase } from '../../components/AnimatedVibeShowcase';
import { colors } from '../../tokens/colors';
import { fonts } from '../../tokens/typography';

/**
 * CheckScreen: The main home screen & mobile dashboard of Vibe Check.
 * Features the uppercase Anton headline, InkPanel hero, quick actions, and creative studio.
 */
export function CheckScreen() {
  return (
    <Screen
      title=""
      right={
        <View style={{ backgroundColor: colors.blueSoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.line }}>
          <T variant="small" color={colors.blueDark} style={{ fontWeight: '600' }}>
            1 Free Check
          </T>
        </View>
      }
    >
      {/* Brand Identity Headline */}
      <View style={{ paddingVertical: 10, gap: 6 }}>
        <T style={{ fontFamily: fonts.anton, fontSize: 56, lineHeight: 56, letterSpacing: 0.5, color: '#080D23', textTransform: 'uppercase' }}>
          ONE VIBE.{'\n'}ALL YOU.
        </T>
        <T color={colors.blueDark} style={{ fontSize: 15 }}>
          Story & expression, in your own direction.
        </T>
      </View>

      {/* Hero Action Card */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Check my story"
        onPress={() => router.push('/check/new')}
        style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}
      >
        <InkPanel>
          <View style={{ gap: 18 }}>
            <View>
              <T variant="hero" color={colors.surface} style={{ fontSize: 44, lineHeight: 48 }}>
                Your Story.{'\n'}
                <T variant="hero" color={colors.surface} style={{ fontFamily: fonts.italic, fontSize: 44, lineHeight: 48 }}>
                  Your Way.
                </T>
              </T>
            </View>
            <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <T variant="bold" color={colors.blue} style={{ fontSize: 14 }}>Check my story</T>
                <Icon name="arrow-right" size={16} color={colors.blue} />
              </View>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffffff30', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="arrow-up-right" size={18} color={colors.surface} />
              </View>
            </Row>
          </View>
        </InkPanel>
      </Pressable>

      {/* Quick Actions */}
      <View style={{ gap: 10 }}>
        <T variant="label" color={colors.muted} style={{ fontSize: 11, paddingHorizontal: 2 }}>Quick Actions</T>
        <Row style={{ gap: 12 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Take a photo"
            onPress={() => router.push({ pathname: '/check/new', params: { source: 'camera' } })}
            style={({ pressed }) => [{
              flex: 1,
              backgroundColor: colors.skySoft,
              borderColor: colors.line,
              borderWidth: 1,
              borderRadius: 16,
              padding: 13,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 11,
              opacity: pressed ? 0.8 : 1,
            }]}
          >
            <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="aperture" size={19} color={colors.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <T variant="bold" style={{ fontSize: 13, lineHeight: 17 }}>Take photo</T>
              <T variant="small" color={colors.muted} style={{ fontSize: 11, lineHeight: 14 }}>Instant check</T>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Compare two stories"
            onPress={() => router.push({ pathname: '/check/new', params: { mode: 'compare' } })}
            style={({ pressed }) => [{
              flex: 1,
              backgroundColor: colors.lavenderSoft,
              borderColor: colors.line,
              borderWidth: 1,
              borderRadius: 16,
              padding: 13,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 11,
              opacity: pressed ? 0.8 : 1,
            }]}
          >
            <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="layers" size={19} color={colors.lavender} />
            </View>
            <View style={{ flex: 1 }}>
              <T variant="bold" style={{ fontSize: 13, lineHeight: 17 }}>Compare</T>
              <T variant="small" color={colors.muted} style={{ fontSize: 11, lineHeight: 14 }}>Pick between</T>
            </View>
          </Pressable>
        </Row>
      </View>

      {/* Creative Studio */}
      <View style={{ gap: 10 }}>
        <T variant="label" color={colors.muted} style={{ fontSize: 11, paddingHorizontal: 2 }}>Creative Studio</T>
        <Card style={{ padding: 0, overflow: 'hidden', borderColor: colors.cardBorder }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/loox')}
            style={({ pressed }) => [{ paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: colors.line, opacity: pressed ? 0.8 : 1 }]}
          >
            <Row style={{ gap: 14, alignItems: 'center' }}>
              <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.sageSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="bookmark" size={16} color={colors.sage} />
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <T variant="bold" style={{ fontSize: 14, lineHeight: 18 }}>Loox</T>
                <T variant="small" color={colors.muted} style={{ fontSize: 11 }}>Aesthetic presets & style DNA benchmarks</T>
              </View>
              <Icon name="chevron-right" size={18} color={colors.muted} />
            </Row>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/chicfit')}
            style={({ pressed }) => [{ paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: colors.line, opacity: pressed ? 0.8 : 1 }]}
          >
            <Row style={{ gap: 14, alignItems: 'center' }}>
              <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.lavenderSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check-circle" size={16} color={colors.lavender} />
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <T variant="bold" style={{ fontSize: 14, lineHeight: 18 }}>Chicfit</T>
                <T variant="small" color={colors.muted} style={{ fontSize: 11 }}>Outfit checks, occasion fit & closet</T>
              </View>
              <Icon name="chevron-right" size={18} color={colors.muted} />
            </Row>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/taste')}
            style={({ pressed }) => [{ paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: colors.line, opacity: pressed ? 0.8 : 1 }]}
          >
            <Row style={{ gap: 14, alignItems: 'center' }}>
              <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.peachSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="sliders" size={16} color={colors.peach} />
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <T variant="bold" style={{ fontSize: 14, lineHeight: 18 }}>Taste Profile</T>
                <T variant="small" color={colors.muted} style={{ fontSize: 11 }}>Learns what feels like you</T>
              </View>
              <Icon name="chevron-right" size={18} color={colors.muted} />
            </Row>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/history')}
            style={({ pressed }) => [{ paddingVertical: 12, paddingHorizontal: 16, opacity: pressed ? 0.8 : 1 }]}
          >
            <Row style={{ gap: 14, alignItems: 'center' }}>
              <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.skySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="film" size={16} color={colors.sky} />
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <T variant="bold" style={{ fontSize: 14, lineHeight: 18 }}>Past Checks & Stories</T>
                <T variant="small" color={colors.muted} style={{ fontSize: 11 }}>Review scored stories & verdicts</T>
              </View>
              <Icon name="chevron-right" size={18} color={colors.muted} />
            </Row>
          </Pressable>
        </Card>
      </View>

      {/* Animated Dynamic Vibe Showcase */}
      <AnimatedVibeShowcase />
    </Screen>
  );
}

export default CheckScreen;
