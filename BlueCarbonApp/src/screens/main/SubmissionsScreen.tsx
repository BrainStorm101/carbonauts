import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl, Alert} from 'react-native';
import {Card, Button, Chip, FAB, Searchbar} from 'react-native-paper';
import {useAuth} from '../../context/AuthContext';
import {useBlockchain} from '../../context/BlockchainContext';

const SubmissionsScreen = ({navigation}: any) => {
  const {user} = useAuth();
  const {submissions, getSubmissionsByUser} = useBlockchain();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSubmissions, setFilteredSubmissions] = useState(submissions);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadSubmissions();
  }, [user]);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchQuery, filter]);

  const loadSubmissions = async () => {
    if (!user) return;
    try {
      await getSubmissionsByUser(user.id);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSubmissions();
    setRefreshing(false);
  };

  const filterSubmissions = () => {
    let filtered = submissions;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(submission =>
        submission.plantType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.projectId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filter !== 'ALL') {
      filtered = filtered.filter(submission => submission.status === filter);
    }

    setFilteredSubmissions(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#4caf50';
      case 'REJECTED': return '#f44336';
      case 'PENDING': return '#ff9800';
      case 'UNDER_REVIEW': return '#2196f3';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return '✅';
      case 'REJECTED': return '❌';
      case 'PENDING': return '⏳';
      case 'UNDER_REVIEW': return '🔍';
      default: return '📋';
    }
  };

  const getPlantTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'MANGROVE': return '🌿';
      case 'SEAGRASS': return '🌱';
      case 'SALTMARSHES': return '🌾';
      default: return '🌳';
    }
  };

  const handleViewDetails = (submission: any) => {
    Alert.alert(
      'Submission Details',
      `Plant Type: ${submission.plantType}\n` +
      `Samples: ${submission.numberOfSamples}\n` +
      `Growth Rate: ${submission.growthRate}%\n` +
      `Health Score: ${submission.healthScore}/100\n` +
      `Submitted: ${new Date(submission.submittedAt).toLocaleDateString()}\n` +
      `Status: ${submission.status}` +
      (submission.reviewNotes ? `\n\nReview Notes: ${submission.reviewNotes}` : ''),
      [{text: 'OK'}]
    );
  };

  const renderSubmissionCard = (submission: any) => (
    <Card key={submission.id} style={styles.submissionCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.submissionInfo}>
            <Text style={styles.submissionTitle}>
              {getPlantTypeIcon(submission.plantType)} {submission.plantType} Monitoring
            </Text>
            <Text style={styles.projectId}>Project: {submission.projectId}</Text>
          </View>
          <Chip
            mode="outlined"
            textStyle={{color: getStatusColor(submission.status)}}
            style={[styles.statusChip, {borderColor: getStatusColor(submission.status)}]}>
            {getStatusIcon(submission.status)} {submission.status}
          </Chip>
        </View>

        <View style={styles.submissionDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Samples:</Text>
            <Text style={styles.detailValue}>{submission.numberOfSamples}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Growth Rate:</Text>
            <Text style={styles.detailValue}>{submission.growthRate}%</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Health Score:</Text>
            <Text style={styles.detailValue}>{submission.healthScore}/100</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Submitted:</Text>
            <Text style={styles.detailValue}>
              {new Date(submission.submittedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {submission.carbonCreditsEarned > 0 && (
          <View style={styles.creditsContainer}>
            <Text style={styles.creditsText}>
              💰 Earned {submission.carbonCreditsEarned} Carbon Credits
            </Text>
          </View>
        )}

        {submission.reviewNotes && (
          <View style={styles.reviewNotesContainer}>
            <Text style={styles.reviewNotesTitle}>Review Notes:</Text>
            <Text style={styles.reviewNotesText}>{submission.reviewNotes}</Text>
          </View>
        )}
      </Card.Content>
      
      <Card.Actions>
        <Button
          mode="outlined"
          onPress={() => handleViewDetails(submission)}
          compact>
          View Details
        </Button>
        {submission.status === 'REJECTED' && (
          <Button
            mode="contained"
            onPress={() => navigation.navigate('CreateSubmission', {
              projectId: submission.projectId,
              resubmission: true
            })}
            compact>
            Resubmit
          </Button>
        )}
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search submissions..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}>
          {['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((status) => (
            <Chip
              key={status}
              selected={filter === status}
              onPress={() => setFilter(status)}
              style={styles.filterChip}>
              {status.replace('_', ' ')}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        
        {filteredSubmissions.length > 0 ? (
          filteredSubmissions.map(renderSubmissionCard)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>
              {searchQuery || filter !== 'ALL' ? 'No submissions found' : 'No submissions yet'}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || filter !== 'ALL' 
                ? 'Try adjusting your search or filters'
                : 'Submit monitoring data for your approved projects to earn carbon credits'
              }
            </Text>
            {!searchQuery && filter === 'ALL' && (
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Projects')}
                style={styles.createButton}>
                View Projects
              </Button>
            )}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="upload"
        onPress={() => navigation.navigate('Projects')}
        label="New Submission"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    elevation: 2,
  },
  searchbar: {
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  submissionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  submissionInfo: {
    flex: 1,
    marginRight: 12,
  },
  submissionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  projectId: {
    fontSize: 12,
    color: '#666',
  },
  statusChip: {
    height: 28,
  },
  submissionDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  creditsContainer: {
    backgroundColor: '#e8f5e8',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  creditsText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '500',
  },
  reviewNotesContainer: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  reviewNotesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  reviewNotesText: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  createButton: {
    marginTop: 12,
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

export default SubmissionsScreen;
