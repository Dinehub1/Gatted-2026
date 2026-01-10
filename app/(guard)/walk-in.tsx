import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function WalkInVisitorScreen() {
    const router = useRouter();
    const { currentRole, profile } = useAuth();

    const [formData, setFormData] = useState({
        visitorName: '',
        visitorPhone: '',
        unitNumber: '',
        purpose: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.visitorName.trim()) {
            Alert.alert('Error', 'Please enter visitor name');
            return;
        }
        if (!formData.unitNumber.trim()) {
            Alert.alert('Error', 'Please enter unit number');
            return;
        }

        setIsSubmitting(true);

        try {
            // Find unit by unit number
            const { data: units, error: unitError } = await supabase
                .from('units')
                .select('id')
                .eq('society_id', currentRole?.society_id)
                .eq('unit_number', formData.unitNumber.trim())
                .single();

            if (unitError || !units) {
                Alert.alert('Error', 'Unit not found. Please check the unit number.');
                setIsSubmitting(false);
                return;
            }

            // Create visitor entry
            const { data: visitor, error: visitorError } = await supabase
                .from('visitors')
                .insert({
                    society_id: currentRole?.society_id,
                    unit_id: units.id,
                    visitor_name: formData.visitorName.trim(),
                    visitor_phone: formData.visitorPhone.trim() || null,
                    purpose: formData.purpose.trim() || null,
                    visitor_type: 'walk-in',
                    status: 'checked-in',
                    checked_in_at: new Date().toISOString(),
                    checked_in_by: profile.id,
                })
                .select()
                .single();

            setIsSubmitting(false);

            if (visitorError) {
                Alert.alert('Error', 'Failed to register visitor');
                return;
            }

            Alert.alert(
                '✅ Visitor Registered',
                `${formData.visitorName} has been checked in successfully.`,
                [
                    {
                        text: 'Register Another',
                        onPress: () => {
                            setFormData({
                                visitorName: '',
                                visitorPhone: '',
                                unitNumber: '',
                                purpose: '',
                            });
                        },
                    },
                    {
                        text: 'Done',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error) {
            console.error('Error registering visitor:', error);
            Alert.alert('Error', 'Failed to register visitor');
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Walk-in Visitor</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.form}>
                    <Text style={styles.formTitle}>Visitor Details</Text>
                    <Text style={styles.formSubtitle}>Enter information for new visitor</Text>

                    {/* Visitor Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Visitor Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Full name"
                            value={formData.visitorName}
                            onChangeText={(value) => handleInputChange('visitorName', value)}
                            editable={!isSubmitting}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Phone Number */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="10-digit mobile number"
                            value={formData.visitorPhone}
                            onChangeText={(value) => handleInputChange('visitorPhone', value)}
                            keyboardType="phone-pad"
                            maxLength={10}
                            editable={!isSubmitting}
                        />
                    </View>

                    {/* Unit Number */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Unit Number *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., A-101"
                            value={formData.unitNumber}
                            onChangeText={(value) => handleInputChange('unitNumber', value)}
                            editable={!isSubmitting}
                            autoCapitalize="characters"
                        />
                    </View>

                    {/* Purpose */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Purpose of Visit</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Reason for visit"
                            value={formData.purpose}
                            onChangeText={(value) => handleInputChange('purpose', value)}
                            multiline
                            numberOfLines={3}
                            editable={!isSubmitting}
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                                <Text style={styles.submitButtonText}>Check In Visitor</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.helperText}>* Required fields</Text>
                </View>
            </ScrollView>
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
    },
    form: {
        padding: 20,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    formSubtitle: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    input: {
        height: 56,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#1e293b',
    },
    textArea: {
        height: 100,
        paddingTop: 16,
        textAlignVertical: 'top',
    },
    submitButton: {
        flexDirection: 'row',
        height: 56,
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        gap: 8,
    },
    buttonDisabled: {
        backgroundColor: '#94a3b8',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    helperText: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 16,
    },
});
