import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl, Alert} from 'react-native';
import {Card, Button, Title, Chip, FAB} from 'react-native-paper';
import {useAuth} from '../../context/AuthContext';
import {useBlockchain} from '../../context/BlockchainContext';

const WalletScreen = ({navigation}: any) => {
  const {user} = useAuth();
  const {carbonCredits, getCreditsByUser} = useBlockchain();
  const [refreshing, setRefreshing] = useState(false);
  const [walletStats, setWalletStats] = useState({
    totalCredits: 0,
    totalValue: 0,
    availableCredits: 0,
    retiredCredits: 0,
    pendingCredits: 0,
  });

  useEffect(() => {
    loadWalletData();
  }, [user]);

  useEffect(() => {
    calculateStats();
  }, [carbonCredits]);

  const loadWalletData = async () => {
    if (!user) return;
    try {
      await getCreditsByUser(user.id);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const calculateStats = () => {
    const stats = carbonCredits.reduce(
      (acc, credit) => {
        acc.totalCredits += credit.creditsAmount;
        acc.totalValue += credit.creditsAmount * credit.pricePerCredit;
        
        switch (credit.status) {
          case 'AVAILABLE':
            acc.availableCredits += credit.creditsAmount;
            break;
          case 'RETIRED':
            acc.retiredCredits += credit.creditsAmount;
            break;
          case 'PENDING':
            acc.pendingCredits += credit.creditsAmount;
            break;
        }
        return acc;
      },
      {totalCredits: 0, totalValue: 0, availableCredits: 0, retiredCredits: 0, pendingCredits: 0}
    );
    setWalletStats(stats);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return '#4caf50';
      case 'RETIRED': return '#666';
      case 'PENDING': return '#ff9800';
      case 'TRANSFERRED': return '#2196f3';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return '💰';
      case 'RETIRED': return '♻️';
      case 'PENDING': return '⏳';
      case 'TRANSFERRED': return '📤';
      default: return '💳';
    }
  };

  const handleTransferCredits = (creditId: string) => {
    Alert.alert(
      'Transfer Credits',
      'Enter recipient wallet address to transfer carbon credits.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Transfer', onPress: () => {
          // Simulate transfer
          Alert.alert('Success', 'Credits transferred successfully!');
        }},
      ]
    );
  };

  const handleRetireCredits = (creditId: string) => {
    Alert.alert(
      'Retire Credits',
      'Retiring credits will permanently remove them from circulation to offset your carbon footprint. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Retire', style: 'destructive', onPress: () => {
          // Simulate retirement
          Alert.alert('Success', 'Credits retired successfully!');
        }},
      ]
    );
  };

  const renderCreditCard = (credit: any) => (
    <Card key={credit.id} style={styles.creditCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.creditInfo}>
            <Text style={styles.creditAmount}>{credit.creditsAmount} Credits</Text>
            <Text style={styles.creditValue}>₹{(credit.creditsAmount * credit.pricePerCredit).toFixed(2)}</Text>
            <Text style={styles.creditProject}>Project: {credit.projectId}</Text>
          </View>
          <Chip
            mode="outlined"
            textStyle={{color: getStatusColor(credit.status)}}
            style={[styles.statusChip, {borderColor: getStatusColor(credit.status)}]}>
            {getStatusIcon(credit.status)} {credit.status}
          </Chip>
        </View>

        <View style={styles.creditDetails}>
          <Text style={styles.detailText}>
            📅 Issued: {new Date(credit.issuedAt).toLocaleDateString()}
          </Text>
          <Text style={styles.detailText}>
            💵 Price per Credit: ₹{credit.pricePerCredit}
          </Text>
          {credit.verifiedBy && (
            <Text style={styles.detailText}>
              ✅ Verified by: {credit.verifiedBy}
            </Text>
          )}
        </View>
      </Card.Content>
      
      {credit.status === 'AVAILABLE' && (
        <Card.Actions>
          <Button
            mode="outlined"
            onPress={() => handleTransferCredits(credit.id)}
            compact>
            Transfer
          </Button>
          <Button
            mode="contained"
            onPress={() => handleRetireCredits(credit.id)}
            compact>
            Retire
          </Button>
        </Card.Actions>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        
        {/* Wallet Overview */}
        <Card style={styles.overviewCard}>
          <Card.Content>
            <Title style={styles.overviewTitle}>Wallet Overview</Title>
            
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Total Portfolio Value</Text>
              <Text style={styles.balanceValue}>₹{walletStats.totalValue.toFixed(2)}</Text>
              <Text style={styles.balanceCredits}>{walletStats.totalCredits} Total Credits</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{walletStats.availableCredits}</Text>
                <Text style={styles.statLabel}>Available</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{walletStats.pendingCredits}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{walletStats.retiredCredits}</Text>
                <Text style={styles.statLabel}>Retired</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Wallet Address */}
        <Card style={styles.addressCard}>
          <Card.Content>
            <Text style={styles.addressLabel}>Your Wallet Address</Text>
            <Text style={styles.addressValue}>{user?.walletAddress || 'Not available'}</Text>
            <Button
              mode="outlined"
              onPress={() => {
                // Copy to clipboard functionality
                Alert.alert('Copied', 'Wallet address copied to clipboard');
              }}
              style={styles.copyButton}
              compact>
              Copy Address
            </Button>
          </Card.Content>
        </Card>

        {/* Carbon Credits */}
        <View style={styles.creditsSection}>
          <Text style={styles.sectionTitle}>Carbon Credits</Text>
          
          {carbonCredits.length > 0 ? (
            carbonCredits.map(renderCreditCard)
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateTitle}>No Carbon Credits Yet</Text>
                  <Text style={styles.emptyStateText}>
                    Create projects and submit monitoring data to earn carbon credits
                  </Text>
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('Projects')}
                    style={styles.createButton}>
                    View Projects
                  </Button>
                </View>
              </Card.Content>
            </Card>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="swap-horizontal"
        onPress={() => {
          Alert.alert('Marketplace', 'Carbon credit marketplace coming soon!');
        }}
        label="Trade"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  overviewCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  overviewTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4caf50',
    marginVertical: 4,
  },
  balanceCredits: {
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  addressCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  addressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  addressValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  copyButton: {
    alignSelf: 'flex-start',
  },
  creditsSection: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  creditCard: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  creditInfo: {
    flex: 1,
    marginRight: 12,
  },
  creditAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  creditValue: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '500',
  },
  creditProject: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusChip: {
    height: 28,
  },
  creditDetails: {
    marginTop: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  emptyCard: {
    elevation: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    marginTop: 8,
  },
  bottomSpacing: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
});

export default WalletScreen;
