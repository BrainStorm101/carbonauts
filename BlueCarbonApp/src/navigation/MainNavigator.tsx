import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DashboardScreen from '../screens/main/DashboardScreen';
import CreateProjectScreen from '../screens/main/CreateProjectScreen';
import ProjectsScreen from '../screens/main/ProjectsScreen';
import SubmissionsScreen from '../screens/main/SubmissionsScreen';
import WalletScreen from '../screens/main/WalletScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{title: 'Blue Carbon Registry'}}
    />
    <Stack.Screen 
      name="CreateProject" 
      component={CreateProjectScreen}
      options={{title: 'Create Project'}}
    />
  </Stack.Navigator>
);

const ProjectsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Projects" 
      component={ProjectsScreen}
      options={{title: 'My Projects'}}
    />
  </Stack.Navigator>
);

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          
          switch (route.name) {
            case 'Home':
              iconName = 'dashboard';
              break;
            case 'ProjectsTab':
              iconName = 'nature';
              break;
            case 'Submissions':
              iconName = 'assignment';
              break;
            case 'Wallet':
              iconName = 'account-balance-wallet';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1976d2',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}>
      <Tab.Screen 
        name="Home" 
        component={DashboardStack}
        options={{title: 'Home'}}
      />
      <Tab.Screen 
        name="ProjectsTab" 
        component={ProjectsStack}
        options={{title: 'Projects'}}
      />
      <Tab.Screen 
        name="Submissions" 
        component={SubmissionsScreen}
        options={{title: 'Submissions'}}
      />
      <Tab.Screen 
        name="Wallet" 
        component={WalletScreen}
        options={{title: 'Wallet'}}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{title: 'Profile'}}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
