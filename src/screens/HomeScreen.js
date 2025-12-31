import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';


export default function HomeScreen({ navigation }) {
  const games = [
    {
      id: 1,
      name: 'El Impostor',
      description: 'Descubrí quién es el impostor entre ustedes! Mínimo 3 jugadores.',
      screen: 'ImpostorConfig',
      color: '#e74c3c',
      icon: 'incognito'
    },
    {
      id: 2,
      name: 'Tabú',
      description: "Adiviná palabras secretas sin usar las palabras prohibidas. Mínimo 2 equipos con 'X' cantidad de jugadores cada uno.",
      screen: 'TabuConfig',
      color: '#3498db',
      icon: 'sword-cross'
    },
    // {
    // id: 3,
    // name: 'akisuM',
    // description: '¡Canta canciones al revés!',
    // screen: 'AkisumGame',
    // color: '#9b59b6'
    // },
    {
      id: 4,
      name: 'Pictionary',
      description: 'Dibujá y adiviná palabras en equipo. Mínimo 2 equipos con "X" cantidad de jugadores cada uno.',
      screen: 'Home',
      color: '#27ae60',
      icon: 'brush'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>¡Bienvenidos!</Text>
        <Text style={styles.subtitle}>Elegí un juego para comenzar</Text>
      </View>

      <View style={styles.gamesContainer}>
        {games.map((game) => (
        <TouchableOpacity
          key={game.id}
          style={[styles.gameCard, { backgroundColor: game.color }]}
          onPress={() => navigation.navigate(game.screen)}
        >
          {/* FONDO */}
          <View style={styles.iconPattern}>
            {Array.from({ length: 25 }).map((_, i) => (
              <MaterialCommunityIcons
                key={i}
                name={game.icon}
                size={40}
                color="rgba(255,255,255,0.15)"
                style={styles.patternIcon}
              />
            ))}
          </View>

          {/* CONTENIDO */}
          <View style={{ zIndex: 2 }}>
            <View style={styles.gameTitleRow}>
              <MaterialCommunityIcons name={game.icon} size={28} color="#fff" />
              <Text style={styles.gameName}>{game.name}</Text>
            </View>
            <Text style={styles.gameDescription}>{game.description}</Text>
          </View>
        </TouchableOpacity>

        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#6200ee',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
  },
  gamesContainer: {
    padding: 15,
  },
  gameCard: {
    borderRadius: 15,
    padding: 25,
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  gameName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  gameDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  gameTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  iconPattern: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    transform: [{ rotate: '-20deg' }],
    zIndex: 1,
  },
  patternIcon: {
    margin: 12,
  },
});