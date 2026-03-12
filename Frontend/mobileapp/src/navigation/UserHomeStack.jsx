import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DiscoverScreen from '../features/user/DiscoverScreen';
import BusinessProfileScreen from '../features/user/BusinessProfileScreen'; 

const Stack = createNativeStackNavigator();

export default function UserHomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Discover" component={DiscoverScreen} />
            <Stack.Screen name="BusinessProfile" component={BusinessProfileScreen} />
        </Stack.Navigator>
    );
}