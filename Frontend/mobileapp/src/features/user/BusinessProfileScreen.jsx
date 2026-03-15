import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Modal,
    SafeAreaView,
    ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, MapPin, Star, X, Phone, BadgeCheck } from 'lucide-react-native';

// Stores
import { useAuthStore } from '../../core/store/authStore'; // 🚨 Added Auth Store
import { useBusinessStore } from '../../core/store/businessStore';
import { useServiceStore } from '../../core/store/serviceStore';
import { useAppointmentStore } from '../../core/store/appointmentStore';
import { useScheduleStore } from '../../core/store/scheduleStore';
import { useReviewStore } from '../../core/store/reviewStore';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getNext7Days = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        dates.push(d);
    }
    return dates;
};
const baseUpcomingDates = getNext7Days();

export default function BusinessProfileScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    
    // 🚨 NEW: Get the current user to act as the Bouncer
    const user = useAuthStore(state => state.user);

    const { providerId } = route.params;

    const { businesses } = useBusinessStore();
    const { services, isLoadingServices, fetchBusinessServices } = useServiceStore();
    const { reviews, averageRating, totalReviews, fetchBusinessReviews } = useReviewStore();
    const { submitBooking, isBooking } = useAppointmentStore();
    const { schedule, fetchBusinessSchedule } = useScheduleStore();

    const business = businesses.find(b => b?._id === providerId || b?.id === providerId) || {};

    useEffect(() => {
        if (providerId) {
            fetchBusinessServices(providerId);
            fetchBusinessSchedule(providerId);
            fetchBusinessReviews(providerId);
        }
    }, [providerId]);

    const availableDates = baseUpcomingDates.filter(date => {
        if (!schedule || !schedule.workingHours) return true;

        const dayName = daysOfWeek[date.getDay()];
        const daySchedule = schedule.workingHours.find(d => d.day === dayName);
        return daySchedule && !daySchedule.isClosed;
    });

    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [fullScreenImage, setFullScreenImage] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(
        availableDates.length > 0 ? availableDates[0].toDateString() : baseUpcomingDates[0].toDateString()
    );
    const [selectedTime, setSelectedTime] = useState("");

    const handleBookClick = (service) => {
        // 🚨 THE BOUNCER: Stop guests from booking!
        if (!user) {
            alert("Please log in to book an appointment.");
            navigation.navigate('Auth');
            return;
        }

        setSelectedService(service);
        setBookingModalOpen(true);
    };

    const generateTimeSlots = () => {
        if (!schedule || !schedule.workingHours) {
            return [
                { display: "9:00 AM", value: "09:00" },
                { display: "10:00 AM", value: "10:00" },
                { display: "1:00 PM", value: "13:00" },
                { display: "2:00 PM", value: "14:00" }
            ];
        }

        const selectedDateObj = new Date(selectedDate);
        const dayName = daysOfWeek[selectedDateObj.getDay()];
        const daySchedule = schedule.workingHours.find(d => d.day === dayName);

        if (!daySchedule || daySchedule.isClosed) return [];

        const slots = [];
        let [currentHour, currentMin] = daySchedule.startTime.split(':').map(Number);
        const [endHour, endMin] = daySchedule.endTime.split(':').map(Number);

        while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
            const backendHour = currentHour.toString().padStart(2, '0');
            const backendMin = currentMin.toString().padStart(2, '0');
            const backendValue = `${backendHour}:${backendMin}`;

            const ampm = currentHour >= 12 ? 'PM' : 'AM';
            const displayHour = currentHour > 12 ? currentHour - 12 : (currentHour === 0 ? 12 : currentHour);
            const displayMin = currentMin.toString().padStart(2, '0');
            const displayValue = `${displayHour}:${displayMin} ${ampm}`;

            slots.push({ display: displayValue, value: backendValue });

            currentMin += 30;
            if (currentMin >= 60) {
                currentHour += 1;
                currentMin -= 60;
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    const handleConfirmBooking = async () => {
        const targetId = selectedService?._id || selectedService?.id;

        if (!targetId) {
            alert("Error: Missing Service ID");
            return;
        }

        const d = new Date(selectedDate);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        const finalDateString = `${year}-${month}-${day}T${selectedTime}:00`;

        const result = await submitBooking(targetId, finalDateString, selectedTime);

        if (result.success) {
            setBookingModalOpen(false);
            setSelectedTime("");
            navigation.navigate('Bookings');
        } else {
            alert(result.message || "Failed to book appointment.");
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&q=80";
        if (imagePath.startsWith('http')) return imagePath;

        const BASE_URL = 'http://192.168.18.125:3000/';

        const cleanPath = imagePath.replace(/\\/g, '/');
        return `${BASE_URL}${cleanPath}`;
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

                <View style={styles.heroContainer}>
                    <Image
                        source={{ uri: getImageUrl(business?.coverImage) }}
                        style={styles.heroImage}
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.6)', 'transparent']}
                        style={styles.heroGradient}
                    />
                    <SafeAreaView style={styles.safeArea}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <ArrowLeft color="#0f172a" size={24} />
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>

                <View style={styles.headerInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <Text style={styles.businessName}>{business?.name || "Loading..."}</Text>
                        {business?.isVerified && (
                            <BadgeCheck color="#3b82f6" fill="#bfdbfe" size={24} />
                        )}
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Star color="#facc15" fill="#facc15" size={16} />
                            <Text style={styles.statText}>
                                {totalReviews > 0 ? `${averageRating} (${totalReviews} reviews)` : "New Business (No reviews)"}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.statItem, { marginTop: 4 }]}>
                        <MapPin color="#64748b" size={16} />
                        <Text style={styles.addressText}>
                            {business?.address ? `${business.address}${business.city ? `, ${business.city}` : ''}` : "Location not provided"}
                        </Text>
                    </View>

                    {business?.phone && (
                        <View style={[styles.statItem, { marginTop: 8 }]}>
                            <Phone color="#64748b" size={16} />
                            <Text style={styles.addressText}>{business.phone}</Text>
                        </View>
                    )}
                </View>

                {business?.description && (
                    <View style={styles.aboutContainer}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.descriptionText}>{business.description}</Text>
                    </View>
                )}

                {business?.images && business.images.length > 0 && (
                    <View style={styles.galleryContainer}>
                        <Text style={styles.sectionTitle}>Gallery</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
                            {business.images.map((img, index) => (
                                <TouchableOpacity
                                    key={index}
                                    activeOpacity={0.8}
                                    onPress={() => setFullScreenImage(getImageUrl(img))}
                                >
                                    <Image
                                        source={{ uri: getImageUrl(img) }}
                                        style={styles.galleryImage}
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={styles.servicesContainer}>
                    <Text style={styles.sectionTitle}>Services</Text>

                    {isLoadingServices ? (
                        <ActivityIndicator size="large" color="#f43f5e" style={{ marginTop: 20 }} />
                    ) : services.length === 0 ? (
                        <Text style={{ textAlign: 'center', color: '#64748b', marginTop: 20 }}>
                            No services listed yet.
                        </Text>
                    ) : (
                        services.map((service, index) => (
                            <View key={service?._id || service?.id || index.toString()} style={styles.serviceCard}>
                                <View style={styles.serviceInfo}>
                                    <Text style={styles.serviceName}>{service?.name || "Service"}</Text>
                                    <Text style={styles.serviceDetails}>
                                        {service?.duration || 0} mins • ${service?.price || 0}
                                    </Text>
                                </View>

                                <TouchableOpacity onPress={() => handleBookClick(service)}>
                                    <LinearGradient
                                        colors={['#f43f5e', '#fb7185']}
                                        style={styles.bookButton}
                                    >
                                        <Text style={styles.bookButtonText}>Book</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </View>

                <View style={styles.reviewsContainer}>
                    <Text style={styles.sectionTitle}>Customer Reviews</Text>

                    {reviews.length === 0 ? (
                        <Text style={{ color: '#64748b', textAlign: 'center', marginTop: 10 }}>
                            No reviews yet. Be the first to book!
                        </Text>
                    ) : (
                        reviews.map((review, index) => (
                            <View key={review?._id || index.toString()} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <View style={styles.reviewAuthor}>
                                        <View style={styles.avatar}>
                                            <Text style={styles.avatarText}>
                                                {review?.userId?.name?.charAt(0)?.toUpperCase() || "G"}
                                            </Text>
                                        </View>
                                        <Text style={styles.reviewName}>
                                            {review?.userId?.name || "Guest"}
                                        </Text>
                                    </View>

                                    <View style={styles.reviewStars}>
                                        <Star color="#facc15" fill="#facc15" size={14} />
                                        <Text style={styles.reviewRatingText}>{review?.rating || 5}</Text>
                                    </View>
                                </View>

                                {review?.comment ? (
                                    <Text style={styles.reviewComment}>{review.comment}</Text>
                                ) : null}
                            </View>
                        ))
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={bookingModalOpen}
                onRequestClose={() => setBookingModalOpen(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>

                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Book {selectedService?.name}</Text>
                            <TouchableOpacity
                                onPress={() => setBookingModalOpen(false)}
                                style={styles.closeButton}
                            >
                                <X color="#64748b" size={24} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSectionTitle}>Select Date</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                            {availableDates.length === 0 ? (
                                <Text style={{ color: '#ef4444' }}>This business is currently closed all week.</Text>
                            ) : (
                                availableDates.map((date, index) => {
                                    const dateString = date.toDateString();
                                    const isSelected = selectedDate === dateString;
                                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                                    const dayNumber = date.getDate();

                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => {
                                                setSelectedDate(dateString);
                                                setSelectedTime("");
                                            }}
                                            style={[styles.dateCard, isSelected && styles.dateCardActive]}
                                        >
                                            <Text style={[styles.dateDay, isSelected && styles.dateTextActive]}>
                                                {dayName}
                                            </Text>
                                            <Text style={[styles.dateNumber, isSelected && styles.dateTextActive]}>
                                                {dayNumber}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                        </ScrollView>

                        <Text style={styles.modalSectionTitle}>Select Time</Text>
                        <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                            <View style={styles.timeGrid}>
                                {timeSlots.length === 0 ? (
                                    <Text style={{ color: '#64748b' }}>No times available on this date.</Text>
                                ) : (
                                    timeSlots.map((time, index) => {
                                        const isSelected = selectedTime === time.value;
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                onPress={() => setSelectedTime(time.value)}
                                                style={[styles.timeSlot, isSelected && styles.timeSlotActive]}
                                            >
                                                <Text style={[styles.timeText, isSelected && styles.timeTextActive]}>
                                                    {time.display}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })
                                )}
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.confirmWrapper, (!selectedDate || !selectedTime || isBooking) && styles.confirmDisabled]}
                            disabled={!selectedDate || !selectedTime || isBooking}
                            onPress={handleConfirmBooking}
                        >
                            <LinearGradient
                                colors={selectedDate && selectedTime ? ['#f43f5e', '#fb7185'] : ['#e2e8f0', '#cbd5e1']}
                                style={styles.confirmButton}
                            >
                                {isBooking ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text style={styles.confirmButtonText}>
                                        {selectedDate && selectedTime
                                            ? `Confirm • $${selectedService?.price || 0}`
                                            : 'Select Date & Time'}
                                    </Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={!!fullScreenImage}
                onRequestClose={() => setFullScreenImage(null)}
            >
                <View style={styles.fullScreenOverlay}>
                    <TouchableOpacity
                        style={styles.fullScreenClose}
                        onPress={() => setFullScreenImage(null)}
                    >
                        <X color="#ffffff" size={32} />
                    </TouchableOpacity>

                    <Image
                        source={{ uri: fullScreenImage }}
                        style={styles.fullScreenImage}
                        resizeMode="contain"
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    heroContainer: { position: 'relative', height: 260 },
    heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    heroGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
    safeArea: { position: 'absolute', top: 0, left: 0, right: 0 },
    backButton: { width: 44, height: 44, backgroundColor: '#ffffff', borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 20, marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    headerInfo: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    businessName: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
    statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statText: { fontSize: 14, color: '#0f172a', fontWeight: '500' },
    addressText: { fontSize: 14, color: '#64748b' },

    aboutContainer: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    descriptionText: { fontSize: 15, color: '#475569', lineHeight: 22 },

    galleryContainer: { paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    galleryScroll: { paddingHorizontal: 20 },
    galleryImage: { width: 140, height: 140, borderRadius: 16, marginRight: 12, resizeMode: 'cover' },

    servicesContainer: { padding: 20 },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
    serviceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#ffffff', borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: '#f1f5f9' },
    serviceInfo: { flex: 1 },
    serviceName: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
    serviceDetails: { fontSize: 14, color: '#64748b' },
    bookButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
    bookButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },

    reviewsContainer: { padding: 20, paddingTop: 10 },
    reviewCard: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    reviewAuthor: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    avatar: { width: 32, height: 32, backgroundColor: '#e2e8f0', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 14, fontWeight: '700', color: '#475569' },
    reviewName: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
    reviewStars: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ffffff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    reviewRatingText: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
    reviewComment: { fontSize: 14, color: '#475569', lineHeight: 20 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
    closeButton: { padding: 4, backgroundColor: '#f1f5f9', borderRadius: 20 },
    modalSectionTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 12 },
    dateScroll: { flexGrow: 0, marginBottom: 24, marginRight: -24 },
    dateCard: { width: 64, height: 80, backgroundColor: '#f8fafc', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#f1f5f9' },
    dateCardActive: { backgroundColor: '#f43f5e', borderColor: '#f43f5e' },
    dateDay: { fontSize: 13, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', fontWeight: '600' },
    dateNumber: { fontSize: 20, color: '#0f172a', fontWeight: '700' },
    dateTextActive: { color: '#ffffff' },
    timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
    timeSlot: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#f8fafc', borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9' },
    timeSlotActive: { backgroundColor: '#f43f5e', borderColor: '#f43f5e' },
    timeText: { fontSize: 14, fontWeight: '500', color: '#475569' },
    timeTextActive: { color: '#ffffff', fontWeight: '600' },
    confirmWrapper: { width: '100%', borderRadius: 16, overflow: 'hidden', marginTop: 16 },
    confirmDisabled: { opacity: 0.7 },
    confirmButton: { height: 56, justifyContent: 'center', alignItems: 'center' },
    confirmButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },

    fullScreenOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.95)', justifyContent: 'center', alignItems: 'center' },
    fullScreenClose: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 },
    fullScreenImage: { width: '100%', height: '80%' }
});