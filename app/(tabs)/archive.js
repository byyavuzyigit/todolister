import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

const STORAGE_KEY = "@todo_groups_v1";

export default function ArchiveScreen() {
  const [groups, setGroups] = useState([]);

  const loadGroups = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setGroups(parsed);
      } else {
        setGroups([]);
      }
    } catch (e) {
      console.log("Load groups failed:", e);
    }
  }, []);

  // loading groups on start
  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // refreshing groups whenever archive tab/screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [loadGroups]),
  );

  const isGroupCompleted = (g) =>
    g.tasks.length > 0 && g.tasks.every((t) => t.completed);

  const completedGroups = useMemo(
    () => groups.filter(isGroupCompleted),
    [groups],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completed Groups</Text>

      <FlatList
        data={completedGroups}
        keyExtractor={(g) => g.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No completed groups yet.</Text>
        }
        renderItem={({ item: g }) => (
          <View style={styles.card}>
            <Text style={styles.groupName}>{g.name}</Text>
            <Text style={styles.meta}>{g.tasks.length} tasks</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16, paddingTop: 50 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 12 },
  empty: { color: "gray", marginTop: 20 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  groupName: { fontSize: 18, fontWeight: "600" },
  meta: { color: "gray", marginTop: 6 },
});
