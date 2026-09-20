import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors as c } from '../tokens/colors';

/**
 * Native vector hero panel with organic curvature and cobalt glow.
 * Scales dynamically to any viewport without bitmaps or network overhead.
 */
export function InkPanel({ children }: PropsWithChildren) {
  return (
    <View style={{ padding: 24, minHeight: 230, justifyContent: 'center' }}>
      <Svg
        pointerEvents="none"
        width="100%"
        height="100%"
        viewBox="0 0 340 300"
        preserveAspectRatio="none"
        style={{ position: 'absolute', left: 0, top: 0 }}
      >
        <Path
          d="M8 17L65 12L62 8L188 10L201 4L301 11L327 20L331 41L335 38L329 267L320 270L319 287L187 289L155 295L28 286L12 291L6 244L10 205L3 177Z"
          fill={c.blue}
        />
        <Path d="M16 31L131 20M210 280L319 277M16 243L13 170" stroke="#3780FF" strokeWidth="4" />
      </Svg>
      {children}
    </View>
  );
}
