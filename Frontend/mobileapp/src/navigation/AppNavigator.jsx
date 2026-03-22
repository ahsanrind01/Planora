import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore } from '../core/store/authStore';

import { usePushNotifications } from '../hooks/usePushNotifications';

import CustomerTabs from './CustomerTabs';
import ManagerTabs from './ManagerTabs';
import AuthStack from './AuthStack';
import RegisterBusinessScreen from '../features/user/RegisterBusinessScreen';
import CheckoutScreen from '../features/payment/CheckoutScreen';
import ChatScreen from '../features/chat/ChatScreen';
import ManagerInboxScreen from '../features/manager/ManagerInboxScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const user = useAuthStore((state) => state.user);
    const isManager = user?.role === 'manager';

    usePushNotifications();

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>

                {isManager ? (
                    <Stack.Screen name="ManagerApp" component={ManagerTabs} />
                ) : (
                    <Stack.Screen name="CustomerApp" component={CustomerTabs} />
                )}

                <Stack.Screen name="Auth" component={AuthStack} options={{ presentation: 'modal' }} />
                <Stack.Screen name="RegisterBusiness" component={RegisterBusinessScreen} options={{ presentation: 'modal' }} />

                <Stack.Screen
                    name="Checkout"
                    component={CheckoutScreen}
                    options={{ presentation: 'modal' }}
                />

                <Stack.Screen
                    name="ChatScreen"
                    component={ChatScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="ManagerInbox"
                    component={ManagerInboxScreen}
                    options={{ headerShown: false }}
                />

            </Stack.Navigator>
        </NavigationContainer>
    );
}