import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radii, spacing, type } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  title?: string;
  subtitle?: string;
  testID?: string;
}

export const Card: React.FC<Props> = ({ children, style, title, subtitle, testID }) => (
  <View style={[styles.card, style]} testID={testID}>
    {title ? <Text style={[type.label, { marginBottom: subtitle ? 4 : spacing.md }]}>{title}</Text> : null}
    {subtitle ? <Text style={[type.bodyMuted, { marginBottom: spacing.md }]}>{subtitle}</Text> : null}
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
});
