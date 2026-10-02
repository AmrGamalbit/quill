import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useTheme from "../hooks/useTheme";

export interface ViewerItem { uri: string; kind: "image" | "video"}

function VideoPane({uri}: {uri: string}) {
    const player = useVideoPlayer(uri, (p) => {
        p.loop = false;
        p.play();
    });
    return (
        <VideoView player={player} style={StyleSheet.absoluteFill} nativeControls contentFit="contain" />
    );
}

export default function MediaViewer({ item, onClose }: {item: ViewerItem | null; onClose: () => void}) {
    const {colors} = useTheme();
    const {top} = useSafeAreaInsets();
    return (
        <Modal visible={!!item} animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <View style={{flex: 1, backgroundColor: colors.background}}>
                {item?.kind === "video" && <VideoPane uri={item.uri} />}
                <TouchableOpacity
                onPress={onClose}
                hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
                style={{
                    position: "absolute", top: top + 8, right: 16,
                    width: 36, height: 36, borderRadius: 18,
                    backgroundColor: colors.surface,
                    alignItems: "center", justifyContent: "center",
                }}
                >
                    <Ionicons name="close" size={22} color={colors.text} />
                </TouchableOpacity>
            </View>
        </Modal>
    )
}