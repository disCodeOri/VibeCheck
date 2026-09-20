import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, T } from './ui';
import { colors } from '../tokens/colors';

export type ActionSheetChoice = { label: string; onPress: () => void; destructive?: boolean };
export type ActionSheetConfig = { title: string; message?: string; choices: ActionSheetChoice[] };

/**
 * Unified bottom sheet modal for React Native (iOS & Android).
 * Renders any number of selection choices cleanly without layout bugs.
 */
export function useActionSheet() {
  const [state, setState] = useState<ActionSheetConfig | null>(null);
  const close = () => setState(null);

  const sheet = (
    <Modal visible={Boolean(state)} transparent animationType="slide" onRequestClose={close}>
      <View style={{ flex: 1, backgroundColor: '#08163180', justifyContent: 'flex-end' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close menu" onPress={close} style={{ flex: 1 }} />
        <SafeAreaView
          accessibilityViewIsModal
          edges={['bottom', 'left', 'right']}
          style={{
            backgroundColor: colors.canvas,
            maxHeight: '85%',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          <ScrollView contentContainerStyle={{ padding: 24, gap: 12 }}>
            <T variant="title" accessibilityRole="header">
              {state?.title}
            </T>
            {state?.message ? <T variant="small">{state.message}</T> : null}
            {state?.choices.map(choice => (
              <Button
                key={choice.label}
                label={choice.label}
                kind={choice.destructive ? 'danger' : 'secondary'}
                onPress={() => {
                  close();
                  choice.onPress();
                }}
              />
            ))}
            <Button label="Cancel" kind="dark" onPress={close} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );

  return { show: setState, sheet };
}
