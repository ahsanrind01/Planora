import { useEffect, useState } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export function usePushNotifications() {
    const [expoPushToken, setExpoPushToken] = useState('');

    useEffect(() => {
        const getPermissionAndToken = async () => {
            if (!Device.isDevice) {
                console.log('Must use physical device for Push Notifications');
                return;
            }

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            
            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return;
            }
            
            try {
                // This grabs your phone's unique ID
                const token = (await Notifications.getExpoPushTokenAsync()).data;
                console.log("📱 MY EXPO PUSH TOKEN:", token);
                setExpoPushToken(token);
            } catch (error) {
                console.log("🚨 Error getting push token:", error);
            }
        };

        getPermissionAndToken();
    }, []);

    return expoPushToken;
}