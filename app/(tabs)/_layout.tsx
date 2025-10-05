// Update your app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import { ShoppingProvider } from '../context/ShoppingContext';

export default function TabLayout() {
  return (
    <ShoppingProvider>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="recipe" />
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="upload" />
      </Tabs>
    </ShoppingProvider>
  );
}