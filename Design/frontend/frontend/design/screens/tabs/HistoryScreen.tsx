import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Chip, Field, Row, Screen, State, T } from '../../components/ui';
import { MediaPreview, type SwatchColor } from '../../components/MediaPreview';
import { colors } from '../../tokens/colors';

interface HistoryItem {
  id: string;
  headline: string;
  intentLabel: string;
  mode: 'story' | 'compare';
  displayScore: number;
  date: string;
  palette: SwatchColor[];
}

const DEMO_HISTORY: HistoryItem[] = [
  {
    id: '1',
    headline: 'Easy mood. Strong story.',
    intentLabel: 'Effortless',
    mode: 'story',
    displayScore: 88,
    date: 'Sep 20',
    palette: [
      { hex: '#c5946e', weight: 0.4 },
      { hex: '#427d97', weight: 0.35 },
      { hex: '#d9e7f4', weight: 0.25 },
    ],
  },
  {
    id: '2',
    headline: 'This moment speaks for itself.',
    intentLabel: 'Travel',
    mode: 'story',
    displayScore: 92,
    date: 'Sep 19',
    palette: [
      { hex: '#E06D14', weight: 0.5 },
      { hex: '#3D6178', weight: 0.3 },
      { hex: '#FAF6EE', weight: 0.2 },
    ],
  },
  {
    id: '3',
    headline: 'Small change. Better story.',
    intentLabel: 'Aesthetic',
    mode: 'compare',
    displayScore: 81,
    date: 'Sep 18',
    palette: [
      { hex: '#6941C6', weight: 0.45 },
      { hex: '#F3EFFF', weight: 0.35 },
      { hex: '#005BFF', weight: 0.2 },
    ],
  },
];

/**
 * HistoryScreen: Chronological log of past story and outfit checks with preserved palettes.
 */
export function HistoryScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'story' | 'compare'>('all');

  const filtered = DEMO_HISTORY.filter(
    r =>
      (filter === 'all' || r.mode === filter) &&
      [r.headline, r.intentLabel].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Screen scroll={false} title="History">
      <FlatList<HistoryItem>
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 22, gap: 14, paddingBottom: 40 }}
        ListHeaderComponent={
          <View style={{ gap: 18, paddingBottom: 12 }}>
            <View style={{ gap: 4 }}>
              <T variant="hero">Your Posts.{'\n'}Your Calls.</T>
              <T color={colors.muted}>A little clarity, kept for later.</T>
            </View>
            <Field
              label="Search checks"
              placeholder="Find a vibe or verdict"
              value={search}
              onChangeText={setSearch}
            />
            <Row style={{ gap: 8 }}>
              <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
              <Chip label="Stories" selected={filter === 'story'} onPress={() => setFilter('story')} />
              <Chip label="Compare" selected={filter === 'compare'} onPress={() => setFilter('compare')} />
            </Row>
          </View>
        }
        ListEmptyComponent={
          <State
            title={search || filter !== 'all' ? 'No matching checks' : 'Your story starts here.'}
            message="Your verdicts, captions, and decisions will be saved here."
            action="Check a story"
            onAction={() => router.push('/check/new')}
          />
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/check/demo')}
            style={({ pressed }) => [{
              padding: 14,
              borderRadius: 16,
              borderColor: colors.line,
              borderWidth: 1,
              backgroundColor: colors.surface,
              opacity: pressed ? 0.92 : 1,
            }]}
          >
            <Row style={{ alignItems: 'flex-start', gap: 12 }}>
              <View style={{ width: 72 }}>
                <MediaPreview compact palette={item.palette} />
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <T variant="label" color={colors.blue}>
                  {item.intentLabel} · {item.mode === 'compare' ? 'A/B' : 'Story'}
                </T>
                <T variant="bold">{item.headline}</T>
                <T variant="small" color={colors.muted}>
                  {item.date} · Decision saved
                </T>
              </View>
              <T variant="title" color={colors.blue}>
                {item.displayScore}
              </T>
            </Row>
          </Pressable>
        )}
      />
    </Screen>
  );
}

export default HistoryScreen;
