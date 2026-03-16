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
    ActivityIndicator,
    Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, MapPin, Star, X, Phone, BadgeCheck } from 'lucide-react-native';

// Stores
import { useAuthStore } from '../../core/store/authStore'; 
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
                        colors={['rgba(15,23,42,0.7)', 'rgba(15,23,42,0.2)', 'transparent']}
                        style={styles.heroGradientTop}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(248,250,252,0.8)', '#f8fafc']}
                        style={styles.heroGradientBottom}
                    />
                    
                    <SafeAreaView style={styles.safeArea}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.7}
                        >
                            <ArrowLeft color="#0f172a" size={22} strokeWidth={2.5} />
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>

                <View style={styles.contentWrapper}>
                    <View style={styles.headerInfoCard}>
                        <View style={styles.titleRow}>
                            <Text style={styles.businessName}>{business?.name || "Loading..."}</Text>
                            {business?.isVerified && (
                                <BadgeCheck color="#2563eb" fill="#dbeafe" size={26} />
                            )}
                        </View>

                        <View style={styles.statsRow}>
                            <View style={styles.statPill}>
                                <Star color="#fbbf24" fill="#fbbf24" size={16} />
                                <Text style={styles.statText}>
                                    {totalReviews > 0 ? `${averageRating} (${totalReviews} reviews)` : "New Business"}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <MapPin color="#64748b" size={18} />
                            <Text style={styles.infoText}>
                                {business?.address ? `${business.address}${business.city ? `, ${business.city}` : ''}` : "Location not provided"}
                            </Text>
                        </View>

                        {business?.phone && (
                            <View style={styles.infoRow}>
                                <Phone color="#64748b" size={18} />
                                <Text style={styles.infoText}>{business.phone}</Text>
                            </View>
                        )}
                    </View>

                    {business?.description && (
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>About</Text>
                            <Text style={styles.descriptionText}>{business.description}</Text>
                        </View>
                    )}

                    {business?.images && business.images.length > 0 && (
                        <View style={styles.sectionContainer}>
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
                                <View style={{ width: 24 }} /> 
                            </ScrollView>
                        </View>
                    )}

                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Services</Text>

                        {isLoadingServices ? (
                            <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 24 }} />
                        ) : services.length === 0 ? (
                            <Text style={styles.emptyText}>No services listed yet.</Text>
                        ) : (
                            services.map((service, index) => (
                                <View key={service?._id || service?.id || index.toString()} style={styles.serviceCard}>
                                    <View style={styles.serviceInfo}>
                                        <Text style={styles.serviceName}>{service?.name || "Service"}</Text>
                                        <Text style={styles.serviceDetails}>
                                            {service?.duration || 0} mins • <Text style={styles.servicePrice}>${service?.price || 0}</Text>
                                        </Text>
                                    </View>

                                    <TouchableOpacity 
                                        onPress={() => handleBookClick(service)}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={['#1e40af', '#3b82f6']}
                                            style={styles.bookButton}
                                        >
                                            <Text style={styles.bookButtonText}>Book</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </View>

                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Customer Reviews</Text>

                        {reviews.length === 0 ? (
                            <Text style={styles.emptyText}>No reviews yet. Be the first to book!</Text>
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
                                            <Star color="#fbbf24" fill="#fbbf24" size={14} />
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

                    <View style={{ height: 60 }} />
                </View>
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
                                <Text style={styles.errorText}>This business is currently closed all week.</Text>
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
                                            activeOpacity={0.7}
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
                            <View style={{ width: 24 }} />
                        </ScrollView>

                        <Text style={styles.modalSectionTitle}>Select Time</Text>
                        <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
                            <View style={styles.timeGrid}>
                                {timeSlots.length === 0 ? (
                                    <Text style={styles.emptyText}>No times available on this date.</Text>
                                ) : (
                                    timeSlots.map((time, index) => {
                                        const isSelected = selectedTime === time.value;
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                onPress={() => setSelectedTime(time.value)}
                                                activeOpacity={0.7}
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

                        <View style={styles.confirmWrapperContainer}>
                            <TouchableOpacity
                                style={[styles.confirmWrapper, (!selectedDate || !selectedTime || isBooking) && styles.confirmDisabled]}
                                disabled={!selectedDate || !selectedTime || isBooking}
                                onPress={handleConfirmBooking}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={selectedDate && selectedTime ? ['#1e40af', '#3b82f6'] : ['#e2e8f0', '#cbd5e1']}
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
    container: { 
        flex: 1, 
        backgroundColor: '#f8fafc' 
    },
    
    heroContainer: { 
        position: 'relative', 
        height: 320, 
        backgroundColor: '#0f172a'
    },
    heroImage: { 
        width: '100%', 
        height: '100%', 
        resizeMode: 'cover',
        opacity: 0.85
    },
    heroGradientTop: { 
        position: 'absolute', top: 0, left: 0, right: 0, height: 140 
    },
    heroGradientBottom: { 
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 
    },
    safeArea: { 
        position: 'absolute', top: 0, left: 0, right: 0 
    },
    backButton: { 
        width: 48, 
        height: 48, 
        backgroundColor: 'rgba(255, 255, 255, 0.85)', 
        borderRadius: 24, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginLeft: 24, 
        marginTop: Platform.OS === 'android' ? 40 : 10, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.15, 
        shadowRadius: 12, 
        elevation: 5 
    },

    contentWrapper: {
        marginTop: -40, 
        zIndex: 10
    },
    headerInfoCard: { 
        backgroundColor: '#ffffff',
        marginHorizontal: 24,
        padding: 24,
        borderRadius: 24,
        shadowColor: '#0f172a', 
        shadowOffset: { width: 0, height: 8 }, 
        shadowOpacity: 0.08, 
        shadowRadius: 24, 
        elevation: 8,
        marginBottom: 24
    },
    titleRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 8, 
        marginBottom: 12 
    },
    businessName: { 
        fontSize: 26, 
        fontWeight: '700', 
        color: '#0f172a',
        letterSpacing: -0.5,
        flex: 1
    },
    statsRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 20 
    },
    statPill: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 6,
        backgroundColor: '#fef3c7', 
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8
    },
    statText: { 
        fontSize: 14, 
        color: '#b45309', 
        fontWeight: '700' 
    },
    infoRow: {
        flexDirection: 'row', 
        alignItems: 'flex-start', 
        gap: 12,
        marginTop: 12
    },
    infoText: { 
        fontSize: 15, 
        color: '#475569',
        fontWeight: '500',
        flex: 1,
        lineHeight: 22
    },

    sectionContainer: { 
        paddingHorizontal: 24,
        marginBottom: 32
    },
    sectionTitle: { 
        fontSize: 22, 
        fontWeight: '700', 
        color: '#0f172a', 
        marginBottom: 16,
        letterSpacing: -0.3
    },
    descriptionText: { 
        fontSize: 16, 
        color: '#475569', 
        lineHeight: 26,
        fontWeight: '400'
    },

    galleryScroll: { 
        marginHorizontal: -24, 
        paddingHorizontal: 24 
    },
    galleryImage: { 
        width: 160, 
        height: 160, 
        borderRadius: 20,
        marginRight: 16, 
        resizeMode: 'cover' 
    },

    serviceCard: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 20, 
        backgroundColor: '#ffffff', 
        borderRadius: 20, 
        marginBottom: 16, 
        shadowColor: '#0f172a', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.05, 
        shadowRadius: 12, 
        elevation: 3, 
        borderWidth: 1, 
        borderColor: '#f1f5f9' 
    },
    serviceInfo: { 
        flex: 1,
        paddingRight: 16
    },
    serviceName: { 
        fontSize: 17, 
        fontWeight: '700', 
        color: '#0f172a', 
        marginBottom: 6 
    },
    serviceDetails: { 
        fontSize: 14, 
        color: '#64748b',
        fontWeight: '500'
    },
    servicePrice: {
        color: '#1d4ed8',
        fontWeight: '700'
    },
    bookButton: { 
        paddingHorizontal: 24, 
        paddingVertical: 12, 
        borderRadius: 16,
        shadowColor: '#1d4ed8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4
    },
    bookButtonText: { 
        color: '#ffffff', 
        fontWeight: '700', 
        fontSize: 15,
        letterSpacing: 0.3
    },

    reviewCard: { 
        backgroundColor: '#ffffff', 
        padding: 20, 
        borderRadius: 20, 
        marginBottom: 16, 
        borderWidth: 1, 
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1
    },
    reviewHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 12 
    },
    reviewAuthor: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 12 
    },
    avatar: { 
        width: 38, 
        height: 38, 
        backgroundColor: '#dbeafe', 
        borderRadius: 12, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    avatarText: { 
        fontSize: 16, 
        fontWeight: '800', 
        color: '#1e40af' 
    },
    reviewName: { 
        fontSize: 16, 
        fontWeight: '700', 
        color: '#0f172a' 
    },
    reviewStars: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 6, 
        backgroundColor: '#f8fafc', 
        paddingHorizontal: 10, 
        paddingVertical: 6, 
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    reviewRatingText: { 
        fontSize: 14, 
        fontWeight: '700', 
        color: '#0f172a' 
    },
    reviewComment: { 
        fontSize: 15, 
        color: '#475569', 
        lineHeight: 24,
        fontWeight: '400'
    },

    modalOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(15, 23, 42, 0.6)', 
        justifyContent: 'flex-end' 
    },
    modalContent: { 
        backgroundColor: '#ffffff', 
        borderTopLeftRadius: 32, 
        borderTopRightRadius: 32, 
        padding: 24, 
        paddingBottom: Platform.OS === 'ios' ? 40 : 24, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: -8 }, 
        shadowOpacity: 0.15, 
        shadowRadius: 24, 
        elevation: 20 
    },
    modalHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 32 
    },
    modalTitle: { 
        fontSize: 22, 
        fontWeight: '800', 
        color: '#0f172a',
        letterSpacing: -0.3 
    },
    closeButton: { 
        padding: 8, 
        backgroundColor: '#f1f5f9', 
        borderRadius: 20 
    },
    modalSectionTitle: { 
        fontSize: 17, 
        fontWeight: '700', 
        color: '#0f172a', 
        marginBottom: 16 
    },
    dateScroll: { 
        flexGrow: 0, 
        marginBottom: 32, 
        marginHorizontal: -24, 
        paddingHorizontal: 24 
    },
    dateCard: { 
        width: 72, 
        height: 90, 
        backgroundColor: '#f8fafc', 
        borderRadius: 20, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 12, 
        borderWidth: 1.5, 
        borderColor: '#e2e8f0' 
    },
    dateCardActive: { 
        backgroundColor: '#1e40af', 
        borderColor: '#1e40af',
        shadowColor: '#1d4ed8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4
    },
    dateDay: { 
        fontSize: 13, 
        color: '#64748b', 
        marginBottom: 6, 
        textTransform: 'uppercase', 
        fontWeight: '700' 
    },
    dateNumber: { 
        fontSize: 22, 
        color: '#0f172a', 
        fontWeight: '800' 
    },
    dateTextActive: { 
        color: '#ffffff' 
    },
    timeGrid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 12, 
        marginBottom: 8 
    },
    timeSlot: { 
        paddingVertical: 12, 
        paddingHorizontal: 18, 
        backgroundColor: '#f8fafc', 
        borderRadius: 16, 
        borderWidth: 1.5, 
        borderColor: '#e2e8f0' 
    },
    timeSlotActive: { 
        backgroundColor: '#eff6ff', 
        borderColor: '#3b82f6' 
    },
    timeText: { 
        fontSize: 15, 
        fontWeight: '600', 
        color: '#475569' 
    },
    timeTextActive: { 
        color: '#1d4ed8', 
        fontWeight: '800' 
    },
    confirmWrapperContainer: {
        marginTop: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9'
    },
    confirmWrapper: { 
        width: '100%', 
        borderRadius: 20, 
        overflow: 'hidden',
        shadowColor: '#1d4ed8',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 6
    },
    confirmDisabled: { 
        opacity: 0.6,
        shadowOpacity: 0 
    },
    confirmButton: { 
        height: 60, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    confirmButtonText: { 
        color: '#ffffff', 
        fontSize: 17, 
        fontWeight: '600',
        letterSpacing: 0.3
    },

    emptyText: { 
        color: '#64748b', 
        textAlign: 'center', 
        marginTop: 10, 
        fontSize: 15,
        fontWeight: '500' 
    },
    errorText: { 
        color: '#ef4444', 
        textAlign: 'center', 
        marginTop: 10, 
        fontSize: 15,
        fontWeight: '600' 
    },

    fullScreenOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(15, 23, 42, 0.98)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    fullScreenClose: { 
        position: 'absolute', 
        top: 60, 
        right: 24, 
        zIndex: 10, 
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 24
    },
    fullScreenImage: { 
        width: '100%', 
        height: '80%' 
    }
});

