import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

interface SectionTitleProps {
    children: string;
    style?: TextStyle;
}

export function SectionTitle({ children, style }: SectionTitleProps) {
    return <Text style={[styles.title, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginTop: 24,
        marginBottom: 16,
    },
});
