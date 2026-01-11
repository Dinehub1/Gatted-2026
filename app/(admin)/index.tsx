import {
    ActionButton,
    PageHeader,
    SectionTitle,
    StatCard,
    StatRow,
} from '@/components/shared';
import { useAuth } from '@/contexts/auth-context';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function AdminHome() {
    const { signOut, profile } = useAuth();

    return (
        <View style={styles.container}>
            <PageHeader
                greeting="Admin Dashboard"
                title={profile?.full_name || 'Admin'}
                subtitle="System Management"
                rightAction={{
                    icon: 'log-out-outline',
                    color: '#ef4444',
                    onPress: signOut,
                }}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <SectionTitle>System Overview</SectionTitle>

                <StatRow>
                    <StatCard
                        icon="people-outline"
                        iconColor="#8b5cf6"
                        value={0}
                        label="Total Users"
                        backgroundColor="#ede9fe"
                    />
                    <StatCard
                        icon="business-outline"
                        iconColor="#3b82f6"
                        value={0}
                        label="Societies"
                        backgroundColor="#dbeafe"
                    />
                </StatRow>

                <SectionTitle>Quick Actions</SectionTitle>

                <ActionButton
                    icon="person-add-outline"
                    title="Manage Users"
                    subtitle="Add, edit, or deactivate users"
                    variant="primary"
                    onPress={() => { }}
                />

                <ActionButton
                    icon="business-outline"
                    title="Manage Societies"
                    subtitle="Configure societies and settings"
                    variant="success"
                    onPress={() => { }}
                />

                <ActionButton
                    icon="stats-chart-outline"
                    title="View Reports"
                    subtitle="Analytics and insights"
                    variant="info"
                    onPress={() => { }}
                />

                <ActionButton
                    icon="settings-outline"
                    title="System Settings"
                    subtitle="Configure app preferences"
                    backgroundColor="#64748b"
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
