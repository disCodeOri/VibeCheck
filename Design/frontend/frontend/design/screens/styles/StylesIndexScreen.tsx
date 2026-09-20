import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Chip, Icon, Row, Screen, T } from '../../components/ui';
import { colors } from '../../tokens/colors';
import { fonts } from '../../tokens/typography';

export interface StylePreset {
  id: string;
  name: string;
  version: number;
  traits: string[];
  status: 'active' | 'archived';
  description: string;
}

const sampleStyles: StylePreset[] = [
  {
    id: 'nordic-warmth',
    name: 'Nordic Warmth',
    version: 3,
    traits: ['Subdued Contrast', 'Warm Ambient', 'Clean Framing'],
    status: 'active',
    description: 'Soft overcast daylight with balanced shadows and minimalist background geometry.',
  },
  {
    id: 'analog-flash',
    name: 'Analog Flash',
    version: 2,
    traits: ['Hard Direct Flash', 'Saturated Reds', 'Candid Posture'],
    status: 'active',
    description: 'Point-and-shoot direct illumination with party atmosphere and crisp shadow falloff.',
  },
  {
    id: 'golden-editorial',
    name: 'Golden Editorial',
    version: 4,
    traits: ['Low Sun Angle', 'Warm Rim Light', 'Rule-of-Thirds'],
    status: 'active',
    description: 'Golden hour sunset backlighting with cinematic depth of field and authentic silhouette.',
  },
  {
    id: 'metro-minimal',
    name: 'Metro Minimal',
    version: 1,
    traits: ['Monochrome Bias', 'Sharp Angles', 'Generous Negative Space'],
    status: 'archived',
    description: 'Urban architecture lines with neutral tones and focused central subject framing.',
  },
];

export interface StylesIndexScreenProps {
  onSelectStyle?: (style: StylePreset) => void;
  onCreateStyle?: () => void;
}

/**
 * StylesIndexScreen: Reference styles library.
 * Allows users to browse active and archived visual references, captured styles, and aesthetic fingerprints.
 */
export function StylesIndexScreen({ onSelectStyle, onCreateStyle }: StylesIndexScreenProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  const filteredStyles = sampleStyles.filter(s => s.status === activeTab);

  return (
    <Screen back title="Reference Styles">
      {/* Editorial Headline */}
      <View style={{ gap: 8, paddingVertical: 4 }}>
        <T style={{ fontFamily: fonts.anton, fontSize: 44, lineHeight: 46, color: '#080D23', textTransform: 'uppercase' }}>
          YOUR MOOD.{'\n'}YOUR VERSION.
        </T>
        <T color={colors.blueDark} style={{ fontSize: 14, lineHeight: 20 }}>
          Turn a post you love into a reusable style blueprint. Light, layout, color, and voice.
        </T>
      </View>

      {/* Primary Action Button */}
      <Button
        label="Create a reference style"
        icon="plus"
        onPress={() => {
          if (onCreateStyle) onCreateStyle();
          else router.push('/styles/new');
        }}
      />

      {/* Tab Switcher */}
      <Row style={{ gap: 8 }}>
        <Chip
          label="My styles"
          selected={activeTab === 'active'}
          onPress={() => setActiveTab('active')}
        />
        <Chip
          label="Archived"
          selected={activeTab === 'archived'}
          onPress={() => setActiveTab('archived')}
        />
      </Row>

      {/* Styles List */}
      <View style={{ gap: 14 }}>
        {filteredStyles.map((item, index) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`Style ${item.name}`}
            onPress={() => {
              if (onSelectStyle) onSelectStyle(item);
              else router.push({ pathname: '/styles/[id]', params: { id: item.id } });
            }}
            style={({ pressed }) => [{
              padding: 20,
              borderRadius: 16,
              backgroundColor: index % 2 === 0 ? colors.surface : colors.blueSoft,
              borderWidth: 1,
              borderColor: colors.line,
              gap: 12,
              opacity: pressed ? 0.9 : 1,
            }]}
          >
            <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <T variant="label" color={colors.blue}>
                STYLE {String(index + 1).padStart(2, '0')}
              </T>
              <View style={{ backgroundColor: '#005BFF18', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                <T variant="small" color={colors.blue} style={{ fontWeight: '600' }}>
                  v{item.version}
                </T>
              </View>
            </Row>

            <T variant="title" style={{ fontSize: 24, lineHeight: 30 }}>
              {item.name}
            </T>

            <Row style={{ flexWrap: 'wrap', gap: 6 }}>
              {item.traits.map(trait => (
                <View
                  key={trait}
                  style={{
                    backgroundColor: colors.surface,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: colors.line,
                  }}
                >
                  <T variant="small" color={colors.ink} style={{ fontSize: 11 }}>
                    {trait}
                  </T>
                </View>
              ))}
            </Row>

            <T variant="small" color={colors.muted} numberOfLines={2}>
              {item.description}
            </T>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
