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

    const [formData, setFormData] = useState({ name: '', description: '', price: '', duration: '' });

    useFocusEffect(
        useCallback(() => { 
            if (user?.businessId) fetchBusinessServices(user.businessId);
        }, [user?.businessId])
    );

    const openAddModal = () => {
        setEditMode(false);
        setCurrentServiceId(null);
        setFormData({ name: '', description: '', price: '', duration: '30' }); 
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
            <LinearGradient colors={['#0f172a', '#1e3a8a']} style={styles.header}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <View style={[styles.circle, styles.circleTopRight]} />
                        <View style={[styles.circle, styles.circleBottomLeft]} />

                        <View style={styles.headerTitleRow}>
                            <View style={styles.iconBackground}>
                                <Scissors color="#ffffff" size={26} strokeWidth={2.5} />
                            </View>
                            <Text style={styles.headerTitle}>My Services</Text>
                        </View>
                        <Text style={styles.headerSubtitle}>Manage what you offer to clients.</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <TouchableOpacity activeOpacity={0.7} style={styles.addButton} onPress={openAddModal}>
                    <Plus color="#2563eb" size={24} strokeWidth={2.5} />
                    <Text style={styles.addButtonText}>Add New Service</Text>
                </TouchableOpacity>

                {isLoadingServices ? (
                    <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
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
                                        <Clock color="#2563eb" size={14} strokeWidth={2.5} />
                                        <Text style={styles.tagText}>{service.duration} mins</Text>
                                    </View>
                                    <View style={styles.tag}>
                                        <DollarSign color="#16a34a" size={14} strokeWidth={2.5} />
                                        <Text style={[styles.tagText, { color: '#166534' }]}>${service.price}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.actionsBox}>
                                <TouchableOpacity activeOpacity={0.7} style={styles.editBtn} onPress={() => openEditModal(service)}>
                                    <Edit color="#2563eb" size={20} />
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.7} style={styles.deleteBtn} onPress={() => handleDelete(service._id)}>
                                    <Trash2 color="#dc2626" size={20} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
                <View style={{ height: 40 }} />
            </ScrollView>

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

                            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                                <Text style={styles.label}>Service Name</Text>
                                <TextInput 
                                    style={styles.input} 
                                    placeholder="e.g. Men's Haircut" 
                                    placeholderTextColor="#94a3b8"
                                    value={formData.name} 
                                    onChangeText={(t) => setFormData({...formData, name: t})} 
                                />

                                <Text style={styles.label}>Description</Text>
                                <TextInput 
                                    style={[styles.input, styles.textArea]} 
                                    placeholder="Briefly describe this service..." 
                                    placeholderTextColor="#94a3b8"
                                    multiline 
                                    value={formData.description} 
                                    onChangeText={(t) => setFormData({...formData, description: t})} 
                                />

                                <View style={{ flexDirection: 'row', gap: 16 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>Price ($)</Text>
                                        <TextInput 
                                            style={styles.input} 
                                            placeholder="0.00" 
                                            placeholderTextColor="#94a3b8"
                                            keyboardType="numeric" 
                                            value={formData.price} 
                                            onChangeText={(t) => setFormData({...formData, price: t})} 
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>Duration (Mins)</Text>
                                        <TextInput 
                                            style={styles.input} 
                                            placeholder="e.g. 30" 
                                            placeholderTextColor="#94a3b8"
                                            keyboardType="numeric" 
                                            value={formData.duration} 
                                            onChangeText={(t) => setFormData({...formData, duration: t})} 
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity 
                                    style={[styles.submitButtonWrapper, isSubmitting && styles.submitButtonDisabled]} 
                                    onPress={handleSaveService} 
                                    disabled={isSubmitting}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient colors={['#1e40af', '#3b82f6']} style={styles.submitGradient}>
                                        {isSubmitting ? (
                                            <ActivityIndicator color="#ffffff" />
                                        ) : (
                                            <Text style={styles.submitButtonText}>{editMode ? "Update Service" : "Save Service"}</Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                                <View style={{ height: 20 }} />
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f8fafc' 
    },

    header: { 
        paddingBottom: 36,
        borderBottomLeftRadius: 38,
        borderBottomRightRadius: 38,
        overflow: 'hidden',
        shadowColor: '#020617',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 15
    },
    headerContent: { 
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? 40 : 26
    },
    circle: { 
        position: 'absolute',
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 100
    },
    circleTopRight: { width: 200, height: 200, top: -80, right: -70 },
    circleBottomLeft: { width: 150, height: 150, bottom: -60, left: -60 },
    
    headerTitleRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 12,
        marginTop: 10
    },
    iconBackground: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        padding: 8,
        borderRadius: 12,
        marginRight: 12
    },
    headerTitle: { 
        fontSize: 28, 
        fontWeight: '800', 
        color: '#ffffff',
        letterSpacing: -0.5 
    },
    headerSubtitle: { 
        fontSize: 15, 
        color: '#cbd5e1',
        fontWeight: '500',
        paddingRight: 20,
        lineHeight: 22
    },
    
    content: { 
        paddingHorizontal: 24, 
        paddingTop: 32 
    },
    addButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#eff6ff', 
        padding: 16, 
        borderRadius: 16, 
        marginBottom: 24, 
        borderWidth: 1.5, 
        borderColor: '#bfdbfe', 
        borderStyle: 'dashed' 
    },
    addButtonText: { 
        color: '#2563eb', 
        fontSize: 16, 
        fontWeight: '700', 
        marginLeft: 8,
        letterSpacing: 0.3 
    },
    emptyText: { 
        textAlign: 'center', 
        color: '#64748b', 
        marginTop: 20, 
        fontSize: 16,
        fontWeight: '500' 
    },
    
    serviceCard: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        backgroundColor: '#ffffff', 
        padding: 20, 
        borderRadius: 24, 
        marginBottom: 16, 
        shadowColor: '#0f172a', 
        shadowOffset: { width: 0, height: 8 }, 
        shadowOpacity: 0.05, 
        shadowRadius: 16, 
        elevation: 3, 
        borderWidth: 1, 
        borderColor: '#f1f5f9' 
    },
    serviceInfo: { 
        flex: 1, 
        paddingRight: 12 
    },
    serviceName: { 
        fontSize: 19, 
        fontWeight: '800', 
        color: '#0f172a', 
        marginBottom: 6,
        letterSpacing: -0.3 
    },
    serviceDesc: { 
        fontSize: 14, 
        color: '#64748b', 
        marginBottom: 12,
        lineHeight: 20,
        fontWeight: '500'
    },
    serviceTags: { 
        flexDirection: 'row', 
        gap: 12 
    },
    tag: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 6, 
        backgroundColor: '#f8fafc', 
        paddingHorizontal: 10, 
        paddingVertical: 6, 
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    tagText: { 
        fontSize: 13, 
        fontWeight: '700', 
        color: '#1e40af' 
    },
    actionsBox: { 
        alignItems: 'flex-end', 
        gap: 10 
    },
    editBtn: { 
        padding: 10, 
        backgroundColor: '#eff6ff', 
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#dbeafe'
    },
    deleteBtn: { 
        padding: 10, 
        backgroundColor: '#fef2f2', 
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#fee2e2'
    },

    modalOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(15, 23, 42, 0.6)', 
        justifyContent: 'flex-end' 
    },
    modalContent: { 
        backgroundColor: '#ffffff', 
        borderTopLeftRadius: 32, 
        borderTopRightRadius: 32, 
        padding: 24, 
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: -8 }, 
        shadowOpacity: 0.15, 
        shadowRadius: 24, 
        elevation: 20 
    },
    modalHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24 
    },
    modalTitle: { 
        fontSize: 22, 
        fontWeight: '800', 
        color: '#0f172a',
        letterSpacing: -0.3 
    },
    closeButton: { 
        padding: 8, 
        backgroundColor: '#f1f5f9', 
        borderRadius: 20 
    },
    label: { 
        fontSize: 14, 
        fontWeight: '700', 
        color: '#475569', 
        marginBottom: 8, 
        marginTop: 16,
        marginLeft: 4 
    },
    input: { 
        backgroundColor: '#f8fafc', 
        borderWidth: 1.5, 
        borderColor: '#e2e8f0', 
        borderRadius: 16, 
        paddingHorizontal: 16, 
        height: 60, 
        fontSize: 16, 
        color: '#0f172a',
        fontWeight: '500' 
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 16
    },
    
    submitButtonWrapper: { 
        width: '100%', 
        borderRadius: 16, 
        shadowColor: '#1d4ed8', 
        shadowOffset: { width: 0, height: 8 }, 
        shadowOpacity: 0.35, 
        shadowRadius: 16, 
        elevation: 8,
        marginTop: 32
    },
    submitButtonDisabled: { 
        opacity: 0.7,
        shadowOpacity: 0,
        elevation: 0
    },
    submitGradient: { 
        height: 60, 
        borderRadius: 16, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    submitButtonText: { 
        color: '#ffffff', 
        fontSize: 17, 
        fontWeight: '800',
        letterSpacing: 0.5 
    }
});