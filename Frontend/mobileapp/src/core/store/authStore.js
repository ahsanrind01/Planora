import { create } from 'zustand';
import { apiClient } from '../api/apiClient'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create((set) => ({
    user: null,    
    token: null, 
    isLoading: false, 
    error: null,     

    login: (userData, jwtToken) => set({ 
        user: userData, 
        token: jwtToken 
    }),
    
    logout: () => set({ 
        user: null, 
        token: null 
    }),

    updateProfile: async (name, email) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.put('/users/profile', { name, email });
            
            const { token, ...userData } = response.data;
            
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            
            set({ user: userData, token, isLoading: false });
            return { success: true };
        } catch (error) {
            console.log("🚨 UPDATE PROFILE ERROR:", error.response?.data || error.message);
            set({ isLoading: false });
            return { success: false, message: error.response?.data?.message || "Failed to update profile." };
        }
    },

    updatePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.put('/users/password', { currentPassword, newPassword });
            
            const { token, ...userData } = response.data;
            
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            
            set({ user: userData, token, isLoading: false });
            return { success: true };
        } catch (error) {
            console.log("🚨 UPDATE PASSWORD ERROR:", error.response?.data || error.message);
            set({ isLoading: false });
            return { success: false, message: error.response?.data?.message || "Failed to update password." };
        }
    },
}));