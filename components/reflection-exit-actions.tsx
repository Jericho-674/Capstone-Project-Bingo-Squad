import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  busy: boolean;
  saveDisabled?: boolean;
  onSaveAndExit: () => void | Promise<void>;
  onExit: () => void;
};

export function ReflectionExitActions({
  busy,
  saveDisabled = false,
  onSaveAndExit,
  onExit,
}: Props) {
  const [visible, setVisible] = useState(false);

  const closeDialog = () => {
    if (!busy) {
      setVisible(false);
    }
  };

  const handleSave = () => {
    if (busy || saveDisabled) return;

    // Close the dialog so any save error is visible on the page.
    setVisible(false);
    void onSaveAndExit();
  };

  const handleDiscard = () => {
    if (busy) return;

    setVisible(false);
    onExit();
  };

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={() => setVisible(true)}
        style={[
          styles.triggerButton,
          busy && styles.disabled,
        ]}
      >
        <Text style={styles.triggerText}>
          {busy ? "Saving..." : "Save Draft"}
        </Text>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={closeDialog}
      >
        <View style={styles.overlay}>
          <View
            style={styles.dialog}
            accessibilityViewIsModal
          >
            <Text style={styles.heading}>
              Save your reflection?
            </Text>

            <Text style={styles.description}>
              Save your changes before leaving, or exit without
              saving. Previously saved drafts will be kept.
            </Text>

            <Pressable
              accessibilityRole="button"
              disabled={busy || saveDisabled}
              onPress={handleSave}
              style={[
                styles.primaryButton,
                (busy || saveDisabled) && styles.disabled,
              ]}
            >
              <Text style={styles.primaryText}>
                Save and Exit
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={handleDiscard}
              style={[
                styles.secondaryButton,
                busy && styles.disabled,
              ]}
            >
              <Text style={styles.discardText}>
                Exit without Saving
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={closeDialog}
              style={[
                styles.secondaryButton,
                busy && styles.disabled,
              ]}
            >
              <Text style={styles.triggerText}>
                Keep Editing
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },

  triggerButton: {
    minHeight: 50,
    padding: 12,
    borderWidth: 2,
    borderColor: "#3F2A88",
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  triggerText: {
    color: "#3F2A88",
    fontSize: 16,
    fontWeight: "600",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    padding: 24,
  },

  dialog: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    gap: 16,
  },

  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },

  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#555555",
  },

  primaryButton: {
    minHeight: 50,
    padding: 12,
    borderRadius: 15,
    backgroundColor: "#3F2A88",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  secondaryButton: {
    minHeight: 50,
    padding: 12,
    borderWidth: 1,
    borderColor: "#3F2A88",
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  discardText: {
    color: "#B42318",
    fontSize: 16,
    fontWeight: "600",
  },

  disabled: {
    opacity: 0.6,
  },
});