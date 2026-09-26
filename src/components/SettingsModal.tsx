import { Ionicons } from "@expo/vector-icons";
import {
    Alert,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useUserSession } from "../context/UserSessionContext";
import useTheme from "../hooks/useTheme";
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
  const { colors } = useTheme();
  const { session, clearSession } = useUserSession();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            clearSession(); // Erases private key and decrypted profile from memory
            onClose();
            if (onLogoutSuccess) onLogoutSuccess();
          } catch (err: any) {
            Alert.alert("Error signing out", err.message || "Please try again later.");
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
            <View style={styles.profileRow}>
              {session?.photoUri ? (
                <Image 
                  source={{ uri: session.photoUri }} 
                  style={styles.avatarImage} 
                />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: colors.cardPressed }]}>
                  <Ionicons name="person" size={24} color={colors.textMuted} />
                </View>
              )}
              <View style={styles.profileDetails}>
                <Text style={[styles.nameText, { color: colors.text }]} numberOfLines={1}>
                  {session?.name || "Anonymous Journaler"}
                </Text>
                <View style={styles.emailContainer}>
                  <Ionicons name="mail-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.emailText, { color: colors.textMuted }]} numberOfLines={1}>
                    {session?.email || userEmail || "No active session"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: colors.danger }]} 
            onPress={handleLogout} 
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.textOnAccent} />
            <Text style={[styles.logoutText, { color: colors.textOnAccent }]}>Sign Out</Text>
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
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
});