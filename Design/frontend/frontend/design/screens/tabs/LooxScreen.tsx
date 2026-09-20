import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { router } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Button, Card, Chip, Row, Screen, State, T } from '../../components/ui';
import { colors } from '../../tokens/colors';

const CURATED_PRESETS = [
  {
    id: 'preset-golden',
    name: 'Golden Hour Editorial',
    traits: ['Warm 3200K', 'Soft backlight', 'Unhurried mood', 'Open space'],
    version: '1.0',
    palette: ['#E69B56', '#F5D3A9', '#3D6178', '#FAF6EE'],
    description: 'Golden natural light, earthy terracotta, diffused shadows, relaxed composition.',
  },
  {
    id: 'preset-film',
    name: '35mm Film Noir',
    traits: ['High contrast', '35mm grain', 'Deep shadows', 'Editorial voice'],
    version: '1.0',
    palette: ['#1A1E24', '#3E4651', '#98A1AF', '#F0F2F5'],
    description: 'Tungsten glow, intentional cinematic grain, moody monochrome balance.',
  },
  {
    id: 'preset-cyber',
    name: 'Cyberpunk Flash',
    traits: ['Direct flash', 'Neon cold accents', 'Saturated hues', 'Edgy angle'],
    version: '1.0',
    palette: ['#0C0D1B', '#7A22FF', '#00F0FF', '#FF007A'],
    description: 'Harsh flash pop against nocturnal ambient neon. Bold and unapologetic.',
  },
  {
    id: 'preset-minimal',
    name: 'Studio Minimal',
    traits: ['Diffused softbox', 'Neutral palette', 'Rule of thirds', 'Airy negative space'],
    version: '1.0',
    palette: ['#FFFFFF', '#E9ECF0', '#9CA3AF', '#22262E'],
    description: 'Clean architectural light with crisp modern editorial balance.',
  },
];

interface LooxDisplayItem {
  id: string;
  name: string;
  version: string | number;
  traits: string[];
  description?: string | null;
  palette: string[];
  isPreset: boolean;
}

/**
 * LooxScreen: Aesthetic benchmarks, style DNA presets, and look management.
 */
export function LooxScreen() {
  const [tab, setTab] = useState<'presets' | 'my' | 'archived'>('presets');

  const displayItems: LooxDisplayItem[] = CURATED_PRESETS.map(p => ({
    ...p,
    isPreset: true,
  }));

  return (
    <Screen scroll={false} title="Loox">
      <FlatList<LooxDisplayItem>
        data={displayItems}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 44, gap: 14 }}
        ListHeaderComponent={
          <View style={{ gap: 18, paddingBottom: 6 }}>
            <View style={{ gap: 4 }}>
              <T variant="hero">Your Mood.{'\n'}Your Version.</T>
              <T color={colors.blueDark} style={{ fontSize: 14 }}>
                Turn inspiration posts into reusable aesthetic DNA. Light, layout, color, and voice.
              </T>
            </View>

            {/* Create Loox Banner */}
            <Card style={{ backgroundColor: colors.blueSoft, borderColor: colors.blueDark + '20', gap: 14 }}>
              <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <T variant="bold" style={{ fontSize: 16 }}>Capture a new Loox</T>
                  <T variant="small" color={colors.muted}>From a screenshot, saved post, or camera snap</T>
                </View>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="aperture" size={20} color={colors.blue} />
                </View>
              </Row>
              <Button
                label="Add reference style"
                icon="plus"
                onPress={() => router.push('/styles/new')}
              />
            </Card>

            {/* Filter Tabs */}
            <Row style={{ gap: 8 }}>
              <Chip label="Curated Presets" selected={tab === 'presets'} onPress={() => setTab('presets')} />
              <Chip label="My Loox" selected={tab === 'my'} onPress={() => setTab('my')} />
              <Chip label="Archived" selected={tab === 'archived'} onPress={() => setTab('archived')} />
            </Row>
          </View>
        }
        ListEmptyComponent={
          <State
            title="Your aesthetic direction starts here."
            message="Add a reference photo or screenshot to extract its aesthetic style DNA."
          />
        }
        renderItem={({ item, index }) => (
          <View
            style={{
              padding: 20,
              borderRadius: 18,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              gap: 14,
            }}
          >
            {/* Header: Label & Version */}
            <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Row style={{ gap: 8, alignItems: 'center' }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.blue }} />
                <T variant="label" color={colors.blue} style={{ fontSize: 12 }}>
                  {item.isPreset ? 'Aesthetic Preset' : `Loox ${String(index + 1).padStart(2, '0')}`}
                </T>
              </Row>
              <View style={{ backgroundColor: colors.canvas, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                <T variant="small" color={colors.muted}>v{item.version}</T>
              </View>
            </Row>

            {/* Title & Description */}
            <View style={{ gap: 4 }}>
              <T variant="title" style={{ fontSize: 18 }}>{item.name}</T>
              {item.description ? (
                <T variant="small" color={colors.muted} style={{ lineHeight: 16 }}>{item.description}</T>
              ) : null}
            </View>

            {/* Palette Swatches */}
            <Row style={{ gap: 6 }}>
              {item.palette.map((hex, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: 14,
                    borderRadius: 4,
                    backgroundColor: hex,
                    borderWidth: 1,
                    borderColor: '#00000010',
                  }}
                />
              ))}
            </Row>

            {/* Trait Pills */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {item.traits.map(trait => (
                <View
                  key={trait}
                  style={{
                    backgroundColor: colors.blueSoft,
                    paddingHorizontal: 9,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <T variant="small" color={colors.blueDark} style={{ fontSize: 11 }}>{trait}</T>
                </View>
              ))}
            </View>

            {/* Actions */}
            <Row style={{ gap: 10, paddingTop: 4 }}>
              <Button
                label="Use this Loox"
                icon="arrow-right"
                onPress={() => router.push('/check/new')}
                style={{ flex: 1 }}
              />
            </Row>
          </View>
        )}
        ListFooterComponent={
          <View style={{ paddingVertical: 12, alignItems: 'center' }}>
            <T variant="small" color={colors.muted} style={{ textAlign: 'center', fontSize: 11, lineHeight: 15 }}>
              We extract lighting, palette & composition grammar.{'\n'}
              Never faces, people, or personal identities.
            </T>
          </View>
        }
      />
    </Screen>
  );
}

export default LooxScreen;
