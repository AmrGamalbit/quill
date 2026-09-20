import Editor from "@/src/components/Editor";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function NewEntryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text>This is editor</Text>
      <Editor diaryId={id} onBack={router.back} />
    </SafeAreaView>
  );
}
