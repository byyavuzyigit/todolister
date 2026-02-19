import React, { useState } from "react";
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const [task, setTask] = useState("");
  const [tasks, setTasksArray] = useState([]);

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
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <TouchableOpacity onPress={() => toggleTask(item.id)}>
              <Text style={item.completed ? styles.completed : styles.task}>
                {item.title}
              </Text>
            </TouchableOpacity>

            <Button title="X" onPress={() => deleteTask(item.id)} />
          </View>
        )}
      />
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
});
