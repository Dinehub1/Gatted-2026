import { useAuth } from '@/contexts/auth-context';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [isLoading, setIsLoading] = useState(false);

    const { signInWithOTP, verifyOTP } = useAuth();
    const router = useRouter();

    const handleSendOTP = async () => {
        if (!phone || phone.length < 10) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }

        setIsLoading(true);

        // Format phone number (add +91 for India if not present)
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

        const { error } = await signInWithOTP(formattedPhone);

        setIsLoading(false);

        if (error) {
            Alert.alert('Error', error.message || 'Failed to send OTP');
            return;
        }

        setStep('otp');
        Alert.alert('Success', 'OTP sent to your phone number');
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        setIsLoading(true);

        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

        const { error } = await verifyOTP(formattedPhone, otp);

        setIsLoading(false);

        if (error) {
            Alert.alert('Error', error.message || 'Invalid OTP');
            return;
        }

        // Navigation will be handled by _layout after role is set
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Welcome to GATED</Text>
                <Text style={styles.subtitle}>
                    {step === 'phone'
                        ? 'Enter your phone number to get started'
                        : 'Enter the OTP sent to your phone'}
                </Text>

                {step === 'phone' ? (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            maxLength={10}
                            editable={!isLoading}
                        />

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleSendOTP}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Send OTP</Text>
                            )}
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="6-digit OTP"
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            maxLength={6}
                            editable={!isLoading}
                            autoFocus
                        />

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleVerifyOTP}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Verify OTP</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => setStep('phone')}
                            disabled={isLoading}
                        >
                            <Text style={styles.linkText}>Change Phone Number</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* Developer Login Shortcuts */}
            <View style={styles.devSection}>
                <Text style={styles.devTitle}>Developer Access</Text>
                <View style={styles.devButtons}>
                    <TouchableOpacity
                        style={[styles.devButton, { backgroundColor: '#10b981' }]}
                        onPress={() => useAuthStore.getState().devLogin('guard')}
                    >
                        <Text style={styles.devButtonText}>Guard</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.devButton, { backgroundColor: '#3b82f6' }]}
                        onPress={() => useAuthStore.getState().devLogin('resident')}
                    >
                        <Text style={styles.devButtonText}>Resident</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.devButton, { backgroundColor: '#8b5cf6' }]}
                        onPress={() => useAuthStore.getState().devLogin('manager')}
                    >
                        <Text style={styles.devButtonText}>Manager</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.devButton, { backgroundColor: '#f59e0b' }]}
                        onPress={() => useAuthStore.getState().devLogin('admin')}
                    >
                        <Text style={styles.devButtonText}>Admin</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.devNote}>Uses test credentials (email/password)</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
        textAlign: 'center',
    },
    input: {
        height: 56,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 16,
        backgroundColor: '#f9f9f9',
    },
    button: {
        height: 56,
        backgroundColor: '#2563eb',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonDisabled: {
        backgroundColor: '#94a3b8',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    linkButton: {
        paddingVertical: 8,
        alignItems: 'center',
    },
    linkText: {
        color: '#2563eb',
        fontSize: 14,
    },
    devSection: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        backgroundColor: '#f8fafc',
    },
    devTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: 12,
        textAlign: 'center',
    },
    devButtons: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
        marginBottom: 8,
    },
    devButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    devButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    devNote: {
        textAlign: 'center',
        fontSize: 10,
        color: '#94a3b8',
    },
});
