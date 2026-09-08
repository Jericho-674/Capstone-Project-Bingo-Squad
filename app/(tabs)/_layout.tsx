import { Tabs, router } from "expo-router";

import React, { useState } from "react";

import { HapticTab } from "@/components/haptic-tab";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { Colors } from "@/constants/theme";

import { useColorScheme } from "@/hooks/use-color-scheme";

import { Ionicons } from "@expo/vector-icons";

import { Pressable, StyleSheet, Text, View } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const [showMenu, setShowMenu] = useState(false);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,

        // Hide the bottom tab bar
        tabBarStyle: { display: "none" },

        header: () => (
          <View style={styles.header}>
            {/* Header Title */}
            <Text style={styles.headerTitle}>Reflection Diary</Text>

            {/* Hamburger Menu */}
            <View>
              <Pressable
                onPress={() => setShowMenu(!showMenu)}
                accessibilityRole="button"
                accessibilityLabel="Open menu"
              >
                <Ionicons name="menu" size={28} color="black" />
              </Pressable>

              {/* Dropdown Menu */}
              {showMenu && (
                <View style={styles.dropdown}>
                  {/* Role Selection */}
                  <Pressable
                    style={styles.dropdownOption}
                    onPress={() => {
                      setShowMenu(false);
                      router.push("/");
                    }}
                  >
                    <Ionicons
                      name="swap-horizontal-outline"
                      size={22}
                      color="#D00000"
                    />
                    <Text style={styles.roleSelectionText}>Role Selection</Text>
                  </Pressable>

                  {/* Reflector Home */}
                  <Pressable
                    style={styles.dropdownOption}
                    onPress={() => {
                      setShowMenu(false);
                      router.push("/(tabs)/reflector-home");
                    }}
                  >
                    <Ionicons name="book-outline" size={22} color="#2E7D32" />
                    <Text style={styles.dropdownText}>Reflector Home</Text>
                  </Pressable>

                  {/* Reflection History */}
                  <Pressable
                    style={styles.dropdownOption}
                    onPress={() => {
                      setShowMenu(false);
                      router.push("/reflection-list");
                    }}
                  >
                    <Ionicons name="time-outline" size={22} color="#3F2A88" />
                    <Text style={styles.dropdownText}>Reflection History</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        ),

        // Keep this as-is
        tabBarButton: HapticTab,
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      {/* New Reflection */}
      <Tabs.Screen
        name="new-reflection"
        options={{
          title: "New Reflection",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />

      {/* Reflection */}
      <Tabs.Screen
        name="reflection"
        options={{
          href: null,
        }}
      />

      {/* Assessment Result */}
      <Tabs.Screen
        name="assessment-result"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 80,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    position: "relative",
  },

  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 45,
    textAlign: "center",
    color: "#161221",
    fontSize: 18,
    fontWeight: "700",
  },

  dropdown: {
    position: "absolute",
    top: 38,
    right: 0,
    width: 215,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
    zIndex: 1000,
    elevation: 5,
  },

  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },

  dropdownText: {
    fontSize: 17,
    color: "#000",
  },

  roleSelectionText: {
    fontSize: 17,
    color: "#D00000",
  },
});
