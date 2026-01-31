import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { batches } from '../utils/api';

export default function BatchDetailScreen({ route, navigation }) {
  const { batchId } = route.params;
  const [batch, setBatch] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingQR, setGeneratingQR] = useState(false);

  useEffect(() => {
    loadBatchDetails();
  }, []);

  const loadBatchDetails = async () => {
    try {
      setLoading(true);
      const response = await batches.getById(batchId);
      setBatch(response.data);
      setQrCode(response.data.qr_code_url);
    } catch (error) {
      console.error('Error loading batch:', error);
      Alert.alert('Error', 'Failed to load batch details');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    try {
      setGeneratingQR(true);
      const response = await batches.generateQR(batchId);
      setQrCode(response.data.qr_code);
      Alert.alert('Success', 'QR code generated successfully!');
    } catch (error) {
      console.error('Error generating QR:', error);
      Alert.alert('Error', 'Failed to generate QR code');
    } finally {
      setGeneratingQR(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B4423" />
      </View>
    );
  }

  if (!batch) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Batch not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Batch Code Header */}
        <View style={styles.header}>
          <Text style={styles.batchCode}>{batch.batch_code}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(batch.status) }]}>
            <Text style={styles.statusText}>{batch.status}</Text>
          </View>
        </View>

        {/* QR Code Section */}
        {qrCode ? (
          <View style={styles.qrSection}>
            <Text style={styles.sectionTitle}>QR Code</Text>
            <Image
              source={{ uri: qrCode }}
              style={styles.qrCode}
              resizeMode="contain"
            />
            <Text style={styles.qrHint}>Scan this code to trace the batch</Text>
          </View>
        ) : (
          <View style={styles.qrSection}>
            <Text style={styles.sectionTitle}>QR Code</Text>
            <TouchableOpacity
              style={[styles.generateButton, generatingQR && styles.generateButtonDisabled]}
              onPress={generateQRCode}
              disabled={generatingQR}
            >
              {generatingQR ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.generateButtonText}>Generate QR Code</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Batch Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Harvest Details</Text>

          <DetailRow label="Harvest Date" value={new Date(batch.harvest_date).toLocaleDateString()} />
          <DetailRow label="Quantity" value={`${batch.quantity_kg} kg`} />
          <DetailRow label="Quality Grade" value={batch.quality_grade} />
          <DetailRow label="Variety" value={batch.variety} />
          <DetailRow label="Processing Method" value={batch.processing_method} />

          {batch.notes && (
            <>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{batch.notes}</Text>
            </>
          )}
        </View>

        {/* Farmer Info */}
        {batch.farmer_name && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Farmer Information</Text>
            <DetailRow label="Farmer" value={batch.farmer_name} />
            <DetailRow label="Farmer Code" value={batch.farmer_code} />
            {batch.farm_location && <DetailRow label="Location" value={batch.farm_location} />}
            {batch.certification && <DetailRow label="Certification" value={batch.certification} />}
          </View>
        )}

        {/* Cooperative Info */}
        {batch.cooperative_name && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Cooperative</Text>
            <DetailRow label="Name" value={batch.cooperative_name} />
            {batch.cooperative_location && (
              <DetailRow label="Location" value={`${batch.cooperative_location}, ${batch.country}`} />
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const getStatusColor = (status) => {
  switch (status) {
    case 'logged': return '#10b981';
    case 'verified': return '#3b82f6';
    case 'shipped': return '#8b5cf6';
    default: return '#6b7280';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
  content: {
    padding: 15,
  },
  header: {
    backgroundColor: '#6B4423',
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  batchCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  qrSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  qrCode: {
    width: 250,
    height: 250,
    marginBottom: 10,
  },
  qrHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  generateButton: {
    backgroundColor: '#6B4423',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    alignItems: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 140,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
