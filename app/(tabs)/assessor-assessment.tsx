import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const MAX_STARS = 5;

const competencies = [
  "Contribution",
  "Communication",
  "Collaboration",
  "Critical thinking",
  "Problem Solving",
] as const;

type Competency = (typeof competencies)[number];

export default function AssessorAssessment() {
  const [ratings, setRatings] = useState<Record<Competency, number>>({
    Contribution: 0,
    Communication: 0,
    Collaboration: 0,
    "Critical thinking": 0,
    "Problem Solving": 0,
  });
  const [feedback, setFeedback] = useState("");

  const setRating = (competency: Competency, value: number) => {
    setRatings((prev) => ({ ...prev, [competency]: value }));
  };

  const validateRatings = () => {
    return competencies.every((competency) => ratings[competency] >= 1);
  };

  const handleSubmit = () => {
    if (!validateRatings()) {
      Alert.alert(
        "Incomplete Assessment",
        "Please rate all five competencies before submitting."
      );
      return;
    }

    // SUBMIT ASSESSMENT FUNCTIONALITY GOES HERE
    router.back();
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Assess Reflection</Text>
        <Text style={styles.subtitle}>
          Rate the student on each competency.
        </Text>

        {/* Scoring */}
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
                  }
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Feedback */}
        <View style={styles.field}>
          <Text style={styles.label}>Feedback (optional)</Text>
          <TextInput
            style={styles.feedbackBox}
            multiline
            textAlignVertical="top"
            placeholder="Add any notes for the student..."
            placeholderTextColor="#999"
            value={feedback}
            onChangeText={setFeedback}
            maxLength={2000}
          />
        </View>

        {/* Submit */}
        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Assessment</Text>
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
    gap: 14,
    marginBottom: 25,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  rowLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
    flex: 1,
  },

  starRow: {
    flexDirection: "row",
  },

  star: {
    marginLeft: 6,
  },

  field: {
    marginBottom: 25,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },

  feedbackBox: {
    width: "100%",
    height: 120,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
  },

  submitButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#E08E00",
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
