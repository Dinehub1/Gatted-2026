/**
 * StatCard Component
 * A card for displaying statistics with an icon
 */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

export interface StatCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    value: number | string;
    label: string;
    backgroundColor: string;
    style?: ViewStyle;
}

export function StatCard({
    icon,
    iconColor,
    value,
    label,
    backgroundColor,
    style,
}: StatCardProps) {
    const theme = useTheme();
    const { colors, borderRadius, spacing, typography } = theme;

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor,
                    borderRadius: borderRadius.lg,
                    padding: spacing[4],
                },
                style,
            ]}
        >
            <Ionicons name={icon} size={28} color={iconColor} />
            <Text
                style={[
                    styles.value,
                    {
                        color: colors.text.primary,
                        marginTop: spacing[2],
                        fontSize: typography.fontSize['3xl'],
                    },
                ]}
            >
                {value}
            </Text>
            <Text
                style={[
                    styles.label,
                    {
                        color: colors.text.secondary,
                        marginTop: spacing[1],
                        fontSize: typography.fontSize.xs + 1,
                    },
                ]}
            >
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        alignItems: 'center',
    },
    value: {
        fontWeight: 'bold',
    },
    label: {
        fontWeight: '500',
        textAlign: 'center',
    },
});
