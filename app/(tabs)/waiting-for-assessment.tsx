import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WaitingForAssessment() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="hourglass-outline" size={40} color="#3F2A88" />
        </View>

        <Text style={styles.title}>Waiting for Assessor</Text>

        <Text style={styles.subtitle}>
          Your reflection and self assessment have been submitted. An
          assessor will review your work soon.
        </Text>

        <Pressable
          style={styles.homeButton}
          onPress={() => router.push("/(tabs)/reflector-home")}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
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
    width: "85%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },

  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#EFEBFB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 35,
    lineHeight: 22,
  },

  homeButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#3F2A88",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  homeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
