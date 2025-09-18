import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppRegistry } from 'react-native';
import App from '../App';

// Register the app
AppRegistry.registerComponent('BlueCarbonApp', () => App);

// Run the app in the browser
const container = document.getElementById('root');
const root = createRoot(container);

AppRegistry.runApplication('BlueCarbonApp', {
  rootTag: container,
});
