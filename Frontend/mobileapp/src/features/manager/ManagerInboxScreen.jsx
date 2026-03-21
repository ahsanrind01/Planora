import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
// 👇 ADDED ChevronLeft for the back button
import { MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { apiClient } from '../../core/api/apiClient';
import { useAuthStore } from '../../core/store/authStore';

export default function ManagerInboxScreen() {
    const navigation = useNavigation();
    const currentUser = useAuthStore(state => state.user);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchConversations();
        }, [])
    );

    const fetchConversations = async () => {
        try {
            const response = await apiClient.get('/chat/conversations');
            
            // 🚨 THE DEBUGGER: This will print the raw database data to your Expo terminal!
            console.log("📥 INBOX DATA RECEIVED:", JSON.stringify(response.data.data, null, 2));
            
            setConversations(response.data.data);
        } catch (error) {
            console.error("🚨 Failed to load inbox:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const dateObj = new Date(dateString);
        const today = new Date();
        
        if (dateObj.toDateString() === today.toDateString()) {
            return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const renderItem = ({ item }) => {
        // 👇 UNIVERSAL LOGIC: Figure out who the "other" person is dynamically!
        // If my ID matches the customerId, then the "other person" is the Business.
        // If it doesn't match, then I am the Business, and the "other person" is the Customer.
        const amICustomer = item.customerId?._id === currentUser?._id || item.customerId === currentUser?._id;
        const otherParty = amICustomer ? item.businessId : item.customerId;
        
        const displayName = otherParty?.name || "Unknown User";
        const displayLetter = displayName.charAt(0).toUpperCase();

        return (
            <TouchableOpacity 
                style={styles.chatCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ChatScreen', { 
                    conversationId: item._id, 
                    receiverName: displayName,
                    receiverId: otherParty?._id
                })}
            >
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{displayLetter}</Text>
                </View>
                
                <View style={styles.chatDetails}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.customerName}>{displayName}</Text>
                        <Text style={styles.timeText}>{formatTime(item.lastMessageAt)}</Text>
                    </View>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.lastMessage || "Started a conversation..."}
                    </Text>
                </View>

                <ChevronRight color="#cbd5e1" size={20} />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
            <View style={styles.container}>
                
                {/* 👇 UPGRADED HEADER WITH BACK BUTTON 👇 */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <ChevronLeft color="#0f172a" size={28} />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Messages</Text>
                    
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{conversations.length}</Text>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#2563eb" />
                    </View>
                ) : conversations.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <View style={styles.emptyIconCircle}>
                            <MessageSquare color="#94a3b8" size={32} />
                        </View>
                        <Text style={styles.emptyTitle}>No Messages Yet</Text>
                        <Text style={styles.emptySubtitle}>When customers message you about their appointments, they will appear here.</Text>
                    </View>
                ) : (
                    <FlatList 
                        data={conversations}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8fafc' },
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { 
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16, 
        paddingVertical: 12,
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1,
        borderColor: '#f1f5f9'
    },
    backButton: {
        marginRight: 12,
        padding: 4
    },
    headerTitle: { 
        fontSize: 24, 
        fontWeight: '800', 
        color: '#0f172a',
        letterSpacing: -0.5
    },
    badgeContainer: {
        backgroundColor: '#dbeafe',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 12
    },
    badgeText: {
        color: '#1d4ed8',
        fontWeight: '700',
        fontSize: 14
    },
    listContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
    chatCard: { 
        flexDirection: 'row', backgroundColor: '#ffffff', padding: 16, 
        borderRadius: 20, marginBottom: 12, alignItems: 'center', 
        borderWidth: 1, borderColor: '#f1f5f9',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 
    },
    avatar: { 
        width: 52, height: 52, borderRadius: 26, backgroundColor: '#eff6ff', 
        justifyContent: 'center', alignItems: 'center', marginRight: 16,
        borderWidth: 1, borderColor: '#dbeafe'
    },
    avatarText: { fontSize: 20, fontWeight: '700', color: '#2563eb' },
    chatDetails: { flex: 1, justifyContent: 'center' },
    chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    customerName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
    timeText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
    lastMessage: { fontSize: 14, color: '#475569', paddingRight: 10 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
    emptyIconCircle: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#f1f5f9',
        justifyContent: 'center', alignItems: 'center', marginBottom: 20
    },
    emptyTitle: { fontSize: 18, color: '#0f172a', fontWeight: '700', marginBottom: 8 },
    emptySubtitle: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22 }
});