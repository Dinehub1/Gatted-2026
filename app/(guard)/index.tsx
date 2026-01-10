import { useAuth } from '@/contexts/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GuardHome() {
    const router = useRouter();
    const { signOut, profile, currentRole } = useAuth();

    const handleEmergency = () => {
        Alert.alert(
            '🚨 Emergency Alert',
            'This will notify all managers and admin immediately',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send Alert',
                    style: 'destructive',
                    onPress: () => {
                        // TODO: Implement emergency alert
                        Alert.alert('Alert Sent', 'Emergency notification has been sent to all managers');
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello,</Text>
                    <Text style={styles.name}>{profile?.full_name || 'Guard'}</Text>
                    <Text style={styles.society}>{currentRole?.society?.name || 'Society'}</Text>
                </View>
                <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Main Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <TouchableOpacity
                    style={[styles.actionButton, styles.expectedButton]}
                    onPress={() => router.push('/(guard)/expected-visitor')}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionIcon}>
                        <Ionicons name="checkmark-circle" size={48} color="#fff" />
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Expected Visitor</Text>
                        <Text style={styles.actionSubtitle}>Scan QR code or verify OTP</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.walkinButton]}
                    onPress={() => router.push('/(guard)/walk-in')}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionIcon}>
                        <Ionicons name="person-add" size={48} color="#fff" />
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Walk-in Visitor</Text>
                        <Text style={styles.actionSubtitle}>Register new visitor</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.emergencyButton]}
                    onPress={handleEmergency}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionIcon}>
                        <Ionicons name="alert-circle" size={48} color="#fff" />
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Emergency Alert</Text>
                        <Text style={styles.actionSubtitle}>Notify managers immediately</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>

                {/* Recent Activity */}
                <Text style={styles.sectionTitle}>Today's Activity</Text>
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Visitors Today</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Currently Inside</Text>
                    </View>
                </View>

                {/* Additional Actions */}
                <TouchableOpacity style={styles.secondaryAction}>
                    <Ionicons name="time-outline" size={24} color="#64748b" />
                    <Text style={styles.secondaryActionText}>View Visitor History</Text>
                </TouchableOpacity>

                <View style={styles.spacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
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
    greeting: {
        fontSize: 16,
        color: '#64748b',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 4,
    },
    society: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    logoutButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginTop: 24,
        marginBottom: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        minHeight: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    expectedButton: {
        backgroundColor: '#10b981',
    },
    walkinButton: {
        backgroundColor: '#3b82f6',
    },
    emergencyButton: {
        backgroundColor: '#ef4444',
    },
    actionIcon: {
        marginRight: 16,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    statLabel: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: '#e2e8f0',
        marginHorizontal: 16,
    },
    secondaryAction: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
    },
    secondaryActionText: {
        fontSize: 16,
        color: '#1e293b',
        marginLeft: 12,
    },
    spacer: {
        height: 40,
    },
});
