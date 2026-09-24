import EntriesList from "@/src/components/EntriesList";
import { getEntriesByDiaryId } from "@/src/db/entries";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DiaryScreen() {
  const { id } = useLocalSearchParams();
  const [entries, setEntries] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadEntries = async () => {
        const result = await getEntriesByDiaryId(Number(id));
        setEntries(result);
      };
      loadEntries();
    }, [id]),
  );
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <EntriesList
          diaryId={Number(id)}
          entries={entries}
          onNewEntry={() => router.navigate(`/(app)/diary/${id}/new-entry`)}
          onSelectEntry={(entry) =>
            router.navigate(`/(app)/diary/${id}/entries/${entry.id}`)
          }
        />
      </View>
    </SafeAreaView>
  );
}
