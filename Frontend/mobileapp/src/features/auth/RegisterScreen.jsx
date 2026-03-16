import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserPlus } from 'lucide-react-native';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { apiClient } from '../../core/api/apiClient';

export default function RegisterScreen() {
    const navigation = useNavigation();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            return Alert.alert("Missing Fields", "Please fill in all fields.");
        }

        setIsLoading(true);

        try {
            await apiClient.post('/auth/signup', {
                name,
                email: email.toLowerCase(),
                password,
                role: 'user'
            });

            Alert.alert("Success", "Account created! Please log in.");
            navigation.navigate('Login');

        } catch (error) {
            const message = error.response?.data?.message || "Registration failed.";
            Alert.alert("Error", message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <LinearGradient colors={['#0f172a', '#1e3a8a']} style={styles.container}>
                
                <View style={[styles.circle, styles.circleTopRight]} />
                <View style={[styles.circle, styles.circleBottomLeft]} />

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    

                    <View style={styles.card}>

                        <View style={styles.header}>
                            <View style={styles.iconContainer}>
                                <LinearGradient colors={['#1e40af', '#3b82f6']} style={styles.iconBackground}>
                                    <UserPlus size={28} color="#ffffff" strokeWidth={2.5} />
                                </LinearGradient>
                            </View>
                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.description}>Join Planora to start booking</Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Input
                                    label="Full Name"
                                    placeholder="John Doe"
                                    autoCapitalize="words"
                                    value={name}
                                    onChangeText={setName}
                                />

                                <Input
                                    label="Email"
                                    placeholder="name@example.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />

                                <Input
                                    label="Password"
                                    placeholder="••••••••"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>

                            <Button
                                title="Sign Up"
                                onPress={handleRegister}
                                isLoading={isLoading}
                            />

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Already have an account? </Text>
                                <TouchableOpacity 
                                    activeOpacity={0.7} 
                                    onPress={() => navigation.navigate('Login')}
                                >
                                    <Text style={styles.signupText}>Log in</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1 
    },
    
    circle: { 
        position: 'absolute', 
        backgroundColor: 'rgba(255,255,255,0.04)', 
        borderRadius: 999 
    },
    circleTopRight: { 
        width: 300, 
        height: 300, 
        top: -100, 
        right: -100 
    },
    circleBottomLeft: { 
        width: 200, 
        height: 200, 
        bottom: -50, 
        left: -80 
    },

    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24 
    },

    card: {
        backgroundColor: '#ffffff',
        borderRadius: 32, 
        padding: 32,
        width: '100%',
        maxWidth: 450,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.15,
        shadowRadius: 32,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)'
    },

    header: {
        alignItems: 'center',
        marginBottom: 32
    },

    iconContainer: { 
        marginBottom: 20,
        shadowColor: '#1d4ed8',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8
    },

    iconBackground: {
        padding: 16,
        borderRadius: 24, 
        justifyContent: 'center',
        alignItems: 'center'
    },

    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 8,
        letterSpacing: -0.5 
    },

    description: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        fontWeight: '500'
    },

    form: { 
        gap: 20 
    },

    inputGroup: {
        gap: 16, 
        marginBottom: 8
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 28
    },

    footerText: {
        fontSize: 15,
        color: '#64748b',
        fontWeight: '500'
    },

    signupText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2563eb' 
    }
});