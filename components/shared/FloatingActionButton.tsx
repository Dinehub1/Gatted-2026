import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

type FABVariant = 'primary' | 'success' | 'danger';

interface FloatingActionButtonProps {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    variant?: FABVariant;
    style?: ViewStyle;
}

const variantColors: Record<FABVariant, string> = {
    primary: '#3b82f6',
    success: '#10b981',
    danger: '#ef4444',
};

export function FloatingActionButton({
    icon,
    onPress,
    variant = 'primary',
    style,
}: FloatingActionButtonProps) {
    return (
        <TouchableOpacity
            style={[styles.fab, { backgroundColor: variantColors[variant] }, style]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Ionicons name={icon} size={28} color="#fff" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
});
