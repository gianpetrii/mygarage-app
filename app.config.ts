import { ExpoConfig, ConfigContext } from 'expo/config';

/** Convierte CLIENT_ID → REVERSED_CLIENT_ID para el URL scheme nativo de iOS. */
function getGoogleIosUrlScheme(iosClientId?: string): string | undefined {
  if (!iosClientId) return undefined;
  if (iosClientId.startsWith('com.googleusercontent.apps.')) {
    return iosClientId;
  }
  const suffix = '.apps.googleusercontent.com';
  if (iosClientId.endsWith(suffix)) {
    return `com.googleusercontent.apps.${iosClientId.slice(0, -suffix.length)}`;
  }
  return undefined;
}

const googleIosUrlScheme = getGoogleIosUrlScheme(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);

/** Cuenta Apple gratuita (Personal Team): sin Push ni Sign in with Apple en el perfil. */
const isIosPersonalTeam = process.env.IOS_PERSONAL_TEAM === 'true';

const plugins: ExpoConfig['plugins'] = [
  'expo-router',
  'expo-font',
  'expo-image-picker',
  '@react-native-community/datetimepicker',
  [
    '@react-native-google-signin/google-signin',
    {
      iosUrlScheme: googleIosUrlScheme,
    },
  ],
  './plugins/withFirebaseModularHeaders.js',
  './plugins/withFmtXcode26Fix.js',
  [
    'expo-splash-screen',
    {
      backgroundColor: '#09090b',
      image: './assets/splash-icon.png',
      imageWidth: 200,
    },
  ],
];

if (!isIosPersonalTeam) {
  plugins.splice(4, 0, 'expo-apple-authentication');
  plugins.push([
    'expo-notifications',
    {
      icon: './assets/icon.png',
      color: '#09090b',
    },
  ]);
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'CarLogger',
  slug: 'carlogger-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  scheme: 'carlogger',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#09090b',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.carlogger.app',
    usesAppleSignIn: !isIosPersonalTeam,
  },
  android: {
    package: 'com.carlogger.app',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#09090b',
    },
    edgeToEdgeEnabled: true,
  },
  web: {
    bundler: 'metro',
    favicon: './assets/favicon.png',
    output: 'single',
  },
  plugins,
  experiments: {
    typedRoutes: true,
  },
  extra: {
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? 'e50b729c-a39c-4ade-95ff-4aa228365123',
    },
    iosPersonalTeam: isIosPersonalTeam,
  },
});
