import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Card, Icon, NavRow, Row, Screen, Setting, T } from '../../components/ui';
import { useActionSheet } from '../../components/ActionSheet';
import { colors } from '../../tokens/colors';
import { fonts } from '../../tokens/typography';

/**
 * YouScreen: Clean iOS-style settings card, defaults picker, and account status.
 */
export function YouScreen() {
  const { show, sheet } = useActionSheet();
  const [confidenceMode, setConfidenceMode] = useState(false);
  const [explicitSongs, setExplicitSongs] = useState(false);
  const [captionLang, setCaptionLang] = useState('English');
  const [audience, setAudience] = useState('Close Friends');
  const [vibe, setVibe] = useState('Effortless');

  return (
    <Screen title="You">
      <View style={{ gap: 4 }}>
        <T variant="hero">All You.</T>
        <T variant="accent" color={colors.blue}>Better vibes. Bigger moves.</T>
      </View>

      {/* Account Status */}
      <Card style={{ padding: 18, gap: 14 }}>
        <Row>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="user" size={22} color={colors.blue} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <T variant="title" style={{ fontSize: 24, lineHeight: 28 }}>Good to see you.</T>
            <T variant="small" color={colors.muted}>Your account is linked</T>
          </View>
          <View style={{ backgroundColor: colors.blueSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
            <T variant="label" color={colors.blue}>PRO</T>
          </View>
        </Row>
        <View style={{ flexDirection: 'row', gap: 8, paddingTop: 12, borderTopWidth: 1, borderColor: colors.line }}>
          {[
            { label: 'Checks', count: 'Unlimited', period: 'active' },
            { label: 'Compares', count: 'Unlimited', period: 'active' },
            { label: 'Styles', count: '50', period: 'saved' },
          ].map(q => (
            <View key={q.label} style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 6, backgroundColor: colors.canvas, borderRadius: 10, alignItems: 'center' }}>
              <T style={{ fontFamily: fonts.bold, fontSize: 18, lineHeight: 22, color: colors.blue }}>{q.count}</T>
              <T style={{ fontSize: 11, fontFamily: fonts.medium, color: colors.ink, marginTop: 2, textAlign: 'center' }}>{q.label}</T>
              <T style={{ fontSize: 10, color: colors.muted, textAlign: 'center' }}>{q.period}</T>
            </View>
          ))}
        </View>
      </Card>

      {/* Navigation Links */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <NavRow icon="user" label="Account & sign-in" onPress={() => router.push('/settings/account')} />
        <NavRow icon="aperture" label="Loox" detail="Aesthetic benchmarks & style DNA" onPress={() => router.push('/loox')} />
        <NavRow icon="check-circle" label="Chicfit" detail="Outfit checks & closet wardrobe" onPress={() => router.push('/chicfit')} />
        <NavRow icon="heart" label="Your taste" detail="Learning from your choices" onPress={() => router.push('/taste')} />
        <NavRow icon="shield" label="Privacy & data" onPress={() => router.push('/settings/privacy')} />
        <NavRow icon="bell" label="Notifications" border={false} onPress={() => router.push('/settings/notifications')} />
      </Card>

      {/* Preferences */}
      <Card style={{ gap: 12 }}>
        <T variant="label" color={colors.blue}>Preferences</T>
        <Setting
          label="Confidence mode"
          detail="Keep the advice. Hide all scores and percentages."
          value={confidenceMode}
          onChange={setConfidenceMode}
        />
        <View style={{ height: 1, backgroundColor: colors.line }} />
        <Setting
          label="Explicit songs"
          detail="Include songs with explicit lyrics in recommendations."
          value={explicitSongs}
          onChange={setExplicitSongs}
        />
      </Card>

      {/* Defaults - Clean Modal Picker Rows */}
      <View style={{ gap: 8 }}>
        <T variant="label" color={colors.blue} style={{ paddingHorizontal: 4 }}>Defaults</T>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <NavRow
            icon="globe"
            label="Caption language"
            value={captionLang}
            onPress={() =>
              show({
                title: 'Caption language',
                message: 'Choose your default language for captions.',
                choices: [
                  { label: 'Auto (match photo & vibe)', onPress: () => setCaptionLang('Auto') },
                  { label: 'English', onPress: () => setCaptionLang('English') },
                  { label: 'Hinglish', onPress: () => setCaptionLang('Hinglish') },
                ],
              })
            }
          />
          <NavRow
            icon="users"
            label="Usual audience"
            value={audience}
            onPress={() =>
              show({
                title: 'Usual audience',
                message: 'Pre-selects your audience when starting a new check.',
                choices: [
                  { label: 'Close Friends', onPress: () => setAudience('Close Friends') },
                  { label: 'Public', onPress: () => setAudience('Public') },
                  { label: 'Professional', onPress: () => setAudience('Professional') },
                  { label: 'Everyone', onPress: () => setAudience('Everyone') },
                ],
              })
            }
          />
          <NavRow
            icon="smile"
            label="Usual vibe"
            value={vibe}
            border={false}
            onPress={() =>
              show({
                title: 'Usual vibe',
                message: 'Pre-selects your default intent.',
                choices: [
                  { label: 'Effortless', onPress: () => setVibe('Effortless') },
                  { label: 'Night Out', onPress: () => setVibe('Night Out') },
                  { label: 'Aesthetic', onPress: () => setVibe('Aesthetic') },
                  { label: 'Casual', onPress: () => setVibe('Casual') },
                  { label: 'Travel', onPress: () => setVibe('Travel') },
                ],
              })
            }
          />
        </Card>
      </View>

      {sheet}
    </Screen>
  );
}

export default YouScreen;
