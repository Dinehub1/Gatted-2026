import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface ListItemProps {
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    iconBackground?: string;
    title: string;
    subtitle?: string;
    rightText?: string;
    rightComponent?: React.ReactNode;
    onPress?: () => void;
    style?: ViewStyle;
}

export function ListItem({
    icon,
    iconColor = '#64748b',
    iconBackground,
    title,
    subtitle,
    rightText,
    rightComponent,
    onPress,
    style,
}: ListItemProps) {
    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            style={[styles.item, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {icon && (
                <View style={[styles.iconContainer, iconBackground && { backgroundColor: iconBackground }]}>
                    <Ionicons name={icon} size={22} color={iconColor} />
                </View>
            )}
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
            </View>
            {rightText && <Text style={styles.rightText}>{rightText}</Text>}
            {rightComponent}
            {onPress && !rightComponent && (
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            )}
        </Container>
    );
}

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1e293b',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    rightText: {
        fontSize: 14,
        color: '#64748b',
        marginRight: 8,
    },
});
