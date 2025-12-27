import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';

export default function ImpostorGameScreen({ route, navigation }) {
  const { players, roles, secretWord, hint, gameDuration, showHint } = route.params;

  const [timeLeft, setTimeLeft] = useState(gameDuration * 60); // convertir a segundos
  const [isRunning, setIsRunning] = useState(true);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [eliminatedPlayers, setEliminatedPlayers] = useState([]);
  const [activePlayers, setActivePlayers] = useState(
    players.map((name, index) => ({ name, role: roles[index], index }))
  );

  // Timer
  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Formatear tiempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Manejar votación
  const handleVote = (playerIndex) => {
    const votedPlayer = activePlayers[playerIndex];
    
    // Mostrar si era civil o impostor
    Alert.alert(
      'Votación',
      `¿Estás seguro que querés eliminar a ${votedPlayer.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: () => {
            Alert.alert(
              '¡Votación!',
              `${votedPlayer.name} era un ${votedPlayer.role}`,
              [
                {
                  text: 'Continuar',
                  onPress: () => processVote(votedPlayer),
                },
              ]
            );  
          },
        },
      ]
    );
  };

  // Procesar votación
  const processVote = (votedPlayer) => {
    const newEliminated = [...eliminatedPlayers, votedPlayer];
    const newActive = activePlayers.filter((p) => p.index !== votedPlayer.index);

    setEliminatedPlayers(newEliminated);
    setActivePlayers(newActive);
    setShowVoteModal(false);

    // Verificar condiciones de victoria
    const activeImpostors = newActive.filter((p) => p.role === 'IMPOSTOR').length;
    const activeCivils = newActive.filter((p) => p.role === 'CIVIL').length;

    if (activeImpostors === 0) {
      // Ganaron los civiles
      navigation.replace('ImpostorResult', {
        winner: 'CIVIL',
        secretWord,
        players,
        roles,
        eliminatedPlayers: newEliminated,
        previousConfig: route.params.previousConfig, // Pasar la config
      });
    } else if (activeCivils <= activeImpostors) {
      // Ganaron los impostores
      navigation.replace('ImpostorResult', {
        winner: 'IMPOSTOR',
        secretWord,
        players,
        roles,
        eliminatedPlayers: newEliminated,
        previousConfig: route.params.previousConfig, // Pasar la config
      });
    }
  };

  // Terminar juego manualmente
  const endGame = () => {
    Alert.alert(
      'Terminar Juego',
      '¿Estás seguro que querés terminar el juego?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Terminar',
          onPress: () => {
            navigation.replace('ImpostorResult', {
              winner: 'NONE',
              secretWord,
              players,
              roles,
              eliminatedPlayers,
              previousConfig: route.params.previousConfig, // Pasar la config
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header con timer */}
      <View style={styles.header}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Tiempo restante</Text>
          <Text style={[styles.timerText, timeLeft < 60 && styles.timerWarning]}>
            {formatTime(timeLeft)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.pauseButton}
          onPress={() => setIsRunning(!isRunning)}
        >
          <Text style={styles.pauseButtonText}>{isRunning ? '⏸️' : '▶️'}</Text>
        </TouchableOpacity>
      </View>

      {/* Información del juego */}
      {/* 
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Palabra secreta: {secretWord}</Text>
        {showHint && <Text style={styles.infoHint}>Pista para impostores: {hint}</Text>}
      </View>
       */}

      {/* Jugadores activos */}
      <ScrollView style={styles.playersSection}>
        <Text style={styles.sectionTitle}>
          Jugadores en juego ({activePlayers.length})
        </Text>
        {activePlayers.map((player, index) => (
          <View key={player.index} style={styles.playerCard}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.playerStatus}>🟢 Activo</Text>
          </View>
        ))}

        {eliminatedPlayers.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
              Eliminados ({eliminatedPlayers.length})
            </Text>
            {eliminatedPlayers.map((player, index) => (
              <View key={index} style={[styles.playerCard, styles.eliminatedCard]}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerRole}>
                  {player.role === 'IMPOSTOR' ? '🔴 Impostor' : '🟢 Civil'}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.voteButton}
          onPress={() => setShowVoteModal(true)}
        >
          <Text style={styles.voteButtonText}>🗳️ Votar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.endButton} onPress={endGame}>
          <Text style={styles.endButtonText}>Terminar</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de votación */}
      <Modal
        visible={showVoteModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVoteModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¿Quién es el impostor?</Text>
            
            <ScrollView style={styles.modalScroll}>
              {activePlayers.map((player, index) => (
                <TouchableOpacity
                  key={player.index}
                  style={styles.voteOption}
                  onPress={() => handleVote(index)}
                >
                  <Text style={styles.voteOptionText}>{player.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowVoteModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200ee',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerContainer: {
    flex: 1,
  },
  timerLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  timerText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  timerWarning: {
    color: '#ff6b6b',
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
  infoSection: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  infoHint: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  playersSection: {
    flex: 1,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
    marginLeft: 5,
  },
  playerCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  eliminatedCard: {
    backgroundColor: '#f8f8f8',
    opacity: 0.7,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  playerStatus: {
    fontSize: 14,
    color: '#2ecc71',
  },
  playerRole: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 10,
    gap: 10,
  },
  voteButton: {
    flex: 3,
    backgroundColor: '#e74c3c',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  voteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  endButton: {
    flex: 1,
    backgroundColor: '#95a5a6',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  modalScroll: {
    maxHeight: 300,
  },
  voteOption: {
    backgroundColor: '#f0f0f0',
    padding: 18,
    marginVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  voteOptionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    padding: 15,
    marginTop: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});