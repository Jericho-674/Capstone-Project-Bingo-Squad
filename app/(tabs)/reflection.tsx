import { StyleSheet, Text, View } from "react-native";

export default function Reflection() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reflection Page</Text>
      <Text style={styles.subtitle}>It works!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
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
  },
});
