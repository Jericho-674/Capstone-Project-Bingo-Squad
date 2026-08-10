import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, StyleSheet, View } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        header: () => (
          <View style={styles.header}>
            <Pressable>
              <Ionicons name="arrow-back" size={28} color="black" />
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert("Menu", "Choose an Option", [
                  { text: "Profile", onPress: () => {} },
                  { text: "Settings", onPress: () => {} },
                  {
                    text: "Log Out",
                    style: "destructive",
                    onPress: () => {},
                  },
                  { text: "Cancel", style: "cancel" },
                ])
              }
            >
              <Ionicons name="menu" size={28} color="black" />
            </Pressable>
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
});
