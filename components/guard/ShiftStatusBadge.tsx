import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ShiftStatusBadgeProps {
    isActive: boolean;
    duration?: string; // e.g., "2h 14m"
}

export function ShiftStatusBadge({ isActive, duration }: ShiftStatusBadgeProps) {
    return (
        <View style={[styles.badge, isActive ? styles.activeBadge : styles.inactiveBadge]}>
            <View style={[styles.dot, isActive ? styles.activeDot : styles.inactiveDot]} />
            <Text style={[styles.text, isActive ? styles.activeText : styles.inactiveText]}>
                {isActive ? `Active${duration ? ` • ${duration}` : ''}` : 'Off Duty'}
            </Text>
            {isActive && <Ionicons name="time-outline" size={14} color="#059669" style={styles.icon} />}
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    activeBadge: {
        backgroundColor: '#d1fae5',
    },
    inactiveBadge: {
        backgroundColor: '#f1f5f9',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    activeDot: {
        backgroundColor: '#10b981',
    },
    inactiveDot: {
        backgroundColor: '#94a3b8',
    },
    text: {
        fontSize: 13,
        fontWeight: '600',
    },
    activeText: {
        color: '#059669',
    },
    inactiveText: {
        color: '#64748b',
    },
    icon: {
        marginLeft: 4,
    },
});
