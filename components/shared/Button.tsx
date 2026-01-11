import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    style,
}: ButtonProps) {
    const buttonStyles = [
        styles.button,
        styles[`${variant}Button`],
        styles[`${size}Button`],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`],
        disabled && styles.disabledText,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            <Text style={textStyles}>
                {loading ? 'Loading...' : title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },

    // Variants
    primaryButton: {
        backgroundColor: '#3b82f6',
    },
    secondaryButton: {
        backgroundColor: '#f1f5f9',
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#3b82f6',
    },
    ghostButton: {
        backgroundColor: 'transparent',
    },
    dangerButton: {
        backgroundColor: '#ef4444',
    },

    // Sizes
    smButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    mdButton: {
        paddingHorizontal: 24,
        paddingVertical: 14,
    },
    lgButton: {
        paddingHorizontal: 32,
        paddingVertical: 18,
    },

    // Text
    text: {
        fontWeight: '600',
    },
    primaryText: {
        color: '#fff',
    },
    secondaryText: {
        color: '#1e293b',
    },
    outlineText: {
        color: '#3b82f6',
    },
    ghostText: {
        color: '#3b82f6',
    },
    dangerText: {
        color: '#fff',
    },
    disabledText: {
        opacity: 0.7,
    },

    // Text sizes
    smText: {
        fontSize: 14,
    },
    mdText: {
        fontSize: 16,
    },
    lgText: {
        fontSize: 18,
    },
});
