import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import {Card, Button, FAB, Avatar, Chip} from 'react-native-paper';
import {useAuth} from '../../context/AuthContext';
import {useBlockchain} from '../../context/BlockchainContext';

const DashboardScreen = ({navigation}: any) => {
  const {user} = useAuth();
  const {projects, submissions, carbonCredits, getProjectsByUser, getSubmissionsByUser, getCreditsByUser} = useBlockchain();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingSubmissions: 0,
    verifiedSubmissions: 0,
    totalCredits: 0,
    creditValue: 0,
  });
  const [blockchainStatus, setBlockchainStatus] = useState<'connected' | 'disconnected' | 'syncing'>('connected');

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      const [userProjects, userSubmissions, userCredits] = await Promise.all([
        getProjectsByUser(user.id),
        getSubmissionsByUser(user.id),
        getCreditsByUser(user.id),
      ]);

      setStats({
        totalProjects: userProjects.length,
        pendingSubmissions: userSubmissions.filter(s => s.status === 'PENDING').length,
        verifiedSubmissions: userSubmissions.filter(s => s.status === 'APPROVED').length,
        totalCredits: userCredits.reduce((sum, c) => sum + c.creditsAmount, 0),
        creditValue: userCredits.reduce((sum, c) => sum + (c.creditsAmount * c.pricePerCredit), 0),
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'NGO_OFFICER': return 'NGO Field Officer';
      case 'COMMUNITY_HEAD': return 'Community Head';
      case 'COASTAL_PANCHAYAT': return 'Coastal Panchayat';
      default: return role;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerContent}>
              <View style={styles.userInfo}>
                <Avatar.Text size={50} label={user?.name?.charAt(0) || 'U'} />
                <View style={styles.userDetails}>
                  <Text style={styles.greeting}>{getGreeting()},</Text>
                  <Text style={styles.userName}>{user?.name || 'User'}</Text>
                  <Chip mode="outlined" compact style={styles.roleChip}>
                    {getRoleDisplayName(user?.role || '')}
                  </Chip>
                </View>
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletLabel}>Wallet Balance</Text>
                <Text style={styles.walletValue}>₹{stats.creditValue.toFixed(2)}</Text>
                <Text style={styles.creditsCount}>{stats.totalCredits} Credits</Text>
                <View style={styles.blockchainStatus}>
                  <Text style={[styles.statusText, {color: blockchainStatus === 'connected' ? '#4caf50' : '#f44336'}]}>
                    🔗 {blockchainStatus === 'connected' ? 'Blockchain Connected' : 'Offline Mode'}
                  </Text>
                  <Text style={styles.nccrStatus}>📡 NCCR Portal Synced</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.totalProjects}</Text>
              <Text style={styles.statLabel}>Total Projects</Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.pendingSubmissions}</Text>
              <Text style={styles.statLabel}>Pending Review</Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.verifiedSubmissions}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Quick Actions */}
        <Card style={styles.actionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('CreateProject')}
                style={styles.actionButton}
                icon="plus">
                Create New Project
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Projects')}
                style={styles.actionButton}
                icon="view-list">
                View All Projects
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.activityCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {submissions.slice(0, 3).map((submission, index) => (
              <View key={submission.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Text style={styles.activityEmoji}>
                    {submission.status === 'APPROVED' ? '✅' : 
                     submission.status === 'REJECTED' ? '❌' : '⏳'}
                  </Text>
                </View>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityTitle}>
                    Submission for {submission.plantType}
                  </Text>
                  <Text style={styles.activitySubtitle}>
                    {submission.numberOfSamples} samples • {submission.status}
                  </Text>
                </View>
                <Text style={styles.activityTime}>
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
            
            {submissions.length === 0 && (
              <Text style={styles.emptyState}>
                No recent activity. Create your first project to get started!
              </Text>
            )}
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateProject')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  roleChip: {
    alignSelf: 'flex-start',
  },
  walletInfo: {
    alignItems: 'flex-end',
  },
  walletLabel: {
    fontSize: 12,
    color: '#666',
  },
  walletValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  creditsCount: {
    fontSize: 12,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  actionCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  activityCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityEmoji: {
    fontSize: 18,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 20,
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
  blockchainStatus: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  nccrStatus: {
    fontSize: 9,
    color: '#4caf50',
    marginTop: 2,
  },
});

export default DashboardScreen;
