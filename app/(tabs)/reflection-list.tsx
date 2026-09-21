import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { router, useFocusEffect } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useMemo, useRef, useState } from "react";

import { rankReflections, type SearchableReflection } from "../../services/reflectionSearch";
import { DeleteDraftDialog } from "../../components/delete-draft-dialog";
import { deleteReflectionDraft } from "../../services/reflectionDrafts";

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

interface ReflectionItem extends SearchableReflection {
  id: string;
  title: string;
  status: Status;
  submittedDate?: string;
  progress?: number;
  canDeleteDraft: boolean;
}

type ReflectionRecord = {
  challenges?: string | null;
  id: number | string;
  improvement?: string | null;
  learned?: string | null;
  other_reflection?: string | null;
  project_group?: string | null;
  reflection_date?: string | null;
  status?: string | null;
  title?: string | null;
  updated_at?: string | null;
  worked_on?: string | null;
};

type SelfAssessmentRecord = {
  collaboration?: number | string | null;
  communication?: number | string | null;
  contribution?: number | string | null;
  critical_thinking?: number | string | null;
  problem_solving?: number | string | null;
};

type AssessorAssessmentRecord = {
  assessor_score?: number | string | null;
  feedback?: string | null;
};

type EvidenceRecord = {
  file_name?: string | null;
};

type PortfolioReflection = {
  assessment: AssessorAssessmentRecord | null;
  evidence: EvidenceRecord[];
  reflection: ReflectionRecord;
  selfAssessment: SelfAssessmentRecord | null;
};

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

const formatDate = (
  value?: string | null
) => {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString();
};

const scoreText = (
  value?: number | string | null
) =>
  value === null ||
  value === undefined ||
  value === ""
    ? "Not available"
    : `${value} / 5`;

async function fetchJsonOrNull<T>(
  url: string,
  signal?: AbortSignal
): Promise<T | null> {
  const response =
    await fetch(url, { signal });

  if (
    response.status === 404
  ) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status}`
    );
  }

  return response.json();
}

const buildPortfolioHtml = (
  items: PortfolioReflection[]
) => {
  const generatedAt =
    new Date().toLocaleString();

  const sections =
    items
      .map(
        ({
          assessment,
          evidence,
          reflection,
          selfAssessment,
        }) => {
          const evidenceList =
            evidence.length > 0
              ? evidence
                  .map(
                    (item) =>
                      `<li>${escapeHtml(item.file_name || "Unnamed evidence")}</li>`
                  )
                  .join("")
              : "<li>No evidence recorded.</li>";

          return `
            <section class="reflection">
              <div class="status">${escapeHtml(reflection.status || "unknown")}</div>
              <h2>${escapeHtml(reflection.title || "Untitled Reflection")}</h2>
              <dl class="meta">
                <div><dt>Project Group</dt><dd>${escapeHtml(reflection.project_group || "Not provided")}</dd></div>
                <div><dt>Date</dt><dd>${escapeHtml(formatDate(reflection.reflection_date || reflection.updated_at))}</dd></div>
              </dl>

              <h3>What was worked on?</h3>
              <p>${escapeHtml(reflection.worked_on || "Not provided")}</p>

              <h3>Challenges</h3>
              <p>${escapeHtml(reflection.challenges || "Not provided")}</p>

              <h3>What I learned</h3>
              <p>${escapeHtml(reflection.learned || "Not provided")}</p>

              <h3>Future Improvements</h3>
              <p>${escapeHtml(reflection.improvement || "Not provided")}</p>

              ${
                reflection.other_reflection
                  ? `<h3>Other Reflection</h3><p>${escapeHtml(reflection.other_reflection)}</p>`
                  : ""
              }

              <h3>Self Assessment</h3>
              <ul class="scores">
                <li><span>Contribution</span><strong>${escapeHtml(scoreText(selfAssessment?.contribution))}</strong></li>
                <li><span>Communication</span><strong>${escapeHtml(scoreText(selfAssessment?.communication))}</strong></li>
                <li><span>Collaboration</span><strong>${escapeHtml(scoreText(selfAssessment?.collaboration))}</strong></li>
                <li><span>Critical Thinking</span><strong>${escapeHtml(scoreText(selfAssessment?.critical_thinking))}</strong></li>
                <li><span>Problem Solving</span><strong>${escapeHtml(scoreText(selfAssessment?.problem_solving))}</strong></li>
              </ul>

              <h3>Assessor Score</h3>
              <p>${escapeHtml(scoreText(assessment?.assessor_score))}</p>

              <h3>Assessor Feedback</h3>
              <p>${escapeHtml(assessment?.feedback || "No assessor feedback recorded.")}</p>

              <h3>Evidence</h3>
              <ul>${evidenceList}</ul>
            </section>
          `;
        }
      )
      .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            color: #171321;
            font-family: Arial, Helvetica, sans-serif;
            margin: 36px;
          }

          h1 {
            color: #3f2a88;
            font-size: 30px;
            margin: 0 0 6px;
          }

          .subtitle {
            color: #625c70;
            font-size: 13px;
            margin: 0 0 28px;
          }

          .reflection {
            border-top: 2px solid #3f2a88;
            page-break-inside: avoid;
            padding-top: 18px;
            margin-bottom: 32px;
          }

          .status {
            color: #3f2a88;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
          }

          h2 {
            font-size: 22px;
            margin: 4px 0 12px;
          }

          h3 {
            color: #3f2a88;
            font-size: 14px;
            margin: 16px 0 6px;
          }

          p {
            font-size: 12px;
            line-height: 1.5;
            margin: 0;
          }

          ul {
            margin: 0;
            padding-left: 18px;
          }

          li {
            font-size: 12px;
            line-height: 1.5;
          }

          .meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin: 0 0 14px;
          }

          .meta div,
          .scores li {
            background: #f3f0fb;
            border-radius: 8px;
            padding: 8px 10px;
          }

          dt {
            color: #625c70;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
          }

          dd {
            font-size: 12px;
            margin: 3px 0 0;
          }

          .scores {
            display: grid;
            gap: 7px;
            list-style: none;
            padding: 0;
          }

          .scores li {
            display: flex;
            justify-content: space-between;
          }
          .toolbar { padding: 16px; margin-bottom: 24px; background: #EFEBFB; border-radius: 12px; }
          .toolbar button { padding: 12px 18px; background: #3F2A88; color: white; border: 0; border-radius: 8px; cursor: pointer; }
          p { white-space: pre-wrap; overflow-wrap: anywhere; }
          @media print { .toolbar { display: none; } }
        </style>
      </head>
      <body>
        <div class="toolbar"><button id="print-portfolio" type="button">Print / Save as PDF</button>
        <p>Choose Save as PDF in the print dialog. Drafts are included and labelled.</p></div>
        <h1>Bingo Squad Reflection Portfolio</h1>
        <p class="subtitle">Generated ${escapeHtml(generatedAt)}</p>
        ${sections}
      </body>
    </html>
  `;
};

export default function ReflectionList() {
  const [loadError, setLoadError] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const exporting = useRef(false);
  const [draftToDelete, setDraftToDelete] = useState<ReflectionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const deleting = useRef(false);
  const deletedDraftIds = useRef(new Set<string>());
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

        setReflections(data.filter(item => !deletedDraftIds.current.has(String(item.id))).map(item => {
          const status = normaliseStatus(item.status);
          return {
            id: String(item.id),
            title: item.title?.trim() || "Untitled Reflection",
            status,
            // Unknown statuses must not acquire a destructive action through the display fallback.
            canDeleteDraft: item.status === "draft",
            submittedDate: status !== "Draft" && item.updated_at
              ? new Date(item.updated_at).toLocaleDateString()
              : undefined,
            progress: status === "Draft" ? 0.5 : undefined,
            projectGroup: item.project_group,
            workedOn: item.worked_on,
            challenges: item.challenges,
            learned: item.learned,
            improvement: item.improvement,
            otherReflection: item.other_reflection,
            updatedAt: item.updated_at,
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

  const handleRequestDelete = (item: ReflectionItem) => {
    if (!item.canDeleteDraft || deleting.current) return;
    setDeleteError("");
    setDeleteMessage("");
    setDraftToDelete(item);
  };

  const handleDeleteDraft = async () => {
    if (!draftToDelete?.canDeleteDraft || deleting.current) return;
    const draft = draftToDelete;
    deleting.current = true;
    setIsDeleting(true);
    setDeleteError("");

    try {
      await deleteReflectionDraft(API_BASE_URL, draft.id);
      deletedDraftIds.current.add(draft.id);
      setReflections(current => current.filter(item => item.id !== draft.id));
      setDraftToDelete(null);
      setDeleteMessage(`Draft “${draft.title}” deleted.`);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Could not delete this draft. Please try again.");
    } finally {
      deleting.current = false;
      setIsDeleting(false);
    }
  };

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

  const filteredReflections = useMemo(() => {
    const statusFiltered = reflections.filter(item =>
      activeFilter === "All" || item.status === activeFilter
    );
    return rankReflections(statusFiltered, searchText);
  }, [reflections, activeFilter, searchText]);

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
      if (data.length === 0) {
        preview?.close();
        setExportMessage("Nothing to export yet. Save a reflection first, then try again.");
        return;
      }

      // Retain the team's scores, feedback and evidence names in portfolio exports.
      const portfolioItems: PortfolioReflection[] = [];
      for (const reflection of data) {
        const id = reflection.id;
        const [selfAssessment, assessment, evidence] = await Promise.all([
          fetchJsonOrNull<SelfAssessmentRecord>(`${API_BASE_URL}/api/self-assessments/${id}`, controller.signal),
          fetchJsonOrNull<AssessorAssessmentRecord>(`${API_BASE_URL}/api/assessments/${id}`, controller.signal),
          fetchJsonOrNull<EvidenceRecord[]>(`${API_BASE_URL}/api/evidence/reflection/${id}`, controller.signal),
        ]);
        portfolioItems.push({ reflection, selfAssessment, assessment, evidence: evidence || [] });
      }
      clearTimeout(timeout);
      const html = buildPortfolioHtml(portfolioItems);
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
          {!!deleteMessage && (
            <Text accessibilityRole="alert" style={styles.exportMessage}>{deleteMessage}</Text>
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
                    <View key={item.id} style={styles.card}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Open ${item.title}`}
                      disabled={isDeleting}
                      style={({
                        pressed,
                      }) => [
                        styles.cardOpenButton,

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
                    {item.canDeleteDraft && (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Delete draft ${item.title}`}
                        disabled={isDeleting}
                        onPress={() => handleRequestDelete(item)}
                        style={({ pressed }) => [styles.deleteDraftButton, pressed && styles.cardPressed, isDeleting && styles.disabledButton]}
                      >
                        <Ionicons name="trash-outline" size={18} color="#B42318" />
                        <Text style={styles.deleteDraftText}>Delete draft</Text>
                      </Pressable>
                    )}
                    </View>
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
      <DeleteDraftDialog
        visible={draftToDelete !== null}
        title={draftToDelete?.title ?? ""}
        busy={isDeleting}
        error={deleteError}
        onCancel={() => { if (!deleting.current) setDraftToDelete(null); }}
        onConfirm={() => { void handleDeleteDraft(); }}
      />
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
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E5E5E5",
      borderRadius: 14,
      padding: 14,
      gap: 12,
    },

    cardOpenButton: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 60 },
    deleteDraftButton: { minHeight: 44, paddingHorizontal: 12, alignSelf: "flex-end", flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: "#F2C5C0", borderRadius: 10, backgroundColor: "#FFF5F4" },
    deleteDraftText: { color: "#B42318", fontWeight: "600", fontSize: 14 },

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
