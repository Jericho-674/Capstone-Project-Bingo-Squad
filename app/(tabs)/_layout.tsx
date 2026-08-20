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
            {/* Back Button */}
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="black" />
            </Pressable>

            {/* Header Title */}
            <Text style={styles.headerTitle}>Reflection Diary</Text>

            {/* Hamburger Menu */}
            <View>
              <Pressable onPress={() => setShowMenu(!showMenu)}>
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
                    <Ionicons name="book-outline" size={22} color="#3F2A88" />
                    <Text style={styles.dropdownText}>Reflector Home</Text>
                  </Pressable>

                  {/* Assessor Home */}
                  <Pressable
                    style={styles.dropdownOption}
                    onPress={() => {
                      setShowMenu(false);
                      router.push("/");
                    }}
                  >
                    <Ionicons
                      name="clipboard-outline"
                      size={22}
                      color="#E08E00"
                    />
                    <Text style={styles.dropdownText}>Assessor Home</Text>
                  </Pressable>

                  {/* Settings */}
                  <Pressable
                    style={styles.dropdownOption}
                    onPress={() => {
                      setShowMenu(false);
                      router.push("/");
                    }}
                  >
                    <Ionicons name="settings-outline" size={22} color="#000" />
                    <Text style={styles.dropdownText}>Settings</Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },

  headerTitle: {
    color: "#161221",
    fontSize: 18,
    fontWeight: "700",
  },

  dropdown: {
    position: "absolute",
    top: 38,
    right: 0,
    width: 190,
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
    gap: 12,
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
