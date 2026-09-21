import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  title: string;
  busy: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteDraftDialog({
  visible,
  title,
  busy,
  error,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => { if (!busy) onCancel(); }}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={styles.dialogContent} bounces={false}>
            <Text accessibilityRole="header" style={styles.heading}>Delete draft?</Text>
            <Text style={styles.draftTitle} numberOfLines={3}>{title}</Text>
            <Text style={styles.description}>
              This permanently removes this draft and its saved assessment and evidence records.
              This cannot be undone.
            </Text>
            {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={onCancel}
              style={[styles.button, styles.cancelButton, busy && styles.disabled]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={busy ? "Deleting draft" : "Confirm delete draft"}
              accessibilityState={{ disabled: busy, busy }}
              disabled={busy}
              onPress={onConfirm}
              style={[styles.button, styles.deleteButton, busy && styles.disabled]}
            >
              <Text style={styles.deleteText}>{busy ? "Deleting..." : "Delete draft"}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.45)", justifyContent: "center", padding: 24 },
  dialog: { width: "100%", maxWidth: 440, maxHeight: "100%", alignSelf: "center", backgroundColor: "#FFFFFF", borderRadius: 16, overflow: "hidden" },
  dialogContent: { padding: 24, gap: 16 },
  heading: { fontSize: 20, fontWeight: "700", color: "#000000" },
  draftTitle: { fontSize: 16, fontWeight: "600", color: "#3F2A88" },
  description: { fontSize: 15, lineHeight: 22, color: "#555555" },
  error: { fontSize: 14, lineHeight: 20, color: "#B42318" },
  button: { minHeight: 48, padding: 12, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cancelButton: { borderWidth: 1, borderColor: "#3F2A88" },
  cancelText: { fontSize: 16, fontWeight: "600", color: "#3F2A88" },
  deleteButton: { backgroundColor: "#B42318" },
  deleteText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
  disabled: { opacity: 0.6 },
});
