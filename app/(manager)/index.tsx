import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type VisitorStats = {
    total: number;
    today: number;
    pending: number;
};

type IssueStats = {
    total: number;
    open: number;
    inProgress: number;
};

export default function ManagerHome() {
    const router = useRouter();
    const { signOut, profile, currentRole } = useAuth();

    const [visitorStats, setVisitorStats] = useState<VisitorStats>({ total: 0, today: 0, pending: 0 });
    const [issueStats, setIssueStats] = useState<IssueStats>({ total: 0, open: 0, inProgress: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadStats = async () => {
        try {
            const societyId = currentRole?.society_id;
            if (!societyId) return;

            // Load visitor stats
            const { data: visitors } = await supabase
                .from('visitors')
                .select('id, status, created_at')
                .eq('society_id', societyId);

            const today = new Date().toISOString().split('T')[0];
            const todayVisitors = visitors?.filter(v => v.created_at.startsWith(today)) || [];
            const pendingVisitors = visitors?.filter(v => v.status === 'pending') || [];

            setVisitorStats({
                total: visitors?.length || 0,
                today: todayVisitors.length,
                pending: pendingVisitors.length,
            });

            // Load issue stats
            const { data: issues } = await supabase
                .from('issues')
                .select('id, status')
                .eq('society_id', societyId);

            setIssueStats({
                total: issues?.length || 0,
                open: issues?.filter(i => i.status === 'open').length || 0,
                inProgress: issues?.filter(i => i.status === 'in-progress').length || 0,
            });

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

    const handleCreateAnnouncement = () => {
        Alert.alert('Create Announcement', 'Announcement creation coming soon!');
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#8b5cf6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Manager Dashboard</Text>
                    <Text style={styles.name}>{profile?.full_name || 'Manager'}</Text>
                    <Text style={styles.society}>{currentRole?.society?.name || 'Society'}</Text>
                </View>
                <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" />
                }
            >
                {/* Quick Stats */}
                <Text style={styles.sectionTitle}>Overview</Text>

                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: '#ede9fe' }]}>
                        <Ionicons name="people-outline" size={32} color="#8b5cf6" />
                        <Text style={styles.statValue}>{visitorStats.today}</Text>
                        <Text style={styles.statLabel}>Today's Visitors</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
                        <Ionicons name="time-outline" size={32} color="#f59e0b" />
                        <Text style={styles.statValue}>{visitorStats.pending}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: '#fee2e2' }]}>
                        <Ionicons name="build-outline" size={32} color="#ef4444" />
                        <Text style={styles.statValue}>{issueStats.open}</Text>
                        <Text style={styles.statLabel}>Open Issues</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
                        <Ionicons name="construct-outline" size={32} color="#3b82f6" />
                        <Text style={styles.statValue}>{issueStats.inProgress}</Text>
                        <Text style={styles.statLabel}>In Progress</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <TouchableOpacity style={[styles.actionButton, styles.announcementButton]} onPress={handleCreateAnnouncement}>
                    <Ionicons name="megaphone" size={24} color="#fff" />
                    <Text style={styles.actionText}>Create Announcement</Text>
                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.visitorsButton]}
                    onPress={() => router.push('/(manager)/visitors')}
                >
                    <Ionicons name="clipboard-outline" size={24} color="#fff" />
                    <Text style={styles.actionText}>View All Visitors</Text>
                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.issuesButton]}
                    onPress={() => router.push('/(manager)/issues')}
                >
                    <Ionicons name="list-outline" size={24} color="#fff" />
                    <Text style={styles.actionText}>Manage Issues</Text>
                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.unitsButton]}>
                    <Ionicons name="business-outline" size={24} color="#fff" />
                    <Text style={styles.actionText}>Manage Units</Text>
                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                </TouchableOpacity>

                {/* Recent Activity Section */}
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <View style={styles.activityCard}>
                    <Text style={styles.activityText}>No recent activity</Text>
                </View>

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
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        textTransform: 'uppercase',
        fontWeight: '600',
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
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
        fontWeight: '500',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    announcementButton: {
        backgroundColor: '#8b5cf6',
    },
    visitorsButton: {
        backgroundColor: '#10b981',
    },
    issuesButton: {
        backgroundColor: '#ef4444',
    },
    unitsButton: {
        backgroundColor: '#3b82f6',
    },
    actionText: {
        flex: 1,
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
        marginLeft: 12,
    },
    activityCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    activityText: {
        fontSize: 14,
        color: '#94a3b8',
    },
    spacer: {
        height: 40,
    },
});
