import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { categories } from '../../data/impostorWords';

export default function ImpostorConfigScreen({ navigation, route }) {
  const previousConfig = route.params?.previousConfig;

  const [players, setPlayers] = useState(
    previousConfig?.players || ['Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4']
  );
  const [impostorCount, setImpostorCount] = useState(previousConfig?.impostorCount || 1);
  const [showHint, setShowHint] = useState(previousConfig?.showHint ?? true);
  const [selectedCategories, setSelectedCategories] = useState(
    previousConfig?.selectedCategories || [1]
  );
  const [difficulty, setDifficulty] = useState(previousConfig?.difficulty || 'easy');
  const [gameDuration, setGameDuration] = useState(previousConfig?.gameDuration || 5);

  // Agregar jugador
  const addPlayer = () => {
    const newPlayerNumber = players.length + 1;
    setPlayers([...players, `Jugador ${newPlayerNumber}`]);
  };

  // Eliminar jugador
  const removePlayer = (index) => {
    if (players.length > 1) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
    }
  };

  // Actualizar nombre de jugador
  const updatePlayer = (index, name) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  // Mover jugador arriba
  const movePlayerUp = (index) => {
    if (index > 0) {
      const newPlayers = [...players];
      [newPlayers[index - 1], newPlayers[index]] = [newPlayers[index], newPlayers[index - 1]];
      setPlayers(newPlayers);
    }
  };

  // Mover jugador abajo
  const movePlayerDown = (index) => {
    if (index < players.length - 1) {
      const newPlayers = [...players];
      [newPlayers[index], newPlayers[index + 1]] = [newPlayers[index + 1], newPlayers[index]];
      setPlayers(newPlayers);
    }
  };

  // Toggle categoría
  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
      } else {
        Alert.alert('Error', 'Debe haber al menos una categoría seleccionada');
      }
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  // Validar y comenzar juego
  const startGame = () => {
    const validPlayers = players.filter(p => p.trim() !== '');

    if (validPlayers.length < impostorCount + 3) {
      Alert.alert(
        'Error',
        `Necesitás al menos ${impostorCount + 3} jugadores para ${impostorCount} impostor(es)`
      );
      return;
    }

    if (validPlayers.length < 4) {
      Alert.alert('Error', 'Necesitás al menos 4 jugadores');
      return;
    }

    const uniqueNames = new Set(validPlayers);
    if (uniqueNames.size !== validPlayers.length) {
      Alert.alert('Error', 'No puede haber nombres de jugadores duplicados');
      return;
    }

    const currentConfig = {
      players: validPlayers,
      impostorCount,
      showHint,
      selectedCategories,
      difficulty,
      gameDuration,
    };

    navigation.navigate('ImpostorReveal', {
      ...currentConfig,
      previousConfig: currentConfig,
    });
  };

  const validPlayerCount = players.filter(p => p.trim() !== '').length;
  const minPlayersNeeded = impostorCount + 3;

  return (
    <ScrollView style={styles.container}>
      {/* Sección Jugadores */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Jugadores ({validPlayerCount})</Text>
        <Text style={styles.sectionSubtitle}>
          Mínimo requerido: {minPlayersNeeded} jugadores
        </Text>

        {players.map((player, index) => (
          <View key={index} style={styles.playerCard}>
            {/* Columna de reordenamiento */}
            <View style={styles.reorderColumn}>
              <TouchableOpacity
                style={[styles.reorderButton, index === 0 && styles.reorderButtonDisabled]}
                onPress={() => movePlayerUp(index)}
                disabled={index === 0}
              >
                <Text style={[styles.reorderIcon, index === 0 && styles.iconDisabled]}>▲</Text>
              </TouchableOpacity>
              <Text style={styles.playerNumber}>{index + 1}</Text>
              <TouchableOpacity
                style={[styles.reorderButton, index === players.length - 1 && styles.reorderButtonDisabled]}
                onPress={() => movePlayerDown(index)}
                disabled={index === players.length - 1}
              >
                <Text style={[styles.reorderIcon, index === players.length - 1 && styles.iconDisabled]}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Input del nombre */}
            <TextInput
              style={styles.playerInput}
              placeholder={`Jugador ${index + 1}`}
              value={player}
              onChangeText={(text) => updatePlayer(index, text)}
            />

            {/* Botón eliminar */}
            <TouchableOpacity
              style={[styles.deleteButton, players.length === 1 && styles.deleteButtonDisabled]}
              onPress={() => removePlayer(index)}
              disabled={players.length === 1}
            >
              <Text style={[styles.deleteIcon, players.length === 1 && styles.iconDisabled]}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
          <Text style={styles.addButtonText}>+ Agregar Jugador</Text>
        </TouchableOpacity>
      </View>

      {/* Sección Impostores */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cantidad de Impostores</Text>
        <View style={styles.impostorButtons}>
          {[1, 2, 3].map((count) => (
            <TouchableOpacity
              key={count}
              style={[
                styles.impostorButton,
                impostorCount === count && styles.impostorButtonActive,
              ]}
              onPress={() => setImpostorCount(count)}
            >
              <Text
                style={[
                  styles.impostorButtonText,
                  impostorCount === count && styles.impostorButtonTextActive,
                ]}
              >
                {count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Pista para Impostores */}
      <View style={styles.section}>
        <View style={styles.switchRow}>
          <Text style={styles.sectionTitle}>Pista para Impostores</Text>
          <Switch
            value={showHint}
            onValueChange={setShowHint}
            trackColor={{ false: '#ccc', true: '#6200ee' }}
            thumbColor={showHint ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Categorías */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categorías</Text>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategories.includes(category.id) && styles.categoryButtonActive,
            ]}
            onPress={() => toggleCategory(category.id)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategories.includes(category.id) && styles.categoryButtonTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Dificultad */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dificultad</Text>
        <View style={styles.difficultyButtons}>
          {[
            { key: 'easy', label: 'Fácil' },
            { key: 'medium', label: 'Media' },
            { key: 'hard', label: 'Difícil' },
            { key: 'all', label: 'Todas' },
          ].map((diff) => (
            <TouchableOpacity
              key={diff.key}
              style={[
                styles.difficultyButton,
                difficulty === diff.key && styles.difficultyButtonActive,
              ]}
              onPress={() => setDifficulty(diff.key)}
            >
              <Text
                style={[
                  styles.difficultyButtonText,
                  difficulty === diff.key && styles.difficultyButtonTextActive,
                ]}
              >
                {diff.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Duración */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Duración del Juego (minutos)</Text>
        <Text style={styles.sectionSubtitle}>
          Recomendado: {validPlayerCount} minutos (1 min por jugador)
        </Text>
        <View style={styles.durationButtons}>
          {[3, 5, 7, 10, 15].map((duration) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.durationButton,
                gameDuration === duration && styles.durationButtonActive,
              ]}
              onPress={() => setGameDuration(duration)}
            >
              <Text
                style={[
                  styles.durationButtonText,
                  gameDuration === duration && styles.durationButtonTextActive,
                ]}
              >
                {duration}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Botón Comenzar */}
      <TouchableOpacity style={styles.startButton} onPress={startGame}>
        <Text style={styles.startButtonText}>Comenzar Juego</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 8,
    elevation: 1,
  },
  reorderColumn: {
    alignItems: 'center',
    marginRight: 10,
    width: 40,
  },
  reorderButton: {
    width: 40,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    borderRadius: 5,
  },
  reorderButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  reorderIcon: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  playerNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginVertical: 2,
  },
  playerInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  deleteButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonDisabled: {
    opacity: 0.3,
  },
  deleteIcon: {
    fontSize: 22,
  },
  iconDisabled: {
    color: '#ccc',
  },
  addButton: {
    backgroundColor: '#6200ee',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  impostorButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  impostorButton: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  impostorButtonActive: {
    borderColor: '#e74c3c',
    backgroundColor: '#e74c3c',
  },
  impostorButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  impostorButtonTextActive: {
    color: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 8,
    alignItems: 'center',
  },
  categoryButtonActive: {
    borderColor: '#6200ee',
    backgroundColor: '#6200ee',
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  difficultyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 3,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  difficultyButtonActive: {
    borderColor: '#2ecc71',
    backgroundColor: '#2ecc71',
  },
  difficultyButtonText: {
    fontSize: 14,
    color: '#666',
  },
  difficultyButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 3,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  durationButtonActive: {
    borderColor: '#f39c12',
    backgroundColor: '#f39c12',
  },
  durationButtonText: {
    fontSize: 14,
    color: '#666',
  },
  durationButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#e74c3c',
    padding: 18,
    margin: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});