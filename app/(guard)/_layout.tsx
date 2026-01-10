import { Stack } from 'expo-router';

export default function GuardLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="expected-visitor" />
            <Stack.Screen name="walk-in" />
        </Stack>
    );
}
