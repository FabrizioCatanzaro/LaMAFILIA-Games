import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { FFmpegKit } from 'ffmpeg-kit-react-native';


export default function AkisumGameScreen({ navigation }) {
  const [recording, setRecording] = useState(null);
  const [recordedURI, setRecordedURI] = useState(null);
  const [reversedURI, setReversedURI] = useState(null);
  const [sound, setSound] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackMode, setPlaybackMode] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setupAudio();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const setupAudio = async () => {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Error al iniciar grabación:', err);
      Alert.alert('Error', 'No se pudo iniciar la grabación');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedURI(uri);
      setRecording(null);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      // Procesar audio en reversa
      await processReverseAudio(uri);

      Alert.alert('¡Listo!', 'Audio grabado y procesado');
    } catch (err) {
      console.error('Error al detener grabación:', err);
      Alert.alert('Error', 'No se pudo detener la grabación');
    }
  };

  const processReverseAudio = async (uri) => {
    setIsProcessing(true);
    try {
      const reversedUri = FileSystem.documentDirectory + 'reversed.m4a';

      await FFmpegKit.execute(
        `-i "${uri}" -af areverse "${reversedUri}"`
      );

      setReversedURI(reversedUri);
    } catch (err) {
      console.error('Error al procesar audio:', err);
      Alert.alert('Error', 'No se pudo procesar el audio en reversa');
    } finally {
      setIsProcessing(false);
    }
  };


  const playNormal = async () => {
    if (!recordedURI) return;

    try {
      if (sound) await sound.unloadAsync();

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordedURI },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);
      setPlaybackMode('normal');

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          setPlaybackMode(null);
        }
      });
    } catch (err) {
      console.error('Error:', err);
      Alert.alert('Error', 'No se pudo reproducir');
    }
  };

  const playReverse = async () => {
    if (!reversedURI) return;

    try {
      if (sound) await sound.unloadAsync();

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: reversedURI },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);
      setPlaybackMode('reverse');

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          setPlaybackMode(null);
        }
      });
    } catch (err) {
      console.error('Error:', err);
      Alert.alert('Error', 'No se pudo reproducir en reversa');
    }
  };

  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      setPlaybackMode(null);
    }
  };

  const clearRecording = () => {
    Alert.alert('Borrar grabación', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          if (sound) await sound.unloadAsync();
          setRecordedURI(null);
          setReversedURI(null);
          setSound(null);
          setIsPlaying(false);
          setPlaybackMode(null);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎵 akisuM 🎵</Text>
        <Text style={styles.subtitle}>¡Canta al revés!</Text>
      </View>

      {/* Instrucciones */}
      <View style={styles.instructionsBox}>
        <Text style={styles.instructionsTitle}>📝 Cómo jugar:</Text>
        <Text style={styles.instructionsText}>
          1. Equipo 1: Graba un verso de una canción{'\n'}
          2. Equipo 2: Escucha en reversa y memoriza{'\n'}
          3. Equipo 2: Graba lo que entendiste{'\n'}
          4. Reproduce en reversa para ganar puntos
        </Text>
      </View>

      {/* Estado actual */}
      <View style={styles.statusContainer}>
        {isProcessing && (
          <View style={styles.processingIndicator}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.processingText}>Procesando audio...</Text>
          </View>
        )}

        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>GRABANDO...</Text>
          </View>
        )}

        {isPlaying && (
          <View style={styles.playingIndicator}>
            <Text style={styles.playingText}>
              {playbackMode === 'normal' ? '▶️ REPRODUCIENDO NORMAL' : '◀️ REPRODUCIENDO EN REVERSA'}
            </Text>
          </View>
        )}

        {!isRecording && !isPlaying && !isProcessing && recordedURI && (
          <View style={styles.readyIndicator}>
            <Text style={styles.readyText}>✅ Audio listo para reproducir</Text>
          </View>
        )}

        {!isRecording && !isPlaying && !isProcessing && !recordedURI && (
          <View style={styles.emptyIndicator}>
            <Text style={styles.emptyText}>👇 Presioná GRABAR para comenzar</Text>
          </View>
        )}
      </View>

      {/* Botones principales */}
      <View style={styles.buttonsContainer}>
        {/* Botón GRABAR / DETENER */}
        {!isRecording ? (
          <TouchableOpacity
            style={[styles.recordButton, (recordedURI || isProcessing) && styles.recordButtonDisabled]}
            onPress={startRecording}
            disabled={recordedURI !== null || isProcessing}
          >
            <Text style={styles.recordButtonIcon}>🎤</Text>
            <Text style={styles.recordButtonText}>GRABAR</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.stopRecordButton}
            onPress={stopRecording}
          >
            <Text style={styles.stopRecordButtonIcon}>⏹️</Text>
            <Text style={styles.stopRecordButtonText}>DETENER GRABACIÓN</Text>
          </TouchableOpacity>
        )}

        {/* Botones de reproducción */}
        {recordedURI && !isRecording && !isProcessing && (
          <>
            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.playButtonDisabled]}
              onPress={playNormal}
              disabled={isPlaying}
            >
              <Text style={styles.playButtonIcon}>▶️</Text>
              <Text style={styles.playButtonText}>REPRODUCIR NORMAL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.reverseButton, isPlaying && styles.reverseButtonDisabled]}
              onPress={playReverse}
              disabled={isPlaying}
            >
              <Text style={styles.reverseButtonIcon}>◀️</Text>
              <Text style={styles.reverseButtonText}>REPRODUCIR EN REVERSA</Text>
            </TouchableOpacity>

            {isPlaying && (
              <TouchableOpacity
                style={styles.stopPlayButton}
                onPress={stopPlayback}
              >
                <Text style={styles.stopPlayButtonText}>⏸️ DETENER</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearRecording}
            >
              <Text style={styles.clearButtonText}>🗑️ Borrar y grabar de nuevo</Text>
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
    backgroundColor: '#6200ee',
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
  },
  instructionsBox: {
    backgroundColor: '#2a2a2a',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f39c12',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 22,
  },
  statusContainer: {
    padding: 20,
    alignItems: 'center',
    minHeight: 80,
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f39c12',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },
  processingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  recordingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  playingIndicator: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },
  playingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  readyIndicator: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },
  readyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyIndicator: {
    backgroundColor: '#34495e',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#fff',
  },
  buttonsContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  recordButton: {
    backgroundColor: '#e74c3c',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
  },
  recordButtonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.5,
  },
  recordButtonIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  recordButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  stopRecordButton: {
    backgroundColor: '#34495e',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
  },
  stopRecordButtonIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  stopRecordButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  playButton: {
    backgroundColor: '#3498db',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
  },
  playButtonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.5,
  },
  playButtonIcon: {
    fontSize: 36,
    marginBottom: 5,
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  reverseButton: {
    backgroundColor: '#9b59b6',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
  },
  reverseButtonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.5,
  },
  reverseButtonIcon: {
    fontSize: 36,
    marginBottom: 5,
  },
  reverseButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  stopPlayButton: {
    backgroundColor: '#f39c12',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  stopPlayButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#e74c3c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
});