import { router } from "expo-router";
import { useState } from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Reflection() {
  const [workedOn, setWorkedOn] = useState("");
  const [challenges, setChallenges] = useState("");
  const [learning, setLearning] = useState("");
  const [improvements, setImprovements] = useState("");
  const [otherReflection, setOtherReflection] = useState("");

  const handleSaveDraft = () => {
    // SAVE DRAFT FUNCTIONALITY GOES HERE
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Writing Reflection...</Text>

        <Text style={styles.subtitle}>
          Take some time to reflect on your experience.
        </Text>

        {/* What was worked on? */}
        <View style={styles.section}>
          <Text style={styles.label}>What was worked on?</Text>

          <TextInput
            style={styles.textBox}
            multiline
            textAlignVertical="top"
            placeholder="Describe the task/project/gig worked on."
            placeholderTextColor="#999"
            value={workedOn}
            onChangeText={setWorkedOn}
            maxLength={2000}
          />

          <Text style={styles.wordCount}>
            {workedOn.length} / 2000 characters
          </Text>
        </View>

        {/* Challenges */}
        <View style={styles.section}>
          <Text style={styles.label}>What challenges were faced?</Text>

          <TextInput
            style={styles.textBox}
            multiline
            textAlignVertical="top"
            placeholder="Describe some setbacks for example."
            placeholderTextColor="#999"
            value={challenges}
            onChangeText={setChallenges}
            maxLength={2000}
          />

          <Text style={styles.wordCount}>
            {challenges.length} / 2000 characters
          </Text>
        </View>

        {/* Learning */}
        <View style={styles.section}>
          <Text style={styles.label}>
            What did you learn from this experience?
          </Text>

          <TextInput
            style={styles.textBox}
            multiline
            textAlignVertical="top"
            placeholder="What was learnt, new, or insightful to you?"
            placeholderTextColor="#999"
            value={learning}
            onChangeText={setLearning}
            maxLength={2000}
          />

          <Text style={styles.wordCount}>
            {learning.length} / 2000 characters
          </Text>
        </View>

        {/* Improvements */}
        <View style={styles.section}>
          <Text style={styles.label}>
            What improvements will be made for the future?
          </Text>

          <TextInput
            style={styles.textBox}
            multiline
            textAlignVertical="top"
            placeholder="What can be done differently next project/gig?"
            placeholderTextColor="#999"
            value={improvements}
            onChangeText={setImprovements}
            maxLength={2000}
          />

          <Text style={styles.wordCount}>
            {improvements.length} / 2000 characters
          </Text>
        </View>

        {/* Additional Reflection */}
        <View style={styles.section}>
          <Text style={styles.label}>
            What else would you like to reflect on?
          </Text>

          <TextInput
            style={styles.textBox}
            multiline
            textAlignVertical="top"
            placeholder="Write down any other thoughts you may have..."
            placeholderTextColor="#999"
            value={otherReflection}
            onChangeText={setOtherReflection}
            maxLength={2000}
          />

          <Text style={styles.wordCount}>
            {otherReflection.length} / 2000 characters
          </Text>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable style={styles.saveButton} onPress={handleSaveDraft}>
            <Text style={styles.saveButtonText}>Save Draft</Text>
          </Pressable>

          <Pressable
            style={styles.nextButton}
            onPress={() => router.push("/upload-evidence")}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </Pressable>
        </View>
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
    fontSize: 16,
    color: "#555",
    marginTop: 5,
    marginBottom: 30,
  },

  section: {
    marginBottom: 30,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#000",
  },

  textBox: {
    width: "100%",
    height: 150,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
  },

  wordCount: {
    marginTop: 6,
    textAlign: "right",
    color: "#777",
    fontSize: 13,
  },

  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 5,
  },

  saveButton: {
    flex: 1,
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#3F2A88",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  saveButtonText: {
    color: "#3F2A88",
    fontSize: 16,
    fontWeight: "600",
  },

  nextButton: {
    flex: 1,
    height: 50,
    backgroundColor: "#3F2A88",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
