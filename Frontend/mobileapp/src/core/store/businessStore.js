import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export const useBusinessStore = create((set) => ({
    businesses: [],
    isLoading: false,
    error: null,

    fetchBusinesses: async (category = null, searchQuery = '') => {
        set({ isLoading: true, error: null });
        try {
            let queryParams = [];
            
            if (category && category !== 'All') {
                queryParams.push(`category=${category}`);
            }
            if (searchQuery) {
                queryParams.push(`search=${searchQuery}`);
            }

            const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
            const endpoint = `/business${queryString}`;
                
            const response = await apiClient.get(endpoint);
            
            console.log(`🏪 FETCHING: ${endpoint}`, response.data);

            let safeArray = [];
            
            if (Array.isArray(response.data)) {
                safeArray = response.data;
            } else if (response.data && Array.isArray(response.data.data)) {
                safeArray = response.data.data;
            } else if (response.data && Array.isArray(response.data.businesses)) {
                safeArray = response.data.businesses;
            }

            set({ businesses: safeArray, isLoading: false });

        } catch (error) {
            console.log("🚨 FETCH BUSINESS ERROR:", error.response?.data || error.message);
            set({ 
                error: error.response?.data?.message || "Failed to load businesses.", 
                isLoading: false,
                businesses: []
            });
        }
    }
}));