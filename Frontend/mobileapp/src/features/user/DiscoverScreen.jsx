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
import { BASE_URL } from '@/src/core/config';

const categories = ["All", "Cleaning", "Beauty", "Repair", "Health", "Automative", "Education", "Other"];

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
        return `${BASE_URL}/${cleanPath}`;
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#1e3a8a', '#0f172a']} style={styles.header}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <View style={[styles.circle, styles.circleTopRight]} />
                        <View style={[styles.circle, styles.circleBottomLeft]} />

                        <Text style={styles.greeting}>Hello, {firstName}! </Text>
                        <Text style={styles.subtitle}>Discover amazing services near you</Text>

                        <View style={styles.searchContainer}>
                            <Search color="#2563eb" size={20} style={styles.searchIcon} />
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
                            <TouchableOpacity key={category} activeOpacity={0.8} onPress={() => setSelectedCategory(category)}>
                                <LinearGradient 
                                    colors={isActive ? ['#2563eb', '#1e40af'] : ['#ffffff', '#ffffff']} 
                                    style={[styles.categoryPill, !isActive && styles.categoryPillInactive]}
                                >
                                    <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                                        {category}
                                    </Text>
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
                    <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
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
                                image: getFullImageUrl(business.coverImage || business.image)
                            }}
                            onPress={() => {
                                const targetId = business._id || business.id;
                                navigation.navigate('BusinessProfile', { providerId: targetId });
                            }}
                        />
                    ))
                )}

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:'#f1f5f9'
},

header:{
paddingBottom:36,
borderBottomLeftRadius:38,
borderBottomRightRadius:38,
overflow:'hidden',

shadowColor:'#020617',
shadowOffset:{width:0,height:12},
shadowOpacity:0.25,
shadowRadius:24,
elevation:15
},

headerContent:{
paddingHorizontal:24,
paddingTop:26
},

circle:{
position:'absolute',
backgroundColor:'rgba(255,255,255,0.07)',
borderRadius:100
},

circleTopRight:{
width:200,
height:200,
top:-80,
right:-70
},

circleBottomLeft:{
width:150,
height:150,
bottom:-60,
left:-60
},

greeting:{
fontSize:30,
fontWeight:'700',
color:'#ffffff',
marginBottom:6,
letterSpacing:0
},

subtitle:{
fontSize:15,
color:'rgba(255,255,255,0.9)',
marginBottom:24
},

searchContainer:{
flexDirection:'row',
alignItems:'center',
backgroundColor:'#ffffff',
borderRadius:20,
paddingHorizontal:18,
height:60,

shadowColor:'#0f172a',
shadowOffset:{width:0,height:10},
shadowOpacity:0.18,
shadowRadius:20,
elevation:10
},

searchIcon:{
marginRight:12
},

searchInput:{
flex:1,
fontSize:16,
color:'#0f172a'
},

categoriesWrapper:{
marginTop:24,
marginBottom:6
},

categoriesContainer:{
paddingHorizontal:20,
gap:14
},

categoryPill:{
paddingHorizontal:22,
paddingVertical:12,
borderRadius:30,

shadowColor:'#1e3a8a',
shadowOffset:{width:0,height:8},
shadowOpacity:0.25,
shadowRadius:14,
elevation:8
},

categoryPillInactive:{
backgroundColor:'#ffffff',

shadowColor:'#0f172a',
shadowOffset:{width:0,height:3},
shadowOpacity:0.06,
shadowRadius:6,
elevation:3
},

categoryText:{
fontSize:14,
fontWeight:'600',
color:'#475569'
},

categoryTextActive:{
color:'#ffffff'
},

feedContainer:{
flex:1,
paddingHorizontal:20,
marginTop:6
},

feedHeader:{
flexDirection:'row',
justifyContent:'space-between',
alignItems:'center',
marginVertical:20
},

feedTitle:{
fontSize:21,
fontWeight:'800',
color:'#020617',
letterSpacing:0.3
},

badge:{
backgroundColor:'#dbeafe',
paddingHorizontal:14,
paddingVertical:6,
borderRadius:14
},

badgeText:{
color:'#1e3a8a',
fontSize:12,
fontWeight:'700'
},

loader:{
marginTop:60
},

errorText:{
color:'#dc2626',
textAlign:'center',
marginTop:50,
fontSize:16
},

emptyText:{
color:'#64748b',
textAlign:'center',
marginTop:50,
fontSize:16
}

});