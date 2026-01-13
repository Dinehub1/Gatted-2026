import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
    ActionButton,
    PageHeader,
    SectionTitle,
    StatCard,
    StatRow,
} from '@/components/shared';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

type VisitorSummary = {
    upcoming: number;
    today: number;
    total: number;
};

type IssueSummary = {
    open: number;
    total: number;
};

export default function ResidentHome() {
    const router = useRouter();
    const { profile, currentRole } = useAuth();
    const [visitorSummary, setVisitorSummary] = useState<VisitorSummary>({ upcoming: 0, today: 0, total: 0 });
    const [issueSummary, setIssueSummary] = useState<IssueSummary>({ open: 0, total: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const userId = profile?.id;
            if (!userId) return;

            // Load visitor summary
            const { data: visitors } = await supabase
                .from('visitors')
                .select('id, status, expected_date')
                .eq('host_id', userId);

            const now = new Date();
            const today = now.toISOString().split('T')[0];

            const upcoming = visitors?.filter(v =>
                v.expected_date && v.expected_date >= today && ['pending', 'approved'].includes(v.status)
            ).length || 0;

            const todayVisitors = visitors?.filter(v => v.expected_date === today).length || 0;

            setVisitorSummary({
                upcoming,
                today: todayVisitors,
                total: visitors?.length || 0,
            });

            // Load issue summary
            const { data: issues } = await supabase
                .from('issues')
                .select('id, status')
                .eq('reported_by', userId);

            setIssueSummary({
                open: issues?.filter(i => i.status === 'open').length || 0,
                total: issues?.length || 0,
            });

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [profile?.id]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <View style={styles.container}>
            <PageHeader
                greeting="Welcome Back"
                title={profile?.full_name || 'Resident'}
                subtitle={`Unit: ${currentRole?.unit?.unit_number || 'N/A'}`}
                secondaryRightAction={{
                    icon: 'notifications-outline',
                    color: '#64748b',
                    onPress: () => router.push('/(resident)/notifications'),
                }}
                rightAction={{
                    icon: 'person-circle-outline',
                    color: '#3b82f6',
                    onPress: () => router.push('/(resident)/profile'),
                }}
            />

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
                }
            >
                <SectionTitle>Overview</SectionTitle>

                <StatRow>
                    <StatCard
                        icon="people-outline"
                        iconColor="#3b82f6"
                        value={visitorSummary.upcoming}
                        label="Upcoming"
                        backgroundColor="#dbeafe"
                    />
                    <StatCard
                        icon="calendar-outline"
                        iconColor="#10b981"
                        value={visitorSummary.today}
                        label="Today"
                        backgroundColor="#d1fae5"
                    />
                    <StatCard
                        icon="construct-outline"
                        iconColor="#ef4444"
                        value={issueSummary.open}
                        label="Open Issues"
                        backgroundColor="#fee2e2"
                    />
                </StatRow>

                <SectionTitle>Quick Actions</SectionTitle>

                <ActionButton
                    icon="qr-code"
                    title="Pre-approve Visitor"
                    subtitle="Generate QR code or OTP"
                    variant="primary"
                    onPress={() => router.push('/(resident)/pre-approve-visitor')}
                />

                <ActionButton
                    icon="list-outline"
                    title="My Visitors"
                    subtitle="View & manage visitors"
                    variant="success"
                    onPress={() => router.push('/(resident)/my-visitors')}
                />

                <ActionButton
                    icon="construct-outline"
                    title="My Issues"
                    subtitle={`${issueSummary.open} open issues`}
                    variant="danger"
                    onPress={() => router.push('/(resident)/my-issues')}
                />

                <ActionButton
                    icon="cube-outline"
                    title="My Parcels"
                    subtitle="Track your deliveries"
                    variant="warning"
                    onPress={() => router.push('/(resident)/my-parcels')}
                />

                <ActionButton
                    icon="megaphone-outline"
                    title="Announcements"
                    subtitle="Society updates & news"
                    variant="info"
                    onPress={() => router.push('/(resident)/announcements')}
                />

                <ActionButton
                    icon="people-outline"
                    title="Manage Family"
                    subtitle="Add members to unit"
                    backgroundColor="#64748b"
                    onPress={() => router.push('/(resident)/family')}
                />

                <ActionButton
                    icon="add-circle-outline"
                    title="Raise Issue"
                    subtitle="Report a problem"
                    backgroundColor="#ef4444"
                    onPress={() => router.push('/(resident)/raise-issue')}
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
    emptyText: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
    },
    spacer: {
        height: 40,
    },
});
