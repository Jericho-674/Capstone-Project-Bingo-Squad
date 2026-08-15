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

        header: () => (
          <View style={styles.header}>
            {/* Back Button */}
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="black" />
            </Pressable>

            {/* Hamburger Menu */}
            <View>
              <Pressable onPress={() => setShowMenu(!showMenu)}>
                <Ionicons name="menu" size={28} color="black" />
              </Pressable>

              {/* Dropdown Menu */}
              {showMenu && (
                <View style={styles.dropdown}>
                  {/* Home */}
                  <Pressable
                    style={styles.dropdownOption}
                    onPress={() => {
                      setShowMenu(false);
                      router.push("/(tabs)");
                    }}
                  >
                    <Ionicons name="home-outline" size={22} color="#000" />

                    <Text style={styles.dropdownText}>Home</Text>
                  </Pressable>

                  {/* Profile */}
                  <Pressable
                    style={styles.dropdownOption}
                    onPress={() => {
                      setShowMenu(false);
                      // PROFILE FUNCTIONALITY GOES HERE
                    }}
                  >
                    <Ionicons name="person-outline" size={22} color="#000" />

                    <Text style={styles.dropdownText}>Profile</Text>
                  </Pressable>

                  {/* Log Out */}
                  <Pressable
                    style={styles.dropdownOption}
                    onPress={() => {
                      setShowMenu(false);
                      // LOG OUT FUNCTIONALITY GOES HERE
                    }}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={22}
                      color="#D00000"
                    />

                    <Text style={styles.logoutText}>Log Out</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        ),

        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="new-reflection"
        options={{
          title: "New Reflection",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="reflection"
        options={{
          href: null,
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

  dropdown: {
    position: "absolute",
    top: 38,
    right: 0,
    width: 170,
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

  logoutText: {
    fontSize: 17,
    color: "#D00000",
  },
});
