import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text } from 'react-native';
import 'react-native-reanimated';

import { FamilyProvider } from '@/context/FamilyContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const HeaderButton = ({ title, onPress }: { title: string; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      style={{ paddingHorizontal: 12, paddingVertical: 6, marginLeft: 8 }}
    >
      <Text style={{ color: '#007AFF', fontWeight: '600' }}>{title}</Text>
    </Pressable>
  );

  return (
    <FamilyProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: 'Gia phả',
              headerRight: () => (
                <>
                  <HeaderButton title="+ Thêm thành viên" onPress={() => router.push('/add-member')} />
                  <HeaderButton title="Home" onPress={() => router.push('/')} />
                </>
              ),
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="add-member"
            options={{
              title: 'Thêm thành viên',
              headerRight: () => (
                <>
                  <HeaderButton title="+ Thêm thành viên" onPress={() => router.push('/add-member')} />
                  <HeaderButton title="Home" onPress={() => router.push('/')} />
                </>
              ),
            }}
          />
          <Stack.Screen
            name="edit-member"
            options={{
              title: 'Chỉnh sửa thành viên',
              headerRight: () => (
                <>
                  <HeaderButton title="+ Thêm thành viên" onPress={() => router.push('/add-member')} />
                  <HeaderButton title="Home" onPress={() => router.push('/')} />
                </>
              ),
            }}
          />
          <Stack.Screen
            name="detail-member"
            options={{
              title: 'Chi tiết thành viên',
              headerRight: () => (
                <>
                  <HeaderButton title="+ Thêm thành viên" onPress={() => router.push('/add-member')} />
                  <HeaderButton title="Home" onPress={() => router.push('/')} />
                </>
              ),
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </FamilyProvider>
  );
}
