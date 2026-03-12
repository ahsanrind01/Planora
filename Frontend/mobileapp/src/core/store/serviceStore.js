import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export const useServiceStore = create((set) => ({
    services: [],
    isLoadingServices: false,
    error: null,

    fetchBusinessServices: async (businessId) => {
        set({ isLoadingServices: true, error: null });
        try {
            const response = await apiClient.get(`/services/business/${businessId}`);
            
            let safeArray = [];
            if (Array.isArray(response.data)) safeArray = response.data;
            else if (Array.isArray(response.data?.data)) safeArray = response.data.data;
            else if (Array.isArray(response.data?.services)) safeArray = response.data.services;
            
            set({ services: safeArray, isLoadingServices: false });
        } catch (error) {
            console.log("🚨 FETCH SERVICES ERROR:", error.response?.data || error.message);
            set({ services: [], isLoadingServices: false });
        }
    }
}));