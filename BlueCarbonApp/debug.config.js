/**
 * Debug configuration for React Native
 * This file helps resolve common debugging issues
 */

// Disable remote debugging by default
if (__DEV__) {
  console.log('🔧 Debug configuration loaded');
  
  // Disable network inspector to prevent connection issues
  global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest;
  global.FormData = global.originalFormData || global.FormData;
  
  // Override console methods to prevent debugger connection attempts
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.log = (...args) => {
    const message = args[0];
    if (typeof message === 'string' && message.includes('Remote debugger')) {
      return; // Suppress remote debugger messages
    }
    originalLog.apply(console, args);
  };
  
  console.warn = (...args) => {
    const message = args[0];
    if (typeof message === 'string' && 
        (message.includes('punycode') || 
         message.includes('deprecated') ||
         message.includes('debugger'))) {
      return; // Suppress deprecation and debugger warnings
    }
    originalWarn.apply(console, args);
  };
  
  console.error = (...args) => {
    const message = args[0];
    if (typeof message === 'string' && 
        (message.includes('Failed to connect to debugger') ||
         message.includes('Timeout while connecting') ||
         message.includes('WebSocket connection') ||
         message.includes('Bridge'))) {
      return; // Suppress debugger connection errors
    }
    originalError.apply(console, args);
  };
}

module.exports = {};
