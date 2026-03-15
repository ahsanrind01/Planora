import React, { useState, useCallback } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    SafeAreaView, Modal, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Scissors, Plus, X, Trash2, DollarSign, Clock, Edit } from 'lucide-react-native';

import { useAuthStore } from '../../core/store/authStore';
import { useServiceStore } from '../../core/store/serviceStore';

export default function ManagerServicesScreen() {
    const user = useAuthStore(state => state.user);
    const { services, isLoadingServices, fetchBusinessServices, createService, updateService, deleteService } = useServiceStore();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentServiceId, setCurrentServiceId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({ name: '', description: '', price: '', duration: '' });

    // Refresh data when the screen is opened
    useFocusEffect(
        useCallback(() => { 
            if (user?.businessId) fetchBusinessServices(user.businessId);
        }, [user?.businessId])
    );

    const openAddModal = () => {
        setEditMode(false);
        setCurrentServiceId(null);
        setFormData({ name: '', description: '', price: '', duration: '30' }); // Default 30 mins
        setModalVisible(true);
    };

    const openEditModal = (service) => {
        setEditMode(true);
        setCurrentServiceId(service._id);
        setFormData({ 
            name: service.name, 
            description: service.description, 
            price: service.price.toString(), 
            duration: service.duration.toString() 
        });
        setModalVisible(true);
    };

    const handleSaveService = async () => {
        if (!formData.name || !formData.description || !formData.price || !formData.duration) {
            return Alert.alert("Missing Fields", "Please fill out all fields.");
        }

        setIsSubmitting(true);
        
        const payload = {
            name: formData.name,
            description: formData.description,
            price: Number(formData.price),
            duration: Number(formData.duration)
        };

        let result;
        if (editMode) {
            result = await updateService(currentServiceId, payload);
        } else {
            result = await createService(payload);
        }

        setIsSubmitting(false);

        if (result.success) {
            setModalVisible(false);
            Alert.alert("Success", editMode ? "Service updated!" : "Service added!");
        } else {
            Alert.alert("Error", result.message);
        }
    };

    const handleDelete = (id) => {
        Alert.alert("Delete Service", "Are you sure you want to remove this service?", [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete", style: "destructive", 
                onPress: async () => {
                    const result = await deleteService(id);
                    if (!result.success) Alert.alert("Error", result.message);
                } 
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#f43f5e', '#ec4899']} style={styles.header}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <View style={[styles.circle, styles.circleTopRight]} />
                        <View style={styles.headerTitleRow}>
                            <Scissors color="#ffffff" size={28} />
                            <Text style={styles.headerTitle}>My Services</Text>
                        </View>
                        <Text style={styles.headerSubtitle}>Manage what you offer to clients.</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                    <Plus color="#f43f5e" size={24} />
                    <Text style={styles.addButtonText}>Add New Service</Text>
                </TouchableOpacity>

                {isLoadingServices ? (
                    <ActivityIndicator size="large" color="#f43f5e" style={{ marginTop: 40 }} />
                ) : services.length === 0 ? (
                    <Text style={styles.emptyText}>You haven't added any services yet.</Text>
                ) : (
                    services.map((service) => (
                        <View key={service._id} style={styles.serviceCard}>
                            <View style={styles.serviceInfo}>
                                <Text style={styles.serviceName}>{service.name}</Text>
                                {service.description ? <Text style={styles.serviceDesc}>{service.description}</Text> : null}
                                
                                <View style={styles.serviceTags}>
                                    <View style={styles.tag}>
                                        <Clock color="#64748b" size={14} />
                                        <Text style={styles.tagText}>{service.duration} mins</Text>
                                    </View>
                                    <View style={styles.tag}>
                                        <DollarSign color="#64748b" size={14} />
                                        <Text style={styles.tagText}>${service.price}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.actionsBox}>
                                <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(service)}>
                                    <Edit color="#3b82f6" size={20} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(service._id)}>
                                    <Trash2 color="#ef4444" size={20} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Add / Edit Service Modal */}
            <Modal animationType="slide" transparent={true} visible={modalVisible}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{editMode ? "Edit Service" : "Add New Service"}</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                    <X color="#64748b" size={24} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>Service Name</Text>
                            <TextInput style={styles.input} placeholder="e.g. Men's Haircut" value={formData.name} onChangeText={(t) => setFormData({...formData, name: t})} />

                            <Text style={styles.label}>Description</Text>
                            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Briefly describe this service..." multiline value={formData.description} onChangeText={(t) => setFormData({...formData, description: t})} />

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Price ($)</Text>
                                    <TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" value={formData.price} onChangeText={(t) => setFormData({...formData, price: t})} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Duration (Mins)</Text>
                                    <TextInput style={styles.input} placeholder="e.g. 30" keyboardType="numeric" value={formData.duration} onChangeText={(t) => setFormData({...formData, duration: t})} />
                                </View>
                            </View>

                            <TouchableOpacity style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]} onPress={handleSaveService} disabled={isSubmitting}>
                                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{editMode ? "Update Service" : "Save Service"}</Text>}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fafaf9' },
    header: { paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' },
    headerContent: { paddingHorizontal: 20, paddingTop: 20 },
    circle: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 100 },
    circleTopRight: { width: 150, height: 150, top: -50, right: -50 },
    headerTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    headerTitle: { fontSize: 26, fontWeight: '700', color: '#ffffff', marginLeft: 10 },
    headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.9)' },
    
    content: { paddingHorizontal: 20, paddingTop: 20 },
    addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffe4e6', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#fecdd3', borderStyle: 'dashed' },
    addButtonText: { color: '#f43f5e', fontSize: 16, fontWeight: '700', marginLeft: 8 },
    emptyText: { textAlign: 'center', color: '#64748b', marginTop: 20, fontSize: 16 },
    
    serviceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: '#ffffff', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
    serviceInfo: { flex: 1, paddingRight: 10 },
    serviceName: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
    serviceDesc: { fontSize: 14, color: '#64748b', marginBottom: 10 },
    serviceTags: { flexDirection: 'row', gap: 12 },
    tag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f8fafc', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    tagText: { fontSize: 13, fontWeight: '600', color: '#475569' },
    actionsBox: { alignItems: 'flex-end', gap: 8 },
    editBtn: { padding: 10, backgroundColor: '#eff6ff', borderRadius: 12 },
    deleteBtn: { padding: 10, backgroundColor: '#fef2f2', borderRadius: 12 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
    closeButton: { padding: 4, backgroundColor: '#f1f5f9', borderRadius: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8, marginTop: 12 },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#0f172a' },
    submitBtn: { backgroundColor: '#f43f5e', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
    submitBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' }
});