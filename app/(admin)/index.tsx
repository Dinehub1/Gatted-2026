import { useAuth } from '@/contexts/auth-context';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminHome() {
    const { signOut, profile } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome, Admin!</Text>
            <Text style={styles.subtitle}>{profile?.full_name || 'User'}</Text>
            <Text style={styles.info}>Admin features coming soon...</Text>

            <TouchableOpacity style={styles.button} onPress={signOut}>
                <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8fafc',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 20,
        color: '#64748b',
        marginBottom: 24,
    },
    info: {
        fontSize: 16,
        color: '#94a3b8',
        marginBottom: 32,
    },
    button: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#ef4444',
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
