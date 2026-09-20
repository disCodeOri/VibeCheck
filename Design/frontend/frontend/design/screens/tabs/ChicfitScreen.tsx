import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Button, Card, Chip, Row, Screen, T } from '../../components/ui';
import { colors } from '../../tokens/colors';

const OCCASIONS = [
  'Casual',
  'Dinner Date',
  'Work / Office',
  'Night Out',
  'Formal Event',
  'Coffee Run',
];

const DETECTED_GARMENTS = [
  { id: '1', name: 'Oversized Charcoal Blazer', category: 'Layer', wears: 4, status: 'confirmed' as const, color: '#2B2F38' },
  { id: '2', name: 'Relaxed Straight Raw Denim', category: 'Bottom', wears: 6, status: 'confirmed' as const, color: '#1E2C48' },
  { id: '3', name: 'Chunky Minimalist Loafer', category: 'Footwear', wears: 2, status: 'candidate' as const, color: '#111317' },
  { id: '4', name: 'Heavyweight Ribbed Cotton Tee', category: 'Top', wears: 8, status: 'confirmed' as const, color: '#F3EFEA' },
  { id: '5', name: 'Structured Smooth Leather Tote', category: 'Accessory', wears: 5, status: 'confirmed' as const, color: '#3A2E28' },
];

/**
 * ChicfitScreen: Outfit check, occasion styling, and progressive closet wardrobe.
 */
export function ChicfitScreen() {
  const [selectedOccasion, setSelectedOccasion] = useState('Dinner Date');

  return (
    <Screen scroll={true} title="Chicfit">
      <View style={{ gap: 20, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ gap: 4 }}>
          <T variant="hero">Dress For Where{'\n'}You're Going.</T>
          <T color={colors.blueDark} style={{ fontSize: 14 }}>
            Instant outfit feedback. Silhouette, harmony, and occasion fit — never body shape.
          </T>
        </View>

        {/* Mirror Fit Check Hero Intake */}
        <Card style={{ backgroundColor: colors.blueSoft, borderColor: colors.blueDark + '20', gap: 16 }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, gap: 2 }}>
              <T variant="bold" style={{ fontSize: 16 }}>Start a Fit Check</T>
              <T variant="small" color={colors.muted}>Snap a quick mirror selfie or pick from library</T>
            </View>
            <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="check-circle" size={22} color={colors.blue} />
            </View>
          </Row>

          {/* Occasion Selector */}
          <View style={{ gap: 8 }}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <T variant="label" color={colors.blueDark} style={{ fontSize: 11 }}>Occasion</T>
              <Row style={{ gap: 4, alignItems: 'center' }}>
                <Feather name="sun" size={12} color={colors.muted} />
                <T variant="small" color={colors.muted} style={{ fontSize: 11 }}>Sunny · 23°C</T>
              </Row>
            </Row>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {OCCASIONS.map(occ => (
                <Chip
                  key={occ}
                  label={occ}
                  selected={selectedOccasion === occ}
                  onPress={() => setSelectedOccasion(occ)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Action Buttons */}
          <Row style={{ gap: 10 }}>
            <Button
              label="Snap mirror photo"
              icon="camera"
              onPress={() => router.push({ pathname: '/check/new', params: { source: 'camera', intent: 'fit' } })}
              style={{ flex: 1 }}
            />
            <Button
              label="Library"
              kind="secondary"
              icon="image"
              onPress={() => router.push({ pathname: '/check/new', params: { source: 'gallery', intent: 'fit' } })}
            />
          </Row>
        </Card>

        {/* Latest Fit Verdict Showcase */}
        <View style={{ gap: 10 }}>
          <T variant="label" color={colors.muted} style={{ fontSize: 11, paddingHorizontal: 2 }}>Latest Fit Verdict</T>
          <Card style={{ gap: 14, borderColor: colors.cardBorder }}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ backgroundColor: colors.sageSoft, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 }}>
                <T variant="bold" color={colors.sage} style={{ fontSize: 13 }}>✓ Wear it</T>
              </View>
              <T variant="label" color={colors.blue} style={{ fontSize: 14 }}>94 Fit Score</T>
            </Row>

            <View style={{ gap: 4 }}>
              <T variant="title" style={{ fontSize: 18 }}>Cohesive silhouette with effortless drape</T>
              <T variant="small" color={colors.muted}>
                The relaxed blazer structures the loose denim perfectly for {selectedOccasion.toLowerCase()}.
              </T>
            </View>

            {/* One Smart Swap Card */}
            <View style={{ backgroundColor: colors.lavenderSoft, padding: 12, borderRadius: 12, gap: 4, borderWidth: 1, borderColor: colors.line }}>
              <Row style={{ gap: 6, alignItems: 'center' }}>
                <Feather name="repeat" size={14} color={colors.lavender} />
                <T variant="label" color={colors.lavender} style={{ fontSize: 11 }}>One Smart Swap</T>
              </Row>
              <T variant="small" color={colors.ink} style={{ fontSize: 12, lineHeight: 16 }}>
                Swap bulky white sneakers for dark brown loafers to subtly elevate this outfit for evening dinner.
              </T>
            </View>

            {/* Quick Metrics */}
            <Row style={{ gap: 8, paddingTop: 2 }}>
              <View style={{ flex: 1, backgroundColor: colors.canvas, padding: 10, borderRadius: 10, alignItems: 'center', gap: 2 }}>
                <T variant="small" color={colors.muted} style={{ fontSize: 10 }}>Occasion match</T>
                <T variant="bold" style={{ fontSize: 15 }}>96%</T>
              </View>
              <View style={{ flex: 1, backgroundColor: colors.canvas, padding: 10, borderRadius: 10, alignItems: 'center', gap: 2 }}>
                <T variant="small" color={colors.muted} style={{ fontSize: 10 }}>Palette balance</T>
                <T variant="bold" style={{ fontSize: 15 }}>92%</T>
              </View>
              <View style={{ flex: 1, backgroundColor: colors.canvas, padding: 10, borderRadius: 10, alignItems: 'center', gap: 2 }}>
                <T variant="small" color={colors.muted} style={{ fontSize: 10 }}>Proportions</T>
                <T variant="bold" style={{ fontSize: 15 }}>94%</T>
              </View>
            </Row>
          </Card>
        </View>

        {/* Body-Safe Privacy Guardrail */}
        <Card style={{ backgroundColor: colors.surface, borderColor: colors.line, padding: 14 }}>
          <Row style={{ gap: 12, alignItems: 'center' }}>
            <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="shield" size={17} color={colors.blue} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <T variant="bold" style={{ fontSize: 12 }}>Body-Safe By Construction</T>
              <T variant="small" color={colors.muted} style={{ fontSize: 11, lineHeight: 15 }}>
                We score garment harmony, occasion fit, and color balance — never body shape, size, or attractiveness.
              </T>
            </View>
          </Row>
        </Card>

        {/* Progressive Closet / Wardrobe Section */}
        <View style={{ gap: 10 }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2 }}>
            <T variant="label" color={colors.muted} style={{ fontSize: 11 }}>Progressive Closet</T>
            <T variant="small" color={colors.blue} style={{ fontSize: 11 }}>5 Items Logged</T>
          </Row>

          <Card style={{ padding: 0, overflow: 'hidden', borderColor: colors.cardBorder }}>
            {/* Closet Unlock Milestone Banner */}
            <View style={{ padding: 16, borderBottomWidth: 1, borderColor: colors.line, backgroundColor: colors.skySoft, gap: 8 }}>
              <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <T variant="bold" style={{ fontSize: 13 }}>Unlock AI Outfit Builder</T>
                <T variant="small" color={colors.blueDark} style={{ fontSize: 11 }}>5 / 12 items</T>
              </Row>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: '#ffffff', overflow: 'hidden' }}>
                <View style={{ width: '42%', height: '100%', backgroundColor: colors.blue, borderRadius: 3 }} />
              </View>
              <T variant="small" color={colors.muted} style={{ fontSize: 11 }}>
                Log 7 more fits to unlock "Build outfits from my closet" suggestions.
              </T>
            </View>

            {/* Garment Item Rows */}
            {DETECTED_GARMENTS.map((item, index) => (
              <View
                key={item.id}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderBottomWidth: index < DETECTED_GARMENTS.length - 1 ? 1 : 0,
                  borderColor: colors.line,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: item.color, borderWidth: 1, borderColor: '#00000015' }} />
                <View style={{ flex: 1, gap: 1 }}>
                  <T variant="bold" style={{ fontSize: 13 }}>{item.name}</T>
                  <T variant="small" color={colors.muted} style={{ fontSize: 11 }}>
                    {item.category} · Worn {item.wears}x
                  </T>
                </View>
                <View style={{ backgroundColor: item.status === 'confirmed' ? colors.sageSoft : colors.peachSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                  <T variant="small" color={item.status === 'confirmed' ? colors.sage : colors.peach} style={{ fontSize: 10 }}>
                    {item.status === 'confirmed' ? '✓ Closet' : 'Candidate'}
                  </T>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Outfit Comparison Action */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/check/new', params: { mode: 'compare', intent: 'fit' } })}
          style={({ pressed }) => [{
            padding: 16,
            borderRadius: 16,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.line,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            opacity: pressed ? 0.85 : 1,
          }]}
        >
          <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: colors.lavenderSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="layers" size={18} color={colors.lavender} />
          </View>
          <View style={{ flex: 1, gap: 1 }}>
            <T variant="bold" style={{ fontSize: 14 }}>Compare Two Outfits</T>
            <T variant="small" color={colors.muted} style={{ fontSize: 11 }}>Decide between Outfit A vs Outfit B</T>
          </View>
          <Feather name="chevron-right" size={18} color={colors.muted} />
        </Pressable>
      </View>
    </Screen>
  );
}

export default ChicfitScreen;
