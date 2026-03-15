import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search } from 'lucide-react-native';

import { useAuthStore } from '../../core/store/authStore';
import { useBusinessStore } from '../../core/store/businessStore';
import ProviderCard from '../../components/ui/ProviderCard';

const categories = ["All", "Cleaning", "Beauty", "Repair", "Health", "Automative", "Education", "Other"];

const SERVER_URL = "http://192.168.18.125:3000"; 

export default function DiscoverScreen() {
    const navigation = useNavigation();
    
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const user = useAuthStore((state) => state.user);
    const firstName = user?.name ? user.name.split(' ')[0] : 'Guest';

    const { businesses, isLoading, error, fetchBusinesses } = useBusinessStore();

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchBusinesses(selectedCategory, searchQuery);
        }, 500);

        return () => clearTimeout(delaySearch);
        
    }, [selectedCategory, searchQuery]); 

    const getFullImageUrl = (imagePath) => {
        if (!imagePath) {
            return "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&q=80";
        }
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        const cleanPath = imagePath.replace(/\\/g, '/').replace(/^\//, ''); 
        return `${SERVER_URL}/${cleanPath}`;
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#f43f5e', '#ec4899']} style={styles.header}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <View style={[styles.circle, styles.circleTopRight]} />
                        <View style={[styles.circle, styles.circleBottomLeft]} />

                        <Text style={styles.greeting}>Hello, {firstName}! 👋</Text>
                        <Text style={styles.subtitle}>Discover amazing services near you</Text>

                        <View style={styles.searchContainer}>
                            <Search color="#f43f5e" size={20} style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search for services, businesses, or cities..."
                                placeholderTextColor="#94a3b8"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCorrect={false}
                            />
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.categoriesWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
                    {categories.map((category) => {
                        const isActive = selectedCategory === category;
                        return (
                            <TouchableOpacity key={category} onPress={() => setSelectedCategory(category)}>
                                <LinearGradient colors={isActive ? ['#f43f5e', '#fb7185'] : ['#ffffff', '#ffffff']} style={[styles.categoryPill, !isActive && styles.categoryPillInactive]}>
                                    <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{category}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <ScrollView style={styles.feedContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.feedHeader}>
                    <Text style={styles.feedTitle}>Top Rated Providers</Text>
                    {!isLoading && businesses?.length > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{businesses.length} available</Text>
                        </View>
                    )}
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#f43f5e" style={styles.loader} />
                ) : error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : businesses?.length === 0 ? (
                    <Text style={styles.emptyText}>No businesses match your search.</Text>
                ) : (
                    businesses?.map((business) => (
                        <ProviderCard
                            key={business._id || business.id}
                            provider={{
                                id: business._id || business.id,
                                name: business.name || "Unnamed Business",
                                rating: business.rating || "New",
                                distance: business.distance || "N/A",
                                // 🚨 APPLED THE FIX HERE!
                                image: getFullImageUrl(business.coverImage || business.image)
                            }}
                            onPress={() => {
                                const targetId = business._id || business.id;
                                navigation.navigate('BusinessProfile', { providerId: targetId });
                            }}
                        />
                    ))
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fafaf9' },
    header: { paddingBottom: 24, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' },
    headerContent: { paddingHorizontal: 20, paddingTop: 20 },
    circle: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 100 },
    circleTopRight: { width: 160, height: 160, top: -60, right: -60 },
    circleBottomLeft: { width: 120, height: 120, bottom: -40, left: -40 },
    greeting: { fontSize: 28, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
    subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.9)', marginBottom: 20 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 16, paddingHorizontal: 16, height: 56, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
    searchIcon: { marginRight: 12 },
    searchInput: { flex: 1, fontSize: 16, color: '#0f172a' },
    categoriesWrapper: { marginTop: 16, marginBottom: 8 },
    categoriesContainer: { paddingHorizontal: 20, gap: 12 },
    categoryPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, shadowColor: '#f43f5e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    categoryPillInactive: { shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
    categoryText: { fontSize: 15, fontWeight: '600', color: '#64748b' },
    categoryTextActive: { color: '#ffffff' },
    feedContainer: { flex: 1, paddingHorizontal: 20 },
    feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
    feedTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
    badge: { backgroundColor: '#ffe4e6', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    badgeText: { color: '#be123c', fontSize: 12, fontWeight: '700' },
    loader: { marginTop: 40 },
    errorText: { color: '#e11d48', textAlign: 'center', marginTop: 40, fontSize: 16 },
    emptyText: { color: '#64748b', textAlign: 'center', marginTop: 40, fontSize: 16 }
});