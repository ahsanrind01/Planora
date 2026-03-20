import React from 'react';
import { useEffect } from 'react';
import { apiClient } from './src/core/api/apiClient';
import AppNavigator from './src/navigation/AppNavigator';
import { usePushNotifications } from './src/hooks/usePushNotifications';

import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from './src/core/config';

export default function App() {
  const pushToken = usePushNotifications();

  useEffect(() => {
        const saveTokenToDatabase = async () => {
            if (pushToken) {
                try {
                    await apiClient.put('/users/push-token', { pushToken });
                    console.log("✅ SUCCESS: Token beamed to MongoDB!");
                } catch (error :any) {
                    console.log("🚨 Failed to save token to database:", error.response?.data || error.message);
                }
            }
        };

        saveTokenToDatabase();
        
    }, [pushToken]);

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <AppNavigator />
    </StripeProvider>
  );
}