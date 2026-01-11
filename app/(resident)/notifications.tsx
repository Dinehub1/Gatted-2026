import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PageHeader, SectionTitle } from '@/components/shared';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Notification = {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'visitor';
    read: boolean;
    created_at: string;
};

const typeConfig = {
    info: { icon: 'information-circle', color: '#3b82f6', bg: '#dbeafe' },
    warning: { icon: 'warning', color: '#f59e0b', bg: '#fef3c7' },
    success: { icon: 'checkmark-circle', color: '#10b981', bg: '#d1fae5' },
    visitor: { icon: 'person', color: '#8b5cf6', bg: '#ede9fe' },
};

export default function NotificationsScreen() {
    const { profile } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = async () => {
        if (!profile?.id) return;
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', profile.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map database results to Notification type with defaults
            const mappedNotifications: Notification[] = (data || []).map(n => ({
                id: n.id,
                title: n.title,
                message: n.message,
                type: (['info', 'warning', 'success', 'visitor'].includes(n.type || '')
                    ? n.type as 'info' | 'warning' | 'success' | 'visitor'
                    : 'info'),
                read: n.read ?? false,
                created_at: n.created_at || new Date().toISOString(),
            }));

            setNotifications(mappedNotifications);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (profile?.id) {
            loadNotifications();
        }
    }, [profile?.id]);

    const onRefresh = () => {
        setRefreshing(true);
        loadNotifications();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffHours < 48) return 'Yesterday';
        return date.toLocaleDateString();
    };

    const markAsRead = async (id: string) => {
        try {
            // Optimistic update
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, read: true } : n))
            );

            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            // Revert on error
            loadNotifications();
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <View style={styles.container}>
            <PageHeader
                title="Notifications"
                subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            />

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
                }
            >
                {notifications.length === 0 ? (
                    <EmptyState
                        title="No Notifications"
                        message="You're all caught up! Check back later for updates."
                    />
                ) : (
                    <>
                        {unreadCount > 0 && <SectionTitle>New</SectionTitle>}
                        {notifications
                            .filter(n => !n.read)
                            .map(notification => {
                                const config = typeConfig[notification.type];
                                return (
                                    <TouchableOpacity
                                        key={notification.id}
                                        style={[styles.notificationCard, styles.unread]}
                                        onPress={() => markAsRead(notification.id)}
                                    >
                                        <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
                                            <Ionicons
                                                name={config.icon as any}
                                                size={24}
                                                color={config.color}
                                            />
                                        </View>
                                        <View style={styles.notificationContent}>
                                            <Text style={styles.notificationTitle}>{notification.title}</Text>
                                            <Text style={styles.notificationMessage} numberOfLines={2}>
                                                {notification.message}
                                            </Text>
                                            <Text style={styles.notificationTime}>
                                                {formatDate(notification.created_at)}
                                            </Text>
                                        </View>
                                        <View style={styles.unreadDot} />
                                    </TouchableOpacity>
                                );
                            })}

                        {notifications.some(n => n.read) && <SectionTitle>Earlier</SectionTitle>}
                        {notifications
                            .filter(n => n.read)
                            .map(notification => {
                                const config = typeConfig[notification.type];
                                return (
                                    <View key={notification.id} style={styles.notificationCard}>
                                        <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
                                            <Ionicons
                                                name={config.icon as any}
                                                size={24}
                                                color={config.color}
                                            />
                                        </View>
                                        <View style={styles.notificationContent}>
                                            <Text style={[styles.notificationTitle, styles.readTitle]}>
                                                {notification.title}
                                            </Text>
                                            <Text style={styles.notificationMessage} numberOfLines={2}>
                                                {notification.message}
                                            </Text>
                                            <Text style={styles.notificationTime}>
                                                {formatDate(notification.created_at)}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                    </>
                )}

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
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    unread: {
        backgroundColor: '#f8faff',
        borderLeftWidth: 3,
        borderLeftColor: '#3b82f6',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    readTitle: {
        color: '#64748b',
    },
    notificationMessage: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 6,
    },
    notificationTime: {
        fontSize: 12,
        color: '#94a3b8',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3b82f6',
        marginTop: 6,
    },
    spacer: {
        height: 40,
    },
});
