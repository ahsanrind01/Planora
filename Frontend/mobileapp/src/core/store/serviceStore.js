import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export const useServiceStore = create((set) => ({
    services: [],
    isLoadingServices: false,
    error: null,

    // 🟢 CUSTOMER & MANAGER READ (Untouched!)
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
    },

    // 🛠️ MANAGER ONLY: CREATE
    createService: async (serviceData) => {
        try {
            const response = await apiClient.post('/services', serviceData);
            if (response.data.success || response.data) {
                // Safely grab the new service (handling different backend shapes)
                const newService = response.data.data || response.data;
                // Add it to the existing array in memory
                set((state) => ({ services: [...state.services, newService] }));
                return { success: true };
            }
        } catch (error) {
            console.log("🚨 CREATE SERVICE ERROR:", error.response?.data || error.message);
            return { success: false, message: error.response?.data?.message || "Failed to create service" };
        }
    },

    // 🛠️ MANAGER ONLY: UPDATE
    updateService: async (id, serviceData) => {
        try {
            const response = await apiClient.patch(`/services/${id}`, serviceData);
            if (response.data.success || response.data) {
                const updatedService = response.data.data || response.data;
                // Find the old service in memory and swap it with the new one
                set((state) => ({
                    services: state.services.map(s => s._id === id ? updatedService : s)
                }));
                return { success: true };
            }
        } catch (error) {
            console.log("🚨 UPDATE SERVICE ERROR:", error.response?.data || error.message);
            return { success: false, message: error.response?.data?.message || "Failed to update service" };
        }
    },

    // 🛠️ MANAGER ONLY: DELETE
    deleteService: async (id) => {
        try {
            const response = await apiClient.delete(`/services/${id}`);
            if (response.data.success || response.status === 200) {
                // Filter the deleted service out of the array
                set((state) => ({
                    services: state.services.filter(s => s._id !== id)
                }));
                return { success: true };
            }
        } catch (error) {
            console.log("🚨 DELETE SERVICE ERROR:", error.response?.data || error.message);
            return { success: false, message: error.response?.data?.message || "Failed to delete service" };
        }
    }
}));