import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    Platform
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native'; 
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, MapPin, Lock, CalendarX2, MessageCircle } from 'lucide-react-native'; 

import { useAppointmentStore } from '../../core/store/appointmentStore';
import { useAuthStore } from '../../core/store/authStore'; 
import { apiClient } from '../../core/api/apiClient'; 

export default function AppointmentsScreen() {
    const navigation = useNavigation();
    const user = useAuthStore(state => state.user); 

    const [activeTab, setActiveTab] = useState("upcoming");

    const { appointments, isLoading, error, fetchMyAppointments, cancelBooking } = useAppointmentStore();

    useFocusEffect(
        useCallback(() => {
            if (user) {
                fetchMyAppointments();
            }
        }, [user])
    );

    const handleMessageBusiness = async (businessId, businessName) => {
        try {
            const response = await apiClient.post('/chat/initiate', { businessId });
            const conversationId = response.data.data._id;

            navigation.navigate('ChatScreen', {
                conversationId: conversationId,
                receiverName: businessName,
                receiverId: businessId
            });
        } catch (error) {
            console.error("🚨 Could not open chat:", error);
            Alert.alert("Error", "Could not start chat with the business.");
        }
    };

    const upcomingAppointments = appointments.filter(app =>
        app.status !== 'completed' && app.status !== 'cancelled'
    );
    const pastAppointments = appointments.filter(app =>
        app.status === 'completed' || app.status === 'cancelled'
    );

    const displayList = activeTab === "upcoming" ? upcomingAppointments : pastAppointments;

    const formatDateTime = (isoString) => {
        if (!isoString) return { date: "TBD", time: "TBD" };
        const d = new Date(isoString);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return { date: dateStr, time: timeStr };
    };

    const handleCancel = (bookingId) => {
        Alert.alert(
            "Cancel Appointment",
            "Are you sure you want to cancel this booking?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes, Cancel",
                    style: "destructive",
                    onPress: () => cancelBooking(bookingId)
                }
            ]
        );
    };

    const getStatusColors = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return { bg: '#dcfce7', text: '#166534' };
            case 'confirmed': return { bg: '#dbeafe', text: '#1e40af' };
            case 'pending': return { bg: '#fef3c7', text: '#92400e' };
            case 'cancelled': return { bg: '#fee2e2', text: '#991b1b' };
            default: return { bg: '#f1f5f9', text: '#475569' };
        }
    };

    const getPaymentBadgeStyle = (status) => {
        switch (status) {
            case 'paid': return { backgroundColor: '#dcfce7', color: '#166534' }; 
            case 'unpaid': return { backgroundColor: '#fef9c3', color: '#854d0e' }; 
            case 'refunded': return { backgroundColor: '#f1f5f9', color: '#475569' }; 
            default: return { backgroundColor: '#f1f5f9', color: '#475569' };
        }
    };

    if (!user) {
        return (
            <View style={styles.bouncerContainer}>
                <View style={styles.bouncerIconBox}>
                    <Lock color="#1e40af" size={40} strokeWidth={2} />
                </View>
                <Text style={styles.bouncerTitle}>Your Bookings</Text>
                <Text style={styles.bouncerSubtitle}>Log in or sign up to view and manage your upcoming bookings.</Text>
                <TouchableOpacity style={styles.bouncerButtonWrapper} activeOpacity={0.8} onPress={() => navigation.navigate('Auth')}>
                    <LinearGradient colors={['#1e40af', '#3b82f6']} style={styles.bouncerButton}>
                        <Text style={styles.bouncerButtonText}>Log In / Sign Up</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f172a', '#1e3a8a']} style={styles.header}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <View style={[styles.circle, styles.circleTopRight]} />
                        <View style={[styles.circle, styles.circleBottomLeft]} />
                        <Text style={styles.title}>My Bookings</Text>
                        <View style={styles.segmentedControl}>
                            <TouchableOpacity activeOpacity={0.7} style={[styles.tabButton, activeTab === "upcoming" && styles.tabButtonActive]} onPress={() => setActiveTab("upcoming")}>
                                <Text style={[styles.tabText, activeTab === "upcoming" && styles.tabTextActive]}>Upcoming ({upcomingAppointments.length})</Text>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.7} style={[styles.tabButton, activeTab === "past" && styles.tabButtonActive]} onPress={() => setActiveTab("past")}>
                                <Text style={[styles.tabText, activeTab === "past" && styles.tabTextActive]}>Past ({pastAppointments.length})</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
                ) : error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : displayList.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconBox}>
                            <CalendarX2 color="#3b82f6" size={40} strokeWidth={1.5} />
                        </View>
                        <Text style={styles.emptyTitle}>No {activeTab} appointments</Text>
                        <Text style={styles.emptySubtitle}>Your bookings will appear here</Text>
                    </View>
                ) : (
                    <View style={styles.cardsWrapper}>
                        {displayList.map((appointment) => {
                            const statusStyle = getStatusColors(appointment.status);
                            const businessName = appointment.businessId?.name || "Unknown Business";
                            const businessAddress = appointment.businessId?.address || "Address unavailable";
                            const serviceName = appointment.serviceId?.name || "Unknown Service";
                            const { date: niceDate, time: niceTime } = formatDateTime(appointment.date);

                            return (
                                <View key={appointment._id} style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.cardTitleBox}>
                                            <Text style={styles.providerName}>{businessName}</Text>
                                            <Text style={styles.serviceName}>{serviceName}</Text>
                                        </View>
                                        <View style={styles.badgeRow}>
                                            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                                <Text style={[styles.statusText, { color: statusStyle.text }]}>{appointment.status || "Pending"}</Text>
                                            </View>
                                            <View style={[styles.statusBadge, { backgroundColor: getPaymentBadgeStyle(appointment.paymentStatus).backgroundColor, marginLeft: 8 }]}>
                                                <Text style={[styles.statusText, { color: getPaymentBadgeStyle(appointment.paymentStatus).color }]}>
                                                    {appointment.paymentStatus ? appointment.paymentStatus.toUpperCase() : 'UNPAID'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <View style={styles.infoPill}>
                                            <Calendar color="#2563eb" size={16} />
                                            <Text style={styles.infoText}>{niceDate}</Text>
                                        </View>
                                        <View style={styles.infoPill}>
                                            <Clock color="#2563eb" size={16} />
                                            <Text style={styles.infoText}>{niceTime}</Text>
                                        </View>
                                    </View>

                                    <View style={[styles.infoPill, styles.addressPill]}>
                                        <MapPin color="#64748b" size={16} />
                                        <Text style={styles.addressText}>{businessAddress}</Text>
                                    </View>

                                    <View style={styles.actionButtonsRow}>
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            style={styles.chatButton}
                                            onPress={() => handleMessageBusiness(appointment.businessId?._id, businessName)}
                                        >
                                            <MessageCircle color="#3b82f6" size={18} style={{ marginRight: 6 }} />
                                            <Text style={styles.chatButtonText}>Message</Text>
                                        </TouchableOpacity>

                                        {activeTab === "upcoming" && (
                                            <TouchableOpacity
                                            activeOpacity={0.7}
                                            style={styles.cancelButton}
                                            onPress={() => handleCancel(appointment._id)}
                                            >
                                                <Text style={styles.cancelButtonText}>Cancel</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                </View>
                            );
                        })}
                    </View>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f8fafc' 
    },

    bouncerContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 24,
        backgroundColor: '#f8fafc'
    },
    bouncerIconBox: { 
        width: 88, 
        height: 88, 
        borderRadius: 44, 
        backgroundColor: '#dbeafe', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 24,
        shadowColor: '#1d4ed8',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 5
    },
    bouncerTitle: { 
        fontSize: 26, 
        fontWeight: '700', 
        color: '#0f172a', 
        marginBottom: 12, 
        textAlign: 'center',
        letterSpacing: -0.5
    },
    bouncerSubtitle: { 
        fontSize: 16, 
        color: '#64748b', 
        textAlign: 'center', 
        marginBottom: 40, 
        paddingHorizontal: 20,
        lineHeight: 24
    },
    bouncerButtonWrapper: { 
        width: '100%', 
        maxWidth: 350,
        borderRadius: 16, 
        overflow: 'hidden',
        shadowColor: '#1d4ed8',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8
    },
    bouncerButton: { 
        height: 60, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    bouncerButtonText: { 
        color: '#ffffff', 
        fontSize: 16, 
        fontWeight: '800',
        letterSpacing: 0.5 
    },

    header: { 
        paddingBottom: 24, 
        borderBottomLeftRadius: 32, 
        borderBottomRightRadius: 32, 
        overflow: 'hidden' 
    },
    headerContent: { 
        paddingHorizontal: 24, 
        paddingTop: Platform.OS === 'android' ? 40 : 20 
    },
    circle: { 
        position: 'absolute', 
        backgroundColor: 'rgba(255,255,255,0.03)', 
        borderRadius: 999 
    },
    circleTopRight: { width: 200, height: 200, top: -80, right: -60 },
    circleBottomLeft: { width: 140, height: 140, bottom: -50, left: -40 },
    title: { 
        fontSize: 30, 
        fontWeight: '700', 
        color: '#ffffff', 
        marginBottom: 20,
        letterSpacing: -0.5 
    },
    
    segmentedControl: { 
        flexDirection: 'row', 
        backgroundColor: 'rgba(255, 255, 255, 0.15)', 
        padding: 6, 
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)'
    },
    tabButton: { 
        flex: 1, 
        paddingVertical: 12, 
        borderRadius: 16, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    tabButtonActive: { 
        backgroundColor: '#ffffff', 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 8, 
        elevation: 4 
    },
    tabText: { 
        fontSize: 15, 
        fontWeight: '600', 
        color: 'rgba(255, 255, 255, 0.8)' 
    },
    tabTextActive: { 
        color: '#1d4ed8', 
        fontWeight: '800' 
    },

    listContainer: { 
        flex: 1, 
        paddingHorizontal: 24, 
        paddingTop: 24 
    },
    loader: { marginTop: 60 },
    errorText: { 
        color: '#ef4444', 
        textAlign: 'center', 
        marginTop: 60, 
        fontSize: 16,
        fontWeight: '500' 
    },
    emptyState: { 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginTop: 80 
    },
    emptyIconBox: { 
        width: 88, 
        height: 88, 
        borderRadius: 24, 
        backgroundColor: '#eff6ff', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: 20 
    },
    emptyTitle: { 
        fontSize: 22, 
        fontWeight: '800', 
        color: '#0f172a', 
        marginBottom: 8 
    },
    emptySubtitle: { 
        fontSize: 16, 
        color: '#64748b',
        fontWeight: '500' 
    },
    
    cardsWrapper: { gap: 16 },
    card: { 
        backgroundColor: '#ffffff', 
        borderRadius: 24, 
        padding: 20, 
        shadowColor: '#0f172a', 
        shadowOffset: { width: 0, height: 8 }, 
        shadowOpacity: 0.06, 
        shadowRadius: 16, 
        elevation: 4, 
        borderWidth: 1, 
        borderColor: '#f1f5f9' 
    },
    cardHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: 20 
    },
    cardTitleBox: { 
        flex: 1, 
        paddingRight: 12 
    },
    providerName: { 
        fontSize: 19, 
        fontWeight: '700', 
        color: '#0f172a', 
        marginBottom: 6,
        letterSpacing: -0.3 
    },
    serviceName: { 
        fontSize: 15, 
        fontWeight: '600', 
        color: '#64748b' 
    },
    statusBadge: { 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 12 
    },
    statusText: { 
        fontSize: 13, 
        fontWeight: '700',
        textTransform: 'capitalize',
        letterSpacing: 0.3 
    },
    
    infoRow: { 
        flexDirection: 'row', 
        gap: 12, 
        marginBottom: 12 
    },
    infoPill: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#f8fafc', 
        paddingHorizontal: 12, 
        paddingVertical: 10, 
        borderRadius: 12, 
        gap: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    infoText: { 
        fontSize: 14, 
        fontWeight: '700', 
        color: '#0f172a' 
    },
    addressPill: { 
        marginBottom: 20 
    },
    addressText: { 
        fontSize: 14, 
        fontWeight: '500', 
        color: '#475569',
        flex: 1
    },
    
    cancelButton: { 
        flex: 1,
        width: '100%', 
        paddingVertical: 14, 
        borderRadius: 14, 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#fff1f2' 
    },
    cancelButtonText: { 
        color: '#e11d48', 
        fontSize: 15, 
        fontWeight: '700' 
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 12,
    },
    badge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        gap: 10,
    },
    chatButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#eff6ff', 
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    chatButtonText: {
        color: '#3b82f6',
        fontWeight: '600',
        fontSize: 14,
    },
});