import { View, Text, TextInput, StyleSheet } from 'react-native';

export default function Input({ 
  label, 
  rightElement, 
  ...props      
}) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {label && <Text style={styles.label}>{label}</Text>}
        {rightElement && rightElement}
      </View>

      <TextInput
        style={styles.input}
        placeholderTextColor="#94a3b8"
        {...props} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
});