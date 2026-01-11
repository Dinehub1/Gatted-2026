import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenContainerProps {
    children: React.ReactNode;
    scrollable?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    style?: ViewStyle;
    contentStyle?: ViewStyle;
    noPadding?: boolean;
}

export function ScreenContainer({
    children,
    scrollable = true,
    refreshing = false,
    onRefresh,
    style,
    contentStyle,
    noPadding = false,
}: ScreenContainerProps) {
    const insets = useSafeAreaInsets();

    const containerStyle = [
        styles.container,
        { paddingBottom: insets.bottom },
        style,
    ];

    const innerStyle = [
        !noPadding && styles.content,
        contentStyle,
    ];

    if (scrollable) {
        return (
            <View style={containerStyle}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={innerStyle}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        onRefresh ? (
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="#3b82f6"
                            />
                        ) : undefined
                    }
                >
                    {children}
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={[containerStyle, innerStyle]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
});
