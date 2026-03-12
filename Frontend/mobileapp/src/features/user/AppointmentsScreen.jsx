import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; 
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, MapPin } from 'lucide-react-native';

import { useAppointmentStore } from '../../core/store/appointmentStore';

export default function AppointmentsScreen() {
    const [activeTab, setActiveTab] = useState("upcoming");

    const { appointments, isLoading, error, fetchMyAppointments, cancelBooking } = useAppointmentStore();

    useFocusEffect(
        useCallback(() => {
            fetchMyAppointments();
        }, [])
    );

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

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#f43f5e', '#ec4899']} style={styles.header}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <View style={[styles.circle, styles.circleTopRight]} />
                        <View style={[styles.circle, styles.circleBottomLeft]} />

                        <Text style={styles.title}>My Appointments</Text>

                        <View style={styles.segmentedControl}>
                            <TouchableOpacity
                                style={[styles.tabButton, activeTab === "upcoming" && styles.tabButtonActive]}
                                onPress={() => setActiveTab("upcoming")}
                            >
                                <Text style={[styles.tabText, activeTab === "upcoming" && styles.tabTextActive]}>
                                    Upcoming ({upcomingAppointments.length})
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabButton, activeTab === "past" && styles.tabButtonActive]}
                                onPress={() => setActiveTab("past")}
                            >
                                <Text style={[styles.tabText, activeTab === "past" && styles.tabTextActive]}>
                                    Past ({pastAppointments.length})
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#f43f5e" style={{ marginTop: 40 }} />
                ) : error ? (
                    <Text style={{ color: '#e11d48', textAlign: 'center', marginTop: 40, fontSize: 16 }}>{error}</Text>
                ) : displayList.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconBox}>
                            <Calendar color="#f43f5e" size={40} />
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
                                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                            <Text style={[styles.statusText, { color: statusStyle.text, textTransform: 'capitalize' }]}>
                                                {appointment.status || "Pending"}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <View style={styles.infoPill}>
                                            <Calendar color="#f43f5e" size={16} />
                                            <Text style={styles.infoText}>{niceDate}</Text>
                                        </View>
                                        <View style={styles.infoPill}>
                                            <Clock color="#f43f5e" size={16} />
                                            <Text style={styles.infoText}>{niceTime}</Text>
                                        </View>
                                    </View>

                                    <View style={[styles.infoPill, styles.addressPill]}>
                                        <MapPin color="#94a3b8" size={16} />
                                        <Text style={styles.addressText}>{businessAddress}</Text>
                                    </View>

                                    {activeTab === "upcoming" && (
                                        <TouchableOpacity
                                            style={styles.cancelButton}
                                            onPress={() => handleCancel(appointment._id)}
                                        >
                                            <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
                                        </TouchableOpacity>
                                    )}
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
    container: { flex: 1, backgroundColor: '#fafaf9' },
    header: { paddingBottom: 24, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' },
    headerContent: { paddingHorizontal: 20, paddingTop: 20 },
    circle: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 100 },
    circleTopRight: { width: 160, height: 160, top: -80, right: -80 },
    circleBottomLeft: { width: 120, height: 120, bottom: -40, left: -40 },
    title: { fontSize: 28, fontWeight: '700', color: '#ffffff', marginBottom: 16 },
    segmentedControl: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', padding: 6, borderRadius: 16 },
    tabButton: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    tabButtonActive: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    tabText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
    tabTextActive: { color: '#f43f5e', fontWeight: '700' },
    listContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
    emptyIconBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#ffe4e6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
    emptySubtitle: { fontSize: 16, color: '#64748b' },
    cardsWrapper: { gap: 16 },
    card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: '#f1f5f9' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    cardTitleBox: { flex: 1, paddingRight: 10 },
    providerName: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
    serviceName: { fontSize: 14, fontWeight: '500', color: '#64748b' },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    statusText: { fontSize: 12, fontWeight: '700' },
    infoRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    infoPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 8 },
    infoText: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
    addressPill: { marginBottom: 16 },
    addressText: { fontSize: 14, fontWeight: '500', color: '#64748b' },
    cancelButton: { width: '100%', paddingVertical: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff1f2' },
    cancelButtonText: { color: '#e11d48', fontSize: 15, fontWeight: '700' }
});