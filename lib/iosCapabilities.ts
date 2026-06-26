import Constants from 'expo-constants';

/**
 * Team Personal de Apple (cuenta gratuita): no admite Push Notifications
 * ni Sign in with Apple en el provisioning profile.
 * Activar con IOS_PERSONAL_TEAM=true en .env.local antes de prebuild.
 */
export const isIosPersonalTeam =
  Constants.expoConfig?.extra?.iosPersonalTeam === true ||
  process.env.EXPO_PUBLIC_IOS_PERSONAL_TEAM === 'true';
