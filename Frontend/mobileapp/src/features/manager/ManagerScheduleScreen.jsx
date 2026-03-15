import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    SafeAreaView, Switch, ActivityIndicator, Alert, Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarDays, Save } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useScheduleStore } from '../../core/store/scheduleStore';
import { useAuthStore } from '../../core/store/authStore';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ManagerScheduleScreen() {
    const user = useAuthStore(state => state.user);

    const { fetchBusinessSchedule, saveBusinessSchedule } = useScheduleStore();
    
    const [schedule, setSchedule] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [showPicker, setShowPicker] = useState(false);
    const [activeDayIndex, setActiveDayIndex] = useState(null);
    const [activeTimeType, setActiveTimeType] = useState(null); 
    const [pickerDate, setPickerDate] = useState(new Date());

    // 🚨 THE FIX IS HERE: It now actively watches user?.businessId
    useEffect(() => {
        if (user?.businessId) {
            fetchSchedule();
        }
    }, [user?.businessId]);

    const fetchSchedule = async () => {
        // Double-check we actually have the ID before making the network request
        if (!user?.businessId) return; 

        setIsLoading(true);
        
        try {
            const result = await fetchBusinessSchedule(user.businessId);
            
            if (result?.success && result?.data && result.data.workingHours?.length === 7) {
                const mappedSchedule = result.data.workingHours.map(day => ({
                    day: day.day,
                    isOpen: !day.isClosed, 
                    startTime: day.startTime,
                    endTime: day.endTime
                }));
                setSchedule(mappedSchedule);
            } else {
                setSchedule(daysOfWeek.map(day => ({ day, isOpen: false, startTime: '09:00', endTime: '17:00' })));
            }
            
        } catch (error) {
            console.log("🚨 Fetch Error:", error);
            setSchedule(daysOfWeek.map(day => ({ day, isOpen: false, startTime: '09:00', endTime: '17:00' })));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        
        const dbFormattedSchedule = schedule.map(day => ({
            day: day.day,
            isClosed: !day.isOpen,
            startTime: day.startTime,
            endTime: day.endTime
        }));

        const result = await saveBusinessSchedule(dbFormattedSchedule);
        
        setIsSaving(false);
        
        if (result.success) {
            Alert.alert("Success", "Your operating hours have been saved.");
        } else {
            Alert.alert("Error", result.message || "Failed to save schedule.");
        }
    };

    const toggleDay = (index) => {
        const newSchedule = [...schedule];
        newSchedule[index].isOpen = !newSchedule[index].isOpen;
        setSchedule(newSchedule);
    };

    const openTimePicker = (index, type) => {
        setActiveDayIndex(index);
        setActiveTimeType(type);
        
        const [hours, minutes] = schedule[index][type].split(':');
        const d = new Date();
        d.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
        
        setPickerDate(d);
        setShowPicker(true);
    };

    const onTimeChange = (event, selectedDate) => {
        setShowPicker(Platform.OS === 'ios'); 
        if (selectedDate) {
            setPickerDate(selectedDate);
            
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            const timeString = `${hours}:${minutes}`;

            const newSchedule = [...schedule];
            newSchedule[activeDayIndex][activeTimeType] = timeString;
            setSchedule(newSchedule);
        }
    };

    const formatTimeDisplay = (time24) => {
        let [hours, minutes] = time24.split(':');
        hours = parseInt(hours, 10);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    };

    if (isLoading) {
        return <View style={[styles.container, { justifyContent: 'center' }]}><ActivityIndicator size="large" color="#f43f5e" /></View>;
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#f43f5e', '#ec4899']} style={styles.header}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <View style={[styles.circle, styles.circleTopRight]} />
                        <View style={styles.headerTitleRow}>
                            <CalendarDays color="#ffffff" size={28} />
                            <Text style={styles.headerTitle}>Operating Hours</Text>
                        </View>
                        <Text style={styles.headerSubtitle}>Set when clients can book appointments with you.</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    {schedule.map((dayObj, index) => (
                        <View key={dayObj.day} style={[styles.dayRow, index === schedule.length - 1 && styles.lastRow]}>
                            
                            <View style={styles.dayInfo}>
                                <Switch
                                    trackColor={{ false: '#cbd5e1', true: '#fbcfe8' }}
                                    thumbColor={dayObj.isOpen ? '#f43f5e' : '#f8fafc'}
                                    ios_backgroundColor="#cbd5e1"
                                    onValueChange={() => toggleDay(index)}
                                    value={dayObj.isOpen}
                                />
                                <Text style={[styles.dayText, !dayObj.isOpen && styles.dayTextClosed]}>{dayObj.day}</Text>
                            </View>

                            {dayObj.isOpen ? (
                                <View style={styles.timeContainer}>
                                    <TouchableOpacity style={styles.timeButton} onPress={() => openTimePicker(index, 'startTime')}>
                                        <Text style={styles.timeText}>{formatTimeDisplay(dayObj.startTime)}</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.timeDivider}>-</Text>
                                    <TouchableOpacity style={styles.timeButton} onPress={() => openTimePicker(index, 'endTime')}>
                                        <Text style={styles.timeText}>{formatTimeDisplay(dayObj.endTime)}</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.closedContainer}>
                                    <Text style={styles.closedText}>Closed</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                <TouchableOpacity 
                    style={[styles.saveButtonWrapper, isSaving && styles.saveButtonDisabled]} 
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    <LinearGradient colors={['#f43f5e', '#fb7185']} style={styles.saveButton}>
                        {isSaving ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <>
                                <Save color="#ffffff" size={20} style={{ marginRight: 8 }} />
                                <Text style={styles.saveButtonText}>Save Schedule</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
                <View style={{ height: 40 }} />
            </ScrollView>

            {showPicker && (
                <View style={{ backgroundColor: '#ffffff' }}> 
                    <DateTimePicker
                        value={pickerDate}
                        mode="time"
                        is24Hour={false}
                        display="spinner"
                        onChange={onTimeChange}
                        textColor="#0f172a" 
                        themeVariant="light"
                    />
                </View>
            )}
            
            {showPicker && Platform.OS === 'ios' && (
                <TouchableOpacity 
                    style={{ backgroundColor: '#f1f5f9', padding: 15, alignItems: 'center', paddingBottom: 30 }} 
                    onPress={() => setShowPicker(false)}
                >
                    <Text style={{ color: '#f43f5e', fontWeight: 'bold', fontSize: 16 }}>Done</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fafaf9' },
    header: { paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' },
    headerContent: { paddingHorizontal: 20, paddingTop: 20 },
    circle: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 100 },
    circleTopRight: { width: 150, height: 150, top: -50, right: -50 },
    headerTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    headerTitle: { fontSize: 26, fontWeight: '700', color: '#ffffff', marginLeft: 10 },
    headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.9)' },
    content: { paddingHorizontal: 20, paddingTop: 20 },
    card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 24 },
    dayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    lastRow: { borderBottomWidth: 0 },
    dayInfo: { flexDirection: 'row', alignItems: 'center', width: 140 },
    dayText: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginLeft: 12 },
    dayTextClosed: { color: '#94a3b8' },
    timeContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
    timeButton: { backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    timeText: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
    timeDivider: { marginHorizontal: 8, color: '#94a3b8', fontWeight: 'bold' },
    closedContainer: { flex: 1, alignItems: 'flex-end', justifyContent: 'center' },
    closedText: { fontSize: 14, fontWeight: '600', color: '#ef4444', fontStyle: 'italic', paddingRight: 10 },
    saveButtonWrapper: { width: '100%', borderRadius: 16, overflow: 'hidden', shadowColor: '#f43f5e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    saveButtonDisabled: { opacity: 0.7 },
    saveButton: { height: 56, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    saveButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' }
});