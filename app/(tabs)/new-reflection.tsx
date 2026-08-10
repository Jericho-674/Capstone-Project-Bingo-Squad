import DateTimePicker from "@react-native-community/datetimepicker";
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

export default function NewReflection() {
  const [reflectionType, setReflectionType] = useState("");
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ADD REFLECTION TYPES HERE LATER
  const reflectionTypes = ["Placeholder"];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Basic Information</Text>
        <Text style={styles.subtitle}>Tell us about your reflection</Text>

        {/* Reflection Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Reflection Title</Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. Project Reflection"
            placeholderTextColor="#999"
          />
        </View>

        {/* Reflection Type */}
        <View style={styles.field}>
          <Text style={styles.label}>Reflection Type</Text>

          <Pressable
            style={styles.input}
            onPress={() => setShowTypeMenu(!showTypeMenu)}
          >
            <Text
              style={reflectionType ? styles.selectedText : styles.placeholder}
            >
              {reflectionType || "Select reflection type"}
            </Text>

            <Text style={styles.arrow}>▼</Text>
          </Pressable>

          {showTypeMenu && (
            <View style={styles.dropdown}>
              {reflectionTypes.map((type) => (
                <Pressable
                  key={type}
                  style={styles.dropdownOption}
                  onPress={() => {
                    setReflectionType(type);
                    setShowTypeMenu(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{type}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Project/Gig */}
        <View style={styles.field}>
          <Text style={styles.label}>Project/Gig</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter project or gig"
            placeholderTextColor="#999"
          />
        </View>

        {/* Date */}
        <View style={styles.field}>
          <Text style={styles.label}>Date</Text>

          <Pressable
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.selectedText}>{date.toLocaleDateString()}</Text>

            <Text style={styles.calendar}>📅</Text>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);

                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}
        </View>

        {/* Continue */}
        <Pressable
          style={styles.continueButton}
          onPress={() => router.push("/(tabs)/reflection")}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
    paddingBottom: 30,
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

  field: {
    marginBottom: 22,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },

  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    paddingHorizontal: 15,
    justifyContent: "center",
  },

  placeholder: {
    color: "#999",
    fontSize: 15,
  },

  selectedText: {
    color: "#000",
    fontSize: 15,
  },

  arrow: {
    position: "absolute",
    right: 15,
    color: "#3F2A88",
    fontSize: 14,
  },

  calendar: {
    position: "absolute",
    right: 15,
    fontSize: 18,
  },

  dropdown: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    marginTop: 5,
    overflow: "hidden",
  },

  dropdownOption: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },

  dropdownText: {
    fontSize: 15,
    color: "#000",
  },

  continueButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#3F2A88",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
