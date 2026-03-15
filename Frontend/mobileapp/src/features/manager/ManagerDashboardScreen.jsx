import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    RefreshControl,
    Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, CalendarCheck, TrendingUp, Clock, Check, X } from 'lucide-react-native';

import { useAuthStore } from '../../core/store/authStore';
import { apiClient } from '../../core/api/apiClient';

export default function ManagerDashboardScreen() {
    const user = useAuthStore(state => state.user);

    const [isLoading, setIsLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [activeFilter, setActiveFilter] = useState('confirmed'); 

    const [stats, setStats] = useState({
        totalBookings: 0,
        totalCustomers: 0,
        monthlyRevenue: 0,
        pendingRequests: 0
    });

    const fetchDashboardData = async () => {
        if (!user?.businessId) {
            setIsLoading(false);
            return;
        }

        try {
            // Safe URL without the trailing slash
            const response = await apiClient.get(`/bookings/business`);
            const data = response.data?.data || [];

            setAppointments(data);

            let confirmedCount = 0; 
            let revenue = 0;
            let pendingCount = 0;
            const uniqueCustomers = new Set();

            data.forEach(apt => {
                const safeStatus = String(apt.status || '').toLowerCase().trim();

                // Count Confirmed/Completed for official stats
                if (safeStatus === 'confirmed' || safeStatus === 'completed') {
                    confirmedCount += 1; 
                    revenue += (apt.serviceId?.price || 0);
                    if (apt.userId?._id) uniqueCustomers.add(apt.userId._id);
                }

                // Count Pending requests
                if (safeStatus === 'pending') {
                    pendingCount += 1;
                }
            });

            setStats({
                totalBookings: confirmedCount,
                totalCustomers: uniqueCustomers.size,
                monthlyRevenue: revenue,
                pendingRequests: pendingCount
            });

        } catch (error) {
            console.log("Dashboard Fetch Error:", error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchDashboardData();
        }, [user?.businessId])
    );

    const displayedAppointments = appointments.filter(apt => {
        const safeStatus = String(apt.status || '').toLowerCase().trim();
        if (activeFilter === 'pending') {
            return safeStatus === 'pending';
        } else {
            return safeStatus === 'confirmed' || safeStatus === 'completed';
        }
    });

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await apiClient.patch(`/bookings/${id}/status`, { status: newStatus });
            fetchDashboardData(); // Refresh stats instantly
        } catch (error) {
            Alert.alert("Error", "Failed to update booking status.");
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchDashboardData} tintColor="#f43f5e" />}
            >
                <LinearGradient colors={['#f43f5e', '#ec4899']} style={styles.header}>
                    <SafeAreaView>
                        <View style={styles.headerContent}>
                            <View style={[styles.circle, styles.circleTopRight]} />
                            <Text style={styles.greeting}>Welcome back,</Text>
                            <Text style={styles.managerName}>{user?.name || 'Manager'} 👋</Text>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                    <View style={styles.statsGrid}>

                        <TouchableOpacity
                            style={[styles.statCard, activeFilter === 'confirmed' && styles.activeCard]}
                            onPress={() => setActiveFilter('confirmed')}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#dbeafe' }]}>
                                <CalendarCheck color="#3b82f6" size={24} />
                            </View>
                            <Text style={styles.statValue}>{stats.totalBookings}</Text>
                            <Text style={styles.statLabel}>Total Bookings</Text>
                        </TouchableOpacity>

                        <View style={styles.statCard}>
                            <View style={[styles.iconBox, { backgroundColor: '#fce7f3' }]}>
                                <Users color="#db2777" size={24} />
                            </View>
                            <Text style={styles.statValue}>{stats.totalCustomers}</Text>
                            <Text style={styles.statLabel}>Total Clients</Text>
                        </View>

                        <View style={styles.statCard}>
                            <View style={[styles.iconBox, { backgroundColor: '#dcfce7' }]}>
                                <TrendingUp color="#16a34a" size={24} />
                            </View>
                            <Text style={styles.statValue}>${stats.monthlyRevenue}</Text>
                            <Text style={styles.statLabel}>Est. Revenue</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.statCard, activeFilter === 'pending' && styles.activeCard]}
                            onPress={() => setActiveFilter('pending')}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#fef3c7' }]}>
                                <Clock color="#d97706" size={24} />
                            </View>
                            <Text style={styles.statValue}>{stats.pendingRequests}</Text>
                            <Text style={styles.statLabel}>Pending Approvals</Text>
                        </TouchableOpacity>

                    </View>
                </View>

                <View style={styles.scheduleContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            {activeFilter === 'pending' ? 'Action Required' : "Confirmed Schedule"} 
                        </Text>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator size="large" color="#f43f5e" style={{ marginTop: 20 }} />
                    ) : displayedAppointments.length === 0 ? (
                        <Text style={{ color: '#64748b', textAlign: 'center', marginTop: 20 }}>
                            {activeFilter === 'pending' ? 'No pending requests.' : 'No confirmed appointments yet.'}
                        </Text>
                    ) : (
                        displayedAppointments.map((apt) => (
                            <View key={apt._id} style={styles.appointmentCard}>
                                <View style={styles.aptTimeBox}>
                                    <Text style={styles.aptTime}>
                                        {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    <Text style={{ fontSize: 11, fontWeight: '500', color: '#64748b', marginTop: 4 }}>
                                        {new Date(apt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </Text>
                                </View>

                                <View style={styles.aptDetails}>
                                    <Text style={styles.customerName}>{apt.userId?.name || 'Guest User'}</Text>
                                    <Text style={styles.serviceName}>{apt.serviceId?.name || 'Service'}</Text>
                                </View>

                                {apt.status === 'pending' ? (
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, { backgroundColor: '#ecfdf5', borderColor: '#10b981' }]}
                                            onPress={() => handleUpdateStatus(apt._id, 'confirmed')}
                                        >
                                            <Check color="#10b981" size={18} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, { backgroundColor: '#fef2f2', borderColor: '#ef4444' }]}
                                            onPress={() => handleUpdateStatus(apt._id, 'cancelled')}
                                        >
                                            <X color="#ef4444" size={18} />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={[
                                        styles.statusDot,
                                        apt.status === 'confirmed' ? { backgroundColor: '#10b981' } : { backgroundColor: '#3b82f6' }
                                    ]} />
                                )}
                            </View>
                        ))
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fafaf9' },
    header: { paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' },
    headerContent: { paddingHorizontal: 20, paddingTop: 20 },
    circle: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 100 },
    circleTopRight: { width: 150, height: 150, top: -50, right: -50 },
    greeting: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginBottom: 4 },
    managerName: { fontSize: 28, fontWeight: '700', color: '#ffffff', marginBottom: 12 },
    badge: { alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    badgeText: { color: '#ffffff', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
    statsContainer: { paddingHorizontal: 20, marginTop: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
    statCard: { width: '48%', backgroundColor: '#ffffff', padding: 16, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 2, borderColor: '#ffffff', marginBottom: 4 },
    activeCard: { borderColor: '#f43f5e', shadowColor: '#f43f5e', shadowOpacity: 0.15 },
    iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    statValue: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
    statLabel: { fontSize: 13, color: '#64748b', fontWeight: '500' },
    scheduleContainer: { paddingHorizontal: 20, marginTop: 32 },
    appointmentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
    aptTimeBox: { width: 80, borderRightWidth: 1, borderRightColor: '#f1f5f9', marginRight: 16 },
    aptTime: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
    aptDetails: { flex: 1 },
    customerName: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
    serviceName: { fontSize: 13, color: '#64748b', textTransform: 'capitalize' },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 10 },
    actionButtons: { flexDirection: 'row', gap: 8 },
    actionBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }
});