import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import {TextInput, Button, Card, Title, Chip} from 'react-native-paper';
import DocumentPicker from 'react-native-document-picker';
import {useAuth} from '../../context/AuthContext';

const ProfileSetupScreen = ({navigation}: any) => {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    coastalZone: '',
    language: 'en',
    documents: [] as any[],
  });
  const [loading, setLoading] = useState(false);
  const {updateProfile, user} = useAuth();

  const languages = [
    {code: 'en', name: 'English'},
    {code: 'hi', name: 'Hindi'},
    {code: 'bn', name: 'Bengali'},
    {code: 'ta', name: 'Tamil'},
    {code: 'te', name: 'Telugu'},
    {code: 'ml', name: 'Malayalam'},
  ];

  const coastalZones = [
    'West Coast - Gujarat',
    'West Coast - Maharashtra',
    'West Coast - Goa',
    'West Coast - Karnataka',
    'West Coast - Kerala',
    'East Coast - Tamil Nadu',
    'East Coast - Andhra Pradesh',
    'East Coast - Odisha',
    'East Coast - West Bengal',
    'Islands - Andaman & Nicobar',
    'Islands - Lakshadweep',
  ];

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
        allowMultiSelection: true,
      });
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...result],
      }));
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert('Error', 'Failed to pick documents');
      }
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.organization || !formData.coastalZone) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await updateProfile({
        name: formData.name,
        organization: formData.organization,
        coastalZone: formData.coastalZone,
        language: formData.language,
      });
      navigation.navigate('Main');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Title style={styles.title}>Complete Your Profile</Title>
        <Text style={styles.subtitle}>
          Provide your details for KYC verification and wallet setup
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <TextInput
              label="Full Name *"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({...prev, name: text}))}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label={user?.role === 'NGO_OFFICER' ? 'NGO Name *' : 
                     user?.role === 'COMMUNITY_HEAD' ? 'Community Name *' : 
                     'Panchayat Name *'}
              value={formData.organization}
              onChangeText={(text) => setFormData(prev => ({...prev, organization: text}))}
              mode="outlined"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Coastal Zone *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
              {coastalZones.map((zone) => (
                <Chip
                  key={zone}
                  selected={formData.coastalZone === zone}
                  onPress={() => setFormData(prev => ({...prev, coastalZone: zone}))}
                  style={styles.chip}>
                  {zone}
                </Chip>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Language Preference</Text>
            <Text style={styles.fieldDescription}>
              Select your preferred language for AI voice recognition
            </Text>
            
            <View style={styles.languageGrid}>
              {languages.map((lang) => (
                <Chip
                  key={lang.code}
                  selected={formData.language === lang.code}
                  onPress={() => setFormData(prev => ({...prev, language: lang.code}))}
                  style={styles.languageChip}>
                  {lang.name}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>KYC Documents</Text>
            <Text style={styles.fieldDescription}>
              Upload ID proof and organization documents
            </Text>
            
            <Button
              mode="outlined"
              onPress={handleDocumentPick}
              style={styles.uploadButton}
              icon="file-upload">
              Upload Documents
            </Button>

            {formData.documents.map((doc, index) => (
              <View key={index} style={styles.documentItem}>
                <Text style={styles.documentName}>{doc.name}</Text>
                <Button
                  mode="text"
                  onPress={() => removeDocument(index)}
                  textColor="#f44336">
                  Remove
                </Button>
              </View>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Wallet Information</Text>
            <Text style={styles.fieldDescription}>
              Your carbon credits wallet address (auto-generated)
            </Text>
            <Text style={styles.walletAddress}>{user?.walletAddress}</Text>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}>
          Complete Setup
        </Button>
      </View>
    </ScrollView>
  );
};

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
    textAlign: 'center',
    marginBottom: 8,
    color: '#1976d2',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
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
    marginBottom: 12,
  },
  chipContainer: {
    marginBottom: 12,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  uploadButton: {
    marginBottom: 12,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  documentName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  walletAddress: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    color: '#333',
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 4,
  },
});

export default ProfileSetupScreen;
