import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../../services/api";

interface Reflection {
  id: number;
  title: string;
  project_group: string;
  reflection_date: string;
  status: "draft" | "submitted" | "assessed";
  created_at: string;
}

const RECENT_COUNT = 3;

export default function HomeScreen() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good Morning!";
    } else if (hour < 18) {
      return "Good Afternoon!";
    } else {
      return "Good Evening!";
    }
  };

  const greeting = getGreeting();

  const loadReflections = useCallback(async () => {
    try {
      setErrorMessage("");

      const response = await fetch(`${API_BASE_URL}/api/reflections`);

      if (!response.ok) {
        throw new Error("Failed to load reflections");
      }

      const data = await response.json();
      setReflections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading reflections:", error);
      setErrorMessage("Could not load your reflections.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Refetch every time this screen comes into focus, so a reflection
  // created/submitted/assessed elsewhere shows up here right away.
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadReflections();
    }, [loadReflections]),
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadReflections();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusLabel = (status: Reflection["status"]) => {
    switch (status) {
      case "submitted":
        return "Submitted";
      case "assessed":
        return "Assessed";
      default:
        return "Draft";
    }
  };

  const goToReflection = (item: Reflection) => {
    if (item.status === "assessed") {
      router.push({
        pathname: "/(tabs)/assessment-result",
        params: { reflectionId: String(item.id) },
      });
      return;
    }

    if (item.status === "submitted") {
      router.push({
        pathname: "/(tabs)/waiting-for-assessment",
        params: { reflectionId: String(item.id) },
      });
      return;
    }

    router.push({
      pathname: "/(tabs)/reflection",
      params: { reflectionId: String(item.id) },
    });
  };

  // Most recent draft, if any - reflections are already ordered newest first
  const draftReflection = reflections.find((item) => item.status === "draft");

  const recentReflections = reflections.slice(0, RECENT_COUNT);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.title}>{greeting}</Text>
          <Text style={styles.subtitle}>Keep reflecting. Keep growing!</Text>
        </View>

        {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        {/* Continue Draft */}
        <View style={styles.draftCard}>
          <Text style={styles.draftTitle}>Continue Draft</Text>

          <View style={styles.divider} />

          {isLoading ? (
            <View style={styles.emptyDraft}>
              <ActivityIndicator color="#3F2A88" />
            </View>
          ) : draftReflection ? (
            <Pressable
              style={styles.draftContent}
              onPress={() => goToReflection(draftReflection)}
            >
              <Text style={styles.draftName} numberOfLines={1}>
                {draftReflection.title}
              </Text>

              <Text style={styles.draftMeta}>
                {draftReflection.project_group}
              </Text>

              <Text style={styles.draftContinueText}>Tap to continue →</Text>
            </Pressable>
          ) : (
            <View style={styles.emptyDraft}>
              <Text style={styles.emptyDraftText}>
                You have no reflections drafted.
              </Text>
            </View>
          )}
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

          <Pressable onPress={() => router.push("/reflection-list")}>
            <Text style={styles.viewAll}>View All</Text>
          </Pressable>
        </View>

        <View style={styles.reflectionList}>
          {isLoading ? (
            <View style={styles.reflectionCard}>
              <ActivityIndicator color="#3F2A88" />
            </View>
          ) : recentReflections.length === 0 ? (
            <View style={styles.reflectionCard}>
              <Text style={styles.emptyReflectionText}>Nothing here</Text>
            </View>
          ) : (
            recentReflections.map((item) => (
              <Pressable
                key={item.id}
                accessibilityHint={`Opens ${item.title}`}
                accessibilityRole="button"
                style={[styles.reflectionCard, styles.filledReflectionCard]}
                onPress={() => goToReflection(item)}
              >
                <View>
                  <Text style={styles.reflectionTitle} numberOfLines={1}>
                    {item.title}
                  </Text>

                  <Text style={styles.reflectionMeta}>
                    {statusLabel(item.status)} ·{" "}
                    {formatDate(item.reflection_date)}
                  </Text>
                </View>

                <Text style={styles.arrow}>›</Text>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
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
    marginTop: 10,
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

  errorText: {
    color: "#B42318",
    marginBottom: 12,
  },

  draftCard: {
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#000",
    minHeight: 130,
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

  draftContent: {
    padding: 20,
  },

  draftName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#161221",
  },

  draftMeta: {
    fontSize: 13,
    color: "#6B6675",
    marginTop: 4,
  },

  draftContinueText: {
    fontSize: 14,
    color: "#3F2A88",
    fontWeight: "600",
    marginTop: 10,
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
    marginBottom: 30,
  },

  reflectionCard: {
    width: "100%",
    minHeight: 70,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  filledReflectionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  reflectionTitle: {
    color: "#161221",
    fontSize: 16,
    fontWeight: "700",
  },

  reflectionMeta: {
    color: "#6B6675",
    fontSize: 13,
    marginTop: 4,
  },

  arrow: {
    fontSize: 32,
    color: "#3F2A88",
  },

  emptyDraft: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 15,
  },

  emptyDraftText: {
    color: "#888",
    fontSize: 15,
    textAlign: "center",
  },

  emptyReflectionText: {
    color: "#888",
    fontSize: 15,
  },
});
