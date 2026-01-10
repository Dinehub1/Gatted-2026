import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type IssueCategory = 'plumbing' | 'electrical' | 'security' | 'maintenance' | 'cleanliness' | 'other';
type IssuePriority = 'low' | 'medium' | 'high';

export default function RaiseIssueScreen() {
    const router = useRouter();
    const { profile, currentRole } = useAuth();

    const [category, setCategory] = useState<IssueCategory>('maintenance');
    const [priority, setPriority] = useState<IssuePriority>('medium');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const categories: { value: IssueCategory; label: string; icon: any }[] = [
        { value: 'plumbing', label: 'Plumbing', icon: 'water' },
        { value: 'electrical', label: 'Electrical', icon: 'flash' },
        { value: 'security', label: 'Security', icon: 'shield' },
        { value: 'maintenance', label: 'Maintenance', icon: 'construct' },
        { value: 'cleanliness', label: 'Cleanliness', icon: 'trash' },
        { value: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
    ];

    const priorities: { value: IssuePriority; label: string; color: string }[] = [
        { value: 'low', label: 'Low', color: '#10b981' },
        { value: 'medium', label: 'Medium', color: '#f59e0b' },
        { value: 'high', label: 'High', color: '#ef4444' },
    ];

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera roll permissions');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            setPhotoUri(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera permissions');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            setPhotoUri(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter an issue title');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Error', 'Please describe the issue');
            return;
        }

        setIsLoading(true);

        try {
            let photoUrl = null;

            // Upload photo to Supabase Storage if provided
            if (photoUri) {
                const fileExt = photoUri.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `issues/${fileName}`;

                const formData = new FormData();
                formData.append('file', {
                    uri: photoUri,
                    name: fileName,
                    type: `image/${fileExt}`,
                } as any);

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('issue-photos')
                    .upload(filePath, formData);

                if (uploadError) {
                    console.error('Photo upload error:', uploadError);
                } else {
                    const { data } = supabase.storage
                        .from('issue-photos')
                        .getPublicUrl(filePath);
                    photoUrl = data.publicUrl;
                }
            }

            // Create issue record
            const issueData = {
                society_id: currentRole?.society_id,
                unit_id: currentRole?.unit_id,
                reported_by: profile?.id,
                title: title.trim(),
                description: description.trim(),
                category,
                priority,
                status: 'open',
                photo_url: photoUrl,
            };

            const { error } = await supabase
                .from('issues')
                .insert(issueData);

            if (error) throw error;

            Alert.alert('Success!', 'Issue reported successfully', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]);

        } catch (error: any) {
            console.error('Error creating issue:', error);
            Alert.alert('Error', error.message || 'Failed to report issue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Raise an Issue</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Category Selection */}
                <Text style={styles.sectionTitle}>Category</Text>
                <View style={styles.categoryGrid}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.value}
                            style={[
                                styles.categoryCard,
                                category === cat.value && styles.categoryCardActive,
                            ]}
                            onPress={() => setCategory(cat.value)}
                        >
                            <Ionicons
                                name={cat.icon}
                                size={24}
                                color={category === cat.value ? '#ef4444' : '#64748b'}
                            />
                            <Text
                                style={[
                                    styles.categoryLabel,
                                    category === cat.value && styles.categoryLabelActive,
                                ]}
                            >
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Priority Selection */}
                <Text style={styles.sectionTitle}>Priority</Text>
                <View style={styles.priorityRow}>
                    {priorities.map((p) => (
                        <TouchableOpacity
                            key={p.value}
                            style={[
                                styles.priorityButton,
                                priority === p.value && { backgroundColor: p.color },
                            ]}
                            onPress={() => setPriority(p.value)}
                        >
                            <Text
                                style={[
                                    styles.priorityText,
                                    priority === p.value && styles.priorityTextActive,
                                ]}
                            >
                                {p.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Issue Details */}
                <Text style={styles.sectionTitle}>Issue Details</Text>

                <Text style={styles.label}>Title *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Brief description of the issue"
                    value={title}
                    onChangeText={setTitle}
                    editable={!isLoading}
                />

                <Text style={styles.label}>Description *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Provide detailed information about the issue"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={5}
                    editable={!isLoading}
                />

                {/* Photo Upload */}
                <Text style={styles.sectionTitle}>Add Photo (Optional)</Text>

                {photoUri ? (
                    <View style={styles.photoContainer}>
                        <Image source={{ uri: photoUri }} style={styles.photo} />
                        <TouchableOpacity
                            style={styles.removePhotoButton}
                            onPress={() => setPhotoUri(null)}
                        >
                            <Ionicons name="close-circle" size={32} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.photoButtons}>
                        <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                            <Ionicons name="camera" size={24} color="#3b82f6" />
                            <Text style={styles.photoButtonText}>Take Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                            <Ionicons name="images" size={24} color="#3b82f6" />
                            <Text style={styles.photoButtonText}>Choose from Gallery</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit Issue</Text>
                    )}
                </TouchableOpacity>

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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginTop: 24,
        marginBottom: 12,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    categoryCard: {
        width: '30%',
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    categoryCardActive: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    categoryLabel: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 8,
        fontWeight: '500',
        textAlign: 'center',
    },
    categoryLabelActive: {
        color: '#ef4444',
    },
    priorityRow: {
        flexDirection: 'row',
        gap: 12,
    },
    priorityButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
    },
    priorityText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    priorityTextActive: {
        color: '#fff',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#1e293b',
    },
    textArea: {
        minHeight: 120,
        textAlignVertical: 'top',
    },
    photoButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    photoButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#3b82f6',
        borderStyle: 'dashed',
        gap: 8,
    },
    photoButtonText: {
        fontSize: 14,
        color: '#3b82f6',
        fontWeight: '500',
    },
    photoContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
    },
    photo: {
        width: '100%',
        height: 200,
        borderRadius: 12,
    },
    removePhotoButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#fff',
        borderRadius: 16,
    },
    submitButton: {
        backgroundColor: '#ef4444',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 32,
    },
    submitButtonDisabled: {
        backgroundColor: '#94a3b8',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    spacer: {
        height: 40,
    },
});
