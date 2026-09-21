import { router } from "expo-router";
import { ReflectionExitActions } from "../../components/reflection-exit-actions";

import { useRef, useState } from "react";

import { API_BASE_URL } from "../../services/api";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function NewReflection() {
  const today = new Date();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [title, setTitle] = useState("");
  const [projectGroup, setProjectGroup] = useState("");
  const [day, setDay] = useState(String(today.getDate()));
  const [month, setMonth] = useState(months[today.getMonth()]);
  const [year, setYear] = useState(String(today.getFullYear()));
  const [activeDateMenu, setActiveDateMenu] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const days = Array.from({ length: 31 }, (_, i) => `${i + 1}`);

  const years = ["2026", "2027", "2028", "2029", "2030"];

  const saving = useRef(false);
  const [errorMessage, setErrorMessage] = useState("");

  const resetForm = () => {
    const now = new Date();
    setTitle("");
    setProjectGroup("");
    setDay(String(now.getDate()));
    setMonth(months[now.getMonth()]);
    setYear(String(now.getFullYear()));
    setActiveDateMenu("");
    setErrorMessage("");
  };

  const handleExit = () => {
    if (saving.current) return;
    resetForm();
    router.replace("/(tabs)/reflection-list");
  };

  const handleContinue = async (exitAfterSave = false) => {
    if (saving.current) return;
    setErrorMessage("");
    if (!title.trim()) {
      setErrorMessage("Please enter a reflection title.");
      Alert.alert("Missing Information", "Please enter a reflection title.");
      return;
    }

    if (!projectGroup.trim()) {
      setErrorMessage("Please enter a project or gig.");
      Alert.alert("Missing Information", "Please enter a project or gig.");
      return;
    }

    if (!day || !month || !year) {
      setErrorMessage("Please select a complete date.");
      Alert.alert("Missing Information", "Please select a complete date.");
      return;
    }

    const selectedDate = new Date(Number(year), months.indexOf(month), Number(day));
    if (selectedDate.getDate() !== Number(day) || selectedDate.getMonth() !== months.indexOf(month)) {
      setErrorMessage("Please select a valid date.");
      return;
    }

    try {
      saving.current = true;
      setIsLoading(true);

      const monthNumber = months.indexOf(month) + 1;
      const formattedMonth = String(monthNumber).padStart(2, "0");
      const formattedDay = String(day).padStart(2, "0");

      const reflectionDate = `${year}-${formattedMonth}-${formattedDay}`;

      const response = await fetch(`${API_BASE_URL}/api/reflections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: 1,
          title: title.trim(),
          project_group: projectGroup.trim(),
          reflection_date: reflectionDate,
          worked_on: "",
          challenges: "",
          learned: "",
          improvement: "",
          status: "draft",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create reflection");
      }

      console.log("Reflection created:", data);

      resetForm();
      if (exitAfterSave) {
        router.replace("/(tabs)/reflection-list");
        return;
      }

      router.push({
        pathname: "/(tabs)/reflection",
        params: {
          reflectionId: String(data.reflectionId),
        },
      });
    } catch (error) {
      console.error("Error creating reflection:", error);
      setErrorMessage("Could not save the reflection. Please try again.");

      Alert.alert(
        "Error",
        "Could not create the reflection. Please try again.",
      );
    } finally {
      saving.current = false;
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Basic Information</Text>

        <Text style={styles.subtitle}>Tell us about your reflection</Text>

        {/* Reflection Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Reflection Title</Text>

          <TextInput
            editable={!isLoading}
            style={styles.input}
            placeholder="e.g. Project Reflection"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Project/Gig */}
        <View style={styles.field}>
          <Text style={styles.label}>Project/Gig</Text>

          <TextInput
            editable={!isLoading}
            style={styles.input}
            placeholder="What was worked on? e.g.: Name of Project"
            placeholderTextColor="#999"
            value={projectGroup}
            onChangeText={setProjectGroup}
          />
        </View>

        {/* Date */}
        <View style={styles.field}>
          <Text style={styles.label}>Date</Text>

          <View style={styles.dateRow}>
            {/* Day */}
            <View style={styles.dateContainer}>
              <Pressable
                disabled={isLoading}
                style={styles.dateInput}
                onPress={() => {
                  setActiveDateMenu(activeDateMenu === "day" ? "" : "day");
                }}
              >
                <Text style={day ? styles.selectedText : styles.placeholder}>
                  {day || "Day"}
                </Text>

                <Text style={styles.arrow}>▼</Text>
              </Pressable>

              {activeDateMenu === "day" && (
                <View style={styles.dateDropdown}>
                  <ScrollView nestedScrollEnabled>
                    {days.map((item) => (
                      <Pressable
                        key={item}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setDay(item);
                          setActiveDateMenu("");
                        }}
                      >
                        <Text style={styles.dropdownText}>{item}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Month */}
            <View style={styles.dateContainer}>
              <Pressable
                disabled={isLoading}
                style={styles.dateInput}
                onPress={() => {
                  setActiveDateMenu(activeDateMenu === "month" ? "" : "month");
                }}
              >
                <Text style={month ? styles.selectedText : styles.placeholder}>
                  {month || "Month"}
                </Text>

                <Text style={styles.arrow}>▼</Text>
              </Pressable>

              {activeDateMenu === "month" && (
                <View style={styles.dateDropdown}>
                  <ScrollView nestedScrollEnabled>
                    {months.map((item) => (
                      <Pressable
                        key={item}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setMonth(item);
                          setActiveDateMenu("");
                        }}
                      >
                        <Text style={styles.dropdownText}>{item}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Year */}
            <View style={styles.dateContainer}>
              <Pressable
                disabled={isLoading}
                style={styles.dateInput}
                onPress={() => {
                  setActiveDateMenu(activeDateMenu === "year" ? "" : "year");
                }}
              >
                <Text style={year ? styles.selectedText : styles.placeholder}>
                  {year || "Year"}
                </Text>

                <Text style={styles.arrow}>▼</Text>
              </Pressable>

              {activeDateMenu === "year" && (
                <View style={styles.dateDropdown}>
                  <ScrollView nestedScrollEnabled>
                    {years.map((item) => (
                      <Pressable
                        key={item}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setYear(item);
                          setActiveDateMenu("");
                        }}
                      >
                        <Text style={styles.dropdownText}>{item}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </View>

        {!!errorMessage && <Text accessibilityRole="alert" style={{ color: "#B42318", marginBottom: 12 }}>{errorMessage}</Text>}

        {/* Continue */}
        <Pressable
          style={[styles.continueButton, isLoading && styles.disabledButton]}
          onPress={() => handleContinue()}
          disabled={isLoading}
        >
          <Text style={styles.continueButtonText}>
            {isLoading ? "Creating..." : "Continue"}
          </Text>
        </Pressable>
        <ReflectionExitActions busy={isLoading}
          onSaveAndExit={() => handleContinue(true)} onExit={handleExit} />
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
    fontSize: 14,
  },

  arrow: {
    position: "absolute",
    right: 10,
    color: "#3F2A88",
    fontSize: 12,
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

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  dateContainer: {
    width: "31%",
    position: "relative",
  },

  dateInput: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingRight: 28,
    justifyContent: "center",
  },

  dateDropdown: {
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    zIndex: 100,
    elevation: 10,
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

  disabledButton: {
    opacity: 0.6,
  },

  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});