import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  useAudioRecorder,
  useAudioPlayer,
  AudioModule,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system';

export default function AkisumGameScreen({ navigation }) {
  const recorder = useAudioRecorder();
  const normalPlayer = useAudioPlayer();
  const reversePlayer = useAudioPlayer();

  const [recordedURI, setRecordedURI] = useState(null);
  const [reversedURI, setReversedURI] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackMode, setPlaybackMode] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  // Listener para cuando termine la reproducción normal
  useEffect(() => {
    if (normalPlayer.playing === false && playbackMode === 'normal' && isPlaying) {
      setIsPlaying(false);
      setPlaybackMode(null);
    }
  }, [normalPlayer.playing]);

  // Listener para cuando termine la reproducción reversa
  useEffect(() => {
    if (reversePlayer.playing === false && playbackMode === 'reverse' && isPlaying) {
      setIsPlaying(false);
      setPlaybackMode(null);
    }
  }, [reversePlayer.playing]);

  const requestPermissions = async () => {
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert('Permiso denegado', 'Necesitamos permiso para grabar audio');
      }
    } catch (err) {
      console.error('Error requesting permissions:', err);
    }
  };

// Iniciar grabación
const startRecording = async () => {
  try {
    const options = {
      extension: '.m4a',
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
    };
    
    await recorder.record(options);
    setIsRecording(true);
  } catch (err) {
    console.error('Error al iniciar grabación:', err);
    Alert.alert('Error', 'No se pudo iniciar la grabación: ' + err.message);
  }
};

  // Detener grabación
  const stopRecording = async () => {
    try {
      setIsRecording(false);
      const uri = await recorder.stop();
      setRecordedURI(uri);

      // Procesar audio en reversa automáticamente
      await processReverseAudio(uri);

      Alert.alert('¡Listo!', 'Audio grabado correctamente');
    } catch (err) {
      console.error('Error al detener grabación:', err);
      Alert.alert('Error', 'No se pudo detener la grabación: ' + err.message);
    }
  };

  // Procesar audio en reversa
  const processReverseAudio = async (uri) => {
    setIsProcessing(true);
    try {
      // Leer el archivo como base64
      const audioData = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convertir base64 a array de bytes
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Para archivos de audio, buscar el header (primeros 44 bytes típicamente para WAV)
      // Si no es WAV, intentamos invertir todo el contenido de audio
      let headerSize = 44;
      
      // Verificar si es un archivo WAV (comienza con "RIFF")
      const isWav = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
      
      if (!isWav) {
        // Si no es WAV, usar un header más pequeño o ninguno
        headerSize = 0;
      }

      const header = bytes.slice(0, headerSize);
      const audioContent = bytes.slice(headerSize);

      // Invertir el contenido del audio (cada muestra es de 2 bytes en formato PCM 16-bit)
      const reversedContent = new Uint8Array(audioContent.length);
      const sampleSize = 2; // 16-bit = 2 bytes
      const numSamples = Math.floor(audioContent.length / sampleSize);

      for (let i = 0; i < numSamples; i++) {
        const srcIndex = i * sampleSize;
        const dstIndex = (numSamples - 1 - i) * sampleSize;
        
        if (dstIndex >= 0 && dstIndex + 1 < reversedContent.length) {
          reversedContent[dstIndex] = audioContent[srcIndex];
          if (srcIndex + 1 < audioContent.length) {
            reversedContent[dstIndex + 1] = audioContent[srcIndex + 1];
          }
        }
      }

      // Combinar header con contenido invertido
      const reversedBytes = new Uint8Array(header.length + reversedContent.length);
      reversedBytes.set(header, 0);
      reversedBytes.set(reversedContent, header.length);

      // Convertir a base64
      let binary = '';
      for (let i = 0; i < reversedBytes.length; i++) {
        binary += String.fromCharCode(reversedBytes[i]);
      }
      const reversedBase64 = btoa(binary);

      // Guardar el archivo invertido
      const reversedUri = FileSystem.documentDirectory + 'reversed_audio.m4a';
      await FileSystem.writeAsStringAsync(reversedUri, reversedBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setReversedURI(reversedUri);
      setIsProcessing(false);
    } catch (err) {
      console.error('Error al procesar audio en reversa:', err);
      Alert.alert('Error', 'No se pudo procesar el audio en reversa: ' + err.message);
      setIsProcessing(false);
    }
  };

  // Reproducir audio normal
  const playNormal = async () => {
    if (!recordedURI) {
      Alert.alert('Error', 'No hay audio grabado');
      return;
    }

    try {
      normalPlayer.replace(recordedURI);
      normalPlayer.play();
      setIsPlaying(true);
      setPlaybackMode('normal');
    } catch (err) {
      console.error('Error al reproducir:', err);
      Alert.alert('Error', 'No se pudo reproducir el audio: ' + err.message);
    }
  };

  // Reproducir audio en reversa
  const playReverse = async () => {
    if (!reversedURI) {
      Alert.alert('Error', 'No hay audio procesado en reversa');
      return;
    }

    try {
      reversePlayer.replace(reversedURI);
      reversePlayer.play();
      setIsPlaying(true);
      setPlaybackMode('reverse');
    } catch (err) {
      console.error('Error al reproducir en reversa:', err);
      Alert.alert('Error', 'No se pudo reproducir el audio en reversa: ' + err.message);
    }
  };

  // Detener reproducción
  const stopPlayback = () => {
    if (playbackMode === 'normal') {
      normalPlayer.pause();
    } else if (playbackMode === 'reverse') {
      reversePlayer.pause();
    }
    setIsPlaying(false);
    setPlaybackMode(null);
  };

  // Borrar audio y empezar de nuevo
  const clearRecording = () => {
    Alert.alert(
      'Borrar grabación',
      '¿Estás seguro que querés borrar la grabación actual?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: () => {
            normalPlayer.pause();
            reversePlayer.pause();
            setRecordedURI(null);
            setReversedURI(null);
            setIsPlaying(false);
            setPlaybackMode(null);
          },
        },
      ]
    );
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