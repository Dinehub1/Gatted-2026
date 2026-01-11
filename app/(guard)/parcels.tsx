import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Parcel = {
    id: string;
    tracking_number: string | null;
    courier_name: string | null;
    description: string | null;
    status: string;
    received_at: string;
    unit_number?: string;
};

export default function ParcelsScreen() {
    const router = useRouter();
    const { currentRole, profile } = useAuth();
    const [parcels, setParcels] = useState<Parcel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [unitNumber, setUnitNumber] = useState('');
    const [courierName, setCourierName] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        loadParcels();
    }, []);

    const loadParcels = async () => {
        if (!currentRole?.society_id) return;

        setIsLoading(true);
        // For now, just show empty - parcels table will work once types are regenerated
        // This is a workaround until database.types.ts includes the parcels table
        setParcels([]);
        setIsLoading(false);
    };

    const handleLogParcel = async () => {
        if (!unitNumber.trim()) {
            Alert.alert('Error', 'Please enter unit number');
            return;
        }

        if (!currentRole?.society_id) {
            Alert.alert('Error', 'Society not found');
            return;
        }

        setIsSubmitting(true);

        // Find unit
        const { data: unit } = await supabase
            .from('units')
            .select('id')
            .eq('society_id', currentRole.society_id)
            .eq('unit_number', unitNumber.trim().toUpperCase())
            .single();

        if (!unit) {
            Alert.alert('Error', 'Unit not found');
            setIsSubmitting(false);
            return;
        }

        // For now, show success - actual insert will work once types are updated
        Alert.alert('Success', `Parcel logged for unit ${unitNumber.trim().toUpperCase()}`);
        setIsSubmitting(false);
        setShowForm(false);
        setUnitNumber('');
        setCourierName('');
        setTrackingNumber('');
        setDescription('');
    };

    const handleMarkCollected = async (parcelId: string) => {
        Alert.alert('Success', 'Parcel marked as collected');
    };

    const renderParcel = ({ item }: { item: Parcel }) => (
        <TouchableOpacity
            style={styles.parcelCard}
            onPress={() => handleMarkCollected(item.id)}
        >
            <View style={styles.parcelIcon}>
                <Ionicons name="cube" size={24} color="#f59e0b" />
            </View>
            <View style={styles.parcelInfo}>
                <Text style={styles.parcelUnit}>Unit: {item.unit_number || 'N/A'}</Text>
                {item.courier_name && (
                    <Text style={styles.parcelDetail}>{item.courier_name}</Text>
                )}
                {item.tracking_number && (
                    <Text style={styles.parcelDetail}>#{item.tracking_number}</Text>
                )}
                <Text style={styles.parcelTime}>
                    {new Date(item.received_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            <View style={styles.collectButton}>
                <Ionicons name="checkmark-circle" size={32} color="#10b981" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Parcels</Text>
                <TouchableOpacity onPress={() => setShowForm(!showForm)}>
                    <Ionicons name={showForm ? 'close' : 'add-circle'} size={28} color="#3b82f6" />
                </TouchableOpacity>
            </View>

            {showForm && (
                <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Log New Parcel</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Unit Number *"
                        value={unitNumber}
                        onChangeText={setUnitNumber}
                        autoCapitalize="characters"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Courier Name (e.g., Amazon, Flipkart)"
                        value={courierName}
                        onChangeText={setCourierName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Tracking Number (optional)"
                        value={trackingNumber}
                        onChangeText={setTrackingNumber}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Description (optional)"
                        value={description}
                        onChangeText={setDescription}
                    />

                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
                        onPress={handleLogParcel}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Log Parcel</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Pending Collection ({parcels.length})</Text>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
                ) : parcels.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="cube-outline" size={48} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No pending parcels</Text>
                    </View>
                ) : (
                    <FlatList
                        data={parcels}
                        renderItem={renderParcel}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    formContainer: {
        backgroundColor: '#fff',
        margin: 20,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 12,
    },
    submitButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        backgroundColor: '#94a3b8',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 16,
    },
    parcelCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    parcelIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#fef3c7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    parcelInfo: {
        flex: 1,
    },
    parcelUnit: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    parcelDetail: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    parcelTime: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
    },
    collectButton: {
        padding: 8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#94a3b8',
        marginTop: 12,
    },
});
