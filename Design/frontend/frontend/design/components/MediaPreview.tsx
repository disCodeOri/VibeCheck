import { useState } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../tokens/colors';
import { Icon, T } from './ui';

export interface SwatchColor {
  hex: string;
  weight: number;
}

export function Palette({ palette }: { palette: SwatchColor[] }) {
  return (
    <View style={{ flexDirection: 'row', flex: 1 }}>
      {palette.length ? (
        palette.map((p, i) => <View key={i} style={{ flex: Math.max(p.weight, 0.1), backgroundColor: p.hex }} />)
      ) : (
        <View style={{ flex: 1, backgroundColor: colors.blueSoft }} />
      )}
    </View>
  );
}

/**
 * Responsive media framing component with fallback palette swatches.
 */
export function MediaPreview({
  uri,
  palette = [],
  compact = false,
}: {
  uri?: string | null;
  palette?: SwatchColor[];
  compact?: boolean;
}) {
  const [ratio, setRatio] = useState(9 / 16);

  return (
    <View
      style={{
        width: '100%',
        aspectRatio: compact ? 1 : ratio,
        maxHeight: compact ? 110 : undefined,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: colors.blueSoft,
      }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          accessibilityLabel="Story photo"
          contentFit={compact ? 'cover' : 'contain'}
          style={{ width: '100%', height: '100%' }}
          onLoad={e => setRatio(e.source.width / e.source.height)}
        />
      ) : (
        <>
          <Palette palette={palette} />
          <View
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              bottom: 12,
              padding: 10,
              backgroundColor: colors.canvas,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon name="image" size={18} />
            {!compact ? <T variant="small">Palette preserved</T> : null}
          </View>
        </>
      )}
    </View>
  );
}
