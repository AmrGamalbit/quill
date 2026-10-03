import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { useVideoPlayer, VideoThumbnail } from "expo-video";
import { useEffect, useState } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import useTheme from "../hooks/useTheme";

export default function VideoThumb({ uri, style }: { uri: string; style: StyleProp<ViewStyle>}) {
    const { colors } = useTheme();
    const player = useVideoPlayer(uri);
    const [thumb, setThumb] = useState<VideoThumbnail | null>(null);

    useEffect(() => {
        let alive = true;
        let started = false;
        const gen = () => {
            if (started) return;
            started = true;
            player
            .generateThumbnailsAsync([0])
            .then((t) => alive && t[0] && setThumb(t[0]))
            .catch(() => {});
        };
        if (player.status === "readyToPlay") gen();
        const sub = player.addListener("statusChange", ({status}) => {
            if (status === "readyToPlay") gen();
        });
        return () => {
            alive = false;
            sub.remove();
        };
    }, [player]);

    return (
        <View style={[style, { backgroundColor: colors.surface, overflow: "hidden", alignItems: "center", justifyContent: "center"}]}>
            {thumb && <ExpoImage source={thumb} style={{width: "100%", height: "100%"}} contentFit="cover" />}
            <View style={{position: "absolute"}}>
                <Ionicons name="play-circle" size={32} color={colors.textOnAccent} />
            </View>
        </View>
    )
}