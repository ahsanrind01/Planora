import { useState } from 'react';
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
import { Calendar } from 'lucide-react-native';

import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

import { apiClient } from '../../core/api/apiClient';
import { useAuthStore } from '../../core/store/authStore';

export default function LoginScreen() {
    const navigation = useNavigation();
    const login = useAuthStore((state) => state.login);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email || !password) {
            return Alert.alert("Missing Fields", "Please enter both email and password.");
        }

        setIsLoading(true);

        console.log("1. Sending login request...");

        try {
            const response = await apiClient.post('/auth/login', { 
                email: email.toLowerCase(), 
                password 
            });

            const { token, id, name, email: userEmail, role } = response.data;
            
            const userObj = {
                id: id,
                name: name,
                email: userEmail,
                role: role || 'customer' 
            };
            
            console.log("3. Passing to Zustand:", { user: userObj, token });

            login(userObj, token);



        } catch (error) {
            const message = error.response?.data?.message || "Invalid credentials.";
            Alert.alert("Login Failed", message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <LinearGradient
                colors={['#fffbeb', '#fff1f2', '#f3e8ff']}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <View style={styles.card}>

                        <View style={styles.header}>
                            <View style={styles.iconContainer}>
                                <LinearGradient
                                    colors={['#fb7185', '#a855f7']}
                                    style={styles.iconBackground}
                                >
                                    <Calendar size={32} color="#ffffff" />
                                </LinearGradient>
                            </View>
                            <Text style={styles.title}>Welcome Back</Text>
                            <Text style={styles.description}>Sign in to your booking services account</Text>
                        </View>

                        <View style={styles.form}>

                            <View style={styles.inputGroup}>
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
                                    rightElement={
                                        <TouchableOpacity onPress={() => Alert.alert("Notice", "Password reset coming soon!")}>
                                            <Text style={styles.forgotPassword}>Forgot password?</Text>
                                        </TouchableOpacity>
                                    }
                                />
                            </View>

                            <Button
                                title="Sign In"
                                onPress={handleSubmit}
                                isLoading={isLoading}
                            />

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                    <Text style={styles.signupText}>Sign up</Text>
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
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 16,
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
        marginBottom: 24,
    },
    iconContainer: {
        marginBottom: 16,
    },
    iconBackground: {
        padding: 12,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0f172a', 
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#64748b', 
        textAlign: 'center',
    },
    form: {
        gap: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    passwordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#0f172a',
        marginBottom: 8,
    },
    forgotPassword: {
        fontSize: 14,
        color: '#f43f5e',
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        fontSize: 14,
        color: '#475569', 
    },
    signupText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#f43f5e', 
    }
});