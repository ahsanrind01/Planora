import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export const useAppointmentStore = create((set) => ({
    appointments: [],
    isLoading: false,
    error: null,

    fetchMyAppointments: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.get('/bookings/me');
            
            console.log("📅 BACKEND SENT APPOINTMENTS:", response.data);

            let safeArray = [];
            if (Array.isArray(response.data)) {
                safeArray = response.data;
            } else if (response.data && Array.isArray(response.data.data)) {
                safeArray = response.data.data;
            } else if (response.data && Array.isArray(response.data.appointments)) {
                safeArray = response.data.appointments;
            }

            set({ appointments: safeArray, isLoading: false });

        } catch (error) {
            console.log("🚨 FETCH APPOINTMENTS ERROR:", error.response?.data || error.message);
            set({ 
                error: "Failed to load appointments. Check connection.", 
                isLoading: false,
                appointments: [] 
            });
        }
    },

    submitBooking: async (serviceId, finalDateString, selectedTime) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.post('/bookings/create', {
                serviceId: serviceId,
                date: finalDateString 
            });

            set((state) => ({ isLoading: false }));
            return { success: true }; 
        } catch (error) {
            console.log("🚨 BOOKING ERROR:", error.response?.data || error.message);
            set({ error: error.response?.data?.message || "Booking failed", isLoading: false });
            return { success: false, message: error.response?.data?.message };
        }
    },
    cancelBooking: async (bookingId) => {
        set({ isLoading: true });
        try {
            await apiClient.put(`/bookings/${bookingId}/cancel`);
            
            const { fetchMyAppointments } = useAppointmentStore.getState();
            await fetchMyAppointments();
            
            return { success: true };
        } catch (error) {
            console.log("🚨 CANCEL ERROR:", error.response?.data || error.message);
            set({ isLoading: false, error: "Failed to cancel booking." });
            return { success: false };
        }
    }
}));