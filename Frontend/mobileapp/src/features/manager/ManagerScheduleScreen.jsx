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

    useEffect(() => {
        if (user?.businessId) {
            fetchSchedule();
        }
    }, [user?.businessId]);

    const fetchSchedule = async () => {
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
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#2563eb" />
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

                        <View style={styles.headerTitleRow}>
                            <View style={styles.iconBackground}>
                                <CalendarDays color="#ffffff" size={26} strokeWidth={2.5} />
                            </View>
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
                                {/* 🎨 UI UPGRADE: Synced switch colors to Royal Blue */}
                                <Switch
                                    trackColor={{ false: '#e2e8f0', true: '#bfdbfe' }}
                                    thumbColor={dayObj.isOpen ? '#2563eb' : '#f8fafc'}
                                    ios_backgroundColor="#e2e8f0"
                                    onValueChange={() => toggleDay(index)}
                                    value={dayObj.isOpen}
                                />
                                <Text style={[styles.dayText, !dayObj.isOpen && styles.dayTextClosed]}>{dayObj.day}</Text>
                            </View>

                            {dayObj.isOpen ? (
                                <View style={styles.timeContainer}>
                                    <TouchableOpacity 
                                        activeOpacity={0.7}
                                        style={styles.timeButton} 
                                        onPress={() => openTimePicker(index, 'startTime')}
                                    >
                                        <Text style={styles.timeText}>{formatTimeDisplay(dayObj.startTime)}</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.timeDivider}>-</Text>
                                    <TouchableOpacity 
                                        activeOpacity={0.7}
                                        style={styles.timeButton} 
                                        onPress={() => openTimePicker(index, 'endTime')}
                                    >
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
                    activeOpacity={0.8}
                >
                    <LinearGradient colors={['#1e40af', '#3b82f6']} style={styles.saveButton}>
                        {isSaving ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <>
                                <Save color="#ffffff" size={20} style={{ marginRight: 8 }} strokeWidth={2.5} />
                                <Text style={styles.saveButtonText}>Save Schedule</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
                <View style={{ height: 60 }} />
            </ScrollView>

            {showPicker && (
                <View style={styles.pickerContainer}> 
                    <View style={styles.pickerHeader}>
                        <Text style={styles.pickerTitle}>Select Time</Text>
                        <TouchableOpacity onPress={() => setShowPicker(false)}>
                            <Text style={styles.pickerDoneText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                    <DateTimePicker
                        value={pickerDate}
                        mode="time"
                        is24Hour={false}
                        display="spinner"
                        onChange={onTimeChange}
                        textColor="#0f172a" 
                        themeVariant="light"
                        style={{ height: 200 }}
                    />
                </View>
            )}
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

    headerTitleRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 12,
        marginTop: 10
    },
    iconBackground: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        padding: 8,
        borderRadius: 12,
        marginRight: 12
    },
    headerTitle: { 
        fontSize: 28, 
        fontWeight: '800', 
        color: '#ffffff',
        letterSpacing: -0.5 
    },
    headerSubtitle: { 
        fontSize: 15, 
        color: '#cbd5e1',
        fontWeight: '500',
        paddingRight: 20,
        lineHeight: 22
    },

    content: { 
        paddingHorizontal: 24, 
        paddingTop: 32 
    },
    card: { 
        backgroundColor: '#ffffff', 
        borderRadius: 24, 
        paddingHorizontal: 20,
        paddingVertical: 8,
        shadowColor: '#0f172a', 
        shadowOffset: { width: 0, height: 8 }, 
        shadowOpacity: 0.05, 
        shadowRadius: 16, 
        elevation: 3, 
        borderWidth: 1, 
        borderColor: '#f1f5f9', 
        marginBottom: 32 
    },
    dayRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingVertical: 18, 
        borderBottomWidth: 1, 
        borderBottomColor: '#f1f5f9' 
    },
    lastRow: { 
        borderBottomWidth: 0 
    },
    dayInfo: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        width: 150 
    },
    dayText: { 
        fontSize: 16, 
        fontWeight: '700', 
        color: '#0f172a', 
        marginLeft: 14,
        letterSpacing: 0.2
    },
    dayTextClosed: { 
        color: '#94a3b8',
        fontWeight: '600'
    },
    timeContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        flex: 1, 
        justifyContent: 'flex-end' 
    },
    timeButton: { 
        backgroundColor: '#f8fafc', 
        paddingHorizontal: 12, 
        paddingVertical: 10, 
        borderRadius: 12, 
        borderWidth: 1.5, 
        borderColor: '#e2e8f0',
        minWidth: 80,
        alignItems: 'center'
    },
    timeText: { 
        fontSize: 14, 
        fontWeight: '700', 
        color: '#1e40af' 
    },
    timeDivider: { 
        marginHorizontal: 8, 
        color: '#cbd5e1', 
        fontWeight: '800' 
    },
    closedContainer: { 
        flex: 1, 
        alignItems: 'flex-end', 
        justifyContent: 'center',
        paddingRight: 8
    },
    closedText: { 
        fontSize: 15, 
        fontWeight: '700', 
        color: '#dc2626', 
        fontStyle: 'italic'
    },

    saveButtonWrapper: { 
        width: '100%', 
        borderRadius: 16, 
        shadowColor: '#1d4ed8', 
        shadowOffset: { width: 0, height: 8 }, 
        shadowOpacity: 0.35, 
        shadowRadius: 16, 
        elevation: 8 
    },
    saveButtonDisabled: { 
        opacity: 0.7,
        shadowOpacity: 0,
        elevation: 0
    },
    saveButton: { 
        height: 60, 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center',
        borderRadius: 16
    },
    saveButtonText: { 
        color: '#ffffff', 
        fontSize: 17, 
        fontWeight: '800',
        letterSpacing: 0.5 
    },

    pickerContainer: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 20,
        paddingBottom: Platform.OS === 'ios' ? 30 : 0
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
    },
    pickerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a'
    },
    pickerDoneText: {
        color: '#2563eb', 
        fontWeight: '800',
        fontSize: 16
    }
});