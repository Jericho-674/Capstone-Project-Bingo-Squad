import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RoleSelection() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting}>Hello, Name!</Text>

        <Text style={styles.title}>What will you be doing today?</Text>

        <Text style={styles.subtitle}>
          Choose how you'd like to use Reflection Diary.
        </Text>

        <Pressable
          style={[styles.roleButton, styles.reflectorButton]}
          onPress={() => router.push("/(tabs)/reflector-home")}
        >
          <Ionicons name="book-outline" size={28} color="#FFFFFF" />

          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>Reflector</Text>
            <Text style={styles.buttonSubtitle}>
              Reflect, record and track your growth
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.roleButton, styles.assessorButton]}
          onPress={() => {}}
        >
          <Ionicons name="clipboard-outline" size={28} color="#FFFFFF" />

          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>Assessor</Text>
            <Text style={styles.buttonSubtitle}>
              Review and provide feedback
            </Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  content: {
    flex: 1,
    width: "90%",
    alignSelf: "center",
    justifyContent: "flex-start",
    paddingTop: 120,
  },

  greeting: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3F2A88",
    textAlign: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 30,
  },

  roleButton: {
    width: "100%",
    minHeight: 90,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    marginBottom: 16,
  },

  reflectorButton: {
    backgroundColor: "#3F2A88",
  },

  assessorButton: {
    backgroundColor: "#E08E00",
  },

  buttonTextContainer: {
    marginLeft: 16,
    flex: 1,
  },

  buttonTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
  },

  buttonSubtitle: {
    color: "#FFFFFF",
    fontSize: 13,
    marginTop: 3,
    opacity: 0.9,
  },
});
