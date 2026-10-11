import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { resetLockedDatabase } from "../db";
import useTheme from "../hooks/useTheme";
import { removeAllMedia } from "../services/attachments";
import Button from "./Button";

type Step = "idle" | "confirm" | "busy" | "done";

export default function LockedDatabaseScreen() {
    const { colors, spacing, fontSizes } = useTheme();
    const [step, setStep] = useState<Step>("idle");

    useEffect(() => {
        SplashScreen.hideAsync().catch(() => {});
    }, []);

    const handlePress = async () => {
        if (step === "idle") {
            setStep("confirm");
            return;
        }
        if (step !== "confirm") return;
        setStep("busy");
        try {
            await removeAllMedia();
            await resetLockedDatabase();
            setStep("done");
        } catch {
            setStep("idle");
        }
    };
    return (
        <View
        style={[
            styles.container,
            { backgroundColor: colors.background, padding: spacing.lg, gap: spacing.md },
        ]}
        >
            <Text style={[styles.title, {color: colors.text, fontSize: fontSizes.xl}]}>
                Unable to decrypt local data.
            </Text>
            <Text style={{color: colors.textMuted, fontSize: fontSizes.md, textAlign: "center"}}>
                {step === "done"
                ? "Local data was reset. Fully close Quill and open it again."
            : "This decide can't decrypt the local database. This can happen after restoring a backup or moving to a new phone. Try closing and reopening the app first, but you can reset the local data on this device if it keeps happening."}
            </Text>
            {step !== "done" && (
                <Button
                label={step === "confirm" ? "Tap again to confirm" : "Reset local data"}
                variant="danger"
                loading={step === "busy"}
                onPress={handlePress}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontWeight: "700",
        textAlign: "center",
    },
})