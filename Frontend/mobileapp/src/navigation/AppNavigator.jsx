import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../core/store/authStore';

import AuthStack from './AuthStack';
import UserTabs from './UserTabs';

export default function AppNavigator() {
  const user = useAuthStore((state) => state.user);

  return (
    <NavigationContainer>
      {!user ? <AuthStack /> : <UserTabs />}
    </NavigationContainer>
  );
}