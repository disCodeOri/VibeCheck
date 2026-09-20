import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, Chip, Icon, Row, Screen, SegmentedControl, Stack, T } from '../../components/ui';
import { useActionSheet } from '../../components/ActionSheet';
import { colors } from '../../tokens/colors';
import { fonts } from '../../tokens/typography';

export type CaptionSlot = 'safe' | 'signature' | 'bold';

const sampleCaptions: Record<CaptionSlot, string> = {
  safe: 'Quiet corners and Sunday light.',
  signature: 'Somewhere between catching up and letting go.',
  bold: 'Not explaining this one.',
};

interface SongRecommendation {
  id: string;
  title: string;
  artist: string;
  explicit: boolean;
  label: string;
  reason: string;
  hookTime: string;
}

const sampleSongs: SongRecommendation[] = [
  {
    id: '1',
    title: 'Warm Sun, Quiet Hour',
    artist: 'Leon Bridges',
    explicit: false,
    label: 'Warm Analog',
    reason: 'Matches the amber natural lighting and candid posture.',
    hookTime: '0:42',
  },
  {
    id: '2',
    title: 'Motion Blur',
    artist: 'Sampha',
    explicit: false,
    label: 'Late Night Soul',
    reason: 'Deep, understated rhythm that elevates the cinematic tone.',
    hookTime: '1:15',
  },
];

export interface CaptionsScreenProps {
  onCopyCaption?: (text: string) => void;
  onSelectSong?: (song: SongRecommendation) => void;
}

/**
 * CaptionsScreen: Tone switcher, quotation card, rewrite toolkit, and audio pairings.
 * Provides safe/signature/bold presets, one-tap translation chips, and platform music pickers.
 */
export function CaptionsScreen({ onCopyCaption, onSelectSong }: CaptionsScreenProps) {
  const [slot, setSlot] = useState<CaptionSlot>('signature');
  const [copied, setCopied] = useState(false);
  const [selectedTweak, setSelectedTweak] = useState<string | null>(null);
  const { show, sheet } = useActionSheet();

  const currentCaption = sampleCaptions[slot];

  const handleCopy = () => {
    setCopied(true);
    onCopyCaption?.(currentCaption);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenSong = (song: SongRecommendation) => {
    show({
      title: 'Open in Music App',
      message: `${song.title} by ${song.artist}`,
      choices: [
        { label: 'Spotify', onPress: () => onSelectSong?.(song) },
        { label: 'Apple Music', onPress: () => onSelectSong?.(song) },
        { label: 'YouTube Music', onPress: () => onSelectSong?.(song) },
      ],
    });
  };

  return (
    <Screen back title="Captions & Sound">
      {/* Title Header */}
      <View style={{ gap: 4, paddingVertical: 4 }}>
        <T style={{ fontFamily: fonts.anton, fontSize: 40, lineHeight: 42, color: '#080D23', textTransform: 'uppercase' }}>
          WORDS THAT FIT.
        </T>
        <T color={colors.blue} style={{ fontSize: 16, fontWeight: '600' }}>
          Make it yours.
        </T>
      </View>

      {/* Tone Segmented Control */}
      <SegmentedControl
        options={[
          { id: 'safe', label: 'Safe' },
          { id: 'signature', label: 'Signature' },
          { id: 'bold', label: 'Bold' },
        ]}
        value={slot}
        onChange={id => setSlot(id as CaptionSlot)}
      />

      {/* Caption Quotation Card */}
      <Card style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, padding: 22, gap: 16 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.blueSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <T variant="label" color={colors.blue}>{slot.toUpperCase()} TONE</T>
          </View>
          <T variant="small" color={colors.muted}>Ready to copy</T>
        </Row>

        <T style={{ fontFamily: fonts.serif, fontSize: 24, lineHeight: 32, color: colors.ink }}>
          “{currentCaption}”
        </T>

        <Row style={{ gap: 10 }}>
          <Button
            label={copied ? 'Copied to clipboard' : 'Copy caption'}
            icon={copied ? 'check' : 'copy'}
            style={{ flex: 1 }}
            onPress={handleCopy}
          />
          <Button
            label="Share"
            icon="share"
            kind="soft"
            onPress={() => {}}
          />
        </Row>
      </Card>

      {/* Tweak or Translate Toolkit */}
      <View style={{ gap: 8 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T variant="label" color={colors.muted} style={{ fontSize: 11 }}>Tweak or translate</T>
          {selectedTweak ? <T variant="small" color={colors.blue}>{selectedTweak} applied</T> : null}
        </Row>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
          {[
            { id: 'shorter', label: 'Shorter', tint: colors.skySoft },
            { id: 'funnier', label: 'Funnier', tint: colors.peachSoft },
            { id: 'more_subtle', label: 'More subtle', tint: colors.lavenderSoft },
            { id: 'bolder', label: 'Bolder', tint: colors.peachSoft },
            { id: 'more_natural', label: 'More natural', tint: colors.sageSoft },
            { id: 'no_emojis', label: 'No emojis', tint: colors.skySoft },
            { id: 'english', label: 'English', tint: colors.lavenderSoft },
            { id: 'hinglish', label: 'Hinglish', tint: colors.peachSoft },
          ].map(chip => (
            <Chip
              key={chip.id}
              label={chip.label}
              tintSoft={chip.tint}
              selected={selectedTweak === chip.label}
              onPress={() => setSelectedTweak(chip.label)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Music Pairings Section */}
      <Stack style={{ gap: 12, marginTop: 10 }}>
        <View style={{ gap: 4 }}>
          <T style={{ fontFamily: fonts.anton, fontSize: 32, lineHeight: 34, color: '#080D23', textTransform: 'uppercase' }}>
            SET THE SOUND.
          </T>
          <T variant="small" color={colors.muted}>
            Auditory pairings aligned with your story's lighting and energy.
          </T>
        </View>

        {sampleSongs.map(song => (
          <Card key={song.id} style={{ padding: 16, gap: 10, borderColor: colors.cardBorder }}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, gap: 2 }}>
                <T variant="bold" style={{ fontSize: 15 }}>
                  {song.title} {song.explicit ? '· [E]' : ''}
                </T>
                <T variant="small" color={colors.muted}>{song.artist}</T>
              </View>
              <View style={{ backgroundColor: colors.blueSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                <T variant="label" color={colors.blue}>{song.label}</T>
              </View>
            </Row>

            <T variant="small" style={{ fontSize: 13, lineHeight: 18 }}>{song.reason}</T>

            <Row style={{ alignItems: 'center', gap: 6 }}>
              <Icon name="clock" size={14} color={colors.muted} />
              <T variant="small" color={colors.muted}>Best hook start at {song.hookTime}</T>
            </Row>

            <Row style={{ gap: 10, marginTop: 4 }}>
              <Button
                label="Find this song"
                kind="secondary"
                icon="external-link"
                style={{ flex: 1 }}
                onPress={() => handleOpenSong(song)}
              />
              <Button
                label="Copy title"
                kind="soft"
                icon="copy"
                onPress={() => {}}
              />
            </Row>
          </Card>
        ))}
      </Stack>

      {sheet}
    </Screen>
  );
}
