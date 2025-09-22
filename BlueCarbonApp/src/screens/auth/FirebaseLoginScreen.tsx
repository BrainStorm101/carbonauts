import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {TextInput, Button, Card, Title, HelperText, ActivityIndicator} from 'react-native-paper';
import {useFirebaseAuth} from '../../context/FirebaseAuthContext';

const FirebaseLoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const {sendOTP, verifyOTP, isLoading} = useFirebaseAuth();

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const validatePhone = (phoneNumber: string) => {
    const phoneRegex = /^[+]?[1-9]\d{9,14}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  };

  const handleSendOTP = async () => {
    setPhoneError('');
    setOtpError('');
    
    if (!phone.trim()) {
      setPhoneError('Phone number is required');
      return;
    }

    if (!validatePhone(phone)) {
      setPhoneError('Please enter a valid phone number (10-15 digits)');
      return;
    }

    try {
      await sendOTP(phone.trim());
      setOtpSent(true);
      setCountdown(60); // 60 seconds countdown
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handleVerifyOTP = async () => {
    setOtpError('');
    
    if (!otp.trim()) {
      setOtpError('OTP is required');
      return;
    }
    
    // Ensure OTP is exactly 6 digits
    if (otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    // Validate OTP contains only numbers
    if (!/^\d{6}$/.test(otp)) {
      setOtpError('OTP must contain only numbers');
      return;
    }

    try {
      await verifyOTP(otp.trim());
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    await handleSendOTP();
  };

  const handleChangePhone = () => {
    setOtpSent(false);
    setOtp('');
    setOtpError('');
    setCountdown(0);
  };

  if (isLoading && !otpSent) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Sending OTP...</Text>
      </View>
    );
  }

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
              onChangeText={(text) => {
                setPhone(text);
                setPhoneError('');
              }}
              keyboardType="phone-pad"
              mode="outlined"
              style={styles.input}
              disabled={otpSent}
              left={<TextInput.Icon icon="phone" />}
              error={!!phoneError}
              placeholder="+1234567890"
            />
            {phoneError ? <HelperText type="error">{phoneError}</HelperText> : null}

            {!otpSent ? (
              <Button
                mode="contained"
                onPress={handleSendOTP}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}>
                Send OTP
              </Button>
            ) : (
              <>
                <TextInput
                  label="Enter OTP"
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text);
                    setOtpError('');
                  }}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.input}
                  maxLength={6}
                  left={<TextInput.Icon icon="lock" />}
                  error={!!otpError}
                  placeholder="123456"
                />
                {otpError ? <HelperText type="error">{otpError}</HelperText> : null}
                
                <Button
                  mode="contained"
                  onPress={handleVerifyOTP}
                  loading={isLoading}
                  disabled={isLoading || otp.length !== 6}
                  style={styles.button}>
                  Verify & Login
                </Button>
                
                <View style={styles.buttonRow}>
                  <Button
                    mode="text"
                    onPress={handleChangePhone}
                    style={styles.resendButton}>
                    Change Phone Number
                  </Button>
                  
                  <TouchableOpacity
                    onPress={handleResendOTP}
                    disabled={countdown > 0}
                    style={[
                      styles.resendButton,
                      countdown > 0 && styles.disabledButton
                    ]}>
                    <Text style={[
                      styles.resendText,
                      countdown > 0 && styles.disabledText
                    ]}>
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <Text style={styles.helpText}>
              {otpSent 
                ? 'Check your phone for the OTP. It will expire in 5 minutes.'
                : 'Enter your phone number to receive an OTP for login.'
              }
            </Text>

            <Text style={styles.firebaseText}>
              🔥 Powered by Firebase Authentication
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#1976d2',
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
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  resendText: {
    color: '#1976d2',
    fontSize: 14,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#999',
  },
  helpText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginTop: 16,
    lineHeight: 16,
  },
  firebaseText: {
    textAlign: 'center',
    fontSize: 10,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default FirebaseLoginScreen;
