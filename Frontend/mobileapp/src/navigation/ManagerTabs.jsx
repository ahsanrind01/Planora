import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Calendar, Settings, Briefcase } from 'lucide-react-native';

import ManagerDashboardScreen from '../features/manager/ManagerDashboardScreen';
import ManagerScheduleScreen from '../features/manager/ManagerScheduleScreen';
import ManagerServicesScreen from '../features/manager/ManagerServicesScreen'; 
import ProfileScreen from '../features/user/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function ManagerTabs() {
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
                name="Dashboard" 
                component={ManagerDashboardScreen} 
                options={{ 
                    tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} strokeWidth={2.5} /> 
                }} 
            />
            <Tab.Screen 
                name="Schedule" 
                component={ManagerScheduleScreen} 
                options={{ 
                    tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} strokeWidth={2.5} /> 
                }} 
            />
            <Tab.Screen 
                name="Services" 
                component={ManagerServicesScreen} 
                options={{ 
                    tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} strokeWidth={2.5} /> 
                }} 
            />  
            <Tab.Screen 
                name="Settings" 
                component={ProfileScreen} 
                options={{ 
                    tabBarIcon: ({ color, size }) => <Settings color={color} size={size} strokeWidth={2.5} /> 
                }} 
            />
        </Tab.Navigator>
    );
}