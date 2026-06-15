import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useFonts,
  Fraunces_300Light,
  Fraunces_400Regular_Italic,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from '@expo-google-fonts/hanken-grotesk';

import { colors, gradients } from './src/theme/theme';
import TabBar from './src/navigation/TabBar';
import type { RootStackParamList } from './src/navigation/types';
import DarshanScreen from './src/screens/DarshanScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import TalkScreen from './src/screens/TalkScreen';
import ContentDetailScreen from './src/screens/ContentDetailScreen';
import ConversationScreen from './src/screens/ConversationScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { PreferencesProvider, usePreferences } from './src/state/preferences';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg0 } }}
    >
      <Tab.Screen name="Darshan" component={DarshanScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Talk" component={TalkScreen} />
    </Tab.Navigator>
  );
}

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg0, card: colors.bg0 },
};

function Splash() {
  return (
    <LinearGradient colors={gradients.screen} style={styles.loader}>
      <Text style={styles.loaderOm}>ॐ</Text>
    </LinearGradient>
  );
}

// Gate: splash while prefs load, onboarding on first run, otherwise the main app.
function Root() {
  const { prefs, loading } = usePreferences();

  if (loading) return <Splash />;
  if (!prefs.onboarded) return <OnboardingScreen />;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg0 },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen
          name="ContentDetail"
          component={ContentDetailScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Conversation"
          component={ConversationScreen}
          options={{ animation: 'fade', animationDuration: 320 }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [loaded] = useFonts({
    Fraunces_300Light,
    Fraunces_400Regular_Italic,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
  });

  if (!loaded) return <Splash />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <PreferencesProvider>
          <Root />
        </PreferencesProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loaderOm: { fontSize: 72, color: colors.gold },
});
