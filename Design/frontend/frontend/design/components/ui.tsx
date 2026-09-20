import type { PropsWithChildren, ComponentProps } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { StyleProp, TextStyle, ViewStyle, TextInputProps, ColorValue } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { colors as c } from '../tokens/colors';
import { fonts as f } from '../tokens/typography';
import { sizes } from '../tokens/spacing';

export type IconName = ComponentProps<typeof Feather>['name'];

export const Icon = ({
  name,
  color = c.blue,
  size = 22,
}: {
  name: IconName;
  color?: ColorValue;
  size?: number;
}) => <Feather name={name} color={color} size={size} />;

export function T({
  children,
  variant = 'body',
  color,
  style,
  ...rest
}: PropsWithChildren<{
  variant?: 'body' | 'small' | 'label' | 'title' | 'hero' | 'accent' | 'bold';
  color?: string;
  style?: StyleProp<TextStyle>;
}> &
  ComponentProps<typeof Text>) {
  return (
    <Text {...rest} style={[styles.text, textStyles[variant], color ? { color } : null, style]}>
      {children}
    </Text>
  );
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  icon,
  busy,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'dark' | 'danger' | 'soft' | 'ghost';
  icon?: IconName;
  busy?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const ink =
    kind === 'secondary'
      ? c.blueDark
      : kind === 'soft'
      ? c.blue
      : kind === 'ghost'
      ? c.muted
      : c.surface;
  const bg =
    kind === 'primary'
      ? c.blue
      : kind === 'dark'
      ? c.navy
      : kind === 'danger'
      ? c.danger
      : kind === 'soft'
      ? c.blueSoft
      : kind === 'secondary'
      ? c.surface
      : 'transparent';
  const border = kind === 'secondary' ? c.line : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor: border, opacity: disabled || busy ? 0.5 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      {busy ? <ActivityIndicator color={ink} /> : null}
      <T variant="bold" color={ink} style={{ textAlign: 'center', flexShrink: 1 }}>
        {label}
      </T>
      {icon && !busy ? <Icon name={icon} color={ink} size={20} /> : null}
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  disabled,
  style,
  tint,
  tintSoft,
}: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  tint?: string;
  tintSoft?: string;
}) {
  const bg = selected ? (tint ?? c.blue) : (tintSoft ?? c.surface);
  const border = selected ? (tint ?? c.blue) : c.line;
  const textColor = selected ? c.surface : (tint ?? c.blueDark);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: bg, borderColor: border, opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      <T variant="small" color={textColor} style={{ fontWeight: selected ? '600' : '400', textAlign: 'center' }}>
        {label}
      </T>
    </Pressable>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (val: T) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.segmented}>
      {options.map(opt => {
        const selected = opt.id === value;
        return (
          <Pressable
            key={opt.id}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            onPress={() => onChange(opt.id)}
            style={[styles.segmentItem, selected && styles.segmentItemSelected]}
          >
            <T
              variant="small"
              color={selected ? c.surface : c.blueDark}
              style={{ fontFamily: selected ? f.bold : f.regular, textAlign: 'center' }}
            >
              {opt.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Row({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Stack({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[{ gap: 16 }, style]}>{children}</View>;
}

export function Brand() {
  return (
    <T style={{ fontFamily: f.bold, fontSize: 28, letterSpacing: -1.6, lineHeight: 36 }}>
      vibecheck<T color={c.blue} style={{ fontSize: 34 }}>.</T>
    </T>
  );
}

export function Header({ back = false, title, right }: { back?: boolean; title?: string; right?: React.ReactNode }) {
  return (
    <Row style={styles.header}>
      {back ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.iconButton}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        >
          <Icon name="arrow-left" />
        </Pressable>
      ) : null}
      <View style={{ flex: 1 }}>{title ? <T variant="bold">{title}</T> : <Brand />}</View>
      {right}
    </Row>
  );
}

export function Screen({
  children,
  title,
  back,
  scroll = true,
  footer,
}: PropsWithChildren<{ title?: string; back?: boolean; scroll?: boolean; footer?: React.ReactNode }>) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <Header title={title} back={back} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page}>
            {children}
          </ScrollView>
        ) : (
          <View style={{ flex: 1 }}>{children}</View>
        )}
        {footer ? <SafeAreaView edges={['bottom']} style={styles.footer}>{footer}</SafeAreaView> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Field({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  return (
    <Stack style={{ gap: 8 }}>
      <T variant="bold">{label}</T>
      <TextInput
        {...props}
        accessibilityLabel={label}
        placeholderTextColor={c.muted}
        style={[styles.input, props.style]}
      />
      {error ? <T variant="small" color={c.danger}>{error}</T> : null}
    </Stack>
  );
}

export function State({
  title,
  message,
  icon = 'inbox',
  action,
  onAction,
  loading,
}: {
  title: string;
  message?: string;
  icon?: IconName;
  action?: string;
  onAction?: () => void;
  loading?: boolean;
}) {
  return (
    <Card style={{ alignItems: 'center', paddingVertical: 32 }}>
      <View style={styles.stateIcon}>
        {loading ? <ActivityIndicator color={c.blue} /> : <Icon name={icon} size={28} />}
      </View>
      <T variant="title" style={{ textAlign: 'center' }}>
        {title}
      </T>
      {message ? (
        <T color={c.muted} style={{ textAlign: 'center' }}>
          {message}
        </T>
      ) : null}
      {action && onAction ? <Button label={action} onPress={onAction} kind="secondary" /> : null}
    </Card>
  );
}

export function ErrorNotice({ error, retry }: { error: unknown; retry?: () => void }) {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : 'An unexpected error occurred.';
  return (
    <Card style={{ backgroundColor: c.dangerSoft }}>
      <Row>
        <Icon name="alert-circle" color={c.danger} />
        <T color={c.danger} style={{ flex: 1 }} accessibilityRole="alert">
          {message}
        </T>
      </Row>
      {retry ? <Button label="Try again" kind="secondary" onPress={retry} /> : null}
    </Card>
  );
}

export function Notice({ children }: PropsWithChildren) {
  return (
    <View style={{ padding: 14, backgroundColor: c.blueSoft, borderRadius: 12 }}>
      <T variant="small" color={c.blueDark}>
        {children}
      </T>
    </View>
  );
}

export function Setting({
  label,
  detail,
  value,
  onChange,
  disabled,
}: {
  label: string;
  detail?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Row style={{ paddingVertical: 8 }}>
      <View style={{ flex: 1, gap: 4 }}>
        <T variant="bold">{label}</T>
        {detail ? <T variant="small" color={c.muted}>{detail}</T> : null}
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: c.line, true: c.blue }}
      />
    </Row>
  );
}

export function NavRow({
  label,
  detail,
  value,
  icon,
  onPress,
  border = true,
}: {
  label: string;
  detail?: string;
  value?: string;
  icon: IconName;
  onPress: () => void;
  border?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        paddingVertical: 13,
        paddingHorizontal: 16,
        borderBottomWidth: border ? 1 : 0,
        borderColor: c.line,
      }}
    >
      <Row style={{ gap: 14 }}>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: c.blueSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={17} color={c.blue} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <T variant="bold" style={{ fontSize: 15, lineHeight: 20 }}>
            {label}
          </T>
          {detail ? (
            <T variant="small" color={c.muted}>
              {detail}
            </T>
          ) : null}
        </View>
        {value ? (
          <View style={{ backgroundColor: c.blueSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <T variant="small" color={c.blue} style={{ fontWeight: '600', fontSize: 12 }}>
              {value}
            </T>
          </View>
        ) : null}
        <Icon name="chevron-right" size={18} color={c.muted} />
      </Row>
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.canvas },
  page: { padding: sizes.pagePadding, paddingTop: 8, paddingBottom: 40, gap: 18, flexGrow: 1 },
  text: { color: c.ink, fontFamily: f.regular, fontSize: 16, lineHeight: 24 },
  header: { minHeight: 62, paddingHorizontal: sizes.pagePadding, paddingBottom: 8 },
  iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  card: { borderRadius: 16, padding: 18, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, gap: 12 },
  button: {
    minHeight: sizes.touch,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmented: { flexDirection: 'row', backgroundColor: c.blueSoft, borderRadius: 14, padding: 4, gap: 4 },
  segmentItem: { flex: 1, paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segmentItemSelected: { backgroundColor: c.blue },
  input: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.line,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: c.ink,
    fontFamily: f.regular,
    fontSize: 16,
  },
  footer: {
    paddingHorizontal: sizes.pagePadding,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: c.canvas,
    borderTopWidth: 1,
    borderColor: c.line,
    gap: 10,
  },
  stateIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.blueSoft,
  },
});

const textStyles = StyleSheet.create({
  body: {},
  small: { fontSize: 13, lineHeight: 20 },
  label: { fontFamily: f.bold, fontSize: 11, lineHeight: 17, letterSpacing: 0.5, textTransform: 'capitalize' },
  bold: { fontFamily: f.bold },
  title: { fontFamily: f.display, fontSize: 32, lineHeight: 37, letterSpacing: -0.3 },
  hero: { fontFamily: f.display, fontSize: 54, lineHeight: 58, letterSpacing: -0.9 },
  accent: { fontFamily: f.italic, fontSize: 24, lineHeight: 30 },
});
