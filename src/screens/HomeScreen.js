import { useEffect, useState } from "react";
import {
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import RequestState from "../components/RequestState";
import ShowPoster from "../components/ShowPoster";
import { colors } from "../theme";
import { requestErrorMessage } from "../utils/requestError";

export default function HomeScreen({ navigation }) {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    async function loadShows() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("https://api.tvmaze.com/shows", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(
            `Não foi possível consultar as séries (HTTP ${response.status}). Tente novamente.`,
          );
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error(
            "A API retornou um formato inesperado para as séries.",
          );
        }
        if (active) {
          setShows(data.filter((show) => show && Number.isInteger(show.id)));
        }
      } catch (requestError) {
        if (active) setError(requestErrorMessage(requestError, "as séries"));
      } finally {
        clearTimeout(timeout);
        if (active) setLoading(false);
      }
    }

    loadShows();

    // Evita atualizar estado depois de sair da tela e cancela a requisição.
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  if (loading)
    return <RequestState loading message="Buscando suas próximas séries…" />;
  if (error)
    return (
      <RequestState
        message={error}
        onRetry={() => setAttempt((value) => value + 1)}
      />
    );

  function renderShow({ item }) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver episódios de ${item.name || "Série sem nome"}`}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        onPress={() =>
          navigation.navigate("Detalhes", {
            id: item.id,
            name: item.name || "Série sem nome",
            image: item.image,
            genres: item.genres ?? [],
          })
        }
      >
        <ShowPoster image={item.image} name={item.name} style={styles.poster} />
        <View style={styles.cardInfo}>
          <Text numberOfLines={2} style={styles.name}>
            {item.name || "Série sem nome"}
          </Text>
          <Text numberOfLines={1} style={styles.genre}>
            {item.genres?.join(" · ") || "Sem gênero informado"}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={shows}
        renderItem={renderShow}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 24 },
        ]}
        ListHeaderComponent={
          <View style={styles.intro}>
            <Text style={styles.eyebrow}>SEU GUIA DE SÉRIES</Text>
            <Text style={styles.title}>
              A próxima história{"\n"}começa aqui.
            </Text>
            <Text style={styles.description}>
              Explore o catálogo e descubra cada episódio.
            </Text>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Para explorar</Text>
              <Text style={styles.count}>{shows.length} séries</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhuma série encontrada.</Text>
        }
        ListFooterComponent={
          <Text
            style={styles.credit}
            onPress={() =>
              Linking.openURL("https://www.tvmaze.com/api").catch(() => {})
            }
          >
            Dados: TVmaze · CC BY-SA
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, width: "100%", maxWidth: 720, alignSelf: "center" },
  list: { paddingHorizontal: 20 },
  columns: { justifyContent: "space-between" },
  intro: { paddingTop: 16, paddingBottom: 18 },
  eyebrow: {
    color: colors.accent,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "800",
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 37,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 28,
  },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  count: {
    color: colors.accent,
    fontSize: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  card: {
    width: "47.7%",
    marginBottom: 22,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.7 },
  poster: { width: "100%", aspectRatio: 210 / 295 },
  cardInfo: { padding: 12, gap: 6 },
  name: { color: colors.text, fontSize: 15, lineHeight: 20, fontWeight: "700" },
  genre: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  empty: { color: colors.muted, paddingVertical: 32, textAlign: "center" },
  credit: {
    color: colors.muted,
    fontSize: 11,
    textAlign: "center",
    paddingVertical: 18,
  },
});
