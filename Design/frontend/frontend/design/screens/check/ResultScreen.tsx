import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Chip, Icon, Notice, Row, Screen, Stack, T } from '../../components/ui';
import { InkPanel } from '../../components/InkPanel';
import { colors } from '../../tokens/colors';
import { fonts } from '../../tokens/typography';

export interface ResultScreenProps {
  score?: number;
  headline?: string;
  intent?: string;
  audience?: string;
  onPost?: () => void;
  onFix?: () => void;
}

/**
 * ResultScreen: Scorecard and aesthetic verdict display.
 * Displays high-impact score banners, actionable visual tweaks, working elements, and quick decisions.
 */
export function ResultScreen({
  score = 88,
  headline = 'Effortless and in your element.',
  intent = 'Effortless',
  audience = 'Close friends',
  onPost,
  onFix,
}: ResultScreenProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showFixArea, setShowFixArea] = useState(false);
  const [decision, setDecision] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'felt_like_me' | 'not_me' | null>(null);

  const components = [
    { key: 'intent', label: 'Your intent', score: 92, note: 'Matches subtle, natural self-expression.' },
    { key: 'instant_read', label: 'Instant read', score: 85, note: 'Subject stands out clearly against ambient lighting.' },
    { key: 'composition', label: 'Composition', score: 90, note: 'Balanced vertical rule-of-thirds alignment.' },
    { key: 'emotional', label: 'Emotional pull', score: 84, note: 'Warm, candid tone with high authenticity.' },
    { key: 'technical', label: 'Technical quality', score: 89, note: 'Clean dynamic range and crisp facial clarity.' },
  ];

  return (
    <Screen
      back
      title="The Receipt"
      footer={
        <>
          <Button
            label={decision ? 'Decision recorded' : 'I posted it'}
            icon="check"
            onPress={() => {
              setDecision('posted');
              onPost?.();
            }}
          />
          <Button
            label="Try another"
            kind="secondary"
            onPress={() => router.push('/check/new')}
          />
        </>
      }
    >
      {/* Verdict Headline */}
      <View style={{ gap: 4, paddingVertical: 4 }}>
        <T style={{ fontFamily: fonts.anton, fontSize: 36, lineHeight: 38, color: '#080D23', textTransform: 'uppercase' }}>
          {headline}
        </T>
      </View>

      {/* InkPanel Score Banner */}
      <InkPanel>
        <Stack style={{ gap: 14 }}>
          <Row style={{ alignItems: 'baseline', gap: 6 }}>
            <T
              variant="hero"
              color={colors.surface}
              style={{ fontFamily: fonts.anton, fontSize: 88, lineHeight: 92 }}
            >
              {score}
            </T>
            <T color={colors.surface} style={{ fontSize: 22, fontWeight: '600', opacity: 0.85 }}>
              / 100
            </T>
          </Row>
          <View style={{ gap: 4 }}>
            <T color={colors.surface} style={{ fontSize: 16, fontWeight: '600' }}>
              {intent} · {audience}
            </T>
            <T variant="small" color={colors.surface} style={{ opacity: 0.9 }}>
              Strong alignment with your defined visual intention.
            </T>
          </View>
        </Stack>
      </InkPanel>

      {/* Decision Notice if set */}
      {decision ? (
        <Notice>Decision saved: {decision.replace(/_/g, ' ')}. Your post, your call.</Notice>
      ) : null}

      {/* One Useful Tweak */}
      <Card style={{ backgroundColor: colors.blueSoft, borderColor: colors.line, padding: 18, gap: 10 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Row style={{ gap: 8, alignItems: 'center' }}>
            <Icon name="zap" size={18} color={colors.blue} />
            <T variant="label" color={colors.blue}>One useful tweak</T>
          </Row>
          <View style={{ backgroundColor: colors.surface, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
            <T variant="bold" color={colors.blue} style={{ fontSize: 12 }}>+6 pts</T>
          </View>
        </Row>
        <T variant="title" style={{ fontSize: 20, lineHeight: 26 }}>
          Crop slightly from bottom to pull focus toward eyes
        </T>
        <T variant="small" color={colors.muted}>
          A quick 3-second crop before posting elevates the instant visual punch.
        </T>
        <Row style={{ gap: 10, marginTop: 4 }}>
          <Button
            label={showFixArea ? 'Hide area' : 'Show me where'}
            kind="secondary"
            style={{ flex: 1 }}
            onPress={() => setShowFixArea(!showFixArea)}
          />
        </Row>
        {showFixArea ? (
          <View style={{ height: 120, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line }}>
            <Icon name="crosshair" size={28} color={colors.blue} />
            <T variant="small" color={colors.blue} style={{ marginTop: 6 }}>Focus target highlighted</T>
          </View>
        ) : null}
      </Card>

      {/* What's Working */}
      <Card style={{ padding: 18, gap: 12, borderColor: colors.cardBorder }}>
        <T variant="label" color={colors.muted}>What’s working</T>
        <Row style={{ gap: 10, alignItems: 'flex-start' }}>
          <Icon name="check-circle" size={18} color={colors.green} />
          <T style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>
            Natural skin highlights without over-processing or artificial haze.
          </T>
        </Row>
        <Row style={{ gap: 10, alignItems: 'flex-start' }}>
          <Icon name="check-circle" size={18} color={colors.green} />
          <T style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>
            Casual gesture feels unscripted and directly true to life.
          </T>
        </Row>
      </Card>

      {/* Scorecard Accordion */}
      <Button
        label={showDetails ? 'Hide scorecard breakdown' : 'Why this verdict?'}
        kind="secondary"
        icon={showDetails ? 'chevron-up' : 'chevron-down'}
        onPress={() => setShowDetails(!showDetails)}
      />

      {showDetails ? (
        <Card style={{ padding: 18, gap: 16, borderColor: colors.cardBorder }}>
          <T variant="small" color={colors.muted}>
            Scores reflect visual composition and intent alignment. They never rate people.
          </T>
          {components.map(item => (
            <Stack key={item.key} style={{ gap: 6 }}>
              <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <T variant="bold" style={{ fontSize: 14 }}>{item.label}</T>
                <T variant="bold" color={colors.blue}>{item.score}</T>
              </Row>
              <View style={{ height: 7, backgroundColor: colors.blueSoft, borderRadius: 5, overflow: 'hidden' }}>
                <View
                  style={{
                    height: 7,
                    width: `${item.score}%`,
                    backgroundColor: colors.blue,
                    borderRadius: 5,
                  }}
                />
              </View>
              <T variant="small" color={colors.muted} style={{ fontSize: 12 }}>
                {item.note}
              </T>
            </Stack>
          ))}
        </Card>
      ) : null}

      {/* Feel Like You? Feedback Card */}
      <Card style={{ padding: 18, gap: 14, borderColor: colors.cardBorder }}>
        <View style={{ gap: 4 }}>
          <T variant="title" style={{ fontSize: 22, lineHeight: 28 }}>Feel Like You?</T>
          <T variant="small" color={colors.muted}>Your feedback tunes future recommendations.</T>
        </View>
        <Row style={{ gap: 10 }}>
          <Chip
            label="Felt like me"
            selected={feedback === 'felt_like_me'}
            tint={colors.sage}
            tintSoft={colors.sageSoft}
            style={{ flex: 1, minHeight: 42 }}
            onPress={() => setFeedback('felt_like_me')}
          />
          <Chip
            label="Not me"
            selected={feedback === 'not_me'}
            tint={colors.peach}
            tintSoft={colors.peachSoft}
            style={{ flex: 1, minHeight: 42 }}
            onPress={() => setFeedback('not_me')}
          />
        </Row>
      </Card>

      {/* Your Next Move */}
      <Card style={{ padding: 18, gap: 12, borderColor: colors.cardBorder }}>
        <View style={{ gap: 4 }}>
          <T variant="bold" style={{ fontSize: 16 }}>Your next move</T>
          <T variant="small" color={colors.muted}>Let us know if this check helped you decide.</T>
        </View>
        <Row style={{ gap: 10 }}>
          <Button
            label="I made the fix"
            icon="check"
            kind="primary"
            style={{ flex: 1 }}
            onPress={() => {
              setDecision('applied_fix');
              onFix?.();
            }}
          />
          <Button
            label="Not posting"
            icon="x"
            kind="soft"
            style={{ flex: 1 }}
            onPress={() => setDecision('not_posting')}
          />
        </Row>
      </Card>

      {/* Destructive / Delete Option */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Delete photo or check"
        style={({ pressed }) => [{
          paddingVertical: 14,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
          marginTop: 4,
          marginBottom: 12,
        }]}
      >
        <Row style={{ gap: 8, alignItems: 'center' }}>
          <Icon name="trash-2" size={16} color={colors.danger} />
          <T variant="small" color={colors.danger} style={{ fontWeight: '500' }}>
            Delete photo or check
          </T>
        </Row>
      </Pressable>
    </Screen>
  );
}
