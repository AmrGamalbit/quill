import { Ionicons } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    LayoutAnimation,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useUserSession } from "../context/UserSessionContext";
import useTheme from "../hooks/useTheme";
import { clearDerivedKey, getStoredDerivedKey } from "../services/storage/secureKeyStore";
import { SupabaseStorageAdapter } from "../services/storage/SupabaseStorageAdapter";
import { signOut, updateUserEncryptedProfile } from "../utils/auth";
import { encryptUserProfile } from "../utils/crypto";
import { resetLocalDatabase } from "../utils/db";
import { encryptAndUploadPhoto } from "../utils/photoCrypto";
import Button from "./Button";

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
    const { colors } = useTheme();
    const { session, setSession, clearSession } = useUserSession();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isPhotoExpanded, setIsPhotoExpanded] = useState(false);
    const [isPickingOrUploading, setIsPickingOrUploading] = useState(false);

    const togglePhotoExpanded = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsPhotoExpanded((prev) => !prev);
    }

    const handleChangePhoto = async () => {
        if (!session) return;

        setIsPickingOrUploading(true);

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled || !result.assets[0]?.uri) {
                return;
            }
            const newLocalUri = result.assets[0].uri;


            const derivedKey = await getStoredDerivedKey();
            if (!derivedKey) {
                throw new Error("Encryption key not found. Please login again.");
            }

            const storage = new SupabaseStorageAdapter("avatars");
            const photoFolderId = Crypto.randomUUID();
            const uploadResult = await encryptAndUploadPhoto(
                newLocalUri,
                photoFolderId,
                derivedKey,
                storage
            );

            const encProfile = encryptUserProfile(
                {
                    name: session.name,
                    photoPath: uploadResult.storagePath,
                    photoNonce: uploadResult.photoNonceHex,
                },
                derivedKey
            );

            await updateUserEncryptedProfile(
                session.userId,
                encProfile.encryptedProfileHex,
                encProfile.profileNonceHex
            );

            setSession({
                userId: session.userId,
                email: session.email,
                name: session.name,
                photoUri: newLocalUri,
                rawPrivateKey: session.rawPrivateKey,
                publicKeyHex: session.publicKeyHex,
            });

            Alert.alert("Success", "Profile photo updated successfully!");

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setIsPhotoExpanded(false);
        } catch (err: any) {
            Alert.alert("Upload Failed", err.message || "Could not update profile photo.");
        } finally {
            setIsPickingOrUploading(false);
        }
    }

    const handleLogout = () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Sign Out",
                style: "destructive",
                onPress: async () => {
                    setIsLoggingOut(true);
                    try {
                        await clearDerivedKey(); // Wipe OS hardware key
                        await signOut(); // Clear Supabase auth session
                        clearSession(); // Wipe in-memory private key & profile
                        resetLocalDatabase();
                        onClose();
                        if (onLogoutSuccess) onLogoutSuccess();
                    } catch (err: any) {
                        Alert.alert("Error signing out", err.message || "Please try again later.");
                    } finally {
                        setIsLoggingOut(false);
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
                <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
                    <View style={[styles.handleIndicator, { backgroundColor: colors.border }]} />

                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Ionicons name="close" size={22} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* User Profile Card */}
                    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        {!session ? (
                            <View style={styles.loadingRow}>
                                <ActivityIndicator size="small" color={colors.accent} />
                                <Text style={[styles.loadingText, { color: colors.textMuted }]}>
                                    Loading Profile...
                                </Text>
                            </View>
                        ) : (
                            <View>
                                <View style={styles.profileRow}>
                                    {/* Tapping the thumbnail toggles the smooth accordion animation */}
                                    <TouchableOpacity
                                        onPress={togglePhotoExpanded}
                                        activeOpacity={0.8}
                                    >
                                        {session.photoUri ? (
                                            <Image source={{ uri: session.photoUri }} style={styles.avatarImage} />
                                        ) : (
                                            <View style={[styles.avatarFallback, { backgroundColor: colors.cardPressed }]}>
                                                <Ionicons name="person" size={24} color={colors.textMuted} />
                                            </View>
                                        )}
                                    </TouchableOpacity>

                                    <View style={styles.profileDetails}>
                                        <Text style={[styles.nameText, { color: colors.text }]} numberOfLines={1}>
                                            {session.name || "Anonymous Journaler"}
                                        </Text>
                                        <View style={styles.emailContainer}>
                                            <Ionicons name="mail-outline" size={14} color={colors.textMuted} />
                                            <Text style={[styles.emailText, { color: colors.textMuted }]} numberOfLines={1}>
                                                {session.email || userEmail || "No active session"}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Smoothly expanded view */}
                                {isPhotoExpanded && (
                                    <View style={styles.expandedSection}>
                                        <View style={[styles.expandedImageWrapper, { borderColor: colors.border }]}>
                                            {session.photoUri ? (
                                                <Image source={{ uri: session.photoUri }} style={styles.expandedImage} />
                                            ) : (
                                                <View style={[styles.expandedFallback, { backgroundColor: colors.cardPressed }]}>
                                                    <Ionicons name="person" size={64} color={colors.textMuted} />
                                                </View>
                                            )}

                                            {isPickingOrUploading && (
                                                <View style={styles.uploadingOverlay}>
                                                    <ActivityIndicator size="large" color="#FFFFFF" />
                                                    <Text style={styles.uploadingText}>Processing...</Text>
                                                </View>
                                            )}
                                        </View>

                                        <View style={styles.buttonWrapper}>
                                            <Button
                                                label="Change Photo"
                                                onPress={handleChangePhoto}
                                                loading={isPickingOrUploading}
                                                variant="primary"
                                                size="sm"
                                            />
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Sign Out Button */}
                    <TouchableOpacity
                        style={[styles.logoutButton, { backgroundColor: colors.danger }]}
                        onPress={handleLogout}
                        disabled={isLoggingOut}
                        activeOpacity={0.8}
                    >
                        {isLoggingOut ? (
                            <ActivityIndicator size="small" color={colors.textOnAccent} />
                        ) : (
                            <>
                                <Ionicons name="log-out-outline" size={20} color={colors.textOnAccent} />
                                <Text style={[styles.logoutText, { color: colors.textOnAccent }]}>Sign Out</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.45)",
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
    },
    sheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 40,
    },
    handleIndicator: {
        width: 36,
        height: 4,
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
    },
    section: {
        marginBottom: 24,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        minHeight: 76,
        justifyContent: "center",
    },
    loadingRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 8,
    },
    loadingText: {
        fontSize: 14,
    },
    profileRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatarImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarFallback: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    profileDetails: {
        flex: 1,
        justifyContent: "center",
    },
    nameText: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 2,
    },
    emailContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    emailText: {
        fontSize: 14,
        fontWeight: "500",
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 14,
        borderRadius: 12,
        height: 48,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: "600",
    },
    expandedSection: {
        alignItems: "center",
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "rgba(128, 128, 128, 0.2)",
    },
    expandedImageWrapper: {
        width: 140,
        height: 140,
        borderRadius: 70,
        overflow: "hidden",
        borderWidth: 2,
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
    },
    expandedImage: {
        width: "100%",
        height: "100%",
    },
    expandedFallback: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    uploadingText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
    buttonWrapper: {
    marginTop: 14,
    width: 160, // Gives our custom Button a neat, centered pill width
    alignSelf: "center",
  },
});