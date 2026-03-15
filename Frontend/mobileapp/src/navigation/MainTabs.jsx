import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, User, LayoutDashboard, Settings } from 'lucide-react-native';
import { useAuthStore } from '../core/store/authStore';

// Customer / Guest Screens
import UserHomeStack from './UserHomeStack';
import AppointmentsScreen from '../features/user/AppointmentsScreen';
import ProfileScreen from '../features/user/ProfileScreen';

// Manager Screens (Use your placeholder screens here for now)
import ManagerDashboardScreen from '../features/manager/ManagerDashboardScreen';
import ManagerScheduleScreen from '../features/manager/ManagerScheduleScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
    // Check who is looking at the screen!
    const user = useAuthStore((state) => state.user);
    const isManager = user?.role === 'manager';

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#f43f5e',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 8 },
            }}
        >
            {/* TAB 1: The Feed */}
            <Tab.Screen 
                name={isManager ? "Dashboard" : "Discover"} 
                component={isManager ? ManagerDashboardScreen : UserHomeStack} 
                options={{ tabBarIcon: ({ color, size }) => isManager ? <LayoutDashboard color={color} size={size} /> : <Home color={color} size={size} /> }}
            />

            {/* TAB 2: The Calendar */}
            <Tab.Screen 
                name={isManager ? "Schedule" : "Bookings"} 
                component={isManager ? ManagerScheduleScreen : AppointmentsScreen} 
                options={{ tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} /> }}
            />

            {/* TAB 3: The Profile (Everyone gets this tab, we will secure it later) */}
            <Tab.Screen 
                name={isManager ? "Settings" : "Profile"} 
                component={isManager ? ManagerDashboardScreen : ProfileScreen} // Swap to ManagerSettings later
                options={{ tabBarIcon: ({ color, size }) => isManager ? <Settings color={color} size={size} /> : <User color={color} size={size} /> }}
            />
        </Tab.Navigator>
    );
}