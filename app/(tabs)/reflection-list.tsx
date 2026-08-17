import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Status = "Draft" | "Submitted" | "Assessed";

interface ReflectionItem {
  id: string;
  title: string;
  status: Status;
  submittedDate?: string; // shown for Submitted / Assessed
  progress?: number; // 0-1, shown for Draft
  selected: boolean;
}

const FILTERS: ("All" | Status)[] = ["All", "Draft", "Submitted", "Assessed"];

// No real drafts/submissions exist yet - starts empty until storage is wired up
const initialReflections: ReflectionItem[] = [];

export default function ReflectionList() {
  const [reflections, setReflections] = useState<ReflectionItem[]>(initialReflections);
  const [activeFilter, setActiveFilter] = useState<"All" | Status>("All");
  const [searchText, setSearchText] = useState("");

  const toggleSelected = (id: string) => {
    setReflections((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const filteredReflections = useMemo(() => {
    return reflections.filter((item) => {
      const matchesFilter = activeFilter === "All" || item.status === activeFilter;
      const matchesSearch = item.title
        .toLowerCase()
        .includes(searchText.trim().toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [reflections, activeFilter, searchText]);

  const iconFor = (status: Status) => {
    switch (status) {
      case "Assessed":
        return "checkmark-circle";
      case "Submitted":
        return "document-text";
      default:
        return "document";
    }
  };

  const handleExportPortfolio = () => {
    // EXPORT PORTFOLIO FUNCTIONALITY GOES HERE
  };

  const isFilteredOrSearched = activeFilter !== "All" || searchText.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Filter tabs */}
          <View style={styles.filterRow}>
            {FILTERS.map((filter) => {
              const active = filter === activeFilter;
              return (
                <Pressable
                  key={filter}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      active && styles.filterTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Header */}
          <Text style={styles.title}>Export Portfolio</Text>
          <Text style={styles.subtitle}>Export your own reflection</Text>

          {/* Reflection list */}
          <View style={styles.list}>
            {filteredReflections.map((item) => (
              <Pressable
                key={item.id}
                style={styles.card}
                onPress={() => toggleSelected(item.id)}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name={iconFor(item.status)} size={20} color="#3F2A88" />
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.title}</Text>

                  {item.status === "Draft" ? (
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${(item.progress ?? 0) * 100}%` },
                        ]}
                      />
                    </View>
                  ) : (
                    <Text style={styles.cardMeta}>
                      Submitted {item.submittedDate}
                    </Text>
                  )}
                </View>

                <View
                  style={[
                    styles.checkbox,
                    item.selected && styles.checkboxChecked,
                  ]}
                >
                  {item.selected && (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  )}
                </View>
              </Pressable>
            ))}

            {filteredReflections.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {isFilteredOrSearched
                    ? "No reflections match this filter."
                    : "You haven't created any reflections yet."}
                </Text>
                {!isFilteredOrSearched && (
                  <Text style={styles.emptyStateSubtext}>
                    Tap "Create New Reflection" below to get started.
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Actions */}
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push("/(tabs)/new-reflection")}
          >
            <Ionicons name="add" size={18} color="#FFF" />
            <Text style={styles.primaryButtonText}>Create New Reflection</Text>
          </Pressable>

          <Pressable style={styles.primaryButton} onPress={handleExportPortfolio}>
            <Ionicons name="share-outline" size={18} color="#FFF" />
            <Text style={styles.primaryButtonText}>Export portfolio</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Search bar */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reflections"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          <Ionicons name="mic-outline" size={18} color="#888" />
        </View>

        {searchText.length > 0 && (
          <Pressable
            style={styles.searchClear}
            onPress={() => setSearchText("")}
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close" size={18} color="#000" />
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  scrollContent: {
    paddingBottom: 20,
  },

  content: {
    width: "90%",
    alignSelf: "center",
    paddingTop: 15,
  },

  filterRow: {
    flexDirection: "row",
    backgroundColor: "#EFEBFB",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },

  filterPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },

  filterPillActive: {
    backgroundColor: "#3F2A88",
  },

  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3F2A88",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },

  subtitle: {
    fontSize: 14,
    color: "#555",
    marginTop: 3,
    marginBottom: 20,
  },

  list: {
    gap: 12,
    marginBottom: 25,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },

  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFEBFB",
    alignItems: "center",
    justifyContent: "center",
  },

  cardInfo: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
  },

  cardMeta: {
    fontSize: 12,
    color: "#888",
  },

  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E5E5E5",
    overflow: "hidden",
    width: "90%",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#3F2A88",
    borderRadius: 3,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#3F2A88",
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxChecked: {
    backgroundColor: "#3F2A88",
  },

  emptyState: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  emptyStateText: {
    color: "#555",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  emptyStateSubtext: {
    color: "#888",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
  },

  primaryButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#3F2A88",
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  searchBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: "5%",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    backgroundColor: "#F8F8F8",
  },

  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EDEDED",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 44,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
  },

  searchClear: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EDEDED",
    alignItems: "center",
    justifyContent: "center",
  },
});
