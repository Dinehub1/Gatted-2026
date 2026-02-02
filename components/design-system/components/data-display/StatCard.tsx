/**
 * StatCard Component
 * A compact card for displaying statistics with an icon (horizontal layout)
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
    const { colors, spacing, typography } = theme;

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor,
                    borderRadius: 10,
                    paddingVertical: spacing[3],
                    paddingHorizontal: spacing[3],
                },
                style,
            ]}
        >
            <View style={styles.topRow}>
                <Ionicons name={icon} size={20} color={iconColor} />
                <Text
                    style={[
                        styles.value,
                        {
                            color: colors.text.primary,
                            marginLeft: spacing[2],
                            fontSize: typography.fontSize['2xl'],
                        },
                    ]}
                >
                    {value}
                </Text>
            </View>
            <Text
                style={[
                    styles.label,
                    {
                        color: colors.text.secondary,
                        marginTop: spacing[1],
                        fontSize: typography.fontSize.xs,
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
        minHeight: 52,
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    value: {
        fontWeight: 'bold',
    },
    label: {
        fontWeight: '500',
    },
});
