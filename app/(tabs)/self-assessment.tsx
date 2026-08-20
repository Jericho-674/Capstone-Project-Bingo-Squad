import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const MAX_STARS = 4;

const competencies = [
  "Contribution",
  "Communication",
  "Collaboration",
  "Critical thinking",
  "Problem Solving",
] as const;

type Competency = (typeof competencies)[number];

export default function SelfAssessment() {
  const [ratings, setRatings] = useState<Record<Competency, number>>({
    Contribution: 0,
    Communication: 0,
    Collaboration: 0,
    "Critical thinking": 0,
    "Problem Solving": 0,
  });

  const setRating = (competency: Competency, value: number) => {
    setRatings((prev) => ({ ...prev, [competency]: value }));
  };

  const handleSubmit = () => {
    // SUBMIT SELF ASSESSMENT FUNCTIONALITY GOES HERE
    router.push("/assessment-result");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Self Assessment</Text>
        <Text style={styles.subtitle}>Rate yourself for each competency.</Text>

        {/* Competency rows */}
        <View style={styles.list}>
          {competencies.map((competency) => (
            <View key={competency} style={styles.row}>
              <Text style={styles.rowLabel}>{competency}</Text>

              <View style={styles.starRow}>
                {Array.from({ length: MAX_STARS }, (_, i) => i + 1).map(
                  (star) => {
                    const filled = star <= ratings[competency];
                    return (
                      <Pressable
                        key={star}
                        onPress={() => setRating(competency, star)}
                        hitSlop={6}
                        accessibilityLabel={`Rate ${competency} ${star} out of ${MAX_STARS}`}
                      >
                        <Ionicons
                          name={filled ? "star" : "star-outline"}
                          size={22}
                          color={filled ? "#E08E00" : "#B0B0B0"}
                          style={styles.star}
                        />
                      </Pressable>
                    );
                  },
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Submit */}
        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Self Assessment</Text>
        </Pressable>
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
    paddingTop: 10,
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

  list: {
    gap: 18,
    marginBottom: 30,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
  },

  rowLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  starRow: {
    flexDirection: "row",
  },

  star: {
    marginLeft: 6,
  },

  submitButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#3F2A88",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
