import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={styles.title}>Good Morning, (Name)!</Text>

        <Text style={styles.subtitle}>Keep reflecting. Keep growing!</Text>
      </View>

      {/* Continue Draft */}
      <View style={styles.draftCard}>
        <Text style={styles.draftTitle}>Continue Draft</Text>

        <View style={styles.divider} />
      </View>

      {/* Create Reflection Button */}
      <Pressable
        style={styles.createButton}
        onPress={() => router.push("/new-reflection")}
      >
        <Text style={styles.buttonText}>+ Create New Reflection</Text>
      </Pressable>

      {/* Recent Reflections */}
      <View style={styles.recentHeader}>
        <Text style={styles.sectionTitle}>Recent Reflections</Text>

        <Text style={styles.viewAll}>View All</Text>
      </View>

      <View style={styles.reflectionList}>
        <Pressable style={styles.reflectionCard}>
          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable style={styles.reflectionCard}>
          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable style={styles.reflectionCard}>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 25,
  },

  greeting: {
    width: "100%",
    alignSelf: "center",
    marginBottom: 30,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },

  subtitle: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },

  draftCard: {
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#000",
    height: 180,
    paddingTop: 15,
    marginBottom: 20,
  },

  draftTitle: {
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginBottom: 15,
  },

  divider: {
    height: 2,
    backgroundColor: "#000",
    width: "100%",
  },

  createButton: {
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#3F2A88",
    borderRadius: 15,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },

  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  recentHeader: {
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  viewAll: {
    fontSize: 16,
    color: "#3F2A88",
  },
  reflectionList: {
    width: "95%",
    alignSelf: "center",
    gap: 12,
    marginTop: 12,
  },

  reflectionCard: {
    width: "100%",
    height: 70,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 20,
  },

  arrow: {
    fontSize: 32,
    color: "#3F2A88",
  },
});
