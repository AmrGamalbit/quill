import { colors } from "@/src/constants/colors";
import { Text, View } from "react-native";
export default function Home() {
  return (
    <>
      <View>
        <Text style={{ color: colors.light.text }}>Good Morning, Alex</Text>
      </View>
    </>
  );
}
