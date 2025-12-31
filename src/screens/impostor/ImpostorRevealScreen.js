

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { categories } from '../../data/impostorWords';
import { Audio } from 'expo-av';


export default function ImpostorRevealScreen({ route, navigation }) {
  const { players, impostorCount, showHint, selectedCategories, difficulty, gameDuration } = route.params;

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [roles, setRoles] = useState([]);
  const [secretWord, setSecretWord] = useState('');
  const [hint, setHint] = useState('');
  const [fadeAnim] = useState(new Animated.Value(1));
  const [isRevealed, setIsRevealed] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [startingPlayer, setStartingPlayer] = useState('');

  // Asignar roles y seleccionar palabra al montar el componente
  useEffect(() => {
    assignRoles();
    selectWord();
  }, []);

    const playTimerStartSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../../assets/sounds/impostor-inicio.mp3')
      );
      await sound.playAsync();

      // Limpieza
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (err) {
      console.log('Error reproduciendo sonido', err);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      playTimerStartSound();
      // Cuando llega a 0, navegar al juego
      navigation.navigate('ImpostorGame', {
        players,
        roles,
        secretWord,
        hint,
        gameDuration,
        showHint,
        startingPlayer,
        previousConfig: route.params.previousConfig,
      });
    }
  }, [showCountdown, countdown]);

  // Asignar roles aleatoriamente
  const assignRoles = () => {
    const totalPlayers = players.length;
    const roleArray = new Array(totalPlayers).fill('CIVIL');
    
    const impostorIndices = [];
    while (impostorIndices.length < impostorCount) {
      const randomIndex = Math.floor(Math.random() * totalPlayers);
      if (!impostorIndices.includes(randomIndex)) {
        impostorIndices.push(randomIndex);
      }
    }
    
    impostorIndices.forEach(index => {
      roleArray[index] = 'IMPOSTOR';
    });
    
    setRoles(roleArray);
  };

  // Seleccionar palabra secreta
  const selectWord = () => {
    let allWords = [];
    
    selectedCategories.forEach(categoryId => {
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        if (difficulty === 'all') {
          allWords = [...allWords, ...category.easy, ...category.medium, ...category.hard];
        } else {
          allWords = [...allWords, ...category[difficulty]];
        }
      }
    });

    if (allWords.length > 0) {
      const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
      setSecretWord(randomWord.word);
      setHint(randomWord.hint);
    }
  };

  // Manejar la revelación
  const handleReveal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setIsRevealed(true);
    });
  };

  // Siguiente jugador o comenzar juego
  const nextPlayer = () => {
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setIsRevealed(false);
      fadeAnim.setValue(1);
    } else {
      // Último jugador, elegir jugador inicial aleatorio y mostrar countdown
      const randomPlayerIndex = Math.floor(Math.random() * players.length);
      setStartingPlayer(players[randomPlayerIndex]);
      setShowCountdown(true);
    }
  };

  const currentPlayer = players[currentPlayerIndex];
  const currentRole = roles[currentPlayerIndex];
  const isLastPlayer = currentPlayerIndex === players.length - 1;

  if (roles.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Preparando juego...</Text>
      </View>
    );
  }

  // Pantalla de countdown
  if (showCountdown) {
    return (
      <View style={styles.countdownContainer}>
        <Text style={styles.countdownTitle}>¡Comienza el juego!</Text>
        <Text style={styles.startingPlayerText}>Arranca:</Text>
        <Text style={styles.startingPlayerName}>{startingPlayer}</Text>
        <Text style={styles.countdownNumber}>{countdown}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Información superior */}
      <View style={styles.topInfo}>
        <Text style={styles.playerCounter}>
          {currentPlayer} ({currentPlayerIndex + 1} de {players.length})
        </Text>
      </View>

      {/* Área de revelación */}
      <View style={styles.revealContainer}>
        {/* Pantalla de cobertura con nombre */}
        {!isRevealed && (
          <Animated.View
            style={[
              styles.coverScreen,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.coverName}>{currentPlayer}</Text>
            <Text style={styles.coverInstruction}>
              Presioná el botón de abajo para ver tu rol
            </Text>
          </Animated.View>
        )}

        {/* Contenido revelado */}
        {isRevealed && (
          <View style={styles.revealedContent}>
            <View style={[
              styles.roleCard,
              currentRole === 'IMPOSTOR' ? styles.impostorCard : styles.civilCard
            ]}>
              <Text style={styles.roleTitle}>Tu rol es:</Text>
              <Text style={styles.roleText}>{currentRole}</Text>
              
              {currentRole === 'CIVIL' && (
                <View style={styles.wordContainer}>
                  <Text style={styles.wordLabelCivil}>Palabra secreta:</Text>
                  <Text style={styles.wordTextCivil}>{secretWord}</Text>
                </View>
              )}
              
              {currentRole === 'IMPOSTOR' && showHint && (
                <View style={styles.wordContainer}>
                  <Text style={styles.wordLabelImpostor}>Tenés una pista:</Text>
                  <Text style={styles.wordTextImpostor}>{hint}</Text>
                </View>
              )}

              {currentRole === 'IMPOSTOR' && !showHint && (
                <Text style={styles.noHintText}>No tenés pistas. ¡Buena suerte!</Text>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Botones */}
      <View style={styles.buttonContainer}>
        {!isRevealed ? (
          <TouchableOpacity
            style={styles.revealButton}
            onPress={handleReveal}
          >
            <Text style={styles.revealButtonText}>👁️ Revelar Mi Rol</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={nextPlayer}
          >
            <Text style={styles.nextButtonText}>
              {isLastPlayer ? '🎮 Comenzar Juego' : '➡️ Siguiente Jugador'}
            </Text>
          </TouchableOpacity>
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
  loadingText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
  },
  topInfo: {
    padding: 20,
    alignItems: 'center',
  },
  playerCounter: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  revealContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  coverScreen: {
    width: '100%',
    height: '100%',
    padding: 40,
    backgroundColor: '#6200ee',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  coverInstruction: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  revealedContent: {
    width: '100%',
    alignItems: 'center',
  },
  roleCard: {
    width: '100%',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 5,
    backgroundColor: '#6200ee'
  },
  /*civilCard: {
    backgroundColor: '#b2ffd2ff',
  },
  impostorCard: {
    backgroundColor: '#f5b7b0ff',
  },
  */
  roleTitle: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 10,
  },
  roleText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  wordContainer: {
    backgroundColor: '#00000085',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  wordLabelCivil: {
    fontSize: 16,
    color: '#06c556ff',
    marginBottom: 5,
  },
  wordTextCivil: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#06c556ff',
    textAlign: 'center',
  },
  wordLabelImpostor: {
    fontSize: 16,
    color: '#ff1d04ff',
    marginBottom: 5,
  },
  wordTextImpostor: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff1d04ff',
    textAlign: 'center',
  },
  noHintText: {
    fontSize: 16,
    color: '#ff1d04ff',
    fontStyle: 'italic',
    marginTop: 10,
  },
  buttonContainer: {
    padding: 20,
  },
  revealButton: {
    backgroundColor: '#6200ee',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
  },
  revealButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
  },
  nextButtonText: {
    color: '#6200ee',
    fontSize: 20,
    fontWeight: 'bold',
  },
  countdownContainer: {
    flex: 1,
    backgroundColor: '#f39c12',
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