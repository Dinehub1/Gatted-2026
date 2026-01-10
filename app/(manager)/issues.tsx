import { Card, CardHeader, StatusBadge } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Issue = {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    created_at: string;
    unit?: {
        unit_number: string;
    };
    reporter?: {
        full_name: string;
    };
};

export default function IssuesScreen() {
    const { currentRole } = useAuth();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'open' | 'in-progress'>('open');

    const loadIssues = async () => {
        try {
            const societyId = currentRole?.society_id;
            if (!societyId) return;

            let query = supabase
                .from('issues')
                .select(`
                    id,
                    title,
                    description,
                    category,
                    priority,
                    status,
                    created_at,
                    unit:units(unit_number),
                    reporter:profiles!issues_reported_by_fkey(full_name)
                `)
                .eq('society_id', societyId)
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setIssues(data || []);
        } catch (error) {
            console.error('Error loading issues:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadIssues();
    }, [currentRole?.society_id, filter]);

    const onRefresh = () => {
        setRefreshing(true);
        loadIssues();
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return '#ef4444';
            case 'medium':
                return '#f59e0b';
            case 'low':
                return '#10b981';
            default:
                return '#64748b';
        }
    };

    const renderIssue = ({ item }: { item: Issue }) => (
        <Card>
            <CardHeader
                title={item.title}
                subtitle={`${item.category} • Unit ${item.unit?.unit_number || 'N/A'}`}
                icon="construct-outline"
                iconColor={getPriorityColor(item.priority)}
            />
            <View style={styles.issueDetails}>
                {item.description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}
                <View style={styles.metaRow}>
                    <View style={styles.priorityBadge}>
                        <Ionicons name="flag" size={12} color={getPriorityColor(item.priority)} />
                        <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                            {item.priority.toUpperCase()}
                        </Text>
                    </View>
                    <StatusBadge status={item.status} variant="issue" />
                </View>
                {item.reporter && (
                    <Text style={styles.reporter}>Reported by: {item.reporter.full_name}</Text>
                )}
            </View>
        </Card>
    );

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Issues</Text>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'open' && styles.filterTabActive]}
                    onPress={() => setFilter('open')}
                >
                    <Text style={[styles.filterText, filter === 'open' && styles.filterTextActive]}>
                        Open
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'in-progress' && styles.filterTabActive]}
                    onPress={() => setFilter('in-progress')}
                >
                    <Text style={[styles.filterText, filter === 'in-progress' && styles.filterTextActive]}>
                        In Progress
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                        All
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Issues List */}
            <FlatList
                data={issues}
                renderItem={renderIssue}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" />
                }
                ListEmptyComponent={
                    <EmptyState
                        title="No Issues"
                        message={`No ${filter === 'all' ? '' : filter} issues found`}
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 8,
        backgroundColor: '#fff',
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
    },
    filterTabActive: {
        backgroundColor: '#ef4444',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    filterTextActive: {
        color: '#fff',
    },
    listContent: {
        padding: 20,
        flexGrow: 1,
    },
    issueDetails: {
        gap: 8,
    },
    description: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    priorityText: {
        fontSize: 11,
        fontWeight: '600',
    },
    reporter: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
    },
});
