import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function AssessorQueue() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Reflections to Assess</Text>
        <Text style={styles.subtitle}>
          Review and score submitted reflections.
        </Text>

        <View style={styles.emptyState}>
          <Ionicons
            name="clipboard-outline"
            size={28}
            color="#B0B0B0"
            style={styles.emptyStateIcon}
          />
          <Text style={styles.emptyStateText}>No files to review.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  content: {
    width: "90%",
    alignSelf: "center",
    paddingTop: 15,
    paddingBottom: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },

  subtitle: {
    fontSize: 15,
    color: "#555",
    marginTop: 5,
    marginBottom: 25,
  },

  emptyState: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  emptyStateIcon: {
    marginBottom: 10,
  },

  emptyStateText: {
    color: "#555",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});
