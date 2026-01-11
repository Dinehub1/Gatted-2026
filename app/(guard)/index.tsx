import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
    ActionButton,
    PageHeader,
    SecondaryAction,
    SectionTitle,
    StatCard,
    StatRow,
} from '@/components/shared';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

type Stats = {
    visitorsToday: number;
    currentlyInside: number;
};

export default function GuardHome() {
    const { signOut, profile, currentRole } = useAuth();
    const router = require('expo-router').useRouter();

    const [stats, setStats] = useState<Stats>({ visitorsToday: 0, currentlyInside: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadStats = async () => {
        try {
            const societyId = currentRole?.society_id;
            if (!societyId) return;

            const today = new Date().toISOString().split('T')[0];

            // Get today's visitors (expected for today or checked in today)
            const { data: visitors } = await supabase
                .from('visitors')
                .select('id, status, expected_date, checked_in_at')
                .eq('society_id', societyId);

            const visitorsToday = visitors?.filter(v =>
                v.expected_date === today ||
                (v.checked_in_at && v.checked_in_at.startsWith(today))
            ).length || 0;

            const currentlyInside = visitors?.filter(v => v.status === 'checked-in').length || 0;

            setStats({ visitorsToday, currentlyInside });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, [currentRole?.society_id]);

    const onRefresh = () => {
        setRefreshing(true);
        loadStats();
    };

    const handleEmergency = () => {
        router.push('/(guard)/panic');
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

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

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
                }
            >
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
                    icon="cube"
                    iconSize={48}
                    title="Parcels"
                    subtitle="Log & track deliveries"
                    variant="warning"
                    onPress={() => router.push('/(guard)/parcels')}
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
                        value={stats.visitorsToday}
                        label="Visitors Today"
                        backgroundColor="#dbeafe"
                    />
                    <StatCard
                        icon="log-in-outline"
                        iconColor="#10b981"
                        value={stats.currentlyInside}
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
