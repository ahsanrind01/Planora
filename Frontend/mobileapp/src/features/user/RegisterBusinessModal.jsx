import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';

export default function RegisterBusinessModal({ visible, onClose }) {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Register Business</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X color="#64748b" size={24} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.body}>
                        <Text style={styles.text}>
                            This is where we will put the form (Business Name, Address, Category) to upgrade the user's role to 'manager'.
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, minHeight: '50%', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
    closeButton: { padding: 4, backgroundColor: '#f1f5f9', borderRadius: 20 },
    body: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 24 }
});