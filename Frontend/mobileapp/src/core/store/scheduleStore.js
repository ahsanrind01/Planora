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
        } catch (error) {
            console.log("🚨 FETCH SCHEDULE ERROR:", error.response?.data || error.message);
            set({ schedule: null, isLoadingSchedule: false });
        }
    }
}));