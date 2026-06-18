# CarLogger App

## Descripción del proyecto

Aplicación móvil para **registrar y consultar** todo lo relacionado con un vehículo: gastos, mantenimiento, combustible y recordatorios. Construida con Expo/React Native y Firebase.

## Problema que resuelve

Centraliza el historial del auto en el celular: servicios, cargas de combustible, gastos y alertas de mantenimiento, sin depender de papeles, fotos sueltas o hojas de cálculo.

## Stack

- Expo ~52, Expo Router, React Native (New Architecture)
- Firebase Auth + Firestore + Storage
- NativeWind / Tailwind CSS (dark mode)
- Zustand, React Hook Form + Zod
- Google Sign-In y Apple Sign-In (nativo)

## Requisitos

- Node.js LTS
- pnpm
- Para correr en dispositivo/simulador: **dev client** (no funciona en Expo Go por los módulos nativos de Google/Apple sign-in)

## Instalación

```bash
pnpm install
cp .env.local.example .env.local
# Completar credenciales Firebase en .env.local
```

## Variables de entorno

Copiá `.env.local.example` a `.env.local` y completá:

- `EXPO_PUBLIC_FIREBASE_*` — credenciales de Firebase
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` / `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` — Google Sign-In
- `EXPO_PUBLIC_EAS_PROJECT_ID` — push notifications (EAS)

## Desarrollo

```bash
pnpm start          # Metro bundler
pnpm ios            # Simulador iOS (requiere prebuild)
pnpm android        # Emulador Android (requiere prebuild)
pnpm web            # Web (limitado, sin Google/Apple nativo)
```

### Build nativo

```bash
npx expo prebuild
npx expo run:ios
npx expo run:android
```

## Estructura

```
app/
  (auth)/       # Login, registro, recuperar contraseña
  (app)/        # Tabs: Home, Vehículos, Service, Combustible, Perfil
store/          # Zustand: auth, vehicles, maintenance, fuel, expenses, reminders
lib/            # Firebase + CRUD Firestore
components/     # UI y layout
```

## Funcionalidades

- Dashboard con estadísticas y recordatorios
- CRUD de vehículos (fotos, patente, km)
- Registro de mantenimientos con fotos y próximo service
- Cargas de combustible con consumo promedio
- Gastos por categoría
- Dark mode, push notifications
