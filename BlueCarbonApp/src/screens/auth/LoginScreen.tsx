import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {TextInput, Button, Card, Title} from 'react-native-paper';
import {useAuth} from '../../context/AuthContext';

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const {login, sendOTP} = useAuth();

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      await sendOTP(phone);
      setOtpSent(true);
      Alert.alert('Success', 'OTP sent to your phone number');
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert('Error', 'Please enter a valid OTP');
      return;
    }

    try {
      setLoading(true);
      await login(phone, otp);
    } catch (error) {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>🌊 Blue Carbon Registry</Title>
            <Text style={styles.subtitle}>
              Transparent Carbon Credit Trading Platform
            </Text>

            <TextInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              mode="outlined"
              style={styles.input}
              disabled={otpSent}
              left={<TextInput.Icon icon="phone" />}
            />

            {!otpSent ? (
              <Button
                mode="contained"
                onPress={handleSendOTP}
                loading={loading}
                style={styles.button}>
                Send OTP
              </Button>
            ) : (
              <>
                <TextInput
                  label="Enter OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.input}
                  maxLength={6}
                  left={<TextInput.Icon icon="lock" />}
                />
                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={loading}
                  style={styles.button}>
                  Verify & Login
                </Button>
                <Button
                  mode="text"
                  onPress={() => {
                    setOtpSent(false);
                    setOtp('');
                  }}
                  style={styles.resendButton}>
                  Change Phone Number
                </Button>
              </>
            )}

            <Text style={styles.demoText}>
              Demo OTP: 123456
            </Text>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3f2fd',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  resendButton: {
    marginTop: 8,
  },
  demoText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 16,
    fontStyle: 'italic',
  },
});

export default LoginScreen;
