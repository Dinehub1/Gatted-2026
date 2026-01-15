import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
    ActivityFeed,
    GuardPageHeader,
    ShiftControls,
} from '@/components/guard';
import {
    ActionButton,
    SectionTitle,
    StatCard,
    StatRow,
} from '@/components';
import { VisitorApprovalCard } from '@/components';
import { useAuth } from '@/contexts/auth-context';
import { useActivityFeed, useGuardDashboard, useGuardShift } from '@/hooks';
import { useVisitorApproval } from '@/hooks/useVisitorApproval';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function GuardHome() {
    const { profile, currentRole } = useAuth();
    const router = useRouter();

    const societyId = currentRole?.society_id;
    const guardId = profile?.id;

    // Hooks for data fetching
    const { stats, isLoading: statsLoading, refresh: refreshStats } = useGuardDashboard({ societyId });
    const { activities, isLoading: activitiesLoading, refresh: refreshActivities } = useActivityFeed({ societyId, limit: 5 });
    const {
        isShiftActive,
        shiftDuration,
        shiftStartTime,
        isLoading: shiftLoading,
        startShift,
        endShift,
        refresh: refreshShift
    } = useGuardShift({ guardId, societyId });

    // Visitor approval for pending/approved visitors
    const {
        pendingVisitors,
        approvedVisitors,
        pendingCount,
        approvedCount,
        checkIn,
        refresh: refreshVisitors,
        isLoading: visitorsLoading,
    } = useVisitorApproval({
        societyId,
        userId: guardId,
        role: 'guard',
    });

    const [refreshing, setRefreshing] = useState(false);

    const isLoading = statsLoading || activitiesLoading || shiftLoading || visitorsLoading;

    // Refresh on focus
    useFocusEffect(
        useCallback(() => {
            refreshStats();
            refreshActivities();
            refreshShift();
            refreshVisitors();
        }, [societyId, guardId])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refreshStats(), refreshActivities(), refreshShift(), refreshVisitors()]);
        setRefreshing(false);
    }, [refreshStats, refreshActivities, refreshShift, refreshVisitors]);

    const handleStartShift = async () => {
        try {
            await startShift();
        } catch (error) {
            Alert.alert('Error', 'Failed to start shift. Please try again.');
        }
    };

    const handleEndShift = async () => {
        Alert.alert(
            'End Shift',
            'Are you sure you want to end your shift?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'End Shift',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await endShift();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to end shift. Please try again.');
                        }
                    }
                },
            ]
        );
    };

    const handleEmergency = () => {
        router.push('/(guard)/panic');
    };

    const handleCheckIn = async (visitorId: string) => {
        if (!guardId) return false;
        const success = await checkIn(visitorId, guardId);
        if (success) {
            Alert.alert('✅ Checked In', 'Visitor has been checked in successfully.');
            refreshActivities();
        } else {
            Alert.alert('Error', 'Failed to check in visitor. Please try again.');
        }
        return success;
    };

    if (isLoading && !refreshing) {
        return <LoadingSpinner />;
    }

    const totalPendingApproval = pendingCount + approvedCount;

    return (
        <View style={styles.container}>
            <GuardPageHeader
                guardName={profile?.full_name || 'Guard'}
                societyName={currentRole?.society?.name || 'Society'}
                isShiftActive={isShiftActive}
                shiftDuration={shiftDuration}
                onNotificationPress={() => router.push('/(guard)/notifications')}
                onProfilePress={() => router.push('/(guard)/profile')}
            />

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
                }
            >
                {/* Pending Visitors Section - Shows visitors waiting for resident approval */}
                {pendingCount > 0 && (
                    <View style={styles.pendingSection}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <Ionicons name="hourglass-outline" size={20} color="#f59e0b" />
                                <Text style={styles.sectionHeaderTitle}>Waiting for Approval</Text>
                            </View>
                            <View style={[styles.badge, { backgroundColor: '#f59e0b' }]}>
                                <Text style={styles.badgeText}>{pendingCount}</Text>
                            </View>
                        </View>
                        {pendingVisitors.map((visitor) => (
                            <VisitorApprovalCard
                                key={visitor.id}
                                visitor={{
                                    id: visitor.id,
                                    visitor_name: visitor.visitor_name,
                                    visitor_phone: visitor.visitor_phone,
                                    unit_number: visitor.unit_number,
                                    purpose: visitor.purpose,
                                    status: visitor.status,
                                    created_at: visitor.created_at,
                                }}
                                role="guard"
                            />
                        ))}
                    </View>
                )}

                {/* Approved Visitors Section - Ready to check in */}
                {approvedCount > 0 && (
                    <View style={styles.approvedSection}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                                <Text style={styles.sectionHeaderTitle}>Ready to Check In</Text>
                            </View>
                            <View style={[styles.badge, { backgroundColor: '#22c55e' }]}>
                                <Text style={styles.badgeText}>{approvedCount}</Text>
                            </View>
                        </View>
                        {approvedVisitors.map((visitor) => (
                            <VisitorApprovalCard
                                key={visitor.id}
                                visitor={{
                                    id: visitor.id,
                                    visitor_name: visitor.visitor_name,
                                    visitor_phone: visitor.visitor_phone,
                                    unit_number: visitor.unit_number,
                                    purpose: visitor.purpose,
                                    status: visitor.status,
                                    created_at: visitor.created_at,
                                }}
                                role="guard"
                                onCheckIn={() => handleCheckIn(visitor.id)}
                            />
                        ))}
                    </View>
                )}

                <SectionTitle>Today at Gate</SectionTitle>

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
                        value={stats.insideNow}
                        label="Inside Now"
                        backgroundColor="#d1fae5"
                    />
                </StatRow>

                <StatRow>
                    <StatCard
                        icon="cube-outline"
                        iconColor="#f59e0b"
                        value={stats.pendingParcels}
                        label="Pending Parcels"
                        backgroundColor="#fef3c7"
                    />
                    <StatCard
                        icon="alert-circle-outline"
                        iconColor="#ef4444"
                        value={stats.openIssues}
                        label="Open Issues"
                        backgroundColor="#fee2e2"
                    />
                </StatRow>

                <SectionTitle>Quick Actions</SectionTitle>

                <ActionButton
                    icon="person-add"
                    iconSize={48}
                    title="New Entry"
                    subtitle="Log walk-in visitor"
                    variant="primary"
                    onPress={() => router.push('/(guard)/walk-in')}
                />

                <ActionButton
                    icon="qr-code-outline"
                    iconSize={48}
                    title="Expected Visitor"
                    subtitle="Verify pre-approved entry"
                    variant="success"
                    onPress={() => router.push('/(guard)/expected-visitor')}
                />

                <ActionButton
                    icon="log-out-outline"
                    iconSize={48}
                    title="Checkout Visitor"
                    subtitle="Mark visitor exit"
                    variant="info"
                    onPress={() => router.push('/(guard)/checkout')}
                />

                <ActionButton
                    icon="cube"
                    iconSize={48}
                    title="Parcels"
                    subtitle="Log & track deliveries"
                    variant="warning"
                    badge={stats.pendingParcels > 0 ? stats.pendingParcels : undefined}
                    onPress={() => router.push('/(guard)/parcels')}
                />

                <ActionButton
                    icon="warning"
                    iconSize={48}
                    title="Emergency Alert"
                    subtitle="Notify managers immediately"
                    variant="danger"
                    onPress={handleEmergency}
                />

                <SectionTitle>Recent Activity</SectionTitle>

                <ActivityFeed
                    activities={activities}
                    maxItems={5}
                    isLoading={activitiesLoading && !refreshing}
                />

                <ShiftControls
                    isShiftActive={isShiftActive}
                    shiftStartTime={shiftStartTime}
                    onStartShift={handleStartShift}
                    onEndShift={handleEndShift}
                    isLoading={shiftLoading}
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
    pendingSection: {
        marginBottom: 16,
        marginTop: 8,
    },
    approvedSection: {
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionHeaderTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#fff',
    },
    spacer: {
        height: 40,
    },
});
