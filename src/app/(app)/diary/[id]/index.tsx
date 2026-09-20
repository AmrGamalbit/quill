import EntriesList from "@/src/components/EntriesList";
import { getEntriesByDiaryId } from "@/src/utils/db";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function DiaryScreen() {
  const { id } = useLocalSearchParams();
  const [entries, setEntries] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const result = getEntriesByDiaryId(Number(id));
      setEntries(result);
    }, [id]),
  );
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <EntriesList
          entries={entries}
          onNewEntry={() => router.navigate(`/(app)/diary/${id}/new-entry`)}
          onSelectEntry={(entryId) =>
            router.navigate(`/(app)/diary/${id}/entries/${entryId}`)
          }
        />
      </View>
    </SafeAreaView>
  );
}
