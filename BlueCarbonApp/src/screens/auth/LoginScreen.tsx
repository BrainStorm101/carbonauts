import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import {TextInput, Button, Card, Title} from 'react-native-paper';
import {useAuth} from '../../context/AuthContext';

const LoginScreen = () => {
  const [email, setEmail] = useState('demo@bluecarbon.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const {login} = useAuth();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await login(email, password);
    } catch (error) {
      Alert.alert('Login Failed', 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>🌊 Blue Carbon Registry - EMAIL LOGIN</Title>
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.button}>
            Login
          </Button>

          <Text style={styles.demoText}>
            Demo: demo@bluecarbon.com / password123
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  demoText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 16,
  },
});

export default LoginScreen;
