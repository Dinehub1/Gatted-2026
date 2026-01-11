import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface StatCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    value: number | string;
    label: string;
    backgroundColor: string;
    style?: ViewStyle;
}

export function StatCard({ icon, iconColor, value, label, backgroundColor, style }: StatCardProps) {
    return (
        <View style={[styles.card, { backgroundColor }, style]}>
            <Ionicons name={icon} size={28} color={iconColor} />
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    value: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 8,
    },
    label: {
        fontSize: 11,
        color: '#64748b',
        marginTop: 4,
        fontWeight: '500',
        textAlign: 'center',
    },
});
