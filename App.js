import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importamos las pantallas
import HomeScreen from './src/screens/HomeScreen';
import ImpostorConfigScreen from './src/screens/impostor/ImpostorConfigScreen';
import ImpostorRevealScreen from './src/screens/impostor/ImpostorRevealScreen';
import ImpostorGameScreen from './src/screens/impostor/ImpostorGameScreen';
import ImpostorResultScreen from './src/screens/impostor/ImpostorResultScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#6200ee' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'La Mafilia Games' }}
        />
        <Stack.Screen 
          name="ImpostorConfig" 
          component={ImpostorConfigScreen}
          options={{ title: 'El Impostor - Configuración' }}
        />
        <Stack.Screen 
          name="ImpostorReveal" 
          component={ImpostorRevealScreen}
          options={{ title: 'El Impostor - Revelación' }}
        />
        <Stack.Screen 
          name="ImpostorGame" 
          component={ImpostorGameScreen}
          options={{ title: 'El Impostor - Juego' }}
        />
        <Stack.Screen 
          name="ImpostorResult" 
          component={ImpostorResultScreen}
          options={{ title: 'El Impostor - Resultados' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}