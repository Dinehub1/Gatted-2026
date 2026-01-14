import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

type ActionButtonVariant = 'primary' | 'success' | 'danger' | 'warning' | 'info';

interface ActionButtonProps {
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

const variantColors: Record<ActionButtonVariant, string> = {
    primary: '#3b82f6',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#6366f1',
};

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
    const bgColor = backgroundColor || variantColors[variant];

    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: bgColor }, style]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={iconSize} color="#fff" />
            </View>
            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{title}</Text>
                    {badge !== undefined && badge !== 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{badge}</Text>
                        </View>
                    )}
                </View>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        minHeight: 90,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    iconContainer: {
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    badge: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
});

