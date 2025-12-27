import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

export default function ImpostorResultScreen({ route, navigation }) {
  const { winner, secretWord, players, roles, eliminatedPlayers } = route.params;

  // Separar jugadores por rol
  const impostors = players
    .map((name, index) => ({ name, role: roles[index] }))
    .filter((p) => p.role === 'IMPOSTOR');

  const civils = players
    .map((name, index) => ({ name, role: roles[index] }))
    .filter((p) => p.role === 'CIVIL');

  // Volver a jugar con la misma configuración
  const playAgain = () => {
    const { previousConfig } = route.params;
    navigation.navigate('ImpostorConfig', {
      previousConfig: previousConfig || {
        players: players.map((name, i) => name),
        impostorCount: impostors.length,
        showHint: true,
        selectedCategories: [1],
        difficulty: 'easy',
        gameDuration: 5,
      }
    });
  };

  // Volver al menú principal
  const goHome = () => {
    navigation.popToTop();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Banner de resultado */}
      <View
        style={[
          styles.resultBanner,
          winner === 'CIVIL' && styles.civilWin,
          winner === 'IMPOSTOR' && styles.impostorWin,
          winner === 'NONE' && styles.noWinner,
        ]}
      >
        {winner === 'CIVIL' && (
          <>
            <Text style={styles.resultEmoji}>🎉</Text>
            <Text style={styles.resultTitle}>¡GANARON LOS CIVILES!</Text>
            <Text style={styles.resultSubtitle}>
              Eliminaron a todos los impostores
            </Text>
          </>
        )}

        {winner === 'IMPOSTOR' && (
          <>
            <Text style={styles.resultEmoji}>😈</Text>
            <Text style={styles.resultTitle}>¡GANARON LOS IMPOSTORES!</Text>
            <Text style={styles.resultSubtitle}>
              Lograron igualar o superar a los civiles
            </Text>
          </>
        )}

        {winner === 'NONE' && (
          <>
            <Text style={styles.resultEmoji}>⏸️</Text>
            <Text style={styles.resultTitle}>JUEGO TERMINADO</Text>
            <Text style={styles.resultSubtitle}>
              El juego fue terminado manualmente
            </Text>
          </>
        )}
      </View>

      {/* Palabra secreta */}
      <View style={styles.secretWordSection}>
        <Text style={styles.secretWordLabel}>La palabra secreta era:</Text>
        <Text style={styles.secretWordText}>{secretWord}</Text>
      </View>

      {/* Revelar roles */}
      <View style={styles.rolesSection}>
        <Text style={styles.sectionTitle}>🔴 Los Impostores</Text>
        {impostors.map((impostor, index) => (
          <View key={index} style={[styles.playerCard, styles.impostorCard]}>
            <Text style={styles.playerCardName}>{impostor.name}</Text>
            <Text style={styles.playerCardRole}>IMPOSTOR</Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
          🟢 Los Civiles
        </Text>
        {civils.map((civil, index) => (
          <View key={index} style={[styles.playerCard, styles.civilCard]}>
            <Text style={styles.playerCardName}>{civil.name}</Text>
            <Text style={styles.playerCardRole}>CIVIL</Text>
          </View>
        ))}
      </View>

      {/* Jugadores eliminados */}
      {eliminatedPlayers && eliminatedPlayers.length > 0 && (
        <View style={styles.eliminatedSection}>
          <Text style={styles.sectionTitle}>
            ⚰️ Jugadores Eliminados ({eliminatedPlayers.length})
          </Text>
          {eliminatedPlayers.map((player, index) => (
            <View key={index} style={styles.eliminatedCard}>
              <Text style={styles.eliminatedName}>{player.name}</Text>
              <Text style={styles.eliminatedRole}>
                {player.role === 'IMPOSTOR' ? '🔴 Impostor' : '🟢 Civil'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.playAgainButton} onPress={playAgain}>
          <Text style={styles.playAgainButtonText}>🔄 Jugar de Nuevo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeButton} onPress={goHome}>
          <Text style={styles.homeButtonText}>🏠 Menú Principal</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  resultBanner: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  civilWin: {
    backgroundColor: '#2ecc71',
  },
  impostorWin: {
    backgroundColor: '#e74c3c',
  },
  noWinner: {
    backgroundColor: '#95a5a6',
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  secretWordSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 15,
    marginHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
  },
  secretWordLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  secretWordText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  rolesSection: {
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
    marginLeft: 5,
  },
  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
  },
  impostorCard: {
    backgroundColor: '#e74c3c',
  },
  civilCard: {
    backgroundColor: '#2ecc71',
  },
  playerCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  playerCardRole: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  eliminatedSection: {
    paddingHorizontal: 10,
    marginTop: 20,
  },
  eliminatedCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#95a5a6',
  },
  eliminatedName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  eliminatedRole: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    paddingHorizontal: 10,
    marginTop: 20,
  },
  playAgainButton: {
    backgroundColor: '#6200ee',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 5,
  },
  playAgainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6200ee',
    elevation: 3,
  },
  homeButtonText: {
    color: '#6200ee',
    fontSize: 18,
    fontWeight: 'bold',
  },
});