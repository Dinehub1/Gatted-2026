import {
    ActionButton,
    PageHeader,
    SecondaryAction,
    SectionTitle,
    StatCard,
    StatRow,
} from '@/components/shared';
import { useAuth } from '@/contexts/auth-context';
import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

export default function GuardHome() {
    const { signOut, profile, currentRole } = useAuth();
    const router = require('expo-router').useRouter();

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
            <PageHeader
                greeting="Hello,"
                title={profile?.full_name || 'Guard'}
                subtitle={currentRole?.society?.name || 'Society'}
                rightAction={{
                    icon: 'log-out-outline',
                    color: '#ef4444',
                    onPress: signOut,
                }}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <SectionTitle>Quick Actions</SectionTitle>

                <ActionButton
                    icon="checkmark-circle"
                    iconSize={48}
                    title="Expected Visitor"
                    subtitle="Scan QR code or verify OTP"
                    variant="success"
                    onPress={() => router.push('/(guard)/expected-visitor')}
                />

                <ActionButton
                    icon="person-add"
                    iconSize={48}
                    title="Walk-in Visitor"
                    subtitle="Register new visitor"
                    variant="primary"
                    onPress={() => router.push('/(guard)/walk-in')}
                />

                <ActionButton
                    icon="alert-circle"
                    iconSize={48}
                    title="Emergency Alert"
                    subtitle="Notify managers immediately"
                    variant="danger"
                    onPress={handleEmergency}
                />

                <SectionTitle>Today's Activity</SectionTitle>

                <StatRow>
                    <StatCard
                        icon="people-outline"
                        iconColor="#3b82f6"
                        value={0}
                        label="Visitors Today"
                        backgroundColor="#dbeafe"
                    />
                    <StatCard
                        icon="log-in-outline"
                        iconColor="#10b981"
                        value={0}
                        label="Currently Inside"
                        backgroundColor="#d1fae5"
                    />
                </StatRow>

                <SecondaryAction
                    icon="time-outline"
                    label="View Visitor History"
                    onPress={() => { }}
                />

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
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    spacer: {
        height: 40,
    },
});
