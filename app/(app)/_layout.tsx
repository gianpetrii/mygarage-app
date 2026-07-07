import { Tabs, router } from 'expo-router';
import { Home, Bell, User } from 'lucide-react-native';
import { AppEngineIcon } from '@/components/brand/AppEngineIcon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/colors';
import { CenterTabButton } from '@/components/navigation/CenterTabButton';
import { QuickRegisterSheet } from '@/components/register/QuickRegisterSheet';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';

export default function AppLayout() {
  const { resolvedScheme } = useColorScheme();
  const colors = Colors[resolvedScheme];
  const { activeVehicle } = useActiveVehicle();

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
          name="reminders"
          options={{
            title: 'Recordatorios',
            tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="register"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.push({
                pathname: '/(app)/add/service',
                params: activeVehicle ? { vehicleId: activeVehicle.id } : undefined,
              });
            },
          }}
          options={{
            title: '',
            tabBarButton: (props) => <CenterTabButton {...props} />,
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
        <Tabs.Screen name="history" options={{ href: null }} />
        <Tabs.Screen name="maintenance" options={{ href: null }} />
        <Tabs.Screen name="fuel" options={{ href: null }} />
        <Tabs.Screen name="add" options={{ href: null }} />
        <Tabs.Screen name="guides" options={{ href: null }} />
        <Tabs.Screen name="onboarding" options={{ href: null }} />
        <Tabs.Screen name="setup-reminders" options={{ href: null }} />
      </Tabs>
      <QuickRegisterSheet />
    </>
  );
}
