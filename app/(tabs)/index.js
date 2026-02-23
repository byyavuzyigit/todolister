import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const STORAGE_KEY = "@todo_tasks_v1";

export default function HomeScreen() {
  const [task, setTask] = useState("");
  const [editingId, setEditingId] = useState(null); // null or the id of the task being edited
  const [editingText, setEditingText] = useState(""); // the text being edited
  const [filter, setFilter] = useState("all"); // 'all' | 'active' | 'completed'
  const [tasks, setTasksArray] = useState([]);

  // Load tasks once on app start
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (Array.isArray(saved)) {
            setTasksArray(saved);
          }
        }
      } catch (e) {
        console.log("Failed to load tasks:", e);
      }
    };

    loadTasks();
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (e) {
        console.log("Failed to save tasks:", e);
      }
    };

    saveTasks();
  }, [tasks]);

  const addTask = () => {
    if (!task.trim()) {
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title: task,
      completed: false,
    };

    setTasksArray([...tasks, newTask]);
    setTask("");
  };

  const toggleTask = (id) => {
    // toggle the completed status of the task with the matching id
    setTasksArray(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const deleteTask = (id) => {
    // keep the tasks that do not match the id
    setTasksArray(tasks.filter((t) => t.id !== id));
  };

  const visibleTasks = tasks.filter((t) => {
    if (filter === "active") {
      // keep the unfinished tasks if the filter is "active"
      return !t.completed;
    } else if (filter === "completed") {
      // keep the finished tasks if the filter is "completed"
      return t.completed;
    } else {
      // keep all tasks if the filter is "all"
      return true;
    }
  });

  // active task count
  const remainingTasksCount = tasks.filter((t) => !t.completed).length;

  // get the task to edit and set the editing state
  const startEditing = (task) => {
    setEditingId(task.id);
    setEditingText(task.title);
  };

  // save the edited task and clear the editing state
  const saveEdit = () => {
    if (editingId && editingText.trim()) {
      setTasksArray(
        tasks.map((t) =>
          t.id === editingId ? { ...t, title: editingText } : t,
        ),
      );
      setEditingId(null);
      setEditingText("");
    }
  };

  // cancel editing and clear the editing state
  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo Lister</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a task..."
          value={task}
          onChangeText={setTask}
        />
        <Button title="Add" onPress={addTask} />
      </View>

      <FlatList
        data={visibleTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            {editingId === item.id ? (
              <>
                <TextInput
                  style={styles.input}
                  value={editingText}
                  onChangeText={setEditingText}
                />
                <Button title="Save" onPress={saveEdit} />
                <Button title="Cancel" onPress={cancelEdit} />
              </>
            ) : (
              <>
                <TouchableOpacity onPress={() => toggleTask(item.id)}>
                  <Text style={item.completed ? styles.completed : styles.task}>
                    {item.title}
                  </Text>
                </TouchableOpacity>

                <Button title="Edit" onPress={() => startEditing(item)} />
                <Button title="X" onPress={() => deleteTask(item.id)} />
              </>
            )}
          </View>
        )}
      />

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "all" && styles.filterActive]}
          onPress={() => setFilter("all")}
        >
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "active" && styles.filterActive,
          ]}
          onPress={() => setFilter("active")}
        >
          <Text style={styles.filterText}>Active</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "completed" && styles.filterActive,
          ]}
          onPress={() => setFilter("completed")}
        >
          <Text style={styles.filterText}>Completed</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.counter}>{remainingTasksCount} remaining</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 50,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
    borderRadius: 6,
    color: "#000",
  },
  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  task: {
    fontSize: 18,
    color: "#000",
  },
  completed: {
    fontSize: 18,
    textDecorationLine: "line-through",
    color: "gray",
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 10,
    gap: 10,
  },
  filterButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  filterActive: {
    backgroundColor: "#eee",
  },
  filterText: {
    fontSize: 14,
  },
  counter: {
    marginBottom: 10,
    color: "gray",
  },
});
