import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ShiftStatusBadge } from './ShiftStatusBadge';

interface GuardPageHeaderProps {
    guardName: string;
    societyName: string;
    isShiftActive: boolean;
    shiftDuration?: string;
    onNotificationPress: () => void;
    onProfilePress: () => void;
}

export function GuardPageHeader({
    guardName,
    societyName,
    isShiftActive,
    shiftDuration,
    onNotificationPress,
    onProfilePress,
}: GuardPageHeaderProps) {
    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <Text style={styles.name}>{guardName}</Text>
                <Text style={styles.role}>Gate Guard • {societyName}</Text>
                <ShiftStatusBadge isActive={isShiftActive} duration={shiftDuration} />
            </View>
            <View style={styles.headerRight}>
                <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
                    <Ionicons name="notifications-outline" size={24} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity onPress={onProfilePress} style={styles.iconButton}>
                    <Ionicons name="person-circle-outline" size={28} color="#3b82f6" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
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
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    role: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    iconButton: {
        padding: 8,
    },
});
