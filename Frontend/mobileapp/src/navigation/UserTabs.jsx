import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, User } from 'lucide-react-native';

import AppointmentsScreen from '../features/user/AppointmentsScreen';
import ProfileScreen from '../features/user/ProfileScreen';

import UserHomeStack from './UserHomeStack';

const Tab = createBottomTabNavigator();

export default function UserTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#f43f5e', 
                tabBarInactiveTintColor: '#94a3b8',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#f1f5f9',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarIcon: ({ color, size }) => {
                    if (route.name === 'Discover') {
                        return <Home color={color} size={size} />;
                    } else if (route.name === 'Bookings') {
                        return <Calendar color={color} size={size} />;
                    } else if (route.name === 'Profile') {
                        return <User color={color} size={size} />;
                    }
                },
            })}
        >
            <Tab.Screen name="Discover" component={UserHomeStack} />
            <Tab.Screen name="Bookings" component={AppointmentsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}