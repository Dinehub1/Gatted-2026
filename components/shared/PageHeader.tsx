import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PageHeaderProps {
    greeting?: string;
    title: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    rightAction?: {
        icon: keyof typeof Ionicons.glyphMap;
        color?: string;
        onPress: () => void;
    };
    secondaryRightAction?: {
        icon: keyof typeof Ionicons.glyphMap;
        color?: string;
        onPress: () => void;
    };
}

export function PageHeader({ greeting, title, subtitle, showBack, onBack, rightAction, secondaryRightAction }: PageHeaderProps) {
    return (
        <View style={styles.header}>
            {showBack && (
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
            )}
            <View style={styles.headerLeft}>
                {greeting && <Text style={styles.greeting}>{greeting}</Text>}
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            {secondaryRightAction && (
                <TouchableOpacity onPress={secondaryRightAction.onPress} style={styles.actionButton}>
                    <Ionicons
                        name={secondaryRightAction.icon}
                        size={24}
                        color={secondaryRightAction.color || '#64748b'}
                    />
                </TouchableOpacity>
            )}
            {rightAction && (
                <TouchableOpacity onPress={rightAction.onPress} style={styles.actionButton}>
                    <Ionicons
                        name={rightAction.icon}
                        size={24}
                        color={rightAction.color || '#ef4444'}
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
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerLeft: {
        flex: 1,
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    greeting: {
        fontSize: 14,
        color: '#64748b',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    actionButton: {
        padding: 8,
    },
});
