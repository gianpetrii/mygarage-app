import { Tabs } from 'expo-router';
import { Home, History, User } from 'lucide-react-native';
import { AppEngineIcon } from '@/components/brand/AppEngineIcon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/colors';
import { CenterTabButton } from '@/components/navigation/CenterTabButton';
import { useRegisterSheet } from '@/contexts/RegisterSheetContext';
import { QuickRegisterSheet } from '@/components/register/QuickRegisterSheet';

export default function AppLayout() {
  const { resolvedScheme } = useColorScheme();
  const colors = Colors[resolvedScheme];
  const { open } = useRegisterSheet();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.tabIconActive,
          tabBarInactiveTintColor: colors.tabIconInactive,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.tabBarBorder,
            height: 60,
            paddingBottom: 8,
            paddingTop: 4,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'Historial',
            tabBarIcon: ({ color, size }) => <History size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="register"
          options={{
            title: '',
            tabBarButton: (props) => (
              <CenterTabButton onPress={open} {...props} />
            ),
          }}
        />
        <Tabs.Screen
          name="vehicles"
          options={{
            title: 'Vehículos',
            tabBarIcon: ({ color, size }) => <AppEngineIcon size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
        {/* Stacks ocultos del tab bar */}
        <Tabs.Screen name="maintenance" options={{ href: null }} />
        <Tabs.Screen name="fuel" options={{ href: null }} />
        <Tabs.Screen name="add" options={{ href: null }} />
        <Tabs.Screen name="reminders" options={{ href: null }} />
        <Tabs.Screen name="guides" options={{ href: null }} />
        <Tabs.Screen name="onboarding" options={{ href: null }} />
        <Tabs.Screen name="setup-reminders" options={{ href: null }} />
      </Tabs>
      <QuickRegisterSheet />
    </>
  );
}
