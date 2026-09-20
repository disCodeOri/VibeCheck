import { type ColorValue, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../tokens/colors';

export type NavigationIconName = 'check' | 'loox' | 'chicfit' | 'history' | 'you';

/**
 * Custom-drawn SVG navigation icons conforming to the rounded story-frame motif.
 */
export function NavigationIcon({
  name,
  focused = false,
  color = focused ? colors.blue : colors.muted,
}: {
  name: NavigationIconName;
  focused?: boolean;
  color?: ColorValue;
}) {
  return (
    <View accessible={false} style={[styles.frame, focused && styles.selected]}>
      <Svg width={27} height={27} viewBox="0 0 28 28" fill="none">
        {name === 'check' ? (
          <>
            <Path d="M16 4.5H9A4.5 4.5 0 0 0 4.5 9v10A4.5 4.5 0 0 0 9 23.5h10a4.5 4.5 0 0 0 4.5-4.5v-7" stroke={color} strokeWidth={1.65} strokeLinecap="round" />
            <Path d="m9.5 13.5 3.3 3.3 6.7-7" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M23.5 3a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6" fill={color} />
          </>
        ) : name === 'loox' ? (
          <>
            <Path d="M4 11.5a3.5 3.5 0 0 1 7 0v3a3.5 3.5 0 0 1-7 0v-3Z" fill={focused ? '#D6E5FF' : 'none'} stroke={color} strokeWidth={1.65} />
            <Path d="M17 11.5a3.5 3.5 0 0 1 7 0v3a3.5 3.5 0 0 1-7 0v-3Z" fill={focused ? '#D6E5FF' : 'none'} stroke={color} strokeWidth={1.65} />
            <Path d="M11 13c1.5-1 4.5-1 6 0" stroke={color} strokeWidth={1.65} strokeLinecap="round" />
            <Path d="M4 12.5H2M26 12.5h-2" stroke={color} strokeWidth={1.65} strokeLinecap="round" />
            <Path d="M22 4.5a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6" fill={color} />
          </>
        ) : name === 'chicfit' ? (
          <>
            <Path d="M14 5a2 2 0 0 1 1.8 2.2c-.3 1.1-1 1.8-1.8 2.4v1.2" stroke={color} strokeWidth={1.65} strokeLinecap="round" />
            <Path d="M5.5 15.5 14 10.8l8.5 4.7" stroke={color} strokeWidth={1.65} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M7 15.5h14" stroke={color} strokeWidth={1.65} strokeLinecap="round" />
            <Path d="M10 16.5v5.2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-5.2" fill={focused ? '#D6E5FF' : 'none'} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
            <Path d="m12 16.5 2 2.8 2-2.8" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : name === 'history' ? (
          <>
            <Path d="M18.5 3.5h-10a5 5 0 0 0-5 5v10" stroke={color} strokeWidth={1.65} strokeLinecap="round" />
            <Path d="M12 7.5h8a4.5 4.5 0 0 1 4.5 4.5v8a4.5 4.5 0 0 1-4.5 4.5h-8A4.5 4.5 0 0 1 7.5 20v-8A4.5 4.5 0 0 1 12 7.5Z" fill={focused ? '#D6E5FF' : 'none'} stroke={color} strokeWidth={1.65} />
            <Path d="M16 11.5v5l3 1.5" stroke={color} strokeWidth={1.65} strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : (
          <>
            <Path d="M22.3 16.5A9.5 9.5 0 1 1 16.5 4.7" stroke={color} strokeWidth={1.65} strokeLinecap="round" />
            <Path d="M17.3 10.5a3.3 3.3 0 1 1-6.6 0 3.3 3.3 0 0 1 6.6 0ZM7.9 21.3a6.2 6.2 0 0 1 12.2 0" stroke={color} strokeWidth={1.65} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M22.5 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4" fill={color} />
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: 54, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17 },
  selected: { backgroundColor: colors.blueSoft },
});
