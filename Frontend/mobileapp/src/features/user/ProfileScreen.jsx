import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    SafeAreaView,
    Modal,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Lock, LogOut, ChevronRight, X, ShieldCheck, Store, Key } from 'lucide-react-native';

import { useAuthStore } from '../../core/store/authStore';
import RegisterBusinessModal from './RegisterBusinessModal';

export default function ProfileScreen() {
    const { user, logout, updateProfile, updatePassword, isLoading } = useAuthStore();

    // Modal States
    const [showBusinessModal, setShowBusinessModal] = useState(false);
    const [editProfileOpen, setEditProfileOpen] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);

    // Form States
    const [editName, setEditName] = useState(user?.name || '');
    const [editEmail, setEditEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleSaveProfile = async () => {
        if (!editName || !editEmail) return alert("Please fill in all fields.");
        
        const result = await updateProfile(editName, editEmail);
        if (result.success) {
            setEditProfileOpen(false);
            alert("Profile updated successfully!");
        } else {
            alert(result.message);
        }
    };

    const handleSavePassword = async () => {
        if (!currentPassword) return alert("Please enter your current password.");
        if (!newPassword || newPassword.length < 6) return alert("New password must be at least 6 characters.");
        
        const result = await updatePassword(currentPassword, newPassword); 
        
        if (result.success) {
            setChangePasswordOpen(false);
            setCurrentPassword(''); 
            setNewPassword('');     
            alert("Password changed successfully!");
        } else {
            alert(result.message);
        }
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                <LinearGradient colors={['#f43f5e', '#ec4899']} style={styles.header}>
                    <SafeAreaView>
                        <View style={styles.headerContent}>
                            <View style={[styles.circle, styles.circleTopRight]} />
                            <View style={[styles.circle, styles.circleBottomLeft]} />
                            
                            <View style={styles.userInfoRow}>
                                <View style={styles.avatarContainer}>
                                    <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
                                </View>
                                
                                <View style={styles.userDetails}>
                                    <Text style={styles.userName}>{user?.name || "Guest User"}</Text>
                                    <Text style={styles.userEmail}>{user?.email || "No email provided"}</Text>
                                    
                                    <View style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                                        <View style={styles.roleBadge}>
                                            <ShieldCheck color="#ffffff" size={12} style={{ marginRight: 4 }} />
                                            <Text style={styles.roleText}>{user?.role?.toUpperCase() || "CUSTOMER"}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                {user?.role !== 'manager' && (
                    <View style={styles.ctaWrapper}>
                        <TouchableOpacity activeOpacity={0.9} onPress={() => setShowBusinessModal(true)}>
                            <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.ctaCard}>
                                <View style={styles.ctaIconContainer}>
                                    <Store color="#ffffff" size={28} />
                                </View>
                                <View style={styles.ctaTextContainer}>
                                    <Text style={styles.ctaTitle}>Register Your Business</Text>
                                    <Text style={styles.ctaSubtitle}>Switch to provider mode & manage appointments</Text>
                                </View>
                                <ChevronRight color="#ffffff" size={24} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={[styles.menuContainer, user?.role === 'manager' && { paddingTop: 20 }]}>
                    <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={() => {
                        setEditName(user?.name || '');
                        setEditEmail(user?.email || '');
                        setEditProfileOpen(true);
                    }}>
                        <View style={styles.menuIconBox}>
                            <User color="#f43f5e" size={20} />
                        </View>
                        <Text style={styles.menuItemText}>Edit Profile Info</Text>
                        <ChevronRight color="#cbd5e1" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => setChangePasswordOpen(true)}>
                        <View style={styles.menuIconBox}>
                            <Lock color="#f43f5e" size={20} />
                        </View>
                        <Text style={styles.menuItemText}>Change Password</Text>
                        <ChevronRight color="#cbd5e1" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <View style={styles.logoutIconBox}>
                            <LogOut color="#dc2626" size={20} />
                        </View>
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={{ height: 40 }} />
            </ScrollView>

            <RegisterBusinessModal visible={showBusinessModal} onClose={() => setShowBusinessModal(false)} />


            <Modal animationType="slide" transparent={true} visible={editProfileOpen} onRequestClose={() => setEditProfileOpen(false)}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ flex: 1, justifyContent: 'flex-end' }}
                    >
                        <ScrollView 
                            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            bounces={false}
                        >
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Edit Profile</Text>
                                    <TouchableOpacity onPress={() => setEditProfileOpen(false)} style={styles.closeButton}>
                                        <X color="#64748b" size={24} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Full Name</Text>
                                    <View style={styles.inputContainer}>
                                        <User color="#94a3b8" size={20} style={styles.inputIcon} />
                                        <TextInput 
                                            style={styles.input} 
                                            value={editName} 
                                            onChangeText={setEditName} 
                                            placeholder="Enter your name"
                                            placeholderTextColor="#94a3b8"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Email Address</Text>
                                    <View style={styles.inputContainer}>
                                        <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
                                        <TextInput 
                                            style={styles.input} 
                                            value={editEmail} 
                                            onChangeText={setEditEmail} 
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            placeholder="Enter your email"
                                            placeholderTextColor="#94a3b8"
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.saveButtonWrapper} onPress={handleSaveProfile} disabled={isLoading}>
                                    <LinearGradient colors={['#f43f5e', '#fb7185']} style={styles.saveButton}>
                                        {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            <Modal animationType="slide" transparent={true} visible={changePasswordOpen} onRequestClose={() => setChangePasswordOpen(false)}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ flex: 1, justifyContent: 'flex-end' }}
                    >
                        <ScrollView 
                            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            bounces={false}
                        >
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Change Password</Text>
                                    <TouchableOpacity onPress={() => setChangePasswordOpen(false)} style={styles.closeButton}>
                                        <X color="#64748b" size={24} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Current Password</Text>
                                    <View style={styles.inputContainer}>
                                        <Key color="#94a3b8" size={20} style={styles.inputIcon} />
                                        <TextInput 
                                            style={styles.input} 
                                            value={currentPassword} 
                                            onChangeText={setCurrentPassword} 
                                            secureTextEntry
                                            placeholder="Enter current password"
                                            placeholderTextColor="#94a3b8"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>New Password</Text>
                                    <View style={styles.inputContainer}>
                                        <Lock color="#94a3b8" size={20} style={styles.inputIcon} />
                                        <TextInput 
                                            style={styles.input} 
                                            value={newPassword} 
                                            onChangeText={setNewPassword} 
                                            secureTextEntry
                                            placeholder="Enter new password (min 6 chars)"
                                            placeholderTextColor="#94a3b8"
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.saveButtonWrapper} onPress={handleSavePassword} disabled={isLoading}>
                                    <LinearGradient colors={['#f43f5e', '#fb7185']} style={styles.saveButton}>
                                        {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveButtonText}>Update Password</Text>}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fafaf9' },
    header: { paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' },
    headerContent: { paddingHorizontal: 20, paddingTop: 20 },
    circle: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 100 },
    circleTopRight: { width: 120, height: 120, top: -40, right: -40 },
    circleBottomLeft: { width: 90, height: 90, bottom: -20, left: -20 },
    userInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 28, fontWeight: '700', color: '#ffffff' },
    userDetails: { flex: 1 },
    userName: { fontSize: 24, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
    userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
    roleBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    roleText: { color: '#ffffff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    
    ctaWrapper: { paddingHorizontal: 20, marginTop: -30, zIndex: 10 },
    ctaCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
    ctaIconContainer: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    ctaTextContainer: { flex: 1 },
    ctaTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
    ctaSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', paddingRight: 10 },
    
    menuContainer: { paddingHorizontal: 20, paddingTop: 32 },
    sectionTitle: { fontSize: 13, fontWeight: '600', color: '#94a3b8', letterSpacing: 1, marginBottom: 12 },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#ffffff', borderRadius: 20, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    menuIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#ffe4e6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    menuItemText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#0f172a' },
    
    logoutButton: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#ffffff', borderRadius: 20, marginTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    logoutIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    logoutText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#dc2626' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
    closeButton: { padding: 4, backgroundColor: '#f1f5f9', borderRadius: 20 },
    
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8, marginLeft: 4 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, height: 56, paddingHorizontal: 16 },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, color: '#0f172a' },
    
    saveButtonWrapper: { width: '100%', borderRadius: 16, overflow: 'hidden', marginTop: 10 },
    saveButton: { height: 56, justifyContent: 'center', alignItems: 'center' },
    saveButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' }
});