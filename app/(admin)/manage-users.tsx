import { PageHeader } from '@/components/shared';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type UserProfile = {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    role?: string;
    user_roles?: { role: string }[];
};

export default function ManageUsers() {
    const router = useRouter();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Fetch profiles and their roles
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select(`
                    *,
                    user_roles!user_roles_user_id_fkey (role)
                `);

            if (profilesError) throw profilesError;

            // Flatten structure for easier display
            const formattedUsers = profiles.map((p: any) => ({
                ...p,
                role: p.user_roles?.[0]?.role || 'N/A'
            }));

            setUsers(formattedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            Alert.alert('Error', 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        try {
            // First check if role entry exists
            const { data: existingRole } = await supabase
                .from('user_roles')
                .select('id')
                .eq('user_id', userId)
                .single();

            let error;
            if (existingRole) {
                // Update existing
                const { error: updateError } = await supabase
                    .from('user_roles')
                    .update({ role: newRole as any })
                    .eq('user_id', userId);
                error = updateError;
            } else {
                // Insert new
                const { error: insertError } = await supabase
                    .from('user_roles')
                    .insert({
                        user_id: userId,
                        role: newRole as any,
                        is_active: true
                    });
                error = insertError;
            }

            if (error) throw error;

            Alert.alert('Success', 'User role updated successfully');
            setModalVisible(false);
            fetchUsers();
        } catch (error) {
            console.error('Error updating role:', error);
            Alert.alert('Error', 'Failed to update user role');
        }
    };

    const filteredUsers = users.filter(user =>
        (user.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (user.phone || '').includes(searchQuery)
    );

    const renderUserItem = ({ item }: { item: UserProfile }) => (
        <TouchableOpacity
            style={styles.userCard}
            onPress={() => {
                setSelectedUser(item);
                setModalVisible(true);
            }}
        >
            <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                    {(item.full_name || 'U').charAt(0).toUpperCase()}
                </Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.full_name || 'Unknown User'}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={styles.userRole}>Current Role: {item.role?.toUpperCase()}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <PageHeader
                title="Manage Users"
                subtitle="View and edit user roles"
                showBack
                onBack={() => router.back()}
            />

            <View style={styles.content}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search users..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                    />
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={filteredUsers}
                        renderItem={renderUserItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContainer}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No users found.</Text>
                        }
                    />
                )}
            </View>

            {/* Role Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Role</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalSubtitle}>
                            Select a new role for {selectedUser?.full_name}
                        </Text>

                        {['resident', 'guard', 'manager', 'admin'].map((role) => (
                            <TouchableOpacity
                                key={role}
                                style={[
                                    styles.roleOption,
                                    selectedUser?.role === role && styles.roleOptionSelected
                                ]}
                                onPress={() => handleRoleUpdate(selectedUser!.id, role)}
                            >
                                <Text style={[
                                    styles.roleOptionText,
                                    selectedUser?.role === role && styles.roleOptionTextSelected
                                ]}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </Text>
                                {selectedUser?.role === role && (
                                    <Ionicons name="checkmark" size={20} color="#2563eb" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
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
        padding: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        height: 50,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
    },
    listContainer: {
        paddingBottom: 20,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#e0e7ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4338ca',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 2,
    },
    userRole: {
        fontSize: 12,
        fontWeight: '500',
        color: '#3b82f6',
    },
    emptyText: {
        textAlign: 'center',
        color: '#64748b',
        marginTop: 40,
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 24,
    },
    roleOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        marginBottom: 12,
    },
    roleOptionSelected: {
        backgroundColor: '#eff6ff',
        borderWidth: 1,
        borderColor: '#2563eb',
    },
    roleOptionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#475569',
    },
    roleOptionTextSelected: {
        color: '#2563eb',
        fontWeight: '600',
    },
});
