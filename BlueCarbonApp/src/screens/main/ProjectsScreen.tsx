import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import {Card, Button, Chip, FAB, Searchbar} from 'react-native-paper';
import {useAuth} from '../../context/AuthContext';
import {useBlockchain} from '../../context/BlockchainContext';

const ProjectsScreen = ({navigation}: any) => {
  const {user} = useAuth();
  const {projects, getProjectsByUser} = useBlockchain();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadProjects();
  }, [user]);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, filter]);

  const loadProjects = async () => {
    if (!user) return;
    try {
      await getProjectsByUser(user.id);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const filterProjects = () => {
    let filtered = projects;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.vegetationType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filter !== 'ALL') {
      filtered = filtered.filter(project => project.status === filter);
    }

    setFilteredProjects(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#4caf50';
      case 'REJECTED': return '#f44336';
      case 'PENDING': return '#ff9800';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return '✅';
      case 'REJECTED': return '❌';
      case 'PENDING': return '⏳';
      default: return '📋';
    }
  };

  const getVegetationIcon = (type: string) => {
    switch (type) {
      case 'MANGROVE': return '🌿';
      case 'SEAGRASS': return '🌱';
      case 'SALTMARSHES': return '🌾';
      case 'OTHERS': return '🌳';
      default: return '🌿';
    }
  };

  const renderProjectCard = (project: any) => (
    <Card key={project.id} style={styles.projectCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.projectInfo}>
            <Text style={styles.projectName}>{project.name}</Text>
            <View style={styles.projectMeta}>
              <Text style={styles.vegetationType}>
                {getVegetationIcon(project.vegetationType)} {project.vegetationType}
              </Text>
              <Text style={styles.area}>
                {project.area} {project.areaUnit}
              </Text>
            </View>
          </View>
          <Chip
            mode="outlined"
            textStyle={{color: getStatusColor(project.status)}}
            style={[styles.statusChip, {borderColor: getStatusColor(project.status)}]}>
            {getStatusIcon(project.status)} {project.status}
          </Chip>
        </View>

        <View style={styles.projectDetails}>
          <Text style={styles.detailText}>
            📍 {project.location.latitude.toFixed(4)}, {project.location.longitude.toFixed(4)}
          </Text>
          <Text style={styles.detailText}>
            🌱 {project.saplingsPlanted} saplings planted
          </Text>
          <Text style={styles.detailText}>
            📅 {new Date(project.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {project.carbonCreditsEarned > 0 && (
          <View style={styles.creditsContainer}>
            <Text style={styles.creditsText}>
              💰 {project.carbonCreditsEarned} Carbon Credits Earned
            </Text>
          </View>
        )}
      </Card.Content>
      
      <Card.Actions>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('ProjectDetails', {projectId: project.id})}
          compact>
          View Details
        </Button>
        {project.status === 'APPROVED' && (
          <Button
            mode="contained"
            onPress={() => navigation.navigate('CreateSubmission', {projectId: project.id})}
            compact>
            Add Submission
          </Button>
        )}
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search projects..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <Chip
              key={status}
              selected={filter === status}
              onPress={() => setFilter(status)}
              style={styles.filterChip}>
              {status}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        
        {filteredProjects.length > 0 ? (
          filteredProjects.map(renderProjectCard)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>
              {searchQuery || filter !== 'ALL' ? 'No projects found' : 'No projects yet'}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || filter !== 'ALL' 
                ? 'Try adjusting your search or filters'
                : 'Create your first project to get started with carbon credit generation'
              }
            </Text>
            {!searchQuery && filter === 'ALL' && (
              <Button
                mode="contained"
                onPress={() => navigation.navigate('CreateProject')}
                style={styles.createButton}>
                Create First Project
              </Button>
            )}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

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
  projectCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectInfo: {
    flex: 1,
    marginRight: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vegetationType: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
  },
  area: {
    fontSize: 12,
    color: '#666',
  },
  statusChip: {
    height: 28,
  },
  projectDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  creditsContainer: {
    backgroundColor: '#e8f5e8',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  creditsText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '500',
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

export default ProjectsScreen;
