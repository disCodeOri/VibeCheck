import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Field, Icon, Notice, Row, Screen, Stack, T } from '../../components/ui';
import { colors } from '../../tokens/colors';
import { fonts } from '../../tokens/typography';

export interface StyleDetailScreenProps {
  initialName?: string;
  version?: number;
  traits?: string[];
  description?: string;
  summary?: Record<string, string[]>;
  onUseStyle?: () => void;
}

/**
 * StyleDetailScreen: Detailed style DNA breakdown and reference controls.
 * Shows visual traits, lighting/color breakdown, and reference actions.
 */
export function StyleDetailScreen({
  initialName = 'Nordic Warmth',
  version = 3,
  traits = ['Subdued Contrast', 'Warm Ambient', 'Clean Framing', 'Minimalist Tone'],
  description = 'Soft overcast daylight with balanced midtones, understated contrast, and minimalist background geometry.',
  summary = {
    lighting: ['Soft indirect overcast source', 'Gentle shadow roll-off with no harsh clipped highlights'],
    color_palette: ['Muted ochre and slate blue tones', 'Warm skin tones without oversaturation'],
    composition: ['Centered subject with clean negative space', 'Eyes aligned along upper third line'],
  },
  onUseStyle,
}: StyleDetailScreenProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);

  return (
    <Screen back title="Style DNA">
      {/* Style Name & Version */}
      <View style={{ gap: 6, paddingVertical: 4 }}>
        <T style={{ fontFamily: fonts.anton, fontSize: 42, lineHeight: 44, color: '#080D23', textTransform: 'uppercase' }}>
          {name}
        </T>
        <T variant="small" color={colors.muted}>
          Version {version} · Blueprint active
        </T>
      </View>

      {/* Trait Pills */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {traits.map(trait => (
          <View
            key={trait}
            style={{
              backgroundColor: colors.blueSoft,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.line,
            }}
          >
            <T variant="small" color={colors.blueDark} style={{ fontWeight: '600' }}>
              {trait}
            </T>
          </View>
        ))}
      </View>

      {/* Canonical Description */}
      <Card style={{ padding: 18, gap: 10, borderColor: colors.cardBorder }}>
        <T variant="label" color={colors.blue}>STYLE SUMMARY</T>
        <T style={{ fontSize: 15, lineHeight: 22, color: colors.ink }}>
          {description}
        </T>
      </Card>

      {/* DNA Breakdown Sections */}
      {Object.entries(summary).map(([section, items]) => (
        <Card key={section} style={{ padding: 18, gap: 10, borderColor: colors.cardBorder }}>
          <T variant="label" color={colors.blue}>
            {section.replace(/_/g, ' ').toUpperCase()}
          </T>
          <Stack style={{ gap: 8 }}>
            {items.map((item, idx) => (
              <Row key={idx} style={{ gap: 8, alignItems: 'flex-start' }}>
                <Icon name="check-circle" size={16} color={colors.blue} style={{ marginTop: 2 }} />
                <T style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>{item}</T>
              </Row>
            ))}
          </Stack>
        </Card>
      ))}

      {/* Name Editor */}
      {editing ? (
        <Stack style={{ gap: 10 }}>
          <Field
            label="Style Name"
            value={name}
            onChangeText={setName}
            maxLength={40}
          />
          <Button label="Save name" onPress={() => setEditing(false)} />
          <Button label="Cancel" kind="secondary" onPress={() => setEditing(false)} />
        </Stack>
      ) : (
        <Button label="Edit name" kind="secondary" onPress={() => setEditing(true)} />
      )}

      {/* Actions */}
      <Button
        label="Use this style in Check"
        icon="arrow-right"
        onPress={() => {
          if (onUseStyle) onUseStyle();
          else router.push('/check/new');
        }}
      />
      <Button
        label="Analyze another reference"
        kind="secondary"
        onPress={() => router.push('/styles/new')}
      />
      <Button label="Archive style" kind="secondary" onPress={() => {}} />

      {/* Privacy Notice */}
      <Notice>
        We preserve stylistic aesthetics, lighting ratios, and color palettes—never personal identity or biometric data.
      </Notice>
    </Screen>
  );
}
