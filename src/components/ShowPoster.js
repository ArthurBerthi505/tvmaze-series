import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function ShowPoster({ image, name, style }) {
  const uri = image?.medium ?? image?.original;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  // image pode ser null. onError também cobre links de imagem indisponíveis.
  if (!uri || failed) {
    return (
      <View accessibilityLabel={`Sem imagem para ${name}`} style={[styles.fallback, style]}>
        <Text style={styles.symbol}>TV</Text>
        <Text style={styles.label}>SEM IMAGEM</Text>
      </View>
    );
  }

  return (
    <Image
      accessibilityLabel={`Capa de ${name}`}
      source={{ uri }}
      style={style}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', gap: 12 },
  symbol: { color: colors.accent, fontSize: 30, fontWeight: '800' },
  label: { color: colors.muted, fontSize: 10, fontWeight: '600', letterSpacing: 1 },
});
