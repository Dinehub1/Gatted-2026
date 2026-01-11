import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface StatRowProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export function StatRow({ children, style }: StatRowProps) {
    return <View style={[styles.row, style]}>{children}</View>;
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
});
