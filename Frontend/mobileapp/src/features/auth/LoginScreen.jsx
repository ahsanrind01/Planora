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

        try {
            const response = await apiClient.post('/auth/login', { 
                email: email.toLowerCase(), 
                password 
            });

            // 🚨 CAUGHT THE BUSINESS ID: Added businessId to destructuring
            const { token, id, name, email: userEmail, role, businessId } = response.data;
            
            const userObj = {
                id: id,
                name: name,
                email: userEmail,
                role: role || 'customer',
                businessId: businessId // 🚨 SAVED IT: Now Zustand knows your business ID!
            };
            
            // 1. Log the user in
            login(userObj, token);

            // 🚨 2. THE FIX: Close the modal immediately so they can see the app!
            navigation.goBack();

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
            {/* 🎨 UI UPGRADE: Deep Navy to Royal Blue Gradient Background */}
            <LinearGradient
                colors={['#0f172a', '#1e3a8a']}
                style={styles.container}
            >
                {/* 🎨 UI UPGRADE: Ambient glass circles for background depth */}
                <View style={[styles.circle, styles.circleTopRight]} />
                <View style={[styles.circle, styles.circleBottomLeft]} />

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* 🎨 UI UPGRADE: Pristine white floating card */}
                    <View style={styles.card}>

                        <View style={styles.header}>
                            <View style={styles.iconContainer}>
                                {/* 🎨 UI UPGRADE: Royal blue icon gradient */}
                                <LinearGradient
                                    colors={['#1e40af', '#3b82f6']}
                                    style={styles.iconBackground}
                                >
                                    <Calendar size={28} color="#ffffff" strokeWidth={2.5} />
                                </LinearGradient>
                            </View>
                            <Text style={styles.title}>Welcome Back</Text>
                            <Text style={styles.description}>Sign in to your booking account</Text>
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
                                        <TouchableOpacity 
                                            activeOpacity={0.7}
                                            onPress={() => Alert.alert("Notice", "Password reset coming soon!")}
                                        >
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
                                <TouchableOpacity 
                                    activeOpacity={0.7}
                                    onPress={() => navigation.navigate('Register')}
                                >
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
        flex: 1 
    },

    // 🎨 AMBIENT BACKGROUND ELEMENTS
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
        padding: 24 // 🎨 Strict 8px grid
    },

    // 🎨 FLOATING CARD
    card: { 
        backgroundColor: '#ffffff', 
        borderRadius: 32, // 🎨 Squircle shape
        padding: 32, 
        width: '100%', 
        maxWidth: 450, 
        alignSelf: 'center',
        
        // Premium layered shadows
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 16 }, 
        shadowOpacity: 0.15, 
        shadowRadius: 32, 
        elevation: 10,
        
        // Subtle inner border for crispness
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)'
    },

    header: { 
        alignItems: 'center', 
        marginBottom: 32 
    },

    iconContainer: { 
        marginBottom: 20,
        // Glowing drop shadow for the icon
        shadowColor: '#1d4ed8',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8
    },

    iconBackground: { 
        padding: 16, 
        borderRadius: 24, // Matches the squircle vibe
        justifyContent: 'center', 
        alignItems: 'center' 
    },

    title: { 
        fontSize: 28, 
        fontWeight: '800', 
        color: '#0f172a', 
        marginBottom: 8,
        letterSpacing: -0.5 // Premium tracking
    },

    description: { 
        fontSize: 15, 
        color: '#64748b', 
        textAlign: 'center',
        fontWeight: '500'
    },

    form: { 
        gap: 20 // Consistent spacing
    },

    inputGroup: { 
        gap: 16, // Adds space between the two inputs
        marginBottom: 8 
    },

    label: { 
        fontSize: 14, 
        fontWeight: '600', 
        color: '#0f172a', 
        marginBottom: 8 
    },

    forgotPassword: { 
        fontSize: 14, 
        color: '#2563eb', // 🎨 Changed to Royal Blue
        fontWeight: '700' 
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
        color: '#2563eb' // 🎨 Changed to Royal Blue
    }
});