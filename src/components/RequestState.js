import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors } from "../theme";

// As duas telas usam os mesmos estados visuais de carregamento e erro.
export default function RequestState({ loading = false, message, onRetry }) {
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.accent}
          accessibilityLabel="Carregando"
        />
      ) : (
        <Text style={styles.icon}>!</Text>
      )}
      <Text
        accessibilityRole={loading ? "text" : "alert"}
        style={styles.message}
      >
        {message}
      </Text>
      {!loading && onRetry && (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Tentar novamente</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 20,
  },
  icon: { color: colors.danger, fontSize: 32, fontWeight: "800" },
  message: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  buttonText: { color: colors.accentText, fontSize: 15, fontWeight: "700" },
});
