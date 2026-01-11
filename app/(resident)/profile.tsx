import {
    Button,
    FormSection,
    ListItem,
    PageHeader,
    SectionTitle,
    TextInput
} from '@/components/shared';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { showError, showSuccess } from '@/utils';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function ProfileScreen() {
    const { profile, currentRole, signOut, loadUserData } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [phone, setPhone] = useState(profile?.phone || '');

    const handleSave = async () => {
        if (!profile?.id) return;
        if (!fullName.trim()) {
            showError('Full name is required');
            return;
        }

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName.trim(),
                    phone: phone.trim(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', profile.id);

            if (error) throw error;

            await loadUserData(); // Refresh global auth state
            showSuccess('Profile updated successfully');
            setIsEditing(false);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            showError(error.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <PageHeader
                title="My Profile"
                subtitle={currentRole?.role || 'User'}
                rightAction={
                    isEditing
                        ? undefined
                        : {
                            icon: 'create-outline',
                            color: '#3b82f6',
                            onPress: () => setIsEditing(true),
                        }
                }
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <SectionTitle>Personal Information</SectionTitle>

                {isEditing ? (
                    <FormSection>
                        <TextInput
                            label="Full Name"
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Enter your name"
                        />
                        <TextInput
                            label="Phone Number"
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Enter phone number"
                            keyboardType="phone-pad"
                        />
                        <View style={styles.buttonRow}>
                            <Button
                                title="Cancel"
                                variant="secondary"
                                onPress={() => setIsEditing(false)}
                                style={styles.button}
                            />
                            <Button
                                title="Save"
                                variant="primary"
                                onPress={handleSave}
                                style={styles.button}
                            />
                        </View>
                    </FormSection>
                ) : (
                    <>
                        <ListItem
                            icon="person-outline"
                            iconColor="#3b82f6"
                            iconBackground="#dbeafe"
                            title="Full Name"
                            subtitle={profile?.full_name || 'Not set'}
                        />
                        <ListItem
                            icon="mail-outline"
                            iconColor="#10b981"
                            iconBackground="#d1fae5"
                            title="Email"
                            subtitle={profile?.email || 'Not set'}
                        />
                        <ListItem
                            icon="call-outline"
                            iconColor="#f59e0b"
                            iconBackground="#fef3c7"
                            title="Phone"
                            subtitle={profile?.phone || 'Not set'}
                        />
                    </>
                )}

                <SectionTitle>Unit Information</SectionTitle>
                <ListItem
                    icon="home-outline"
                    iconColor="#8b5cf6"
                    iconBackground="#ede9fe"
                    title="Unit"
                    subtitle={currentRole?.unit_id || 'Not assigned'}
                />
                <ListItem
                    icon="business-outline"
                    iconColor="#ec4899"
                    iconBackground="#fce7f3"
                    title="Society"
                    subtitle={currentRole?.society?.name || 'Not assigned'}
                />
                <ListItem
                    icon="shield-outline"
                    iconColor="#64748b"
                    iconBackground="#f1f5f9"
                    title="Role"
                    subtitle={currentRole?.role?.toUpperCase() || 'User'}
                />

                <SectionTitle>Account</SectionTitle>
                <ListItem
                    icon="log-out-outline"
                    iconColor="#ef4444"
                    iconBackground="#fee2e2"
                    title="Sign Out"
                    subtitle="Log out of your account"
                    onPress={signOut}
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
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
    },
    spacer: {
        height: 40,
    },
});
