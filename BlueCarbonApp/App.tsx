import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Provider as PaperProvider} from 'react-native-paper';
import {AuthProvider} from './src/context/AuthContext';
import {BlockchainProvider} from './src/context/BlockchainContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import {useAuth} from './src/context/AuthContext';
import LoadingScreen from './src/screens/LoadingScreen';

const Stack = createStackNavigator();

const AppContent = () => {
  const {isAuthenticated, isLoading} = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <PaperProvider>
      <AuthProvider>
        <BlockchainProvider>
          <AppContent />
        </BlockchainProvider>
      </AuthProvider>
    </PaperProvider>
  );
};

export default App;
