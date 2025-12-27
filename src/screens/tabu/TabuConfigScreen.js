import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { tabuCategories } from '../../data/tabuWords';

export default function TabuConfigScreen({ navigation }) {
  const [teams, setTeams] = useState([
    { id: 1, name: 'Equipo 1', score: 0 },
    { id: 2, name: 'Equipo 2', score: 0 },
  ]);
  const [selectedCategories, setSelectedCategories] = useState([1]); // General por defecto
  const [roundDuration, setRoundDuration] = useState(60); // segundos
  const [numberOfRounds, setNumberOfRounds] = useState(3);

  // Agregar equipo
  const addTeam = () => {
    if (teams.length < 6) {
      setTeams([
        ...teams,
        { id: teams.length + 1, name: `Equipo ${teams.length + 1}`, score: 0 },
      ]);
    } else {
      Alert.alert('Límite alcanzado', 'Máximo 6 equipos');
    }
  };

  // Eliminar equipo
  const removeTeam = (id) => {
    if (teams.length > 2) {
      setTeams(teams.filter((t) => t.id !== id));
    } else {
      Alert.alert('Error', 'Debe haber al menos 2 equipos');
    }
  };

  // Actualizar nombre de equipo
  const updateTeamName = (id, name) => {
    setTeams(teams.map((t) => (t.id === id ? { ...t, name } : t)));
  };

  // Toggle categoría
  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
      } else {
        Alert.alert('Error', 'Debe haber al menos una categoría seleccionada');
      }
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  // Comenzar juego
  const startGame = () => {
    // Validar nombres de equipos
    const validTeams = teams.filter((t) => t.name.trim() !== '');
    if (validTeams.length < 2) {
      Alert.alert('Error', 'Debe haber al menos 2 equipos con nombres');
      return;
    }

    // Verificar nombres duplicados
    const uniqueNames = new Set(validTeams.map((t) => t.name));
    if (uniqueNames.size !== validTeams.length) {
      Alert.alert('Error', 'No puede haber nombres de equipos duplicados');
      return;
    }

    // Ir a pantalla pre-juego en lugar de directo al juego
    navigation.navigate('TabuPreGame', {
      teams: validTeams,
      selectedCategories,
      roundDuration,
      currentTeamIndex: 0,
      currentRound: 1,
      totalRounds: numberOfRounds,
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Equipos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Equipos ({teams.length})</Text>
        <Text style={styles.sectionSubtitle}>Mínimo 2 equipos, máximo 6</Text>

        {teams.map((team) => (
          <View key={team.id} style={styles.teamRow}>
            <TextInput
              style={styles.teamInput}
              placeholder={`Equipo ${team.id}`}
              value={team.name}
              onChangeText={(text) => updateTeamName(team.id, text)}
            />
            <TouchableOpacity
              style={[styles.deleteButton, teams.length === 2 && styles.deleteButtonDisabled]}
              onPress={() => removeTeam(team.id)}
              disabled={teams.length === 2}
            >
              <Text style={[styles.deleteIcon, teams.length === 2 && styles.iconDisabled]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.addButton, teams.length >= 6 && styles.addButtonDisabled]}
          onPress={addTeam}
          disabled={teams.length >= 6}
        >
          <Text style={styles.addButtonText}>+ Agregar Equipo</Text>
        </TouchableOpacity>
      </View>

      {/* Categorías */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categorías</Text>
        {tabuCategories.map((category) => (
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
              {category.name} ({category.words.length} palabras)
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Duración de ronda */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Duración por Ronda (segundos)</Text>
        <View style={styles.durationButtons}>
          {[30, 60, 90, 120].map((duration) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.durationButton,
                roundDuration === duration && styles.durationButtonActive,
              ]}
              onPress={() => setRoundDuration(duration)}
            >
              <Text
                style={[
                  styles.durationButtonText,
                  roundDuration === duration && styles.durationButtonTextActive,
                ]}
              >
                {duration}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Cantidad de Rondas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cantidad de Rondas</Text>
        <Text style={styles.sectionSubtitle}>
          Cada ronda todos los equipos juegan una vez
        </Text>
        <View style={styles.durationButtons}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((rounds) => (
            <TouchableOpacity
              key={rounds}
              style={[
                styles.durationButton,
                numberOfRounds === rounds && styles.durationButtonActive,
              ]}
              onPress={() => setNumberOfRounds(rounds)}
            >
              <Text
                style={[
                  styles.durationButtonText,
                  numberOfRounds === rounds && styles.durationButtonTextActive,
                ]}
              >
                {rounds}
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
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteButtonDisabled: {
    opacity: 0.3,
  },
  deleteIcon: {
    fontSize: 24,
    color: '#e74c3c',
  },
  iconDisabled: {
    color: '#ccc',
  },
  addButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  addButtonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    borderColor: '#3498db',
    backgroundColor: '#3498db',
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    flex: 1,
    padding: 15,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  durationButtonTextActive: {
    color: '#fff',
  },
  startButton: {
    backgroundColor: '#2ecc71',
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