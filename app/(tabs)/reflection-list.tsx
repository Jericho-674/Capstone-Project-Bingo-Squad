import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { API_BASE_URL } from "../../services/api";
import {
  rankReflections,
  type SearchableReflection,
} from "../../services/reflectionSearch";

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

type Status =
  | "Draft"
  | "Submitted"
  | "Assessed";

type ApiReflection = {
  id: number | string;
  title?: string | null;
  status?: string | null;
  project_group?: string | null;
  worked_on?: string | null;
  challenges?: string | null;
  learned?: string | null;
  improvement?: string | null;
  other_reflection?: string | null;
  updated_at?: string | null;
};

interface ReflectionItem
  extends SearchableReflection {
  id: string;
  title: string;
  status: Status;
  submittedDate?: string;
  progress?: number;
  projectGroup?: string | null;
  workedOn?: string | null;
  challenges?: string | null;
  learned?: string | null;
  improvement?: string | null;
  otherReflection?: string | null;
  updatedAt?: string | null;
}

const FILTERS: Array<
  "All" | Status
> = [
  "All",
  "Draft",
  "Submitted",
  "Assessed",
];

export default function ReflectionList() {
  const [
    reflections,
    setReflections,
  ] = useState<ReflectionItem[]>([]);

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<"All" | Status>("All");

  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  // ====================================================
  // LOAD REFLECTIONS
  // ====================================================

  const loadReflections = async () => {
    try {
      setIsLoading(true);

      console.log(
        "Loading reflections from backend..."
      );

      const response = await fetch(
        `${API_BASE_URL}/api/reflections`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load reflections: ${response.status}`
        );
      }

      const data =
        (await response.json()) as ApiReflection[];

      console.log(
        "Reflections received:",
        data
      );

      const formattedReflections:
        ReflectionItem[] = data.map(
        (item) => {
          const normalisedStatus =
            String(
              item.status ?? ""
            ).toLowerCase();

          const status: Status =
            normalisedStatus ===
            "submitted"
              ? "Submitted"
              : normalisedStatus ===
                  "assessed"
                ? "Assessed"
                : "Draft";

          return {
            id: String(item.id),

            title:
              item.title?.trim() ||
              "Untitled Reflection",

            status,

            submittedDate:
              normalisedStatus !==
                "draft" &&
              item.updated_at
                ? new Date(
                    item.updated_at
                  ).toLocaleDateString()
                : undefined,

            progress:
              normalisedStatus ===
              "draft"
                ? 0.5
                : undefined,

            projectGroup:
              item.project_group,

            workedOn:
              item.worked_on,

            challenges:
              item.challenges,

            learned:
              item.learned,

            improvement:
              item.improvement,

            otherReflection:
              item.other_reflection,

            updatedAt:
              item.updated_at,
          };
        }
      );

      setReflections(
        formattedReflections
      );
    } catch (error) {
      console.error(
        "Error loading reflections:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReflections();
  }, []);

  // ====================================================
  // OPEN EXISTING REFLECTION
  // ====================================================

  const handleOpenReflection = (
    item: ReflectionItem
  ) => {
    console.log(
      "Opening reflection:",
      item.id,
      item.status
    );

    if (item.status === "Draft") {
      router.push({
        pathname:
          "/(tabs)/reflection",

        params: {
          reflectionId:
            item.id,
        },
      });

      return;
    }

    router.push({
      pathname:
        "/(tabs)/assessment-result",

      params: {
        reflectionId:
          item.id,
      },
    });
  };

  // ====================================================
  // FILTER + LOCAL SEMANTIC SEARCH
  // ====================================================

  const filteredReflections =
    useMemo(() => {
      const statusFiltered =
        reflections.filter(
          (item) =>
            activeFilter ===
              "All" ||
            item.status ===
              activeFilter
        );

      return rankReflections(
        statusFiltered,
        searchText
      );
    }, [
      reflections,
      activeFilter,
      searchText,
    ]);

  // ====================================================
  // STATUS ICON
  // ====================================================

  const iconFor = (
    status: Status
  ) => {
    switch (status) {
      case "Assessed":
        return "checkmark-circle";

      case "Submitted":
        return "document-text";

      default:
        return "document";
    }
  };

  // ====================================================
  // STATUS COLOUR
  // ====================================================

  const statusColor = (
    status: Status
  ) => {
    switch (status) {
      case "Assessed":
        return "#2E7D32";

      case "Submitted":
        return "#3F2A88";

      default:
        return "#B26A00";
    }
  };

  // ====================================================
  // EXPORT PORTFOLIO
  // ====================================================

  const handleExportPortfolio =
    () => {
      console.log(
        "Export portfolio pressed"
      );

      // Existing export functionality can be added here.
    };

  const hasSearch =
    searchText.trim().length > 0;

  const isFilteredOrSearched =
    activeFilter !== "All" ||
    hasSearch;

  // ====================================================
  // SCREEN
  // ====================================================

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* HEADER */}

          <Text style={styles.title}>
            Reflection History
          </Text>

          <Text style={styles.subtitle}>
            View and search all of your
            reflections.
          </Text>

          {/* FILTER TABS */}

          <View
            style={styles.filterRow}
          >
            {FILTERS.map(
              (filter) => {
                const active =
                  filter ===
                  activeFilter;

                return (
                  <Pressable
                    key={filter}
                    style={[
                      styles.filterPill,

                      active &&
                        styles.filterPillActive,
                    ]}
                    onPress={() =>
                      setActiveFilter(
                        filter
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.filterText,

                        active &&
                          styles.filterTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>

          {/* SEARCH SUMMARY */}

          {hasSearch && (
            <View
              style={
                styles.searchSummary
              }
            >
              <Ionicons
                name="sparkles-outline"
                size={16}
                color="#3F2A88"
              />

              <Text
                style={
                  styles.searchSummaryText
                }
              >
                {filteredReflections.length}{" "}
                relevant{" "}
                {filteredReflections.length ===
                1
                  ? "reflection"
                  : "reflections"}{" "}
                found
              </Text>
            </View>
          )}

          {/* REFLECTION LIST */}

          <View style={styles.list}>
            {isLoading ? (
              <View
                style={
                  styles.emptyState
                }
              >
                <Text
                  style={
                    styles.emptyStateText
                  }
                >
                  Loading reflections...
                </Text>
              </View>
            ) : (
              <>
                {filteredReflections.map(
                  (item) => (
                    <Pressable
                      key={item.id}
                      style={({
                        pressed,
                      }) => [
                        styles.card,

                        pressed &&
                          styles.cardPressed,
                      ]}
                      onPress={() =>
                        handleOpenReflection(
                          item
                        )
                      }
                    >
                      <View
                        style={
                          styles.cardIcon
                        }
                      >
                        <Ionicons
                          name={iconFor(
                            item.status
                          )}
                          size={20}
                          color="#3F2A88"
                        />
                      </View>

                      <View
                        style={
                          styles.cardInfo
                        }
                      >
                        <Text
                          style={
                            styles.cardTitle
                          }
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>

                        {item.status ===
                        "Draft" ? (
                          <>
                            <Text
                              style={[
                                styles.statusText,

                                {
                                  color:
                                    statusColor(
                                      item.status
                                    ),
                                },
                              ]}
                            >
                              Draft
                            </Text>

                            <View
                              style={
                                styles.progressTrack
                              }
                            >
                              <View
                                style={[
                                  styles.progressFill,

                                  {
                                    width: `${
                                      (item.progress ??
                                        0) *
                                      100
                                    }%`,
                                  },
                                ]}
                              />
                            </View>
                          </>
                        ) : (
                          <>
                            <Text
                              style={[
                                styles.statusText,

                                {
                                  color:
                                    statusColor(
                                      item.status
                                    ),
                                },
                              ]}
                            >
                              {item.status}
                            </Text>

                            <Text
                              style={
                                styles.cardMeta
                              }
                            >
                              Updated{" "}
                              {item.submittedDate ??
                                "date unavailable"}
                            </Text>
                          </>
                        )}
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#888"
                      />
                    </Pressable>
                  )
                )}

                {filteredReflections.length ===
                  0 && (
                  <View
                    style={
                      styles.emptyState
                    }
                  >
                    <Text
                      style={
                        styles.emptyStateText
                      }
                    >
                      {hasSearch
                        ? "No reflections match this search."
                        : activeFilter !==
                            "All"
                          ? "No reflections match this filter."
                          : "You haven't created any reflections yet."}
                    </Text>

                    {hasSearch && (
                      <Text
                        style={
                          styles.emptyStateSubtext
                        }
                      >
                        Try a different topic,
                        challenge or related
                        word.
                      </Text>
                    )}

                    {!isFilteredOrSearched && (
                      <Text
                        style={
                          styles.emptyStateSubtext
                        }
                      >
                        Tap &quot;Create New
                        Reflection&quot; below
                        to get started.
                      </Text>
                    )}
                  </View>
                )}
              </>
            )}
          </View>

          {/* CREATE NEW REFLECTION */}

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,

              pressed &&
                styles.primaryButtonPressed,
            ]}
            onPress={() =>
              router.push(
                "/(tabs)/new-reflection"
              )
            }
          >
            <Ionicons
              name="add"
              size={18}
              color="#FFF"
            />

            <Text
              style={
                styles.primaryButtonText
              }
            >
              Create New Reflection
            </Text>
          </Pressable>

          {/* EXPORT */}

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,

              pressed &&
                styles.primaryButtonPressed,
            ]}
            onPress={
              handleExportPortfolio
            }
          >
            <Ionicons
              name="share-outline"
              size={18}
              color="#3F2A88"
            />

            <Text
              style={
                styles.secondaryButtonText
              }
            >
              Export Portfolio
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* LOCAL SEMANTIC SEARCH BAR */}

      <View style={styles.searchBarRow}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={18}
            color="#666"
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search by topic, challenge or learning"
            placeholderTextColor="#777"
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            clearButtonMode="never"
            accessibilityLabel="Search reflections by meaning"
          />

          <Ionicons
            name="sparkles-outline"
            size={18}
            color="#3F2A88"
          />
        </View>

        {searchText.length > 0 && (
          <Pressable
            style={styles.searchClear}
            onPress={() =>
              setSearchText("")
            }
            accessibilityLabel="Clear search"
          >
            <Ionicons
              name="close"
              size={18}
              color="#000"
            />
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

// ======================================================
// STYLES
// ======================================================

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

  filterRow: {
    flexDirection: "row",
    backgroundColor: "#EFEBFB",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
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

  searchSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFEBFB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 14,
  },

  searchSummaryText: {
    flex: 1,
    color: "#3F2A88",
    fontSize: 13,
    fontWeight: "600",
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

  cardPressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.99,
      },
    ],
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
    marginBottom: 4,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 5,
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

  secondaryButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#3F2A88",
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  primaryButtonPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  secondaryButtonText: {
    color: "#3F2A88",
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
    borderWidth: 1,
    borderColor: "#DDD8EE",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 46,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
  },

  searchClear: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EDEDED",
    alignItems: "center",
    justifyContent: "center",
  },
});