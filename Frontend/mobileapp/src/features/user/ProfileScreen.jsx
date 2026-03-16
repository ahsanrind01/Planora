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
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Lock, LogOut, ChevronRight, X, ShieldCheck, Store, Key } from 'lucide-react-native';

import { useAuthStore } from '../../core/store/authStore';

export default function ProfileScreen() {
    const navigation = useNavigation();
    const { user, logout, updateProfile, updatePassword, isLoading } = useAuthStore();

    const [editProfileOpen, setEditProfileOpen] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);

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

    if (!user) {
        return (
            <View style={styles.bouncerContainer}>
                <View style={styles.bouncerIconBox}>
                    <Lock color="#1e40af" size={40} strokeWidth={2} />
                </View>
                <Text style={styles.bouncerTitle}>
                    Create your profile
                </Text>
                <Text style={styles.bouncerSubtitle}>
                    Log in or sign up to manage your appointments, register a business, and update your settings.
                </Text>
                
                <TouchableOpacity 
                    style={styles.bouncerButtonWrapper}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('Auth')}
                >
                    <LinearGradient colors={['#1e40af', '#3b82f6']} style={styles.bouncerButton}>
                        <Text style={styles.bouncerButtonText}>Log In / Sign Up</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                
                <LinearGradient colors={['#0f172a', '#1e3a8a']} style={styles.header}>
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
                                    
                                    <View style={{ alignSelf: 'flex-start', marginTop: 6 }}>
                                        <View style={styles.roleBadge}>
                                            <ShieldCheck color="#ffffff" size={14} style={{ marginRight: 6 }} />
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
                        <TouchableOpacity 
                            activeOpacity={0.9} 
                            onPress={() => navigation.navigate('RegisterBusiness')}
                        >
                            <LinearGradient colors={['#064909ff', '#44c867ff']} style={styles.ctaCard}>
                                <View style={styles.ctaIconContainer}>
                                    <Store color="#ffffff" size={26} strokeWidth={2.5} />
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

                <View style={[styles.menuContainer, user?.role === 'manager' && { paddingTop: 24 }]}>
                    <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>

                    <TouchableOpacity 
                        style={styles.menuItem} 
                        activeOpacity={0.7}
                        onPress={() => {
                            setEditName(user?.name || '');
                            setEditEmail(user?.email || '');
                            setEditProfileOpen(true);
                        }}
                    >
                        <View style={styles.menuIconBox}>
                            <User color="#2563eb" size={20} strokeWidth={2.5} />
                        </View>
                        <Text style={styles.menuItemText}>Edit Profile Info</Text>
                        <ChevronRight color="#cbd5e1" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.menuItem} 
                        activeOpacity={0.7}
                        onPress={() => setChangePasswordOpen(true)}
                    >
                        <View style={styles.menuIconBox}>
                            <Lock color="#2563eb" size={20} strokeWidth={2.5} />
                        </View>
                        <Text style={styles.menuItemText}>Change Password</Text>
                        <ChevronRight color="#cbd5e1" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.logoutButton} 
                        activeOpacity={0.7}
                        onPress={logout}
                    >
                        <View style={styles.logoutIconBox}>
                            <LogOut color="#dc2626" size={20} strokeWidth={2.5} />
                        </View>
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={{ height: 40 }} />
            </ScrollView>

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
                                        <User color="#64748b" size={20} style={styles.inputIcon} />
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
                                        <Mail color="#64748b" size={20} style={styles.inputIcon} />
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

                                <TouchableOpacity 
                                    style={[styles.saveButtonWrapper, isLoading && styles.buttonDisabled]} 
                                    onPress={handleSaveProfile} 
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient colors={['#1e40af', '#3b82f6']} style={styles.saveButton}>
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
                                        <Key color="#64748b" size={20} style={styles.inputIcon} />
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
                                        <Lock color="#64748b" size={20} style={styles.inputIcon} />
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

                                <TouchableOpacity 
                                    style={[styles.saveButtonWrapper, isLoading && styles.buttonDisabled]} 
                                    onPress={handleSavePassword} 
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient colors={['#1e40af', '#3b82f6']} style={styles.saveButton}>
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
    container: { 
        flex: 1, 
        backgroundColor: '#f8fafc' 
    },

    bouncerContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 24,
        backgroundColor: '#f8fafc'
    },
    bouncerIconBox: { 
        width: 88, 
        height: 88, 
        borderRadius: 44, 
        backgroundColor: '#dbeafe', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 24,
        shadowColor: '#1d4ed8',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 5
    },
    bouncerTitle: { 
        fontSize: 26, 
        fontWeight: '700', 
        color: '#0f172a', 
        marginBottom: 12, 
        textAlign: 'center',
        letterSpacing: -0.5
    },
    bouncerSubtitle: { 
        fontSize: 16, 
        color: '#64748b', 
        textAlign: 'center', 
        marginBottom: 40, 
        paddingHorizontal: 20,
        lineHeight: 24
    },
    bouncerButtonWrapper: { 
        width: '100%', 
        maxWidth: 350,
        borderRadius: 16, 
        overflow: 'hidden',
        shadowColor: '#1d4ed8',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8
    },
    bouncerButton: { 
        height: 60, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    bouncerButtonText: { 
        color: '#ffffff', 
        fontSize: 16, 
        fontWeight: '700',
        letterSpacing: 0.5 
    },

    header: { 
        paddingBottom: 48, 
        borderBottomLeftRadius: 32, 
        borderBottomRightRadius: 32, 
        overflow: 'hidden' 
    },
    headerContent: { 
        paddingHorizontal: 24, 
        paddingTop: Platform.OS === 'android' ? 40 : 20 
    },
    circle: { 
        position: 'absolute', 
        backgroundColor: 'rgba(255,255,255,0.03)', 
        borderRadius: 999 
    },
    circleTopRight: { width: 200, height: 200, top: -60, right: -60 },
    circleBottomLeft: { width: 140, height: 140, bottom: -40, left: -40 },
    userInfoRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 20 
    },
    avatarContainer: { 
        width: 88, 
        height: 88, 
        borderRadius: 44, 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        borderWidth: 2, 
        borderColor: 'rgba(255,255,255,0.2)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    avatarText: { 
        fontSize: 32, 
        fontWeight: '700', 
        color: '#ffffff',
        letterSpacing: 1 
    },
    userDetails: { 
        flex: 1 
    },
    userName: { 
        fontSize: 26, 
        fontWeight: '800', 
        color: '#ffffff', 
        marginBottom: 4,
        letterSpacing: -0.3 
    },
    userEmail: { 
        fontSize: 15, 
        fontWeight: '500',
        color: 'rgba(255,255,255,0.8)' 
    },
    roleBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: 'rgba(255,255,255,0.15)', 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    roleText: { 
        color: '#ffffff', 
        fontSize: 11, 
        fontWeight: '700', 
        letterSpacing: 0.8 
    },
    
    ctaWrapper: { 
        paddingHorizontal: 24, 
        marginTop: -32, 
        zIndex: 10 
    },
    ctaCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 24, 
        borderRadius: 24, 
        shadowColor: '#5e253cff', 
        shadowOffset: { width: 0, height: 12 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 20, 
        elevation: 8 
    },
    ctaIconContainer: { 
        width: 60, 
        height: 60, 
        borderRadius: 20, 
        backgroundColor: 'rgba(255,255,255,0.15)', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 16 
    },
    ctaTextContainer: { 
        flex: 1 
    },
    ctaTitle: { 
        fontSize: 18, 
        fontWeight: '700', 
        color: '#ffffff', 
        marginBottom: 4,
        letterSpacing: 0.2
    },
    ctaSubtitle: { 
        fontSize: 14, 
        color: 'rgba(255,255,255,0.85)', 
        paddingRight: 10,
        fontWeight: '500',
        lineHeight: 20
    },
    
    menuContainer: { 
        paddingHorizontal: 24, 
        paddingTop: 32 
    },
    sectionTitle: { 
        fontSize: 13, 
        fontWeight: '700', 
        color: '#94a3b8', 
        letterSpacing: 1.2, 
        marginBottom: 16 
    },
    menuItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 16, 
        backgroundColor: '#ffffff', 
        borderRadius: 20, 
        marginBottom: 12, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.04, 
        shadowRadius: 12, 
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    menuIconBox: { 
        width: 44, 
        height: 44, 
        borderRadius: 14, 
        backgroundColor: '#eff6ff', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 16 
    },
    menuItemText: { 
        flex: 1, 
        fontSize: 16, 
        fontWeight: '700', 
        color: '#0f172a' 
    },
    
    logoutButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 16, 
        backgroundColor: '#ffffff', 
        borderRadius: 20, 
        marginTop: 16, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.04, 
        shadowRadius: 12, 
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    logoutIconBox: { 
        width: 44, 
        height: 44, 
        borderRadius: 14, 
        backgroundColor: '#fef2f2', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 16 
    },
    logoutText: { 
        flex: 1, 
        fontSize: 16, 
        fontWeight: '700', 
        color: '#dc2626' 
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
        marginBottom: 32 
    },
    modalTitle: { 
        fontSize: 22, 
        fontWeight: '700', 
        color: '#0f172a',
        letterSpacing: -0.3
    },
    closeButton: { 
        padding: 8, 
        backgroundColor: '#f1f5f9', 
        borderRadius: 20 
    },
    
    inputGroup: { 
        marginBottom: 24 
    },
    label: { 
        fontSize: 14, 
        fontWeight: '700', 
        color: '#475569', 
        marginBottom: 8, 
        marginLeft: 4 
    },
    inputContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#f8fafc', 
        borderWidth: 1.5, 
        borderColor: '#e2e8f0', 
        borderRadius: 16, 
        height: 60, 
        paddingHorizontal: 16 
    },
    inputIcon: { 
        marginRight: 12 
    },
    input: { 
        flex: 1, 
        fontSize: 16, 
        color: '#0f172a',
        fontWeight: '500'
    },
    
    saveButtonWrapper: { 
        width: '100%', 
        borderRadius: 16, 
        overflow: 'hidden', 
        marginTop: 16,
        shadowColor: '#1d4ed8',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 6
    },
    buttonDisabled: {
        opacity: 0.7,
        shadowOpacity: 0
    },
    saveButton: { 
        height: 60, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    saveButtonText: { 
        color: '#ffffff', 
        fontSize: 17, 
        fontWeight: '700',
        letterSpacing: 0.3 
    }
});