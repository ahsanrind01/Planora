import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Star, MapPin } from 'lucide-react-native';

export default function ProviderCard({ provider, onPress }) {
    return (
        <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.8} 
            onPress={onPress}
        >
            <View style={styles.cardInner}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: provider.image }} style={styles.image} />
                    <View style={styles.starBadge}>
                        <Star size={12} color="#ffffff" fill="#ffffff" />
                    </View>
                </View>

                <View style={styles.details}>
                    <Text style={styles.name} numberOfLines={1}>
                        {provider.name}
                    </Text>
                    
                    <View style={styles.statsRow}>
                        <View style={styles.ratingPill}>
                            <Star size={14} color="#facc15" fill="#facc15" />
                            <Text style={styles.ratingText}>{provider.rating}</Text>
                        </View>
                        
                        <View style={styles.distanceContainer}>
                            <MapPin size={14} color="#64748b" />
                            <Text style={styles.distanceText}>{provider.distance}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    cardInner: {
        flexDirection: 'row',
        padding: 16,
        gap: 16,
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: 96,
        height: 96,
        borderRadius: 16,
        backgroundColor: '#e2e8f0',
    },
    starBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#fbbf24', 
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#fbbf24',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4,
    },
    details: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 8,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    ratingPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#fefce8',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
    },
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    distanceText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
    }
});