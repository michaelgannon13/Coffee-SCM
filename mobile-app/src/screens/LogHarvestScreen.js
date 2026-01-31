import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { batches, auth } from '../utils/api';

export default function LogHarvestScreen({ navigation }) {
  const [formData, setFormData] = useState({
    harvest_date: new Date().toISOString().split('T')[0],
    quantity_kg: '',
    quality_grade: 'A',
    variety: 'Arabica Typica',
    processing_method: 'Washed',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const varieties = [
    'Arabica Typica',
    'Arabica Bourbon',
    'Arabica Caturra',
    'Arabica Geisha',
    'SL28',
    'SL34',
    'Robusta',
  ];

  const grades = ['A', 'AA', 'AAA', 'B'];
  const processingMethods = ['Washed', 'Natural', 'Honey', 'Semi-Washed'];

  const handleSubmit = async () => {
    if (!formData.quantity_kg) {
      Alert.alert('Error', 'Please enter quantity');
      return;
    }

    if (parseFloat(formData.quantity_kg) <= 0) {
      Alert.alert('Error', 'Quantity must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      const user = await auth.getCurrentUser();

      const batchData = {
        farmer_id: user.id,
        cooperative_id: user.cooperative_id,
        harvest_date: formData.harvest_date,
        quantity_kg: parseFloat(formData.quantity_kg),
        quality_grade: formData.quality_grade,
        variety: formData.variety,
        processing_method: formData.processing_method,
        notes: formData.notes,
      };

      await batches.create(batchData);

      Alert.alert(
        'Success',
        'Harvest logged successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating batch:', error);
      Alert.alert('Error', 'Failed to log harvest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Log New Harvest</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Harvest Date</Text>
          <TextInput
            style={styles.input}
            value={formData.harvest_date}
            onChangeText={(text) => setFormData({ ...formData, harvest_date: text })}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.label}>Quantity (kg) *</Text>
          <TextInput
            style={styles.input}
            value={formData.quantity_kg}
            onChangeText={(text) => setFormData({ ...formData, quantity_kg: text })}
            placeholder="e.g., 150.5"
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Quality Grade</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.quality_grade}
              onValueChange={(value) => setFormData({ ...formData, quality_grade: value })}
              style={styles.picker}
            >
              {grades.map((grade) => (
                <Picker.Item key={grade} label={grade} value={grade} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Coffee Variety</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.variety}
              onValueChange={(value) => setFormData({ ...formData, variety: value })}
              style={styles.picker}
            >
              {varieties.map((variety) => (
                <Picker.Item key={variety} label={variety} value={variety} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Processing Method</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.processing_method}
              onValueChange={(value) => setFormData({ ...formData, processing_method: value })}
              style={styles.picker}
            >
              {processingMethods.map((method) => (
                <Picker.Item key={method} label={method} value={method} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Add any notes about this harvest..."
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Log Harvest</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: Platform.OS === 'ios' ? 180 : 50,
  },
  submitButton: {
    backgroundColor: '#6B4423',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
