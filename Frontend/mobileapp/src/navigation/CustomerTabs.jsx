import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, User } from 'lucide-react-native';

import UserHomeStack from './UserHomeStack';
import AppointmentsScreen from '../features/user/AppointmentsScreen';
import ProfileScreen from '../features/user/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function CustomerTabs() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#f43f5e', tabBarInactiveTintColor: '#94a3b8', tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 8 } }}>
            <Tab.Screen name="Discover" component={UserHomeStack} options={{ tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
            <Tab.Screen name="Bookings" component={AppointmentsScreen} options={{ tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} /> }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
        </Tab.Navigator>
    );
}