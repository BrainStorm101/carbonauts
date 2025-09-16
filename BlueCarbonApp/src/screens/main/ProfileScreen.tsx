import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import {Card, Button, Title, Avatar, List, Switch, Divider} from 'react-native-paper';
import {useAuth} from '../../context/AuthContext';

const ProfileScreen = ({navigation}: any) => {
  const {user, logout} = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineSyncEnabled, setOfflineSyncEnabled] = useState(true);

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'NGO_OFFICER': return 'NGO Field Officer';
      case 'COMMUNITY_HEAD': return 'Community Head';
      case 'COASTAL_PANCHAYAT': return 'Coastal Panchayat';
      default: return role;
    }
  };

  const getLanguageDisplayName = (lang: string) => {
    switch (lang) {
      case 'en': return 'English';
      case 'hi': return 'Hindi';
      case 'ta': return 'Tamil';
      case 'te': return 'Telugu';
      case 'ml': return 'Malayalam';
      case 'kn': return 'Kannada';
      default: return lang;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Logout', style: 'destructive', onPress: logout},
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing feature coming soon!');
  };

  const handleViewKYC = () => {
    Alert.alert(
      'KYC Documents',
      'Your KYC documents have been verified and are stored securely.',
      [{text: 'OK'}]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Support',
      'For support, please contact:\n\nEmail: support@bluecarbon.org\nPhone: +91-1234567890',
      [{text: 'OK'}]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Blue Carbon Registry',
      'Blue Carbon Registry v1.0.0\n\nA blockchain-based platform for transparent carbon credit trading and coastal ecosystem restoration.\n\nBuilt with Hyperledger Fabric and React Native.',
      [{text: 'OK'}]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.profileHeader}>
              <Avatar.Text 
                size={80} 
                label={user?.name?.charAt(0) || 'U'}
                style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <Title style={styles.userName}>{user?.name || 'User'}</Title>
                <Text style={styles.userRole}>{getRoleDisplayName(user?.role || '')}</Text>
                <Text style={styles.userPhone}>{user?.phoneNumber}</Text>
                <Text style={styles.userLanguage}>
                  Language: {getLanguageDisplayName(user?.language || 'en')}
                </Text>
              </View>
            </View>
            <Button
              mode="outlined"
              onPress={handleEditProfile}
              style={styles.editButton}
              icon="pencil">
              Edit Profile
            </Button>
          </Card.Content>
        </Card>

        {/* Wallet Info */}
        <Card style={styles.walletCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Wallet Information</Text>
            <Text style={styles.walletAddress}>
              {user?.walletAddress || 'Wallet address not available'}
            </Text>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Wallet')}
              style={styles.walletButton}
              icon="wallet">
              View Wallet
            </Button>
          </Card.Content>
        </Card>

        {/* Settings */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            <List.Item
              title="Push Notifications"
              description="Receive updates about your projects"
              left={props => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Offline Sync"
              description="Sync data when internet is available"
              left={props => <List.Icon {...props} icon="sync" />}
              right={() => (
                <Switch
                  value={offlineSyncEnabled}
                  onValueChange={setOfflineSyncEnabled}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="KYC Documents"
              description="View your verification documents"
              left={props => <List.Icon {...props} icon="file-document" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleViewKYC}
            />
          </Card.Content>
        </Card>

        {/* App Info */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Information</Text>
            
            <List.Item
              title="Help & Support"
              description="Get help with the app"
              left={props => <List.Icon {...props} icon="help-circle" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleSupport}
            />
            
            <Divider />
            
            <List.Item
              title="About"
              description="App version and information"
              left={props => <List.Icon {...props} icon="information" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleAbout}
            />
            
            <Divider />
            
            <List.Item
              title="Privacy Policy"
              description="How we protect your data"
              left={props => <List.Icon {...props} icon="shield-check" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Privacy Policy', 'Privacy policy coming soon!')}
            />
          </Card.Content>
        </Card>

        {/* Logout */}
        <Card style={styles.logoutCard}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={handleLogout}
              style={styles.logoutButton}
              buttonColor="#f44336"
              icon="logout">
              Logout
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userLanguage: {
    fontSize: 12,
    color: '#666',
  },
  editButton: {
    alignSelf: 'flex-start',
  },
  walletCard: {
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
  walletAddress: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    color: '#333',
  },
  walletButton: {
    alignSelf: 'flex-start',
  },
  settingsCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  infoCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  logoutCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  logoutButton: {
    marginTop: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ProfileScreen;
