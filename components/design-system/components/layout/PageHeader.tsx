/**
 * PageHeader Component
 * A consistent header for all screen types
 */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

export interface HeaderAction {
    icon: keyof typeof Ionicons.glyphMap;
    color?: string;
    onPress: () => void;
}

export interface PageHeaderProps {
    greeting?: string;
    title: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    rightAction?: HeaderAction;
    secondaryRightAction?: HeaderAction;
    style?: ViewStyle;
}

export function PageHeader({
    greeting,
    title,
    subtitle,
    showBack,
    onBack,
    rightAction,
    secondaryRightAction,
    style,
}: PageHeaderProps) {
    const theme = useTheme();
    const { colors, spacing } = theme;

    return (
        <View
            style={[
                styles.header,
                {
                    paddingHorizontal: spacing[5],
                    paddingTop: 60,
                    paddingBottom: spacing[5],
                    backgroundColor: colors.surface,
                    borderBottomColor: colors.border,
                },
                style,
            ]}
        >
            {showBack && (
                <TouchableOpacity onPress={onBack} style={[styles.backButton, { marginRight: spacing[3] }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.gray[800]} />
                </TouchableOpacity>
            )}
            <View style={styles.headerLeft}>
                {greeting && (
                    <Text style={[styles.greeting, { color: colors.text.secondary }]}>{greeting}</Text>
                )}
                <Text style={[styles.title, { color: colors.text.primary, marginTop: spacing[1] }]}>
                    {title}
                </Text>
                {subtitle && (
                    <Text style={[styles.subtitle, { color: colors.text.secondary, marginTop: spacing[0] + 2 }]}>
                        {subtitle}
                    </Text>
                )}
            </View>
            {secondaryRightAction && (
                <TouchableOpacity onPress={secondaryRightAction.onPress} style={styles.actionButton}>
                    <Ionicons
                        name={secondaryRightAction.icon}
                        size={24}
                        color={secondaryRightAction.color || colors.text.secondary}
                    />
                </TouchableOpacity>
            )}
            {rightAction && (
                <TouchableOpacity onPress={rightAction.onPress} style={styles.actionButton}>
                    <Ionicons
                        name={rightAction.icon}
                        size={24}
                        color={rightAction.color || colors.danger.main}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    headerLeft: {
        flex: 1,
    },
    backButton: {
        padding: 4,
    },
    greeting: {
        fontSize: 14,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
    },
    actionButton: {
        padding: 8,
    },
});
