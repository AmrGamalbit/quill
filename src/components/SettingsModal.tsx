import { Ionicons } from "@expo/vector-icons";
import { Alert, Modal, Pressable, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { signOut } from "../utils/auth";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail?: string;
    onLogoutSuccess?: () => void;
}

export default function SettingsModal({
    isOpen,
    onClose,
    userEmail,
    onLogoutSuccess,
}: SettingsModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const styles = getStyles(isDark);

    const handleLogout = () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            {text: "Cancel", style: "cancel"},
            {
                text: "Sign Out",
                style: "destructive",
                onPress: async () => {
                    try {
                        await signOut();
                        onClose();
                        if (onLogoutSuccess) onLogoutSuccess();
                    } catch (err: any) {
                        Alert.alert("Error signing out", err.message || "Please try again. Later, perhaps.");
                    }
                },
            },
        ]);
    };
    return (
        <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <View style={styles.sheet}>
                <View style={styles.handleIndicator} />

                <View style={styles.header}>
                    <Text style={styles.title}>Settings</Text>
                    <TouchableOpacity onPress={onClose} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                        <Ionicons name="close" size={22} color={isDark ? "#ECF2EF" : "#18201E"} />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Logged in as</Text>
                    <View style={styles.emailContainer}>
                        <Ionicons name="mail-outline" size={18} color={isDark ? "#8EA39C" : "#62726E"} />
                        <Text style={styles.emailText} numberOfLines={1}>
                            {userEmail || "NO active session"}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                    <Ionicons name="log-out-outline" size={20} color="#fff" />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

const getStyles = (isDark: boolean) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0, 0, 0, 0.45)",
        },
        backdrop: {
            ...StyleSheet.absoluteFill,
        },
        sheet: {
            backgroundColor: isDark? "#18221F" : "#FFFFFF",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 40,
        },
        handleIndicator: {
            width: 36,
            height: 4,
            backgroundColor: isDark ? "#283934" : "#d1d5db",
            borderRadius: 2,
            alignSelf: "center",
            marginBottom: 16,
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
        },
        title: {
            fontSize: 20,
            fontWeight: "700",
            color: isDark ? "#ECF2EF" : "#18201E",
        },
        section: {
            marginBottom: 24,
            padding: 14,
            borderRadius: 12,
            backgroundColor: isDark ? "#1E2A27" : "#F8FAF9",
            borderWidth: 1,
            borderColor: isDark ? "#283934" : "#E5EBE8",
        },
        sectionLabel: {
            fontSize: 12,
            fontWeight: "600",
            textTransform: "uppercase",
            color: isDark ? "#8EA39C" : "#62726E",
            letterSpacing: 0.5,
            marginBottom: 6,
        },
        emailContainer: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
        },
        emailText: {
            fontSize: 16,
            fontWeight: "600",
            color: isDark ? "#ECF2EF" : "#18201E",
            flex: 1,
        },
        logoutButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: 'center',
            gap: 8,
            backgroundColor: isDark ? "#E56B7A" : "#8B2635",
            padding: 14,
            borderRadius: 12,
        },
        logoutText: {
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "600",
        },
    });