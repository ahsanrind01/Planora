import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// We will build this new unified file in Step 2!
import MainTabs from './MainTabs'; 
import AuthStack from './AuthStack';
import RegisterBusinessScreen from '../features/user/RegisterBusinessScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* 1. EVERYONE gets in. This is the default view. */}
        <Stack.Screen name="MainTabs" component={MainTabs} />

        {/* 2. Authentication Modal (Slides up when a guest tries to book) */}
        <Stack.Screen 
          name="Auth" 
          component={AuthStack} 
          options={{ presentation: 'modal' }} 
        />

        {/* 3. Manager Registration Modal */}
        <Stack.Screen 
          name="RegisterBusiness" 
          component={RegisterBusinessScreen} 
          options={{ presentation: 'modal' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}