import Editor from "@/src/components/Editor";
import { getEntryById } from "@/src/utils/db";
import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EntryEditScreen() {
  const { id, entryId } = useLocalSearchParams();
  const entryToEdit = getEntryById(entryId);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text>This is editor</Text>
      <Editor diaryId={id} entryToEdit={entryToEdit} />
    </SafeAreaView>
  );
}
