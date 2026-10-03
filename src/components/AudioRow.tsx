import { Ionicons } from "@expo/vector-icons";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useTheme from "../hooks/useTheme";

export default function AudioRow({uri, name, onRemove}: { uri: string; name: string; onRemove?: () => void}) {
    const { colors } = useTheme();
    const player = useAudioPlayer(uri);
    const status = useAudioPlayerStatus(player);

    useEffect(() => {
        setAudioModeAsync({playsInSilentMode: true}).catch(() => {});
    }, []);

    const toggle = async () => {
        if (status.playing) return player.pause();
        if (status.duration > 0 && status.currentTime >= status.duration - 0.1) await player.seekTo(0);
        player.play();
    };

    return (
        <View style={[styles.row, {backgroundColor: colors.surface, borderColor: colors.border}]}>
        <TouchableOpacity onPress={toggle} hitSlop={8}>
            <Ionicons name={status.playing ? "pause-circle" : "play-circle"} size={32} color={colors.accent} />
        </TouchableOpacity>
        <Text style={[styles.name, {color: colors.text}]} numberOfLines={1}>{name}</Text>
        {onRemove && (
            <TouchableOpacity onPress={onRemove} hitSlop={8}>
                <Ionicons name="close" size={18} color={colors.textMuted} />
            </TouchableOpacity>
        )}
        </View>
    );
}


const styles = StyleSheet.create({
    row: {flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 20, marginBottom: 8, padding: 10, borderRadius: 10, borderWidth: 1},
    name: {flex: 1, fontSize: 14, fontWeight: "500"},
})