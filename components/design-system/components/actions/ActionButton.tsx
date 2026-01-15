/**
 * ActionButton Component
 * A prominent action button with icon, title, and subtitle
 */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

export type ActionButtonVariant = 'primary' | 'success' | 'danger' | 'warning' | 'info';

export interface ActionButtonProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    badge?: number | string;
    variant?: ActionButtonVariant;
    backgroundColor?: string;
    onPress: () => void;
    style?: ViewStyle;
    iconSize?: number;
}

export function ActionButton({
    icon,
    title,
    subtitle,
    badge,
    variant = 'primary',
    backgroundColor,
    onPress,
    style,
    iconSize = 32,
}: ActionButtonProps) {
    const theme = useTheme();
    const { colors, borderRadius, spacing, shadows, typography } = theme;

    const variantColors: Record<ActionButtonVariant, string> = {
        primary: colors.primary[500],
        success: colors.success.main,
        danger: colors.danger.main,
        warning: colors.warning.main,
        info: colors.info.main,
    };

    const bgColor = backgroundColor || variantColors[variant];

    return (
        <TouchableOpacity
            style={[
                styles.button,
                shadows.md,
                {
                    backgroundColor: bgColor,
                    borderRadius: borderRadius.xl,
                    padding: spacing[5],
                    marginBottom: spacing[3],
                },
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={[styles.iconContainer, { marginRight: spacing[4] }]}>
                <Ionicons name={icon} size={iconSize} color={colors.white} />
            </View>
            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <Text style={[styles.title, { fontSize: typography.fontSize.xl }]}>{title}</Text>
                    {badge !== undefined && badge !== 0 && (
                        <View style={[styles.badge, { marginLeft: spacing[2] }]}>
                            <Text style={[styles.badgeText, { fontSize: typography.fontSize.sm }]}>{badge}</Text>
                        </View>
                    )}
                </View>
                {subtitle && (
                    <Text style={[styles.subtitle, { fontSize: typography.fontSize.md }]}>{subtitle}</Text>
                )}
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.white} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 90,
    },
    iconContainer: {},
    content: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    badge: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        fontWeight: '600',
        color: '#fff',
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.9)',
    },
});
