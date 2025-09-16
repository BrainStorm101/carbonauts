import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {Card, Button, RadioButton, Title} from 'react-native-paper';
import {useAuth} from '../../context/AuthContext';

const RoleSelectionScreen = ({navigation}: any) => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const {updateProfile} = useAuth();

  const roles = [
    {
      value: 'NGO_OFFICER',
      label: 'NGO Field Officer',
      description: 'Manage restoration projects and coordinate with communities',
      icon: '🌱',
    },
    {
      value: 'COMMUNITY_HEAD',
      label: 'Community Head',
      description: 'Lead community-based restoration initiatives',
      icon: '👥',
    },
    {
      value: 'COASTAL_PANCHAYAT',
      label: 'Coastal Panchayat',
      description: 'Oversee coastal restoration at administrative level',
      icon: '🏛️',
    },
  ];

  const handleContinue = async () => {
    if (!selectedRole) return;
    
    try {
      await updateProfile({role: selectedRole as any});
      navigation.navigate('ProfileSetup');
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Title style={styles.title}>Select Your Role</Title>
        <Text style={styles.subtitle}>
          Choose the role that best describes your position in the Blue Carbon restoration ecosystem
        </Text>

        {roles.map((role) => (
          <Card key={role.value} style={styles.roleCard}>
            <Card.Content>
              <View style={styles.roleHeader}>
                <Text style={styles.roleIcon}>{role.icon}</Text>
                <View style={styles.roleInfo}>
                  <Text style={styles.roleLabel}>{role.label}</Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </View>
                <RadioButton
                  value={role.value}
                  status={selectedRole === role.value ? 'checked' : 'unchecked'}
                  onPress={() => setSelectedRole(role.value)}
                />
              </View>
            </Card.Content>
          </Card>
        ))}

        <Button
          mode="contained"
          onPress={handleContinue}
          disabled={!selectedRole}
          style={styles.continueButton}>
          Continue
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
    lineHeight: 20,
  },
  roleCard: {
    marginBottom: 12,
    elevation: 2,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  roleInfo: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  continueButton: {
    marginTop: 24,
    paddingVertical: 4,
  },
});

export default RoleSelectionScreen;
