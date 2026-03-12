import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export const useReviewStore = create((set, get) => ({
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
    isLoadingReviews: false,
    error: null,

    fetchBusinessReviews: async (businessId) => {
        set({ isLoadingReviews: true, error: null });
        try {
            const response = await apiClient.get(`/reviews/business/${businessId}`);
            
            const fetchedReviews = response.data?.data || [];
            
            let avg = 0;
            if (fetchedReviews.length > 0) {
                const totalStars = fetchedReviews.reduce((sum, review) => sum + review.rating, 0);
                avg = (totalStars / fetchedReviews.length).toFixed(1); 
            }

            set({ 
                reviews: fetchedReviews, 
                averageRating: avg,
                totalReviews: fetchedReviews.length,
                isLoadingReviews: false 
            });
        } catch (error) {
            console.log("🚨 FETCH REVIEWS ERROR:", error.response?.data || error.message);
            set({ reviews: [], averageRating: 0, totalReviews: 0, isLoadingReviews: false });
        }
    },

    submitReview: async (businessId, rating, comment) => {
        try {
            await apiClient.post(`/reviews/business/${businessId}`, { rating, comment });
            
            await get().fetchBusinessReviews(businessId);
            return { success: true };
        } catch (error) {
            console.log("🚨 SUBMIT REVIEW ERROR:", error.response?.data || error.message);
            return { 
                success: false, 
                message: error.response?.data?.message || "Failed to submit review." 
            };
        }
    }
}));