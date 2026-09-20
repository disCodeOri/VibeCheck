import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Chip, Field, Icon, Row, Screen, Stack, T } from '../../components/ui';
import { colors } from '../../tokens/colors';
import { fonts } from '../../tokens/typography';

export type Intent =
  | 'funny'
  | 'attractive'
  | 'effortless'
  | 'aesthetic'
  | 'mysterious'
  | 'romantic'
  | 'chaotic'
  | 'professional'
  | 'personal_update'
  | 'night_out'
  | 'travel'
  | 'custom';

export type Audience = 'close_friends' | 'public' | 'professional' | 'everyone';

const moodTints: Record<Intent, { tint: string; tintSoft: string }> = {
  funny: { tint: colors.peach, tintSoft: colors.peachSoft },
  attractive: { tint: colors.blue, tintSoft: colors.skySoft },
  effortless: { tint: colors.blue, tintSoft: colors.skySoft },
  aesthetic: { tint: colors.lavender, tintSoft: colors.lavenderSoft },
  mysterious: { tint: colors.lavender, tintSoft: colors.lavenderSoft },
  romantic: { tint: colors.lavender, tintSoft: colors.lavenderSoft },
  chaotic: { tint: colors.peach, tintSoft: colors.peachSoft },
  professional: { tint: colors.sage, tintSoft: colors.sageSoft },
  personal_update: { tint: colors.sage, tintSoft: colors.sageSoft },
  night_out: { tint: colors.peach, tintSoft: colors.peachSoft },
  travel: { tint: colors.sage, tintSoft: colors.sageSoft },
  custom: { tint: colors.blue, tintSoft: colors.blueSoft },
};

const intentLabels: Record<Intent, string> = {
  funny: 'Funny',
  attractive: 'Attractive',
  effortless: 'Effortless',
  aesthetic: 'Aesthetic',
  mysterious: 'Mysterious',
  romantic: 'Romantic',
  chaotic: 'Chaotic',
  professional: 'Professional',
  personal_update: 'Personal update',
  night_out: 'Night out',
  travel: 'Travel',
  custom: 'Custom vibe',
};

const audienceLabels: Record<Audience, string> = {
  close_friends: 'Close friends',
  public: 'Public story',
  professional: 'Professional',
  everyone: 'Everyone',
};

const intentGrid: Intent[][] = [
  ['funny', 'attractive', 'effortless'],
  ['aesthetic', 'mysterious', 'romantic'],
  ['chaotic', 'professional', 'personal_update'],
  ['night_out', 'travel', 'custom'],
];

export interface NewCheckScreenProps {
  initialMode?: 'single' | 'compare';
  onCheck?: (payload: { intent: Intent; audience: Audience; custom?: string }) => void;
}

/**
 * NewCheckScreen: Photo intake and mood calibration screen.
 * Provides library/camera trigger buttons, 4x3 mood selector, custom vibe input, and audience targeting.
 */
export function NewCheckScreen({ initialMode = 'single', onCheck }: NewCheckScreenProps) {
  const [compare, setCompare] = useState(initialMode === 'compare');
  const [intent, setIntent] = useState<Intent>('effortless');
  const [custom, setCustom] = useState('');
  const [audience, setAudience] = useState<Audience>('close_friends');
  const [hasPhoto, setHasPhoto] = useState(false);

  const valid = hasPhoto && (intent !== 'custom' || custom.trim().length > 0);

  const handleSubmit = () => {
    if (onCheck) {
      onCheck({ intent, audience, custom: intent === 'custom' ? custom : undefined });
    } else {
      router.push('/check/sample-result');
    }
  };

  return (
    <Screen
      back
      title={compare ? 'Compare two stories' : 'New Story Check'}
      footer={
        <Button
          label={compare ? 'Find my pick' : 'Check my story'}
          icon="arrow-right"
          disabled={!hasPhoto}
          onPress={handleSubmit}
        />
      }
    >
      <View style={{ gap: 6, marginBottom: 4 }}>
        <T style={{ fontFamily: fonts.anton, fontSize: 44, lineHeight: 46, color: '#080D23', textTransform: 'uppercase' }}>
          {compare ? 'THIS ONE.\nOR THAT ONE?' : 'WHAT’S\nTHE VIBE?'}
        </T>
        <T color={colors.blueDark} style={{ fontSize: 15 }}>
          Calibrate intent before you post.
        </T>
      </View>

      {/* Photo Intake Card */}
      {hasPhoto ? (
        <Card style={{ padding: 16, gap: 12, borderColor: colors.cardBorder }}>
          <View style={{ height: 180, borderRadius: 12, backgroundColor: colors.skySoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line }}>
            <Icon name="image" size={36} color={colors.blue} />
            <T variant="label" color={colors.blue} style={{ marginTop: 8 }}>Photo Selected</T>
            <T variant="small" color={colors.muted}>Ready for instant analysis</T>
          </View>
          <Row style={{ gap: 10 }}>
            <Button
              label="Change photo"
              icon="image"
              kind="secondary"
              style={{ flex: 1 }}
              onPress={() => setHasPhoto(false)}
            />
            <Button
              label={compare ? 'Switch to single' : 'Compare 2'}
              kind="soft"
              onPress={() => setCompare(!compare)}
            />
          </Row>
        </Card>
      ) : (
        <Card style={{ padding: 20, gap: 16, borderColor: colors.cardBorder }}>
          <View style={{ gap: 6 }}>
            <T variant="title" style={{ fontSize: 24, lineHeight: 30 }}>
              {compare ? 'Two photos. One decision.' : 'Start with your photo.'}
            </T>
            <T color={colors.muted} style={{ fontSize: 13, lineHeight: 18 }}>
              Choose a photo or screenshot. Metadata is stripped locally before check.
            </T>
          </View>

          <Row style={{ gap: 12 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choose from photo library"
              onPress={() => setHasPhoto(true)}
              style={({ pressed }) => [{
                flex: 1,
                backgroundColor: colors.skySoft,
                borderWidth: 1,
                borderColor: colors.line,
                borderRadius: 16,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                opacity: pressed ? 0.8 : 1,
              }]}
            >
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="image" size={20} color={colors.blue} />
              </View>
              <View style={{ flex: 1 }}>
                <T variant="bold" style={{ fontSize: 14, lineHeight: 18 }}>Photos</T>
                <T variant="small" color={colors.muted} style={{ fontSize: 11, lineHeight: 14 }}>From library</T>
              </View>
            </Pressable>

            {!compare ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open camera"
                onPress={() => setHasPhoto(true)}
                style={({ pressed }) => [{
                  flex: 1,
                  backgroundColor: colors.lavenderSoft,
                  borderWidth: 1,
                  borderColor: colors.line,
                  borderRadius: 16,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  opacity: pressed ? 0.8 : 1,
                }]}
              >
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="camera" size={20} color={colors.lavender} />
                </View>
                <View style={{ flex: 1 }}>
                  <T variant="bold" style={{ fontSize: 14, lineHeight: 18 }}>Camera</T>
                  <T variant="small" color={colors.muted} style={{ fontSize: 11, lineHeight: 14 }}>Snap now</T>
                </View>
              </Pressable>
            ) : null}
          </Row>
        </Card>
      )}

      {/* Mood Selector Grid */}
      <Card style={{ padding: 18, gap: 14, borderColor: colors.cardBorder }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <T variant="bold" style={{ fontSize: 16 }}>What should your post say?</T>
          <T variant="label" color={colors.blue}>{intentLabels[intent]}</T>
        </Row>
        <View style={{ gap: 8 }}>
          {intentGrid.map((row, rIdx) => (
            <Row key={rIdx} style={{ gap: 8 }}>
              {row.map(id => {
                const selected = intent === id;
                const mood = moodTints[id] ?? { tint: colors.blue, tintSoft: colors.blueSoft };
                return (
                  <Chip
                    key={id}
                    label={intentLabels[id]}
                    selected={selected}
                    tint={mood.tint}
                    tintSoft={mood.tintSoft}
                    style={{ flex: 1, minHeight: 38, paddingHorizontal: 4 }}
                    onPress={() => setIntent(id)}
                  />
                );
              })}
            </Row>
          ))}
        </View>
        {intent === 'custom' ? (
          <Field
            label="Your own vibe"
            placeholder="A quiet Sunday kind of mood"
            maxLength={40}
            value={custom}
            onChangeText={setCustom}
          />
        ) : null}
      </Card>

      {/* Audience Selector Grid */}
      <Card style={{ padding: 18, gap: 14, borderColor: colors.cardBorder }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <T variant="bold" style={{ fontSize: 16 }}>Who’s it for?</T>
          <T variant="label" color={colors.blue}>{audienceLabels[audience]}</T>
        </Row>
        <View style={{ gap: 8 }}>
          <Row style={{ gap: 8 }}>
            <Chip
              label={audienceLabels.close_friends}
              selected={audience === 'close_friends'}
              style={{ flex: 1, minHeight: 40 }}
              onPress={() => setAudience('close_friends')}
            />
            <Chip
              label={audienceLabels.public}
              selected={audience === 'public'}
              style={{ flex: 1, minHeight: 40 }}
              onPress={() => setAudience('public')}
            />
          </Row>
          <Row style={{ gap: 8 }}>
            <Chip
              label={audienceLabels.professional}
              selected={audience === 'professional'}
              style={{ flex: 1, minHeight: 40 }}
              onPress={() => setAudience('professional')}
            />
            <Chip
              label={audienceLabels.everyone}
              selected={audience === 'everyone'}
              style={{ flex: 1, minHeight: 40 }}
              onPress={() => setAudience('everyone')}
            />
          </Row>
        </View>
      </Card>
    </Screen>
  );
}
