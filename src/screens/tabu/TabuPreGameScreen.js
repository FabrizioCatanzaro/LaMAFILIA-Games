import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function TabuPreGameScreen({ route, navigation }) {
    const { teams, selectedCategories, roundDuration, currentTeamIndex = 0, usedWords = [], currentRound = 1, totalRounds = 1 } = route.params;

    const currentTeam = teams[currentTeamIndex];
    const [showCountdown, setShowCountdown] = useState(false);
    const [countdown, setCountdown] = useState(3);

  const startRound = () => {
    navigation.replace('TabuGame', {
      teams,
      selectedCategories,
      roundDuration,
      currentTeamIndex,
      usedWords,
      currentRound,
      totalRounds,
    });
  };
  
    // Countdown timer
    useEffect(() => {
      if (showCountdown && countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(countdown - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else if (showCountdown && countdown === 0) {
        // Cuando llega a 0, iniciar la ronda
        startRound();
      }
    }, [showCountdown, countdown]);

      // Pantalla de countdown
      if (showCountdown) {
        return (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownTitle}>¡Comienza el juego!</Text>
            <Text style={styles.startingPlayerText}>Arranca:</Text>
            <Text style={styles.startingPlayerName}>{currentTeam.name}</Text>
            <Text style={styles.countdownNumber}>{countdown}</Text>
          </View>
        );
      }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🎯 Ronda {currentRound} de {totalRounds}</Text>
        <Text style={styles.subtitle}>Arranca el turno de:</Text>
        <Text style={styles.teamName}>{currentTeam.name}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ⏱️ Duración: {roundDuration} segundos
          </Text>
          <Text style={styles.infoText}>
            📝 Explica la palabra sin usar las 5 prohibidas
          </Text>
          <Text style={styles.infoText}>
            ✅ Correcto = +1 punto
          </Text>
          <Text style={styles.infoText}>
            🚫 Prohibida = -1 punto
          </Text>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={() => setShowCountdown(true)}>
          <Text style={styles.startButtonText}>Comenzar</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          💡 Preparate: quien explica y quien adivina
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  teamName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 25,
    borderRadius: 15,
    marginBottom: 40,
    width: '100%',
  },
  infoText: {
    fontSize: 18,
    color: '#fff',
    marginVertical: 5,
  },
  startButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 15,
    elevation: 5,
  },
  startButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  hint: {
    fontSize: 16,
    color: '#fff',
    marginTop: 30,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  countdownContainer: {
    flex: 1,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  countdownTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
  },
  startingPlayerText: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 10,
  },
  startingPlayerName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 60,
    textAlign: 'center',
  },
  countdownNumber: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#fff',
  },
});