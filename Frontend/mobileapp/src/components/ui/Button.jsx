import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Button({ 
  title, 
  onPress, 
  isLoading = false, 
  disabled = false, 
  style 
}) {
  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={onPress} 
      disabled={disabled || isLoading}
      style={[styles.container, style, disabled && styles.disabledContainer]} 
    >
      <LinearGradient
        colors={disabled ? ['#94a3b8', '#cbd5e1'] : ['#1e40af', '#3b82f6']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16, 
    
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  disabledContainer: {
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.8,
  },
  gradient: {
    paddingVertical: 18, 
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16, 
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800', 
    letterSpacing: 0.4, 
  }
});