import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { apiClient } from '../core/api/apiClient';
import { useAuthStore } from '../core/store/authStore';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true, 
        shouldPlaySound: true, 
        shouldSetBadge: false,
    }),
});

export const usePushNotifications = () => {
    const user = useAuthStore(state => state.user);
    const [expoPushToken, setExpoPushToken] = useState('');

    useEffect(() => {
        if (user) {
            registerForPushNotificationsAsync().then(token => {
                if (token && token !== "undefined") {
                    setExpoPushToken(token);
                    
                    apiClient.post('/users/push-token', { pushToken: token })
                        .then(res => {})
                        .catch(err => {});
                } else {
                }
            });
        }
    }, [user]);

    async function registerForPushNotificationsAsync() {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#2563eb',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                return;
            }

            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            if (!projectId) {
                token = (await Notifications.getExpoPushTokenAsync()).data;
            } else {
                token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            }
            
        } else {
        }

        return token;
    }

    return { expoPushToken };
};