import { StyleSheet, Text, View } from "react-native";

export default function NewReflection() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Boo hehe</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
