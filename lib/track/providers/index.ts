/**
 * Provider adapters for workout sources.
 * Web implementation uses evolve_phone only — other adapters are intentional stubs.
 */

export type ActivitySource =
  | "evolve_phone"
  | "evolve_apple_watch"
  | "apple_health"
  | "garmin"
  | "manual"
  | "imported";

export type ProviderCapability = {
  liveTracking: boolean;
  importCompleted: boolean;
  heartRate: boolean;
  route: boolean;
  power: boolean;
  cadence: boolean;
};

export interface WorkoutProvider {
  id: ActivitySource;
  label: string;
  capabilities(): ProviderCapability;
  /** True only after a real authorization succeeded. */
  isConnected(): Promise<boolean>;
}

export const evolvePhoneProvider: WorkoutProvider = {
  id: "evolve_phone",
  label: "Evolve phone",
  capabilities: () => ({
    liveTracking: true,
    importCompleted: false,
    heartRate: false,
    route: true,
    power: false,
    cadence: false,
  }),
  async isConnected() {
    return true;
  },
};

/** Stub — requires native HealthKit entitlements. */
export const appleHealthProvider: WorkoutProvider = {
  id: "apple_health",
  label: "Apple Health",
  capabilities: () => ({
    liveTracking: false,
    importCompleted: false,
    heartRate: false,
    route: false,
    power: false,
    cadence: false,
  }),
  async isConnected() {
    return false;
  },
};

/** Stub — requires watchOS companion. */
export const appleWatchProvider: WorkoutProvider = {
  id: "evolve_apple_watch",
  label: "Apple Watch",
  capabilities: () => ({
    liveTracking: false,
    importCompleted: false,
    heartRate: false,
    route: false,
    power: false,
    cadence: false,
  }),
  async isConnected() {
    return false;
  },
};

/** Stub — requires Garmin developer OAuth backend. */
export const garminProvider: WorkoutProvider = {
  id: "garmin",
  label: "Garmin Connect",
  capabilities: () => ({
    liveTracking: false,
    importCompleted: false,
    heartRate: false,
    route: false,
    power: false,
    cadence: false,
  }),
  async isConnected() {
    return false;
  },
};

export const WORKOUT_PROVIDERS: WorkoutProvider[] = [
  evolvePhoneProvider,
  appleHealthProvider,
  appleWatchProvider,
  garminProvider,
];
