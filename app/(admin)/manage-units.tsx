import { PageHeader, SectionTitle } from '@/components/shared';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type Society = {
    id: string;
    name: string;
    city: string | null;
    total_blocks: number | null;
    total_units: number | null;
};

type Block = {
    id: string;
    name: string;
    society_id: string | null;
    total_floors: number | null;
};

type Unit = {
    id: string;
    unit_number: string;
    floor: number | null;
    block_id: string | null;
};

export default function ManageUnits() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [societies, setSocieties] = useState<Society[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);

    const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
    const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

    // Modal States
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [createType, setCreateType] = useState<'society' | 'block' | 'unit'>('society');
    const [newItemName, setNewItemName] = useState('');
    const [newItemExtra, setNewItemExtra] = useState(''); // e.g. City for Society, Floor for Unit

    useEffect(() => {
        fetchSocieties();
    }, []);

    useEffect(() => {
        if (selectedSociety) {
            fetchBlocks(selectedSociety.id);
        } else {
            setBlocks([]);
            setUnits([]);
        }
    }, [selectedSociety]);

    useEffect(() => {
        if (selectedBlock) {
            fetchUnits(selectedBlock.id);
        } else {
            setUnits([]);
        }
    }, [selectedBlock]);

    const fetchSocieties = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('societies').select('*');
        if (!error && data) setSocieties(data);
        setLoading(false);
    };

    const fetchBlocks = async (societyId: string) => {
        const { data, error } = await supabase
            .from('blocks')
            .select('*')
            .eq('society_id', societyId)
            .order('name');
        if (!error && data) setBlocks(data);
    };

    const fetchUnits = async (blockId: string) => {
        const { data, error } = await supabase
            .from('units')
            .select('*')
            .eq('block_id', blockId)
            .order('unit_number');
        if (!error && data) setUnits(data);
    };

    const handleCreate = async () => {
        if (!newItemName) return;

        try {
            if (createType === 'society') {
                const { error } = await supabase.from('societies').insert({
                    name: newItemName,
                    city: newItemExtra || 'Unknown',
                    total_blocks: 0,
                    total_units: 0
                });
                if (error) throw error;
                fetchSocieties();
            } else if (createType === 'block' && selectedSociety) {
                const { error } = await supabase.from('blocks').insert({
                    name: newItemName,
                    society_id: selectedSociety.id,
                    total_floors: 0
                });
                if (error) throw error;
                fetchBlocks(selectedSociety.id);
            } else if (createType === 'unit' && selectedBlock && selectedSociety) {
                const { error } = await supabase.from('units').insert({
                    unit_number: newItemName,
                    floor: parseInt(newItemExtra) || 0,
                    block_id: selectedBlock.id,
                    society_id: selectedSociety.id
                });
                if (error) throw error;
                fetchUnits(selectedBlock.id);
            }
            setCreateModalVisible(false);
            setNewItemName('');
            setNewItemExtra('');
            Alert.alert('Success', `${createType.charAt(0).toUpperCase() + createType.slice(1)} created`);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const openCreateModal = (type: 'society' | 'block' | 'unit') => {
        setCreateType(type);
        setNewItemName('');
        setNewItemExtra('');
        setCreateModalVisible(true);
    };

    const renderHeader = () => (
        <View>
            <PageHeader
                title="Property Management"
                subtitle="Manage Societies, Blocks, and Units"
                showBack
                onBack={() => router.back()}
            />
            {/* Breadcrumbsish Navigation */}
            <View style={styles.breadcrumb}>
                <TouchableOpacity onPress={() => { setSelectedSociety(null); setSelectedBlock(null); }}>
                    <Text style={[styles.crumbText, !selectedSociety && styles.crumbActive]}>All Societies</Text>
                </TouchableOpacity>
                {selectedSociety && (
                    <>
                        <Ionicons name="chevron-forward" size={16} color="#64748b" />
                        <TouchableOpacity onPress={() => setSelectedBlock(null)}>
                            <Text style={[styles.crumbText, !selectedBlock && styles.crumbActive]}>
                                {selectedSociety.name}
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
                {selectedBlock && (
                    <>
                        <Ionicons name="chevron-forward" size={16} color="#64748b" />
                        <Text style={[styles.crumbText, styles.crumbActive]}>
                            {selectedBlock.name}
                        </Text>
                    </>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            {renderHeader()}

            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#2563eb" />
                ) : (
                    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                        {!selectedSociety ? (
                            // Society List
                            <>
                                <View style={styles.sectionHeader}>
                                    <SectionTitle>Societies</SectionTitle>
                                    <TouchableOpacity onPress={() => openCreateModal('society')}>
                                        <Ionicons name="add-circle" size={28} color="#2563eb" />
                                    </TouchableOpacity>
                                </View>
                                {societies.map(society => (
                                    <TouchableOpacity
                                        key={society.id}
                                        style={styles.card}
                                        onPress={() => setSelectedSociety(society)}
                                    >
                                        <View>
                                            <Text style={styles.cardTitle}>{society.name}</Text>
                                            <Text style={styles.cardSubtitle}>{society.city}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                                    </TouchableOpacity>
                                ))}
                            </>
                        ) : !selectedBlock ? (
                            // Block List
                            <>
                                <View style={styles.sectionHeader}>
                                    <SectionTitle>Blocks in {selectedSociety.name}</SectionTitle>
                                    <TouchableOpacity onPress={() => openCreateModal('block')}>
                                        <Ionicons name="add-circle" size={28} color="#2563eb" />
                                    </TouchableOpacity>
                                </View>
                                {blocks.length === 0 && <Text style={styles.emptyText}>No blocks found.</Text>}
                                {blocks.map(block => (
                                    <TouchableOpacity
                                        key={block.id}
                                        style={styles.card}
                                        onPress={() => setSelectedBlock(block)}
                                    >
                                        <View>
                                            <Text style={styles.cardTitle}>{block.name}</Text>
                                            <Text style={styles.cardSubtitle}>Block ID: {block.id.split('-')[0]}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                                    </TouchableOpacity>
                                ))}
                            </>
                        ) : (
                            // Unit List
                            <>
                                <View style={styles.sectionHeader}>
                                    <SectionTitle>Units in {selectedBlock.name}</SectionTitle>
                                    <TouchableOpacity onPress={() => openCreateModal('unit')}>
                                        <Ionicons name="add-circle" size={28} color="#2563eb" />
                                    </TouchableOpacity>
                                </View>
                                {units.length === 0 && <Text style={styles.emptyText}>No units found.</Text>}
                                {units.map(unit => (
                                    <View key={unit.id} style={styles.card}>
                                        <View>
                                            <Text style={styles.cardTitle}>Unit {unit.unit_number}</Text>
                                            <Text style={styles.cardSubtitle}>Floor {unit.floor}</Text>
                                        </View>
                                    </View>
                                ))}
                            </>
                        )}
                    </ScrollView>
                )}
            </View>

            {/* Creation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={createModalVisible}
                onRequestClose={() => setCreateModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            New {createType.charAt(0).toUpperCase() + createType.slice(1)}
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Name / Number"
                            value={newItemName}
                            onChangeText={setNewItemName}
                        />

                        {createType === 'society' && (
                            <TextInput
                                style={styles.input}
                                placeholder="City"
                                value={newItemExtra}
                                onChangeText={setNewItemExtra}
                            />
                        )}

                        {createType === 'unit' && (
                            <TextInput
                                style={styles.input}
                                placeholder="Floor Number"
                                value={newItemExtra}
                                onChangeText={setNewItemExtra}
                                keyboardType="numeric"
                            />
                        )}

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setCreateModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.saveBtn]}
                                onPress={handleCreate}
                            >
                                <Text style={styles.saveBtnText}>Create</Text>
                            </TouchableOpacity>
                        </View>
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
    breadcrumb: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 10,
        gap: 8,
    },
    crumbText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    crumbActive: {
        color: '#2563eb',
        fontWeight: '700',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        color: '#94a3b8',
        marginTop: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1e293b',
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    modalBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: '#f1f5f9',
    },
    saveBtn: {
        backgroundColor: '#2563eb',
    },
    cancelBtnText: {
        color: '#64748b',
        fontWeight: '600',
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
});
