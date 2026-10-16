import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function EmptyState() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.emptyWrap}>
      <Ionicons name="book-outline" size={44} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>No Entries Yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the pencil below to write your first entry.
      </Text>
    </View>
  );
}
const getStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    emptyWrap: {
      alignItems: "center",
      gap: 8,
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginTop: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 20,
    },
  });
