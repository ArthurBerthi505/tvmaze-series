import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import RequestState from "../components/RequestState";
import ShowPoster from "../components/ShowPoster";
import { colors } from "../theme";
import { requestErrorMessage } from "../utils/requestError";

export default function DetailsScreen({ route }) {
  // O id recebido da listagem é usado na URL da API abaixo.
  const { id, name = "Série", image, genres = [] } = route.params ?? {};
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    async function loadEpisodes() {
      setLoading(true);
      setError(null);

      try {
        if (!Number.isInteger(id) || id <= 0) {
          throw new Error(
            "Identificador inválido. Volte e selecione uma série.",
          );
        }
        const response = await fetch(
          `https://api.tvmaze.com/shows/${id}/episodes`,
          {
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          throw new Error(
            `Não foi possível consultar os episódios (HTTP ${response.status}). Tente novamente.`,
          );
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error(
            "A API retornou um formato inesperado para os episódios.",
          );
        }
        if (active) {
          setEpisodes(
            data.filter((episode) => episode && Number.isInteger(episode.id)),
          );
        }
      } catch (requestError) {
        if (active) setError(requestErrorMessage(requestError, "os episódios"));
      } finally {
        clearTimeout(timeout);
        if (active) setLoading(false);
      }
    }

    loadEpisodes();

    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [id, attempt]);

  if (loading)
    return <RequestState loading message="Carregando os episódios…" />;
  if (error)
    return (
      <RequestState
        message={error}
        onRetry={() => setAttempt((value) => value + 1)}
      />
    );

  function renderEpisode({ item }) {
    return (
      <View style={styles.episode}>
        <View style={styles.episodeNumber}>
          <Text style={styles.episodeNumberText}>{item.number ?? "—"}</Text>
        </View>
        <View style={styles.episodeInfo}>
          <Text style={styles.episodeMeta}>
            Temporada {item.season ?? "—"} · Episódio {item.number ?? "—"}
          </Text>
          <Text style={styles.episodeName}>
            {item.name || "Episódio sem nome"}
          </Text>
        </View>
        {item.runtime != null && (
          <Text style={styles.runtime}>{item.runtime} min</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={episodes}
        renderItem={renderEpisode}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 24 },
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View>
            <View style={styles.hero}>
              <ShowPoster image={image} name={name} style={styles.poster} />
              <View style={styles.heroInfo}>
                <Text style={styles.eyebrow}>CONHEÇA A SÉRIE</Text>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.genre}>
                  {genres?.join(" · ") || "Sem gênero informado"}
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>GUIA DE EPISÓDIOS</Text>
                </View>
              </View>
            </View>
            <View style={styles.heading}>
              <Text style={styles.headingTitle}>Episódios</Text>
              <Text style={styles.count}>{episodes.length} no total</Text>
            </View>
            <Text style={styles.description}>
              Na ordem de exibição. Encontre o seu próximo capítulo.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            Esta série ainda não possui episódios cadastrados.
          </Text>
        }
        ListFooterComponent={
          <Text style={styles.credit}>Dados: TVmaze · CC BY-SA</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, width: "100%", maxWidth: 720, alignSelf: "center" },
  list: { paddingHorizontal: 20 },
  hero: { flexDirection: "row", paddingTop: 16, paddingBottom: 26, gap: 18 },
  poster: { width: 106, height: 149, borderRadius: 12 },
  heroInfo: { flex: 1, justifyContent: "center" },
  eyebrow: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.6,
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  genre: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 8 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: 7,
    marginTop: 12,
  },
  badgeText: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 24,
  },
  headingTitle: { color: colors.text, fontSize: 23, fontWeight: "700" },
  count: { color: colors.accent, fontSize: 12 },
  description: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 22,
  },
  episode: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
  },
  episodeNumber: {
    width: 34,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  episodeNumberText: { color: colors.accent, fontSize: 17, fontWeight: "700" },
  episodeInfo: { flex: 1, gap: 5 },
  episodeMeta: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  episodeName: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  runtime: { color: colors.muted, fontSize: 10 },
  separator: { height: 10 },
  empty: {
    color: colors.muted,
    paddingVertical: 28,
    lineHeight: 22,
    textAlign: "center",
  },
  credit: {
    color: colors.muted,
    fontSize: 11,
    textAlign: "center",
    paddingVertical: 24,
  },
});
