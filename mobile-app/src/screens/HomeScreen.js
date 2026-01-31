import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { batches, auth, price } from '../utils/api';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [myBatches, setMyBatches] = useState([]);
  const [coffeePrice, setCoffeePrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
    loadData();
  }, []);

  const loadUserData = async () => {
    const userData = await auth.getCurrentUser();
    setUser(userData);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const userData = await auth.getCurrentUser();

      // Load farmer's batches and current price
      const [batchesRes, priceRes] = await Promise.all([
        batches.getAll({ farmer_id: userData.id }),
        price.getCurrent(),
      ]);

      setMyBatches(batchesRes.data);
      setCoffeePrice(priceRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await auth.logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const renderBatch = ({ item }) => (
    <TouchableOpacity
      style={styles.batchCard}
      onPress={() => navigation.navigate('BatchDetail', { batchId: item.id })}
    >
      <View style={styles.batchHeader}>
        <Text style={styles.batchCode}>{item.batch_code}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.batchDetails}>
        <Text style={styles.batchLabel}>Date: {new Date(item.harvest_date).toLocaleDateString()}</Text>
        <Text style={styles.batchLabel}>Quantity: {item.quantity_kg} kg</Text>
        <Text style={styles.batchLabel}>Grade: {item.quality_grade} • {item.variety}</Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'logged': return '#10b981';
      case 'verified': return '#3b82f6';
      case 'shipped': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const totalQuantity = myBatches.reduce((sum, batch) => sum + parseFloat(batch.quantity_kg), 0);

  return (
    <View style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.farmerName}>{user?.name || 'Farmer'}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{myBatches.length}</Text>
            <Text style={styles.statLabel}>Batches</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{Math.round(totalQuantity)}</Text>
            <Text style={styles.statLabel}>Total kg</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>${coffeePrice?.price_usd_per_lb || '0.00'}</Text>
            <Text style={styles.statLabel}>NY-C /lb</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('LogHarvest')}
        >
          <Text style={styles.primaryButtonText}>➕ Log New Harvest</Text>
        </TouchableOpacity>
      </View>

      {/* Batches List */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>My Harvest Batches</Text>
      </View>

      <FlatList
        data={myBatches}
        renderItem={renderBatch}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No batches logged yet</Text>
            <Text style={styles.emptySubtext}>Tap "Log New Harvest" to get started</Text>
          </View>
        }
      />

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    backgroundColor: '#6B4423',
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    color: '#f0e6d2',
    fontSize: 14,
  },
  farmerName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#f0e6d2',
    fontSize: 12,
    marginTop: 4,
  },
  actionButtons: {
    padding: 15,
  },
  primaryButton: {
    backgroundColor: '#3d2817',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listHeader: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  batchCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  batchCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B4423',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  batchDetails: {
    gap: 4,
  },
  batchLabel: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  logoutButton: {
    margin: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logoutText: {
    color: '#6B4423',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
