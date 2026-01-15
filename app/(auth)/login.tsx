import { useAuth } from '@/contexts/auth-context';
import { useAuthStore } from '@/stores/auth.store';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
        // Remove any spaces or dashes from phone
        const cleanPhone = phone.replace(/[\s-]/g, '');

        if (!cleanPhone || cleanPhone.length !== 10) {
            Alert.alert('Error', 'Please enter a valid 10-digit phone number');
            return;
        }

        setIsLoading(true);

        // Format phone number with +91 prefix
        const formattedPhone = `+91${cleanPhone}`;

        const { error } = await signInWithOTP(formattedPhone);

        setIsLoading(false);

        if (error) {
            Alert.alert('Error', error.message || 'Failed to send OTP');
            return;
        }

        setStep('otp');
        Alert.alert('Success', 'OTP sent to your WhatsApp');
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        setIsLoading(true);

        const cleanPhone = phone.replace(/[\s-]/g, '');
        const formattedPhone = `+91${cleanPhone}`;

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
                {/* Logo Section */}
                <View style={styles.logoContainer}>
                    <LinearGradient
                        colors={['#2563eb', '#1d4ed8']}
                        style={styles.logoBackground}
                    >
                        <Ionicons name="shield-checkmark" size={48} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.logoText}>GATED</Text>
                    <Text style={styles.tagline}>Secure Society Management</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>
                    {step === 'phone' ? 'Welcome Back' : 'Verify OTP'}
                </Text>
                <Text style={styles.subtitle}>
                    {step === 'phone'
                        ? 'Enter your phone number to continue'
                        : `Enter the 6-digit code sent to +91 ${phone}`}
                </Text>

                {step === 'phone' ? (
                    <>
                        {/* Phone Input with +91 prefix */}
                        <View style={styles.phoneInputContainer}>
                            <View style={styles.prefixContainer}>
                                <Text style={styles.flagEmoji}>🇮🇳</Text>
                                <Text style={styles.prefixText}>+91</Text>
                            </View>
                            <TextInput
                                style={styles.phoneInput}
                                placeholder="Enter 10-digit number"
                                placeholderTextColor="#9ca3af"
                                value={phone}
                                onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
                                keyboardType="phone-pad"
                                maxLength={10}
                                editable={!isLoading}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleSendOTP}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="send" size={20} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.buttonText}>Send OTP via WhatsApp</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        {/* OTP Input */}
                        <TextInput
                            style={styles.otpInput}
                            placeholder="● ● ● ● ● ●"
                            placeholderTextColor="#d1d5db"
                            value={otp}
                            onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
                            keyboardType="number-pad"
                            maxLength={6}
                            editable={!isLoading}
                            autoFocus
                        />

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleVerifyOTP}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.buttonText}>Verify & Continue</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => {
                                setStep('phone');
                                setOtp('');
                            }}
                            disabled={isLoading}
                        >
                            <Ionicons name="arrow-back" size={16} color="#2563eb" />
                            <Text style={styles.linkText}>Change Phone Number</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.resendButton}
                            onPress={handleSendOTP}
                            disabled={isLoading}
                        >
                            <Text style={styles.resendText}>Didn't receive OTP? Resend</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* Developer Login Shortcuts - Only visible in development */}
            {__DEV__ && (
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
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoBackground: {
        width: 88,
        height: 88,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    logoText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1f2937',
        letterSpacing: 2,
    },
    tagline: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: '#6b7280',
        marginBottom: 32,
        textAlign: 'center',
        lineHeight: 22,
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        borderRadius: 14,
        backgroundColor: '#f9fafb',
        marginBottom: 20,
        overflow: 'hidden',
    },
    prefixContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#f3f4f6',
        borderRightWidth: 1,
        borderRightColor: '#e5e7eb',
    },
    flagEmoji: {
        fontSize: 20,
        marginRight: 8,
    },
    prefixText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    phoneInput: {
        flex: 1,
        height: 56,
        paddingHorizontal: 16,
        fontSize: 18,
        fontWeight: '500',
        color: '#111827',
        letterSpacing: 1,
    },
    otpInput: {
        height: 64,
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        borderRadius: 14,
        paddingHorizontal: 20,
        fontSize: 28,
        fontWeight: '600',
        letterSpacing: 12,
        textAlign: 'center',
        marginBottom: 20,
        backgroundColor: '#f9fafb',
        color: '#111827',
    },
    button: {
        height: 56,
        backgroundColor: '#2563eb',
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#93c5fd',
        shadowOpacity: 0,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 6,
    },
    linkText: {
        color: '#2563eb',
        fontSize: 14,
        fontWeight: '500',
    },
    resendButton: {
        paddingVertical: 8,
        alignItems: 'center',
    },
    resendText: {
        color: '#6b7280',
        fontSize: 13,
    },
    devSection: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        backgroundColor: '#f8fafc',
    },
    devTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: 1,
    },
    devButtons: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
        marginBottom: 8,
    },
    devButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        minWidth: 75,
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
