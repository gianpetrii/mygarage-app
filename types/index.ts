// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface UserPreferences {
  currency?: string;
  language?: string;
  units?: 'metric' | 'imperial';
  notifications?: {
    push?: boolean;
    email?: boolean;
    reminders?: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  pushToken?: string;
  preferences?: UserPreferences;
}

export interface Session {
  uid: string;
  email: string | null;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
}

// ─── Theme ────────────────────────────────────────────────────────────────────

export type ColorScheme = 'light' | 'dark' | 'system';

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// ─── Forms (Auth) ─────────────────────────────────────────────────────────────

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordForm {
  email: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface PushNotificationToken {
  token: string;
  platform: 'ios' | 'android';
}

// ─── MyGarage Domain ──────────────────────────────────────────────────────────

export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid';
export type Transmission = 'manual' | 'automatic' | 'cvt';

export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  trim?: string;
  year: number;
  vin?: string;
  licensePlate?: string;
  color?: string;
  mileage: number;
  fuelType: FuelType;
  engine?: string;
  transmission?: Transmission;
  photos: string[];
  manualUrl?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type MaintenanceType =
  | 'oil_change'
  | 'tire_rotation'
  | 'brake_service'
  | 'tune_up'
  | 'inspection'
  | 'repair'
  | 'other';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  userId: string;
  type: MaintenanceType;
  title: string;
  description: string;
  date: number;
  mileage: number;
  cost: number;
  serviceProvider?: string;
  nextServiceMileage?: number;
  nextServiceDate?: number;
  parts: string[];
  photos: string[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type ReminderType = 'mileage' | 'time' | 'both';
export type ReminderPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ServiceReminder {
  id: string;
  vehicleId: string;
  userId: string;
  title: string;
  description: string;
  type: ReminderType;
  targetMileage?: number;
  targetDate?: number;
  intervalMileage?: number;
  intervalMonths?: number;
  isCompleted: boolean;
  lastCompletedDate?: number;
  lastCompletedMileage?: number;
  priority: ReminderPriority;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface FuelEntry {
  id: string;
  vehicleId: string;
  userId: string;
  date: number;
  mileage: number;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  gasStation?: string;
  fuelType?: string;
  isFullTank: boolean;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type ExpenseCategory =
  | 'fuel'
  | 'maintenance'
  | 'insurance'
  | 'registration'
  | 'repair'
  | 'parking'
  | 'tolls'
  | 'other';

export type RecurringInterval = 'monthly' | 'quarterly' | 'yearly';

export interface Expense {
  id: string;
  vehicleId: string;
  userId: string;
  category: ExpenseCategory;
  title: string;
  description?: string;
  amount: number;
  date: number;
  mileage?: number;
  vendor?: string;
  isRecurring: boolean;
  recurringInterval?: RecurringInterval;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type TimelineEntryType = 'maintenance' | 'fuel' | 'expense';

export interface TimelineEntry {
  id: string;
  type: TimelineEntryType;
  vehicleId: string;
  date: number;
  title: string;
  amount?: number;
  mileage?: number;
  source: MaintenanceRecord | FuelEntry | Expense;
}

export interface DashboardStats {
  totalVehicles: number;
  upcomingServices: number;
  overdueServices: number;
  totalExpensesThisMonth: number;
  averageFuelConsumption?: number;
  recentMaintenances: MaintenanceRecord[];
  urgentReminders: ServiceReminder[];
}
