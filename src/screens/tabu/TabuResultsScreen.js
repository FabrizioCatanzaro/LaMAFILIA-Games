import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function TabuResultsScreen({ route, navigation }) {
  const { 
    teams, 
    isFinal = true, 
    currentRound = 1, 
    totalRounds = 1,
    selectedCategories,
    roundDuration,
    usedWords = []
  } = route.params;

  // Ordenar equipos por puntaje (mayor a menor)
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  const goHome = () => {
    navigation.popToTop();
  };

  const playAgain = () => {
    navigation.popToTop();
    navigation.navigate('TabuConfig');
  };

  const nextRound = () => {
    // Ir a la siguiente ronda
    navigation.replace('TabuPreGame', {
      teams,
      currentTeamIndex: 0,
      selectedCategories,
      roundDuration,
      usedWords,
      currentRound: currentRound + 1,
      totalRounds,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {isFinal ? (
          <Text style={styles.title}>🏆 Resultados Finales 🏆</Text>
        ) : (
          <>
            <Text style={styles.title}>📊 Resultados Ronda {currentRound}</Text>
            <Text style={styles.subtitle}>Quedan {totalRounds - currentRound} ronda(s)</Text>
          </>
        )}
      </View>

      <ScrollView style={styles.resultsContainer}>
        {sortedTeams.map((team, index) => (
          <View
            key={team.id}
            style={[
              styles.teamCard,
              index === 0 && styles.winnerCard,
            ]}
          >
            <View style={styles.positionBadge}>
              <Text style={styles.positionText}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}°`}
              </Text>
            </View>
            <Text style={styles.teamName}>{team.name}</Text>
            <Text style={styles.teamScore}>{team.score} pts</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttonsContainer}>
        {!isFinal ? (
          // Botón para siguiente ronda
          <TouchableOpacity style={styles.nextRoundButton} onPress={nextRound}>
            <Text style={styles.nextRoundButtonText}>
              ➡️ Siguiente Ronda ({currentRound + 1} de {totalRounds})
            </Text>
          </TouchableOpacity>
        ) : (
          // Botones finales
          <>
            <TouchableOpacity style={styles.playAgainButton} onPress={playAgain}>
              <Text style={styles.playAgainButtonText}>🔄 Jugar de Nuevo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.homeButton} onPress={goHome}>
              <Text style={styles.homeButtonText}>🏠 Menú Principal</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    backgroundColor: '#f39c12',
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultsContainer: {
    flex: 1,
    padding: 15,
  },
  teamCard: {
    backgroundColor: '#2c3e50',
    padding: 20,
    marginVertical: 8,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  winnerCard: {
    backgroundColor: '#f39c12',
    elevation: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  positionBadge: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  positionText: {
    fontSize: 32,
  },
  teamName: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  teamScore: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonsContainer: {
    padding: 15,
  },
  playAgainButton: {
    backgroundColor: '#3498db',
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
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3498db',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#3498db',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  nextRoundButton: {
    backgroundColor: '#2ecc71',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  nextRoundButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  }
});