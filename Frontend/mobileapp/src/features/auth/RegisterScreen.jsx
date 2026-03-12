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
            <LinearGradient colors={['#fffbeb', '#fff1f2', '#f3e8ff']} style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.card}>

                        <View style={styles.header}>
                            <View style={styles.iconContainer}>
                                <LinearGradient colors={['#fb7185', '#a855f7']} style={styles.iconBackground}>
                                    <UserPlus size={32} color="#ffffff" />
                                </LinearGradient>
                            </View>
                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.description}>Join Planora to start booking</Text>
                        </View>

                        <View style={styles.form}>
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

                            <Button
                                title="Sign Up"
                                onPress={handleRegister}
                                isLoading={isLoading}
                            />

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
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
    container: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 16
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
        width: '100%',
        maxWidth: 450,
        alignSelf: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 24
    },
    iconContainer: { marginBottom: 16 },
    iconBackground: {
        padding: 12,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 8
    },
    description: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center'
    },
    form: { gap: 16 },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24
    },
    footerText: {
        fontSize: 14,
        color: '#475569'
    },
    signupText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#f43f5e'
    }
});