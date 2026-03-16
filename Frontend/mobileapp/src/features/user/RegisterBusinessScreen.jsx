import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    ScrollView, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Store, MapPin, Phone, AlignLeft, Building2, ImagePlus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { apiClient } from '../../core/api/apiClient';
import { useAuthStore } from '../../core/store/authStore';
import { useNavigation } from '@react-navigation/native';

const categories = ['Cleaning', 'Beauty', 'Repair', 'Health', 'Automotive', 'Education', 'Other'];

export default function RegisterBusinessScreen() {
    const navigation = useNavigation();
    const promoteToManager = useAuthStore(state => state.promoteToManager);

    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Cleaning', 
        city: '',
        address: '',
        phone: ''
    });

    const [coverImage, setCoverImage] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);

    const pickCoverImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setCoverImage(result.assets[0].uri);
        }
    };

    const pickGalleryImages = async () => {
        if (galleryImages.length >= 5) {
            return Alert.alert("Limit Reached", "You can only upload up to 5 gallery images.");
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 5 - galleryImages.length, 
            quality: 0.8,
        });

        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri);
            setGalleryImages([...galleryImages, ...newImages].slice(0, 5)); 
        }
    };

    const removeGalleryImage = (indexToRemove) => {
        setGalleryImages(galleryImages.filter((_, index) => index !== indexToRemove));
    };

    const handleRegister = async () => {
        if (!formData.name || !formData.description || !formData.city || !formData.address || !formData.phone) {
            Alert.alert("Missing Fields", "Please fill out all required text fields.");
            return;
        }

        setIsLoading(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('category', formData.category);
            data.append('city', formData.city);
            data.append('address', formData.address);
            data.append('phone', formData.phone);

            if (coverImage) {
                const filename = coverImage.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                data.append('coverImage', { uri: coverImage, name: filename, type });
            }

            galleryImages.forEach((imgUri) => {
                const filename = imgUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                data.append('images', { uri: imgUri, name: filename, type });
            });

            const response = await apiClient.post('/business', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                promoteToManager();
                Alert.alert("Success!", "Your business is pending Admin verification.");
                navigation.navigate('Discover'); 
            }
        } catch (error) {
            console.log("🚨 REGISTRATION ERROR:", error.response?.data || error.message);
            Alert.alert("Registration Failed", error.response?.data?.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} bounces={false}>
            <LinearGradient colors={['#0f172a', '#1e3a8a']} style={styles.header}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <View style={[styles.circle, styles.circleTopRight]} />
                        <View style={[styles.circle, styles.circleBottomLeft]} />

                        <Text style={styles.headerTitle}>Become a Partner</Text>
                        <Text style={styles.headerSubtitle}>List your services and grow your business today.</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.formContainer}>
                
                <Text style={styles.label}>Business Name *</Text>
                <View style={styles.inputWrapper}>
                    <Store color="#64748b" size={20} style={styles.icon} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="e.g. Luxe Studio" 
                        placeholderTextColor="#94a3b8"
                        value={formData.name}
                        onChangeText={(text) => setFormData({...formData, name: text})}
                        maxLength={50}
                    />
                </View>

                <Text style={styles.label}>Category *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                    {categories.map((cat) => (
                        <TouchableOpacity 
                            key={cat} 
                            activeOpacity={0.7}
                            onPress={() => setFormData({...formData, category: cat})}
                            style={[styles.categoryPill, formData.category === cat && styles.categoryPillActive]}
                        >
                            <Text style={[styles.categoryText, formData.category === cat && styles.categoryTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                    <View style={{ width: 24 }} />
                </ScrollView>

                <Text style={styles.label}>Description *</Text>
                <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                    <AlignLeft color="#64748b" size={20} style={[styles.icon, { marginTop: 4 }]} />
                    <TextInput 
                        style={[styles.input, styles.textAreaInput]} 
                        placeholder="Tell clients what makes you great..." 
                        placeholderTextColor="#94a3b8"
                        multiline 
                        value={formData.description}
                        onChangeText={(text) => setFormData({...formData, description: text})}
                        maxLength={500}
                    />
                </View>

                <Text style={styles.label}>City *</Text>
                <View style={styles.inputWrapper}>
                    <Building2 color="#64748b" size={20} style={styles.icon} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="e.g. New York" 
                        placeholderTextColor="#94a3b8"
                        value={formData.city}
                        onChangeText={(text) => setFormData({...formData, city: text})}
                    />
                </View>

                <Text style={styles.label}>Full Address *</Text>
                <View style={styles.inputWrapper}>
                    <MapPin color="#64748b" size={20} style={styles.icon} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="123 Main St" 
                        placeholderTextColor="#94a3b8"
                        value={formData.address}
                        onChangeText={(text) => setFormData({...formData, address: text})}
                    />
                </View>

                <Text style={styles.label}>Phone Number *</Text>
                <View style={styles.inputWrapper}>
                    <Phone color="#64748b" size={20} style={styles.icon} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="e.g. 555-0198" 
                        placeholderTextColor="#94a3b8"
                        keyboardType="phone-pad"
                        value={formData.phone}
                        onChangeText={(text) => setFormData({...formData, phone: text})}
                        maxLength={20}
                    />
                </View>

                <View style={styles.imageSection}>
                    <Text style={styles.label}>Cover Image (Optional)</Text>
                    <TouchableOpacity activeOpacity={0.8} style={styles.uploadButton} onPress={pickCoverImage}>
                        {coverImage ? (
                            <Image source={{ uri: coverImage }} style={styles.coverPreview} />
                        ) : (
                            <View style={styles.uploadPlaceholder}>
                                <ImagePlus color="#94a3b8" size={32} strokeWidth={1.5} />
                                <Text style={styles.uploadText}>Tap to add cover photo</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.label}>Gallery Images (Max 5, Optional)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScrollContainer}>
                        <TouchableOpacity activeOpacity={0.7} style={styles.addGalleryButton} onPress={pickGalleryImages}>
                            <ImagePlus color="#2563eb" size={28} strokeWidth={1.5} />
                        </TouchableOpacity>
                        
                        {galleryImages.map((uri, index) => (
                            <View key={index} style={styles.galleryThumbnailContainer}>
                                <Image source={{ uri }} style={styles.galleryThumbnail} />
                                <TouchableOpacity 
                                    activeOpacity={0.8}
                                    style={styles.removeImageBtn} 
                                    onPress={() => removeGalleryImage(index)}
                                >
                                    <X color="#ffffff" size={14} strokeWidth={3} />
                                </TouchableOpacity>
                            </View>
                        ))}
                        <View style={{ width: 24 }} />
                    </ScrollView>
                </View>

                <View style={styles.submitButtonContainer}>
                    <TouchableOpacity 
                        style={[styles.submitButtonWrapper, isLoading && styles.submitButtonDisabled]} 
                        onPress={handleRegister}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient colors={['#1e40af', '#3b82f6']} style={styles.submitGradient}>
                            {isLoading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Register Business</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    
    header: { 
        paddingBottom: 64, 
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
        paddingTop: Platform.OS === 'android' ? 40 : 26,
        alignItems: 'center'
    },
    circle: { 
        position: 'absolute', 
        backgroundColor: 'rgba(255,255,255,0.07)', 
        borderRadius: 100 
    },
    circleTopRight: { width: 200, height: 200, top: -80, right: -70 },
    circleBottomLeft: { width: 150, height: 150, bottom: -60, left: -60 },
    
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#ffffff', marginBottom: 8, letterSpacing: -0.5, marginTop: 10 },
    headerSubtitle: { fontSize: 15, color: '#cbd5e1', textAlign: 'center', fontWeight: '500', paddingHorizontal: 20 },
    
    formContainer: { 
        paddingHorizontal: 24, 
        paddingTop: 32,
        paddingBottom: 60,
        marginTop: -32, 
        backgroundColor: '#ffffff', 
        borderTopLeftRadius: 32, 
        borderTopRightRadius: 32 
    },
    
    label: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8, marginTop: 20, marginLeft: 4 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 16, paddingHorizontal: 16, height: 60 },
    textAreaWrapper: { height: 120, alignItems: 'flex-start', paddingTop: 16 },
    icon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, color: '#0f172a', fontWeight: '500' },
    textAreaInput: { height: 90, textAlignVertical: 'top' },
    
    categoryScroll: { flexDirection: 'row', marginHorizontal: -24, paddingHorizontal: 24 },
    categoryPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 16, backgroundColor: '#ffffff', marginRight: 12, borderWidth: 1.5, borderColor: '#e2e8f0' },
    categoryPillActive: { backgroundColor: '#1e40af', borderColor: '#1e40af', shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    categoryText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    categoryTextActive: { color: '#ffffff', fontWeight: '700' },
    
    imageSection: { marginTop: 24, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8 },
    uploadButton: { height: 180, backgroundColor: '#f8fafc', borderRadius: 20, borderWidth: 1.5, borderColor: '#cbd5e1', borderStyle: 'dashed', overflow: 'hidden', marginBottom: 16 },
    uploadPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    uploadText: { marginTop: 12, fontSize: 15, color: '#64748b', fontWeight: '600' },
    coverPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
    
    galleryScrollContainer: { flexDirection: 'row', paddingBottom: 16, marginHorizontal: -24, paddingHorizontal: 24 },
    addGalleryButton: { width: 88, height: 88, borderRadius: 16, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1.5, borderColor: '#bfdbfe', borderStyle: 'dashed' },
    galleryThumbnailContainer: { marginRight: 16, position: 'relative' },
    galleryThumbnail: { width: 88, height: 88, borderRadius: 16, resizeMode: 'cover' },
    removeImageBtn: { position: 'absolute', top: -8, right: -8, backgroundColor: '#dc2626', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4, borderWidth: 2, borderColor: '#ffffff' },

    submitButtonContainer: { marginTop: 40, marginBottom: 20 },
    submitButtonWrapper: { width: '100%', borderRadius: 16, shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8 },
    submitButtonDisabled: { opacity: 0.7, shadowOpacity: 0, elevation: 0 },
    submitGradient: { height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    submitButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 }
});