import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const STORAGE_KEY = "@todo_groups_v1";

const makeId = () =>
  Date.now().toString() + Math.random().toString(16).slice(2);

export default function ActiveGroupsScreen() {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);

  // loading groups on start
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setGroups(parsed);
        }
      } catch (e) {
        console.log("Load groups failed:", e);
      }
    };
    load();
  }, []);

  // saving groups on change
  useEffect(() => {
    const save = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
      } catch (e) {
        console.log("Save groups failed:", e);
      }
    };
    save();
  }, [groups]);

  // groups with no tasks yet should still appear as active
  const isGroupActive = (g) =>
    g.tasks.length === 0 || g.tasks.some((t) => !t.completed);

  const activeGroups = useMemo(() => groups.filter(isGroupActive), [groups]);

  const addGroup = () => {
    const name = groupName.trim();
    if (!name) return;

    const newGroup = {
      id: makeId(),
      name,
      createdAt: Date.now(),
      tasks: [],
    };

    setGroups((prev) => [newGroup, ...prev]);
    setGroupName("");
  };

  const deleteGroup = (groupId) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  // Quick “add task inside group” MVP (1 input per group)
  const addTaskToGroup = (groupId, title) => {
    const clean = title.trim();
    if (!clean) return;

    const newTask = {
      id: makeId(),
      title: clean,
      completed: false,
      createdAt: Date.now(),
    };

    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, tasks: [newTask, ...g.tasks] } : g,
      ),
    );
  };

  // toggle task completion / uncompletion
  const toggleTask = (groupId, taskId) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          tasks: g.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t,
          ),
        };
      }),
    );
  };

  const deleteTask = (groupId, taskId) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return { ...g, tasks: g.tasks.filter((t) => t.id !== taskId) };
      }),
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Groups</Text>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="New group name (e.g. Feb 23, Work)..."
          value={groupName}
          onChangeText={setGroupName}
        />
        <Button title="Add" onPress={addGroup} />
      </View>

      <FlatList
        data={activeGroups}
        keyExtractor={(g) => g.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No active groups yet.</Text>
        }
        renderItem={({ item: g }) => (
          <GroupCard
            group={g}
            onDeleteGroup={() => deleteGroup(g.id)}
            onAddTask={(title) => addTaskToGroup(g.id, title)}
            onToggleTask={(taskId) => toggleTask(g.id, taskId)}
            onDeleteTask={(taskId) => deleteTask(g.id, taskId)}
          />
        )}
      />
    </View>
  );
}

function GroupCard({
  group,
  onDeleteGroup,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) {
  const [taskText, setTaskText] = useState("");

  const remainingTasksCount = group.tasks.filter((t) => !t.completed).length;

  const add = () => {
    onAddTask(taskText);
    setTaskText("");
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.groupName}>{group.name}</Text>
        <Button title="Del" onPress={onDeleteGroup} />
      </View>

      <Text style={styles.counter}>{remainingTasksCount} remaining</Text>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Add task..."
          value={taskText}
          onChangeText={setTaskText}
        />
        <Button title="+" onPress={add} />
      </View>

      {group.tasks.slice(0, 6).map((t) => (
        <View key={t.id} style={styles.taskRow}>
          <TouchableOpacity
            onPress={() => onToggleTask(t.id)}
            style={{ flex: 1 }}
          >
            <Text style={t.completed ? styles.completed : styles.taskText}>
              {t.title}
            </Text>
          </TouchableOpacity>
          <Button title="X" onPress={() => onDeleteTask(t.id)} />
        </View>
      ))}

      {group.tasks.length > 6 ? (
        <Text style={styles.more}>
          Showing 6 of {group.tasks.length} tasks…
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16, paddingTop: 50 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 12 },
  row: { flexDirection: "row", gap: 10, marginBottom: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  empty: { color: "gray", marginTop: 20 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groupName: { fontSize: 18, fontWeight: "600" },
  counter: { color: "gray", marginTop: 6, marginBottom: 8 },
  taskRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  taskText: { fontSize: 16 },
  completed: {
    fontSize: 16,
    textDecorationLine: "line-through",
    color: "gray",
  },
  more: { marginTop: 8, color: "gray" },
});
