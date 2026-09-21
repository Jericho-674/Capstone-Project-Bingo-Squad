import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { router, useFocusEffect } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useMemo, useRef, useState } from "react";

import { API_BASE_URL } from "../../services/api";

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

interface ReflectionItem {
  id: string;
  title: string;
  status: Status;
  submittedDate?: string;
  progress?: number;
}

const FILTERS: (
  | "All"
  | Status
)[] = [
  "All",
  "Draft",
  "Submitted",
  "Assessed",
];

type ApiReflection = {
  id: string | number;
  title?: string | null;
  status?: string | null;
  project_group?: string | null;
  reflection_date?: string | null;
  updated_at?: string | null;
  worked_on?: string | null;
  challenges?: string | null;
  learned?: string | null;
  improvement?: string | null;
  other_reflection?: string | null;
};

const normaliseStatus = (value?: string | null): Status => {
  switch (String(value ?? "").trim().toLowerCase()) {
    case "submitted": return "Submitted";
    case "assessed": return "Assessed";
    default: return "Draft";
  }
};

const escapeHtml = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const buildPortfolioHtml = (items: ApiReflection[]) => {
  const sections = items.map(item => {
    const fields = [
      ["What was worked on?", item.worked_on],
      ["What challenges were faced?", item.challenges],
      ["What did you learn from this experience?", item.learned],
      ["What improvements will be made for the future?", item.improvement],
      ["What else would you like to reflect on?", item.other_reflection],
    ];
    return `<section>
      <h2>${escapeHtml(item.title?.trim() || "Untitled Reflection")}</h2>
      <p><strong>Status:</strong> ${normaliseStatus(item.status)}</p>
      <p><strong>Project/Gig:</strong> ${escapeHtml(item.project_group || "Not provided")}</p>
      <p><strong>Date:</strong> ${escapeHtml(item.reflection_date?.slice(0, 10) || "Not provided")}</p>
      ${fields.map(([label, value]) => `<h3>${label}</h3><p class="answer">${escapeHtml(value || "Not provided")}</p>`).join("")}
    </section>`;
  }).join("");

  return `<!DOCTYPE html>
  <html lang="en"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reflection Portfolio</title>
  <style>
    body { font-family: Arial, sans-serif; color: #222; max-width: 850px; margin: 32px auto; padding: 0 24px; line-height: 1.5; }
    h1, h2 { color: #3F2A88; overflow-wrap: anywhere; }
    h3 { font-size: 16px; margin-bottom: 4px; break-after: avoid; }
    section { border-top: 1px solid #ddd; padding-top: 20px; margin-top: 28px; }
    .answer { white-space: pre-wrap; overflow-wrap: anywhere; margin-top: 0; }
    .toolbar { background: #EFEBFB; padding: 16px; border-radius: 12px; }
    button { background: #3F2A88; color: white; padding: 12px 18px; border: 0; border-radius: 8px; cursor: pointer; font-size: 16px; }
    @page { margin: 18mm; }
    @media print { .toolbar { display: none; } body { margin: 0; padding: 0; max-width: none; } section + section { break-before: page; } }
  </style></head><body>
    <div class="toolbar"><button id="print-portfolio" type="button">Print / Save as PDF</button>
    <p>Choose “Save as PDF” in the print dialog. Drafts are included and labelled.</p></div>
    <h1>Reflection Portfolio</h1>
    <p>Generated: ${escapeHtml(new Date().toLocaleString())}</p>
    <p>${items.length} saved reflection(s), including drafts.</p>
    ${sections}
  </body></html>`;
};

export default function ReflectionList() {
  const [loadError, setLoadError] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const exporting = useRef(false);
  const [
    reflections,
    setReflections,
  ] = useState<
    ReflectionItem[]
  >([]);

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<
    "All" | Status
  >("All");

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

  useFocusEffect(useCallback(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const loadReflections = async () => {
      setIsLoading(true);
      setLoadError("");
      setExportMessage("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/reflections`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        const data: ApiReflection[] = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid reflection response");
        if (!active) return;

        setReflections(data.map(item => {
          const status = normaliseStatus(item.status);
          return {
            id: String(item.id),
            title: item.title?.trim() || "Untitled Reflection",
            status,
            submittedDate: status !== "Draft" && item.updated_at
              ? new Date(item.updated_at).toLocaleDateString()
              : undefined,
            progress: status === "Draft" ? 0.5 : undefined,
          };
        }));
      } catch (error) {
        if (!active) return;
        console.error("Error loading reflections:", error);
        setLoadError("Could not refresh reflections. Check the backend connection and reopen this page. Any previously loaded items may be out of date.");
      } finally {
        clearTimeout(timeout);
        if (active) setIsLoading(false);
      }
    };

    void loadReflections();
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, []));

  // ====================================================
  // OPEN EXISTING REFLECTION
  // ====================================================

  const handleOpenReflection =
    (
      item: ReflectionItem
    ) => {
      console.log(
        "Opening reflection:",
        item.id,
        item.status
      );

      if (
        item.status ===
        "Draft"
      ) {
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
  // FILTER + SEARCH
  // ====================================================

  const filteredReflections =
    useMemo(() => {
      return reflections.filter(
        (item) => {
          const matchesFilter =
            activeFilter ===
              "All" ||
            item.status ===
              activeFilter;

          const matchesSearch =
            item.title
              .toLowerCase()
              .includes(
                searchText
                  .trim()
                  .toLowerCase()
              );

          return (
            matchesFilter &&
            matchesSearch
          );
        }
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

  const handleExportPortfolio = async () => {
    if (exporting.current) return;
    exporting.current = true;
    setIsExporting(true);
    setExportMessage("");

    let preview: Window | null = null;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      // Open during the click event, before awaiting requests, to avoid popup blocking.
      if (Platform.OS === "web") {
        preview = window.open("", "_blank");
        if (!preview) {
          setExportMessage("Your browser blocked the portfolio preview. Allow pop-ups for this site, then try Export Portfolio again.");
          return;
        }
        preview.opener = null;
        preview.document.title = "Preparing portfolio";
        preview.document.body.textContent = "Preparing your portfolio...";
      }

      const response = await fetch(
        `${API_BASE_URL}/api/reflections`,
        { signal: controller.signal }
      );
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      const data: ApiReflection[] = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid reflection response");
      clearTimeout(timeout);

      if (data.length === 0) {
        preview?.close();
        setExportMessage("Nothing to export yet. Save a reflection first, then try again.");
        return;
      }

      const html = buildPortfolioHtml(data);
      if (Platform.OS === "web") {
        if (!preview || preview.closed) {
          setExportMessage("The preview was closed. Click Export Portfolio to open it again.");
          return;
        }
        preview.document.open();
        preview.document.write(html);
        preview.document.close();
        const printWindow = preview;
        preview.document.getElementById("print-portfolio")?.addEventListener("click", () => {
          printWindow.focus();
          printWindow.print();
        });
        setExportMessage("Portfolio preview opened. Click Print / Save as PDF in the new tab, then choose Save as PDF.");
        return;
      }

      if (await Sharing.isAvailableAsync()) {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          UTI: "com.adobe.pdf",
          dialogTitle: "Export Reflection Portfolio",
        });
        setExportMessage("PDF generated. Use the share options to save or send it.");
      } else {
        await Print.printAsync({ html });
        setExportMessage("The print dialog was opened for your portfolio.");
      }
    } catch (error) {
      preview?.close();
      console.error("Export portfolio error:", error);
      setExportMessage("Could not export the portfolio. Check your backend connection and try again.");
    } finally {
      clearTimeout(timeout);
      exporting.current = false;
      setIsExporting(false);
    }
  };

  const isFilteredOrSearched =
    activeFilter !== "All" ||
    searchText.trim()
      .length > 0;

  // ====================================================
  // SCREEN
  // ====================================================

  return (
    <KeyboardAvoidingView
      style={
        styles.container
      }
      behavior={
        Platform.OS ===
        "ios"
          ? "padding"
          : "height"
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View
          style={
            styles.content
          }
        >
          {/* HEADER */}

          <Text
            style={
              styles.title
            }
          >
            Reflection History
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            View all of your reflections.
          </Text>

          {!!loadError && (
            <Text accessibilityRole="alert" style={styles.errorMessage}>
              {loadError}
            </Text>
          )}

          {/* FILTER TABS */}

          <View
            style={
              styles.filterRow
            }
          >
            {FILTERS.map(
              (filter) => {
                const active =
                  filter ===
                  activeFilter;

                return (
                  <Pressable
                    key={
                      filter
                    }
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

          {/* REFLECTION LIST */}

          <View
            style={
              styles.list
            }
          >
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
                      key={
                        item.id
                      }
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
                          name={
                            iconFor(
                              item.status
                            )
                          }
                          size={
                            20
                          }
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
                          numberOfLines={
                            1
                          }
                        >
                          {
                            item.title
                          }
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
                              {
                                item.status
                              }
                            </Text>

                            <Text
                              style={
                                styles.cardMeta
                              }
                            >
                              Updated{" "}
                              {
                                item.submittedDate
                              }
                            </Text>
                          </>
                        )}
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={
                          20
                        }
                        color="#888"
                      />
                    </Pressable>
                  )
                )}

                {!loadError && filteredReflections.length ===
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
                      {isFilteredOrSearched
                        ? "No reflections match this filter."
                        : "You haven't created any reflections yet."}
                    </Text>

                    {!isFilteredOrSearched && (
                      <Text
                        style={
                          styles.emptyStateSubtext
                        }
                      >
                        Tap &quot;Create New Reflection&quot; below to get started.
                      </Text>
                    )}
                  </View>
                )}
              </>
            )}
          </View>

          {/* CREATE NEW REFLECTION */}

          <Pressable
            style={({
              pressed,
            }) => [
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
              size={
                18
              }
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
          <Text style={styles.exportHint}>
            Exports all saved reflections, including drafts, regardless of the current filter or search.
          </Text>
          {!!exportMessage && (
            <Text accessibilityRole="alert" style={styles.exportMessage}>
              {exportMessage}
            </Text>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Export Portfolio"
            disabled={isExporting}
            style={({
              pressed,
            }) => [
              styles.secondaryButton,
              isExporting && styles.disabledButton,

              pressed &&
                styles.primaryButtonPressed,
            ]}
            onPress={
              handleExportPortfolio
            }
          >
            <Ionicons
              name="share-outline"
              size={
                18
              }
              color="#3F2A88"
            />

            <Text
              style={
                styles.secondaryButtonText
              }
            >
              {isExporting ? "Exporting..." : "Export Portfolio"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* SEARCH BAR */}

      <View
        style={
          styles.searchBarRow
        }
      >
        <View
          style={
            styles.searchBar
          }
        >
          <Ionicons
            name="search"
            size={
              18
            }
            color="#888"
          />

          <TextInput
            style={
              styles.searchInput
            }
            placeholder="Search reflections"
            placeholderTextColor="#999"
            value={
              searchText
            }
            onChangeText={
              setSearchText
            }
          />

          <Ionicons
            name="mic-outline"
            size={
              18
            }
            color="#888"
          />
        </View>

        {searchText.length >
          0 && (
          <Pressable
            style={
              styles.searchClear
            }
            onPress={() =>
              setSearchText(
                ""
              )
            }
            accessibilityLabel="Clear search"
          >
            <Ionicons
              name="close"
              size={
                18
              }
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

const styles =
  StyleSheet.create({
    errorMessage: { color: "#B42318", marginBottom: 16, fontSize: 14 },
    exportMessage: { color: "#3F2A88", marginBottom: 12, fontSize: 14 },
    exportHint: { color: "#555", marginBottom: 10, fontSize: 13 },
    disabledButton: { opacity: 0.6 },
    container: {
      flex: 1,
      backgroundColor:
        "#F8F8F8",
    },

    scrollContent: {
      paddingBottom: 20,
    },

    content: {
      width: "90%",
      alignSelf:
        "center",
      paddingTop: 15,
    },

    title: {
      fontSize: 22,
      fontWeight:
        "bold",
      color: "#000",
    },

    subtitle: {
      fontSize: 14,
      color: "#555",
      marginTop: 3,
      marginBottom: 20,
    },

    filterRow: {
      flexDirection:
        "row",
      backgroundColor:
        "#EFEBFB",
      borderRadius: 12,
      padding: 4,
      marginBottom: 20,
    },

    filterPill: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 10,
      alignItems:
        "center",
    },

    filterPillActive: {
      backgroundColor:
        "#3F2A88",
    },

    filterText: {
      fontSize: 13,
      fontWeight:
        "600",
      color: "#3F2A88",
    },

    filterTextActive: {
      color: "#FFFFFF",
    },

    list: {
      gap: 12,
      marginBottom: 25,
    },

    card: {
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E5E5E5",
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
      backgroundColor:
        "#EFEBFB",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    cardInfo: {
      flex: 1,
    },

    cardTitle: {
      fontSize: 15,
      fontWeight:
        "700",
      color: "#000",
      marginBottom: 4,
    },

    statusText: {
      fontSize: 12,
      fontWeight:
        "700",
      marginBottom: 5,
    },

    cardMeta: {
      fontSize: 12,
      color: "#888",
    },

    progressTrack: {
      height: 5,
      borderRadius: 3,
      backgroundColor:
        "#E5E5E5",
      overflow:
        "hidden",
      width: "90%",
    },

    progressFill: {
      height: "100%",
      backgroundColor:
        "#3F2A88",
      borderRadius: 3,
    },

    emptyState: {
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E5E5E5",
      borderRadius: 12,
      paddingVertical: 24,
      paddingHorizontal: 20,
      alignItems:
        "center",
    },

    emptyStateText: {
      color: "#555",
      fontSize: 14,
      fontWeight:
        "600",
      textAlign:
        "center",
    },

    emptyStateSubtext: {
      color: "#888",
      fontSize: 13,
      textAlign:
        "center",
      marginTop: 6,
    },

    primaryButton: {
      width: "100%",
      height: 50,
      backgroundColor:
        "#3F2A88",
      borderRadius: 15,
      flexDirection:
        "row",
      justifyContent:
        "center",
      alignItems:
        "center",
      gap: 8,
      marginBottom: 12,
    },

    secondaryButton: {
      width: "100%",
      height: 50,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1.5,
      borderColor:
        "#3F2A88",
      borderRadius: 15,
      flexDirection:
        "row",
      justifyContent:
        "center",
      alignItems:
        "center",
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
      fontWeight:
        "600",
    },

    secondaryButtonText: {
      color: "#3F2A88",
      fontSize: 16,
      fontWeight:
        "600",
    },

    searchBarRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
      paddingHorizontal:
        "5%",
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor:
        "#E5E5E5",
      backgroundColor:
        "#F8F8F8",
    },

    searchBar: {
      flex: 1,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
      backgroundColor:
        "#EDEDED",
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
      backgroundColor:
        "#EDEDED",
      alignItems:
        "center",
      justifyContent:
        "center",
    },
  });