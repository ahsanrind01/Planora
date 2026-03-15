import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export const useScheduleStore = create((set) => ({
    schedule: null, 
    isLoadingSchedule: false,
    error: null,

    fetchBusinessSchedule: async (businessId) => {
        set({ isLoadingSchedule: true, error: null });
        try {
            const response = await apiClient.get(`/schedule/${businessId}`);
            
            console.log("📅 RAW SCHEDULE FROM DB:", JSON.stringify(response.data));

            const scheduleData = response.data?.data || response.data;
            
            set({ schedule: scheduleData, isLoadingSchedule: false });
            
            // 🚨 ADDED: Return the data so ManagerScheduleScreen can actually read it
            return { success: true, data: scheduleData };
            
        } catch (error) {
            console.log("🚨 FETCH SCHEDULE ERROR:", error.response?.data || error.message);
            set({ schedule: null, isLoadingSchedule: false });
            
            // 🚨 ADDED: Return failure so the screen knows it failed
            return { success: false };
        }
    },

    saveBusinessSchedule: async (workingHours) => {
        try {
            const response = await apiClient.post('/schedule', { workingHours });
            set({ schedule: response.data.data });
            return { success: true };
        } catch (error) {
            console.log("🚨 SAVE SCHEDULE ERROR:", error.response?.data || error.message);
            return { success: false, message: error.response?.data?.message || "Failed to save schedule" };
        }
    }
}));