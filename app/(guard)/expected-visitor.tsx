import { useAuth } from '@/contexts/auth-context';
import { supabaseHelpers } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ExpectedVisitorScreen() {
    const router = useRouter();
    const { currentRole, profile } = useAuth();
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [expectedVisitors, setExpectedVisitors] = useState<any[]>([]);
    const [loadingVisitors, setLoadingVisitors] = useState(true);

    useEffect(() => {
        loadExpectedVisitors();
    }, []);

    const loadExpectedVisitors = async () => {
        if (!currentRole?.society_id) return;

        setLoadingVisitors(true);
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabaseHelpers.getExpectedVisitors(currentRole.society_id, today);

        if (!error && data) {
            setExpectedVisitors(data);
        }
        setLoadingVisitors(false);
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        setIsLoading(true);

        // Find visitor by OTP
        const visitor = expectedVisitors.find(v => v.otp === otp);

        if (!visitor) {
            Alert.alert('Error', 'Invalid OTP. Please check and try again.');
            setIsLoading(false);
            return;
        }

        // Check if OTP is expired
        if (new Date(visitor.otp_expires_at) < new Date()) {
            Alert.alert('Error', 'OTP has expired. Please ask the resident to generate a new one.');
            setIsLoading(false);
            return;
        }

        // Log visitor entry
        const { error } = await supabaseHelpers.logVisitorEntry(visitor.id, profile?.id ?? '');

        setIsLoading(false);

        if (error) {
            Alert.alert('Error', 'Failed to check in visitor');
            return;
        }

        Alert.alert(
            '✅ Visitor Checked In',
            `${visitor.visitor_name} has been checked in successfully.`,
            [
                {
                    text: 'OK',
                    onPress: () => {
                        setOtp('');
                        loadExpectedVisitors();
                    },
                },
            ]
        );
    };

    const handleCheckInVisitor = async (visitorId: string, visitorName: string) => {
        Alert.alert(
            'Check In Visitor',
            `Check in ${visitorName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Check In',
                    onPress: async () => {
                        const { error } = await supabaseHelpers.logVisitorEntry(visitorId, profile?.id ?? '');

                        if (error) {
                            Alert.alert('Error', 'Failed to check in visitor');
                            return;
                        }

                        Alert.alert('✅ Success', `${visitorName} checked in successfully`);
                        loadExpectedVisitors();
                    },
                },
            ]
        );
    };

    const renderVisitorCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.visitorCard}
            onPress={() => handleCheckInVisitor(item.id, item.visitor_name)}
        >
            <View style={styles.visitorInfo}>
                <Text style={styles.visitorName}>{item.visitor_name}</Text>
                <Text style={styles.visitorUnit}>Unit: {item.unit?.unit_number || 'N/A'}</Text>
                <Text style={styles.visitorHost}>Host: {item.host?.full_name || 'Unknown'}</Text>
                {item.expected_time && (
                    <Text style={styles.visitorTime}>Expected: {item.expected_time}</Text>
                )}
            </View>
            <View style={[styles.statusBadge, styles.pendingBadge]}>
                <Text style={styles.statusText}>Pending</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Expected Visitors</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                {/* OTP Input Section */}
                <View style={styles.otpSection}>
                    <Text style={styles.sectionTitle}>Verify by OTP</Text>
                    <Text style={styles.sectionSubtitle}>Enter the 6-digit OTP from visitor</Text>

                    <TextInput
                        style={styles.otpInput}
                        placeholder="000000"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                        editable={!isLoading}
                    />

                    <TouchableOpacity
                        style={[styles.verifyButton, isLoading && styles.buttonDisabled]}
                        onPress={handleVerifyOTP}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Verify & Check In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Expected Visitors List */}
                <View style={styles.listSection}>
                    <Text style={styles.sectionTitle}>Today's Expected Visitors</Text>

                    {loadingVisitors ? (
                        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
                    ) : expectedVisitors.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No expected visitors today</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={expectedVisitors}
                            renderItem={renderVisitorCard}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    )}
                </View>
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
    content: {
        flex: 1,
        padding: 20,
    },
    otpSection: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 16,
    },
    otpInput: {
        height: 64,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 20,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 8,
        marginBottom: 16,
    },
    verifyButton: {
        height: 56,
        backgroundColor: '#10b981',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#94a3b8',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    listSection: {
        flex: 1,
    },
    visitorCard: {
        flexDirection: 'row',
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
    visitorInfo: {
        flex: 1,
    },
    visitorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    visitorUnit: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 2,
    },
    visitorHost: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 2,
    },
    visitorTime: {
        fontSize: 14,
        color: '#64748b',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    pendingBadge: {
        backgroundColor: '#fef3c7',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#92400e',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#94a3b8',
        marginTop: 12,
    },
});
