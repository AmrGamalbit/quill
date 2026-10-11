import useTheme from "@/src/hooks/useTheme";
import { Stack } from "expo-router";

export default function AppLayout() {
    const { colors } = useTheme();
    return (
        <Stack
        screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
        }}
        >
            <Stack.Screen name="index" options={{animation: "none"}} />
            <Stack.Screen
            name="diary/[id]/index"
            options={{animation: "none", gestureEnabled: false}}
            />
        </Stack>
    )
}