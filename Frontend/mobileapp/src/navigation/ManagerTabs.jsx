import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Calendar, Settings, Briefcase } from 'lucide-react-native';

import ManagerDashboardScreen from '../features/manager/ManagerDashboardScreen';
import ManagerScheduleScreen from '../features/manager/ManagerScheduleScreen';
import ManagerServicesScreen from '../features/manager/ManagerServicesScreen'; 
import ProfileScreen from '../features/user/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function ManagerTabs() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#f43f5e', tabBarInactiveTintColor: '#94a3b8', tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 8 } }}>
            <Tab.Screen name="Dashboard" component={ManagerDashboardScreen} options={{ tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }} />
            <Tab.Screen name="Schedule" component={ManagerScheduleScreen} options={{ tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} /> }} />
            <Tab.Screen name="Services" component={ManagerServicesScreen} options={{ tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} /> }} />  
            <Tab.Screen name="Settings" component={ProfileScreen} options={{ tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }} />
        </Tab.Navigator>
    );
}