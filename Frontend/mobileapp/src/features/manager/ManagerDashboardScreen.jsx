import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ManagerDashboardScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Manager Dashboard</Text>
            <Text style={styles.subtitle}>Your business stats will appear here.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafaf9' },
    title: { fontSize: 24, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#64748b' }
});