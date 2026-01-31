import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../utils/api';

export default function LoginScreen({ navigation }) {
  const [farmerCode, setFarmerCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!farmerCode.trim()) {
      Alert.alert('Error', 'Please enter your farmer code');
      return;
    }

    setLoading(true);

    try {
      // For demo: Use predefined farmer codes
      // In production, implement proper authentication
      const farmerMapping = {
        'HN-001': { id: 1, name: 'Carlos Martinez', cooperative_id: 1 },
        'HN-002': { id: 2, name: 'Maria Lopez', cooperative_id: 1 },
        'HN-003': { id: 3, name: 'Juan Rodriguez', cooperative_id: 1 },
        'KE-001': { id: 4, name: 'James Kimani', cooperative_id: 2 },
        'KE-002': { id: 5, name: 'Grace Wanjiru', cooperative_id: 2 },
      };

      const farmer = farmerMapping[farmerCode.toUpperCase()];

      if (!farmer) {
        Alert.alert('Error', 'Invalid farmer code. Try: HN-001, HN-002, HN-003, KE-001, or KE-002');
        return;
      }

      // Store farmer info
      await AsyncStorage.setItem('auth_token', 'demo-token');
      await AsyncStorage.setItem('user', JSON.stringify(farmer));

      // Navigate to home
      navigation.replace('Home');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>☕</Text>
        <Text style={styles.title}>Coffee Farmer App</Text>
        <Text style={styles.subtitle}>Log your harvests on the go</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Enter Farmer Code (e.g., HN-001)"
            value={farmerCode}
            onChangeText={setFarmerCode}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.demoInfo}>
            <Text style={styles.demoTitle}>Demo Farmer Codes:</Text>
            <Text style={styles.demoText}>🇭🇳 HN-001, HN-002, HN-003 (Honduras)</Text>
            <Text style={styles.demoText}>🇰🇪 KE-001, KE-002 (Kenya)</Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B4423',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#f0e6d2',
    marginBottom: 40,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#3d2817',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoInfo: {
    marginTop: 30,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  demoTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  demoText: {
    color: '#f0e6d2',
    fontSize: 14,
    marginBottom: 4,
  },
});
