import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { FamilyProvider } from '@/context/FamilyContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <FamilyProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ title: 'Gia phả', headerShown: true }} />
          <Stack.Screen name="add-member" options={{ title: 'Thêm thành viên' }} />
          <Stack.Screen name="edit-member" options={{ title: 'Chỉnh sửa thành viên' }} />
          <Stack.Screen name="detail-member" options={{ title: 'Chi tiết thành viên' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </FamilyProvider>
  );
}
