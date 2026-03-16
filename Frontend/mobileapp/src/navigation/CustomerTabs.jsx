import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, User } from 'lucide-react-native';

import UserHomeStack from './UserHomeStack';
import AppointmentsScreen from '../features/user/AppointmentsScreen';
import ProfileScreen from '../features/user/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function CustomerTabs() {
    return (
        <Tab.Navigator 
            screenOptions={{ 
                headerShown: false, 
                tabBarActiveTintColor: '#2563eb', 
                tabBarInactiveTintColor: '#94a3b8', 
                tabBarStyle: { 
                    height: Platform.OS === 'ios' ? 75 : 68, 
                    paddingBottom: Platform.OS === 'ios' ? 28 : 12, 
                    paddingTop: 12,
                    backgroundColor: '#ffffff',
                    borderTopWidth: 0,
                    shadowColor: '#0f172a',
                    shadowOffset: { width: 0, height: -8 },
                    shadowOpacity: 0.06,
                    shadowRadius: 16,
                    elevation: 16,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '700',
                    marginTop: 4
                }
            }}
        >
            <Tab.Screen 
                name="Discover" 
                component={UserHomeStack} 
                options={{ 
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} strokeWidth={2.5} /> 
                }} 
            />
            <Tab.Screen 
                name="Bookings" 
                component={AppointmentsScreen} 
                options={{ 
                    tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} strokeWidth={2.5} /> 
                }} 
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen} 
                options={{ 
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} strokeWidth={2.5} /> 
                }} 
            />
        </Tab.Navigator>
    );
}