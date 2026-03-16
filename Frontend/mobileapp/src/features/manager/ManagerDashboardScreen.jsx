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
    Alert,
    Platform
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
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchDashboardData} tintColor="#2563eb" />}
            >
                <LinearGradient colors={['#0f172a', '#1e3a8a']} style={styles.header}>
                    <SafeAreaView>
                        <View style={styles.headerContent}>
                            <View style={[styles.circle, styles.circleTopRight]} />
                            <View style={[styles.circle, styles.circleBottomLeft]} />

                            <Text style={styles.greeting}>Welcome back,</Text>
                            <Text style={styles.managerName}>{user?.name || 'Manager'} </Text>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                    <View style={styles.statsGrid}>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.statCard, activeFilter === 'confirmed' && styles.activeCard]}
                            onPress={() => setActiveFilter('confirmed')}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                                <CalendarCheck color="#2563eb" size={24} />
                            </View>
                            <Text style={styles.statValue}>{stats.totalBookings}</Text>
                            <Text style={styles.statLabel}>Total Bookings</Text>
                        </TouchableOpacity>

                        <View style={styles.statCard}>
                            <View style={[styles.iconBox, { backgroundColor: '#e0e7ff' }]}>
                                <Users color="#4f46e5" size={24} />
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
                            activeOpacity={0.8}
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
                        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
                    ) : displayedAppointments.length === 0 ? (
                        <Text style={styles.emptyText}>
                            {activeFilter === 'pending' ? 'No pending requests.' : 'No confirmed appointments yet.'}
                        </Text>
                    ) : (
                        displayedAppointments.map((apt) => (
                            <View key={apt._id} style={styles.appointmentCard}>
                                <View style={styles.aptTimeBox}>
                                    <Text style={styles.aptTime}>
                                        {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    <Text style={styles.aptDate}>
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
                                            activeOpacity={0.7}
                                            style={[styles.actionBtn, { backgroundColor: '#dcfce7', borderColor: '#bbf7d0' }]}
                                            onPress={() => handleUpdateStatus(apt._id, 'confirmed')}
                                        >
                                            <Check color="#16a34a" size={20} strokeWidth={2.5} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            style={[styles.actionBtn, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}
                                            onPress={() => handleUpdateStatus(apt._id, 'cancelled')}
                                        >
                                            <X color="#dc2626" size={20} strokeWidth={2.5} />
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

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f8fafc' 
    },
    
    header:{
        paddingBottom: 36,
        borderBottomLeftRadius: 38,
        borderBottomRightRadius: 38,
        overflow: 'hidden',
        
        shadowColor: '#020617',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 15
    },
    headerContent:{
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? 40 : 26
    },
    circle:{
        position: 'absolute',
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 100
    },
    circleTopRight:{
        width: 200,
        height: 200,
        top: -80,
        right: -70
    },
    circleBottomLeft:{
        width: 150,
        height: 150,
        bottom: -60,
        left: -60
    },

    greeting: { 
        fontSize: 16, 
        color: '#cbd5e1', 
        marginBottom: 4,
        fontWeight: '500' 
    },
    managerName: { 
        fontSize: 30, 
        fontWeight: '700', 
        color: '#ffffff', 
        marginBottom: 12,
        letterSpacing: -0.5 
    },

    statsContainer: { 
        paddingHorizontal: 24, 
        marginTop: 24 
    },
    sectionHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16 
    },
    sectionTitle: { 
        fontSize: 21, 
        fontWeight: '800', 
        color: '#020617', 
        marginBottom: 16,
        letterSpacing: -0.3 
    },
    statsGrid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between', 
        gap: 12 
    },
    statCard: { 
        width: '48%', 
        backgroundColor: '#ffffff', 
        padding: 16, 
        borderRadius: 24, 
        shadowColor: '#0f172a', 
        shadowOffset: { width: 0, height: 8 }, 
        shadowOpacity: 0.05, 
        shadowRadius: 16, 
        elevation: 3, 
        borderWidth: 2, 
        borderColor: '#ffffff', 
        marginBottom: 4 
    },
    activeCard: { 
        borderColor: '#1e40af', 
        shadowColor: '#1d4ed8', 
        shadowOpacity: 0.2,
        shadowRadius: 12
    },
    iconBox: { 
        width: 48, 
        height: 48, 
        borderRadius: 16, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 12 
    },
    statValue: { 
        fontSize: 24, 
        fontWeight: '800', 
        color: '#0f172a', 
        marginBottom: 4,
        letterSpacing: -0.5
    },
    statLabel: { 
        fontSize: 14, 
        color: '#64748b', 
        fontWeight: '600' 
    },

   
    scheduleContainer: { 
        paddingHorizontal: 24, 
        marginTop: 32 
    },
    emptyText: { 
        color: '#64748b', 
        textAlign: 'center', 
        marginTop: 20,
        fontSize: 15,
        fontWeight: '500' 
    },
    appointmentCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#ffffff', 
        padding: 20, 
        borderRadius: 20, 
        marginBottom: 16, 
        shadowColor: '#0f172a', 
        shadowOffset: { width: 0, height: 6 }, 
        shadowOpacity: 0.05, 
        shadowRadius: 12, 
        elevation: 2, 
        borderWidth: 1, 
        borderColor: '#f1f5f9' 
    },
    aptTimeBox: { 
        width: 80, 
        borderRightWidth: 1, 
        borderRightColor: '#e2e8f0', 
        marginRight: 16,
        paddingRight: 12
    },
    aptTime: { 
        fontSize: 15, 
        fontWeight: '800', 
        color: '#0f172a' 
    },
    aptDate: { 
        fontSize: 12, 
        fontWeight: '600', 
        color: '#64748b', 
        marginTop: 4 
    },
    aptDetails: { 
        flex: 1 
    },
    customerName: { 
        fontSize: 17, 
        fontWeight: '700', 
        color: '#0f172a', 
        marginBottom: 4,
        letterSpacing: -0.2
    },
    serviceName: { 
        fontSize: 14, 
        color: '#64748b', 
        fontWeight: '500',
        textTransform: 'capitalize' 
    },
    
    statusDot: { 
        width: 12, 
        height: 12, 
        borderRadius: 6, 
        marginLeft: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2
    },
    actionButtons: { 
        flexDirection: 'row', 
        gap: 10 
    },
    actionBtn: { 
        width: 44, 
        height: 44, 
        borderRadius: 22, 
        borderWidth: 1.5, 
        justifyContent: 'center', 
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2
    }
});