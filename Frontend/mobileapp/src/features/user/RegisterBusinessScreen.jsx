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
    Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Store, MapPin, Phone, AlignLeft, Building2, ImagePlus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { apiClient } from '../../core/api/apiClient';
import { useAuthStore } from '../../core/store/authStore';
import { useNavigation } from '@react-navigation/native';

// 🚨 UPDATED: Exact categories from your Mongoose Schema
const categories = ['Cleaning', 'Beauty', 'Repair', 'Health', 'Automotive', 'Education', 'Other'];

export default function RegisterBusinessScreen() {
    const navigation = useNavigation();
    const promoteToManager = useAuthStore(state => state.promoteToManager);

    const [isLoading, setIsLoading] = useState(false);
    
    // 🚨 UPDATED: Added 'city' to match your Schema
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Cleaning', // Default to first enum option
        city: '',
        address: '',
        phone: ''
    });

    // Image States
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
            selectionLimit: 5 - galleryImages.length, // Only allow them to pick up to the limit
            quality: 0.8,
        });

        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri);
            setGalleryImages([...galleryImages, ...newImages].slice(0, 5)); // Enforce max 5
        }
    };

    const removeGalleryImage = (indexToRemove) => {
        setGalleryImages(galleryImages.filter((_, index) => index !== indexToRemove));
    };

    const handleRegister = async () => {
        // 1. Validate required fields (including City!)
        if (!formData.name || !formData.description || !formData.city || !formData.address || !formData.phone) {
            Alert.alert("Missing Fields", "Please fill out all required text fields.");
            return;
        }

        setIsLoading(true);
        try {
            // 🚨 THE FIX: Convert to FormData so Multer can process the images!
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('category', formData.category);
            data.append('city', formData.city);
            data.append('address', formData.address);
            data.append('phone', formData.phone);

            // Append Cover Image if selected
            if (coverImage) {
                const filename = coverImage.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                data.append('coverImage', { uri: coverImage, name: filename, type });
            }

            // Append Gallery Images if selected
            galleryImages.forEach((imgUri) => {
                const filename = imgUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                data.append('images', { uri: imgUri, name: filename, type });
            });

            // 2. Send to backend with multipart/form-data header
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
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={['#f43f5e', '#ec4899']} style={styles.header}>
                <Text style={styles.headerTitle}>Become a Partner</Text>
                <Text style={styles.headerSubtitle}>List your services and grow your business today.</Text>
            </LinearGradient>

            <View style={styles.formContainer}>
                
                <Text style={styles.label}>Business Name *</Text>
                <View style={styles.inputWrapper}>
                    <Store color="#94a3b8" size={20} style={styles.icon} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="e.g. Luxe Studio" 
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
                            onPress={() => setFormData({...formData, category: cat})}
                            style={[styles.categoryPill, formData.category === cat && styles.categoryPillActive]}
                        >
                            <Text style={[styles.categoryText, formData.category === cat && styles.categoryTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={styles.label}>Description *</Text>
                <View style={[styles.inputWrapper, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
                    <AlignLeft color="#94a3b8" size={20} style={styles.icon} />
                    <TextInput 
                        style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                        placeholder="Tell clients what makes you great..." 
                        multiline 
                        value={formData.description}
                        onChangeText={(text) => setFormData({...formData, description: text})}
                        maxLength={500}
                    />
                </View>

                {/* 🚨 NEW: City Field */}
                <Text style={styles.label}>City *</Text>
                <View style={styles.inputWrapper}>
                    <Building2 color="#94a3b8" size={20} style={styles.icon} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="e.g. New York" 
                        value={formData.city}
                        onChangeText={(text) => setFormData({...formData, city: text})}
                    />
                </View>

                <Text style={styles.label}>Full Address *</Text>
                <View style={styles.inputWrapper}>
                    <MapPin color="#94a3b8" size={20} style={styles.icon} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="123 Main St" 
                        value={formData.address}
                        onChangeText={(text) => setFormData({...formData, address: text})}
                    />
                </View>

                <Text style={styles.label}>Phone Number *</Text>
                <View style={styles.inputWrapper}>
                    <Phone color="#94a3b8" size={20} style={styles.icon} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="e.g. 555-0198" 
                        keyboardType="phone-pad"
                        value={formData.phone}
                        onChangeText={(text) => setFormData({...formData, phone: text})}
                        maxLength={20}
                    />
                </View>

                {/* 🚨 NEW: Image Upload Section */}
                <View style={styles.imageSection}>
                    <Text style={styles.label}>Cover Image (Optional)</Text>
                    <TouchableOpacity style={styles.uploadButton} onPress={pickCoverImage}>
                        {coverImage ? (
                            <Image source={{ uri: coverImage }} style={styles.coverPreview} />
                        ) : (
                            <View style={styles.uploadPlaceholder}>
                                <ImagePlus color="#94a3b8" size={28} />
                                <Text style={styles.uploadText}>Tap to add cover photo</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.label}>Gallery Images (Max 5, Optional)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScrollContainer}>
                        <TouchableOpacity style={styles.addGalleryButton} onPress={pickGalleryImages}>
                            <ImagePlus color="#f43f5e" size={24} />
                        </TouchableOpacity>
                        
                        {galleryImages.map((uri, index) => (
                            <View key={index} style={styles.galleryThumbnailContainer}>
                                <Image source={{ uri }} style={styles.galleryThumbnail} />
                                <TouchableOpacity 
                                    style={styles.removeImageBtn} 
                                    onPress={() => removeGalleryImage(index)}
                                >
                                    <X color="#ffffff" size={14} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                <TouchableOpacity 
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
                    onPress={handleRegister}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Register Business</Text>
                    )}
                </TouchableOpacity>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fafaf9' },
    header: { padding: 40, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center' },
    headerTitle: { fontSize: 28, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
    headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
    formContainer: { padding: 20, marginTop: -20, backgroundColor: '#ffffff', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    label: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginBottom: 8, marginTop: 16 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, paddingHorizontal: 16, height: 56 },
    icon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, color: '#0f172a' },
    categoryScroll: { flexDirection: 'row', marginBottom: 8 },
    categoryPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    categoryPillActive: { backgroundColor: '#f43f5e', borderColor: '#f43f5e' },
    categoryText: { fontSize: 14, fontWeight: '500', color: '#64748b' },
    categoryTextActive: { color: '#ffffff', fontWeight: '600' },
    
    // Image Upload Styles
    imageSection: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
    uploadButton: { height: 160, backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed', overflow: 'hidden', marginBottom: 16 },
    uploadPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    uploadText: { marginTop: 8, fontSize: 14, color: '#64748b', fontWeight: '500' },
    coverPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
    
    galleryScrollContainer: { flexDirection: 'row', paddingBottom: 10 },
    addGalleryButton: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#ffe4e6', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#fecdd3', borderStyle: 'dashed' },
    galleryThumbnailContainer: { marginRight: 12, position: 'relative' },
    galleryThumbnail: { width: 80, height: 80, borderRadius: 12, resizeMode: 'cover' },
    removeImageBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: '#e11d48', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },

    submitButton: { backgroundColor: '#f43f5e', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32, marginBottom: 40, shadowColor: '#f43f5e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    submitButtonDisabled: { opacity: 0.7 },
    submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' }
});