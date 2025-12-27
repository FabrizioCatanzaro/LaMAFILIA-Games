import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function HomeScreen({ navigation }) {
  const games = [
    {
      id: 1,
      name: 'El Impostor',
      description: 'Descubre quién es el impostor entre los jugadores',
      screen: 'ImpostorConfig',
      color: '#e74c3c'
    },
    {
      id: 2,
      name: 'Tabú',
      description: '¡Adivina palabras con palabras prohibidas!',
      screen: 'TabuConfig',
      color: '#3498db'
    },
    {
    id: 3,
    name: 'akisuM',
    description: '¡Canta canciones al revés!',
    screen: 'AkisumGame',
    color: '#9b59b6'
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
            <Text style={styles.gameName}>{game.name}</Text>
            <Text style={styles.gameDescription}>{game.description}</Text>
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
});