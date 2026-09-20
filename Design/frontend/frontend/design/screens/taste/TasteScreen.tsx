import React, { useState } from 'react';
import { View } from 'react-native';
import { Card, Notice, Row, Screen, Setting, Stack, T } from '../../components/ui';
import { colors } from '../../tokens/colors';
import { fonts } from '../../tokens/typography';

export interface TasteScreenProps {
  initialPaused?: boolean;
  confidenceScore?: number;
  signalsCount?: number;
}

/**
 * TasteScreen: Aesthetic fingerprint & taste evolution hub.
 * Displays profile learning progress, confidence score, and privacy/learning controls.
 */
export function TasteScreen({
  initialPaused = false,
  confidenceScore = 74,
  signalsCount = 18,
}: TasteScreenProps) {
  const [learningPaused, setLearningPaused] = useState(initialPaused);

  return (
    <Screen back title="Your Taste Profile">
      {/* Editorial Headline */}
      <View style={{ gap: 6, paddingVertical: 4 }}>
        <T style={{ fontFamily: fonts.anton, fontSize: 44, lineHeight: 46, color: '#080D23', textTransform: 'uppercase' }}>
          YOUR MOOD.{'\n'}YOUR VERSION.
        </T>
        <T color={colors.blue} style={{ fontSize: 16, fontWeight: '600' }}>
          A little more you, every time.
        </T>
      </View>

      {/* Progress & Pattern Card */}
      <Card style={{ padding: 20, gap: 14, borderColor: colors.cardBorder }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <T variant="label" color={colors.blue}>TASTE PATTERN</T>
          <View style={{ backgroundColor: colors.blueSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
            <T variant="small" color={colors.blueDark} style={{ fontWeight: '600' }}>
              Level 2 · Calibrated
            </T>
          </View>
        </Row>

        <T variant="title" style={{ fontSize: 24, lineHeight: 30 }}>
          Your aesthetic choices are finding a distinct pattern.
        </T>

        <View style={{ gap: 6 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <T variant="small" color={colors.muted}>Pattern confidence</T>
            <T variant="bold" color={colors.blue}>{confidenceScore}%</T>
          </Row>
          <View style={{ height: 8, backgroundColor: colors.blueSoft, borderRadius: 4, overflow: 'hidden' }}>
            <View style={{ height: 8, width: `${confidenceScore}%`, backgroundColor: colors.blue, borderRadius: 4 }} />
          </View>
        </View>

        <T style={{ fontSize: 14, lineHeight: 20, color: colors.muted }}>
          Copying captions, choosing between photos, and tapping "Felt like me" tune your future recommendation models.
        </T>
      </Card>

      {/* Stats Quick Cards */}
      <Row style={{ gap: 12 }}>
        <Card style={{ flex: 1, padding: 14, gap: 4, borderColor: colors.line }}>
          <T variant="label" color={colors.muted}>TOTAL SIGNALS</T>
          <T style={{ fontFamily: fonts.anton, fontSize: 28, color: colors.ink }}>
            {signalsCount}
          </T>
          <T variant="small" color={colors.muted}>Interactions recorded</T>
        </Card>

        <Card style={{ flex: 1, padding: 14, gap: 4, borderColor: colors.line }}>
          <T variant="label" color={colors.muted}>TOP MOOD</T>
          <T style={{ fontFamily: fonts.anton, fontSize: 28, color: colors.blue }}>
            EFFORTLESS
          </T>
          <T variant="small" color={colors.muted}>62% of checks</T>
        </Card>
      </Row>

      {/* Learning Controls */}
      <Stack style={{ gap: 10, marginTop: 6 }}>
        <Setting
          label="Pause learning"
          detail="Keep using Vibe Check without adding new taste signals to your model."
          value={learningPaused}
          onChange={setLearningPaused}
        />
      </Stack>

      <Notice>
        Your taste fingerprint is stored securely and private to your account. You can pause or reset it anytime.
      </Notice>
    </Screen>
  );
}
