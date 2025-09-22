import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert, PermissionsAndroid, Platform} from 'react-native';
import {TextInput, Button, Card, Title, Chip, ProgressBar} from 'react-native-paper';
import Geolocation from '@react-native-community/geolocation';
import DocumentPicker from 'react-native-document-picker';
import {launchImageLibrary} from 'react-native-image-picker';
import {useAuth} from '../../context/AuthContext';
import {useBlockchain} from '../../context/BlockchainContext';
import {signData} from '../../utils/crypto';

const CreateProjectScreen = ({navigation}: any) => {
  const {user} = useAuth();
  const {createProject} = useBlockchain();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  
  const [projectData, setProjectData] = useState({
    name: '',
    location: {
      latitude: 0,
      longitude: 0,
      address: '',
      accuracy: 0,
    },
    area: '',
    areaUnit: 'hectares' as 'acres' | 'hectares',
    vegetationType: '' as 'MANGROVE' | 'SEAGRASS' | 'SALTMARSHES' | 'OTHERS',
    saplingsPlanted: '',
    plantationDate: new Date().toISOString().split('T')[0],
    expectedSurvivalRate: '85',
    droneData: null as any,
    photos: [] as any[],
  });

  const vegetationTypes = [
    {value: 'MANGROVE', label: 'Mangrove', icon: '🌿'},
    {value: 'SEAGRASS', label: 'Seagrass', icon: '🌱'},
    {value: 'SALTMARSHES', label: 'Salt Marshes', icon: '🌾'},
    {value: 'OTHERS', label: 'Others', icon: '🌳'},
  ];

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        const {latitude, longitude, accuracy} = position.coords;
        
        if (accuracy && accuracy > 50) {
          Alert.alert(
            'GPS Accuracy Warning',
            `GPS accuracy is ${accuracy.toFixed(0)}m. Please move to an open area for better accuracy.`,
            [
              {text: 'Retry', onPress: getCurrentLocation},
              {text: 'Continue Anyway', onPress: () => updateLocation(latitude, longitude, accuracy)},
            ]
          );
        } else {
          updateLocation(latitude, longitude, accuracy || 0);
        }
        setLocationLoading(false);
      },
      (error) => {
        console.error('Location error:', error);
        Alert.alert('Location Error', 'Unable to get current location. Please enable GPS and try again.');
        setLocationLoading(false);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000}
    );
  };

  const updateLocation = (latitude: number, longitude: number, accuracy: number) => {
    setProjectData(prev => ({
      ...prev,
      location: {
        latitude,
        longitude,
        accuracy,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      },
    }));
  };

  const handleDroneDataUpload = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.zip, DocumentPicker.types.allFiles],
      });
      setProjectData(prev => ({...prev, droneData: result[0]}));
      Alert.alert('Success', 'Drone data uploaded successfully');
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert('Error', 'Failed to upload drone data');
      }
    }
  };

  const handlePhotoUpload = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 10,
        includeBase64: false,
        includeExtra: true,
      },
      (response) => {
        if (response.assets && response.assets.length > 0) {
          setProjectData(prev => ({
            ...prev,
            photos: [...prev.photos, ...response.assets!],
          }));
        }
      }
    );
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!(projectData.name && projectData.location.latitude);
      case 2:
        return !!(projectData.area && projectData.vegetationType && projectData.saplingsPlanted);
      case 3:
        return projectData.photos.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      Alert.alert('Error', 'Please fill all required fields');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Generate photo hashes (simulate IPFS upload)
      const photoHashes = projectData.photos.map((photo, index) => 
        `photo_hash_${Date.now()}_${index}`
      );
      
      // Generate drone data hash if available
      const droneDataHash = projectData.droneData ? 
        `drone_hash_${Date.now()}` : undefined;

      const project = {
        name: projectData.name,
        location: projectData.location,
        area: parseFloat(projectData.area),
        areaUnit: projectData.areaUnit,
        vegetationType: projectData.vegetationType,
        saplingsPlanted: parseInt(projectData.saplingsPlanted),
        plantationDate: projectData.plantationDate,
        expectedSurvivalRate: parseFloat(projectData.expectedSurvivalRate),
        droneDataHash,
        photoHashes,
        createdBy: user?.id || '',
      };

      const projectId = await createProject(project);
      
      Alert.alert(
        'Success',
        'Project created successfully! It will be reviewed by NCCR.',
        [{text: 'OK', onPress: () => navigation.goBack()}]
      );
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Error', 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>Project Details</Title>
        
        <TextInput
          label="Project Name *"
          value={projectData.name}
          onChangeText={(text) => setProjectData(prev => ({...prev, name: text}))}
          mode="outlined"
          style={styles.input}
        />

        <Text style={styles.fieldLabel}>GPS Location *</Text>
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>
            {projectData.location.latitude ? 
              `${projectData.location.latitude.toFixed(6)}, ${projectData.location.longitude.toFixed(6)}` :
              'Location not captured'
            }
          </Text>
          {projectData.location.accuracy > 0 && (
            <Text style={styles.accuracyText}>
              Accuracy: {projectData.location.accuracy.toFixed(0)}m
            </Text>
          )}
          <Button
            mode="outlined"
            onPress={getCurrentLocation}
            loading={locationLoading}
            style={styles.locationButton}
            icon="crosshairs-gps">
            {projectData.location.latitude ? 'Update Location' : 'Capture Location'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderStep2 = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>Plantation Details</Title>
        
        <View style={styles.areaContainer}>
          <TextInput
            label="Area *"
            value={projectData.area}
            onChangeText={(text) => setProjectData(prev => ({...prev, area: text}))}
            keyboardType="numeric"
            mode="outlined"
            style={[styles.input, styles.areaInput]}
          />
          <View style={styles.unitSelector}>
            <Chip
              selected={projectData.areaUnit === 'hectares'}
              onPress={() => setProjectData(prev => ({...prev, areaUnit: 'hectares'}))}
              style={styles.unitChip}>
              Hectares
            </Chip>
            <Chip
              selected={projectData.areaUnit === 'acres'}
              onPress={() => setProjectData(prev => ({...prev, areaUnit: 'acres'}))}
              style={styles.unitChip}>
              Acres
            </Chip>
          </View>
        </View>

        <Text style={styles.fieldLabel}>Vegetation Type *</Text>
        <View style={styles.vegetationGrid}>
          {vegetationTypes.map((type) => (
            <Chip
              key={type.value}
              selected={projectData.vegetationType === type.value}
              onPress={() => setProjectData(prev => ({...prev, vegetationType: type.value as any}))}
              style={styles.vegetationChip}>
              {type.icon} {type.label}
            </Chip>
          ))}
        </View>

        <TextInput
          label="Number of Saplings Planted *"
          value={projectData.saplingsPlanted}
          onChangeText={(text) => setProjectData(prev => ({...prev, saplingsPlanted: text}))}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Expected Survival Rate (%)"
          value={projectData.expectedSurvivalRate}
          onChangeText={(text) => setProjectData(prev => ({...prev, expectedSurvivalRate: text}))}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />
      </Card.Content>
    </Card>
  );

  const renderStep3 = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>Upload Evidence</Title>
        
        <Text style={styles.fieldLabel}>Drone Data (Optional)</Text>
        <Button
          mode="outlined"
          onPress={handleDroneDataUpload}
          style={styles.uploadButton}
          icon="drone">
          Upload Drone Data (ZIP)
        </Button>
        {projectData.droneData && (
          <Text style={styles.uploadedFile}>✅ {projectData.droneData.name}</Text>
        )}

        <Text style={styles.fieldLabel}>Geo-tagged Photos *</Text>
        <Text style={styles.fieldDescription}>
          Take photos with GPS location and AI gesture recognition
        </Text>
        <Button
          mode="outlined"
          onPress={handlePhotoUpload}
          style={styles.uploadButton}
          icon="camera">
          Upload Photos
        </Button>
        
        {projectData.photos.length > 0 && (
          <View style={styles.photoGrid}>
            {projectData.photos.map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Text style={styles.photoName}>📸 Photo {index + 1}</Text>
              </View>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title>Create New Project</Title>
        <ProgressBar progress={step / 3} style={styles.progressBar} />
        <Text style={styles.stepText}>Step {step} of 3</Text>
      </View>

      <ScrollView style={styles.content}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <Button
            mode="outlined"
            onPress={() => setStep(step - 1)}
            style={styles.footerButton}>
            Back
          </Button>
        )}
        
        {step < 3 ? (
          <Button
            mode="contained"
            onPress={handleNext}
            disabled={!validateStep(step)}
            style={styles.footerButton}>
            Next
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            style={styles.footerButton}>
            Create Project
          </Button>
        )}
      </View>
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
  progressBar: {
    marginVertical: 8,
  },
  stepText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    elevation: 2,
  },
  input: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  fieldDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  accuracyText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  locationButton: {
    marginTop: 8,
  },
  areaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  areaInput: {
    flex: 1,
    marginRight: 12,
  },
  unitSelector: {
    flexDirection: 'column',
  },
  unitChip: {
    marginBottom: 4,
  },
  vegetationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  vegetationChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  uploadButton: {
    marginBottom: 12,
  },
  uploadedFile: {
    fontSize: 12,
    color: '#4caf50',
    marginBottom: 16,
  },
  photoGrid: {
    marginTop: 8,
  },
  photoItem: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 4,
  },
  photoName: {
    fontSize: 12,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default CreateProjectScreen;
