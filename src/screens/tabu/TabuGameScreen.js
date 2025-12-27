import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { tabuCategories } from '../../data/tabuWords';

export default function TabuGameScreen({ route, navigation }) {
    const { teams: initialTeams, selectedCategories, roundDuration, currentTeamIndex: initialTeamIndex = 0, usedWords: initialUsedWords = [], currentRound = 1, totalRounds = 1 } = route.params;

    const [teams, setTeams] = useState(initialTeams);
    const currentTeamIndex = initialTeamIndex; // NO usar state, viene de params
    const [timeLeft, setTimeLeft] = useState(roundDuration);
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentWord, setCurrentWord] = useState(null);
    const [usedWords, setUsedWords] = useState(initialUsedWords);
    const [roundScore, setRoundScore] = useState(0);

  // Obtener todas las palabras disponibles de las categorías seleccionadas
  const getAllWords = () => {
    let allWords = [];
    selectedCategories.forEach((catId) => {
      const category = tabuCategories.find((c) => c.id === catId);
      if (category) {
        allWords = [...allWords, ...category.words];
      }
    });
    return allWords;
  };

  // Seleccionar palabra aleatoria que no se haya usado
  const selectRandomWord = () => {
    const allWords = getAllWords();
    const availableWords = allWords.filter(
      (w) => !usedWords.includes(w.word)
    );

    if (availableWords.length === 0) {
      // Si no quedan palabras, reiniciar usadas
      setUsedWords([]);
      const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
      setCurrentWord(randomWord);
      setUsedWords([randomWord.word]);
    } else {
      const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
      setCurrentWord(randomWord);
      setUsedWords([...usedWords, randomWord.word]);
    }
  };

  // Cargar primera palabra al inicio
  useEffect(() => {
    selectRandomWord();
  }, []);

  // Timer
  useEffect(() => {
    let interval;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      endRound();
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  // Formatear tiempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Palabra correcta
  const handleCorrect = () => {
    setRoundScore(roundScore + 1);
    selectRandomWord();
  };

  // Pasar palabra
  const handleSkip = () => {
    selectRandomWord();
  };

  // Usó palabra prohibida
  const handleForbidden = () => {
    setRoundScore(Math.max(0, roundScore - 1));
    selectRandomWord();
  };

  // Terminar ronda
    const endRound = () => {
        setIsPlaying(false);

        // Actualizar puntaje del equipo
        const updatedTeams = teams.map((team, index) =>
            index === currentTeamIndex
            ? { ...team, score: team.score + roundScore }
            : team
        );

        const nextTeamIndex = currentTeamIndex + 1;

        // Verificar si terminó la ronda completa (todos los equipos jugaron)
        if (nextTeamIndex >= teams.length) {
            // Terminó la ronda completa
            if (currentRound >= totalRounds) {
            // Terminaron todas las rondas - resultados finales
            navigation.replace('TabuResults', {
                teams: updatedTeams,
                isFinal: true,
            });
            } else {
            // Mostrar resultados intermedios
            navigation.replace('TabuResults', {
                teams: updatedTeams,
                isFinal: false,
                currentRound,
                totalRounds,
                selectedCategories,
                roundDuration,
                usedWords,
            });
            }
        } else {
            // Siguiente equipo en la misma ronda
            navigation.replace('TabuPreGame', {
            teams: updatedTeams,
            currentTeamIndex: nextTeamIndex,
            selectedCategories,
            roundDuration,
            usedWords,
            currentRound,
            totalRounds,
            });
        }
    };

  // Pausar/Reanudar
  const togglePause = () => {
    setIsPlaying(!isPlaying);
  };

  const currentTeam = teams[currentTeamIndex];

  if (!currentWord) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando palabra...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.teamName}>Turno de: {currentTeam.name}</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Puntos esta ronda: </Text>
          <Text style={styles.scoreValue}>{roundScore}</Text>
        </View>
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <Text style={[styles.timerText, timeLeft <= 10 && styles.timerWarning]}>
          {formatTime(timeLeft)}
        </Text>
        <TouchableOpacity style={styles.pauseButton} onPress={togglePause}>
          <Text style={styles.pauseButtonText}>{isPlaying ? '⏸️' : '▶️'}</Text>
        </TouchableOpacity>
      </View>

      {/* Palabra a adivinar */}
      <View style={styles.wordContainer}>
        <Text style={styles.wordLabel}>Palabra a Adivinar:</Text>
        <Text style={styles.wordText}>{currentWord.word}</Text>
      </View>

      {/* Palabras prohibidas */}
      <View style={styles.forbiddenContainer}>
        <Text style={styles.forbiddenTitle}>🚫 NO PUEDES DECIR:</Text>
        {currentWord.forbidden.map((word, index) => (
          <View key={index} style={styles.forbiddenItem}>
            <Text style={styles.forbiddenText}>• {word}</Text>
          </View>
        ))}
      </View>

      {/* Botones de acción */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.correctButton]}
          onPress={handleCorrect}
          disabled={!isPlaying}
        >
          <Text style={styles.actionButtonIcon}>✓</Text>
          <Text style={styles.actionButtonText}>CORRECTO</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.skipButton]}
          onPress={handleSkip}
          disabled={!isPlaying}
        >
          <Text style={styles.actionButtonIcon}>→</Text>
          <Text style={styles.actionButtonText}>PASAR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.forbiddenButton]}
          onPress={handleForbidden}
          disabled={!isPlaying}
        >
          <Text style={styles.actionButtonIcon}>🚫</Text>
          <Text style={styles.actionButtonText}>PROHIBIDA</Text>
        </TouchableOpacity>
      </View>

      {/* Botón terminar ronda */}
      <TouchableOpacity style={styles.endButton} onPress={endRound}>
        <Text style={styles.endButtonText}>Terminar Ronda</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#fff',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  timerContainer: {
    backgroundColor: '#2c3e50',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 20,
  },
  timerWarning: {
    color: '#e74c3c',
  },
  pauseButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButtonText: {
    fontSize: 24,
  },
  wordContainer: {
    backgroundColor: '#2ecc71',
    padding: 30,
    margin: 15,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
  },
  wordLabel: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  wordText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  forbiddenContainer: {
    backgroundColor: '#e74c3c',
    padding: 20,
    margin: 15,
    borderRadius: 15,
    elevation: 5,
  },
  forbiddenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  forbiddenItem: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 10,
    marginVertical: 3,
    borderRadius: 8,
  },
  forbiddenText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  correctButton: {
    backgroundColor: '#2ecc71',
  },
  skipButton: {
    backgroundColor: '#f39c12',
  },
  forbiddenButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  endButton: {
    backgroundColor: '#95a5a6',
    padding: 15,
    margin: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});