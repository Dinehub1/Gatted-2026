import { Card } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    const { signOut, profile, currentRole } = useAuth();
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
                v.expected_date >= today && ['pending', 'approved'].includes(v.status)
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
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome Back</Text>
                    <Text style={styles.name}>{profile?.full_name || 'Resident'}</Text>
                    <Text style={styles.unit}>Unit: {currentRole?.unit_id || 'N/A'}</Text>
                </View>
                <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
                }
            >
                {/* Quick Stats */}
                <Text style={styles.sectionTitle}>Overview</Text>

                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
                        <Ionicons name="people-outline" size={28} color="#3b82f6" />
                        <Text style={styles.statValue}>{visitorSummary.upcoming}</Text>
                        <Text style={styles.statLabel}>Upcoming</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: '#d1fae5' }]}>
                        <Ionicons name="calendar-outline" size={28} color="#10b981" />
                        <Text style={styles.statValue}>{visitorSummary.today}</Text>
                        <Text style={styles.statLabel}>Today</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: '#fee2e2' }]}>
                        <Ionicons name="construct-outline" size={28} color="#ef4444" />
                        <Text style={styles.statValue}>{issueSummary.open}</Text>
                        <Text style={styles.statLabel}>Open Issues</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <TouchableOpacity
                    style={[styles.actionButton, styles.preApproveButton]}
                    onPress={() => router.push('/(resident)/pre-approve-visitor')}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionIcon}>
                        <Ionicons name="qr-code" size={32} color="#fff" />
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Pre-approve Visitor</Text>
                        <Text style={styles.actionSubtitle}>Generate QR code or OTP</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.visitorsButton]}
                    onPress={() => router.push('/(resident)/my-visitors')}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionIcon}>
                        <Ionicons name="list-outline" size={32} color="#fff" />
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>My Visitors</Text>
                        <Text style={styles.actionSubtitle}>View & manage visitors</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.issueButton]}
                    onPress={() => router.push('/(resident)/raise-issue')}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionIcon}>
                        <Ionicons name="warning-outline" size={32} color="#fff" />
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Raise Issue</Text>
                        <Text style={styles.actionSubtitle}>Report a problem</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>

                {/* Recent Announcements */}
                <Text style={styles.sectionTitle}>Recent Announcements</Text>
                <Card>
                    <Text style={styles.emptyText}>No recent announcements</Text>
                </Card>

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
        fontSize: 14,
        color: '#64748b',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 4,
    },
    unit: {
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
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 11,
        color: '#64748b',
        marginTop: 4,
        fontWeight: '500',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        minHeight: 90,
    },
    preApproveButton: {
        backgroundColor: '#3b82f6',
    },
    visitorsButton: {
        backgroundColor: '#10b981',
    },
    issueButton: {
        backgroundColor: '#ef4444',
    },
    actionIcon: {
        marginRight: 16,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
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
